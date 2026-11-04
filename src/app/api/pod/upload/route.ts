import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma';
import { analyzePODImage } from '@/lib/aiVision';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const tripId = formData.get('tripId') as string;
    const file = formData.get('file') as File | null;
    const gpsLat = formData.get('gpsLat') ? parseFloat(formData.get('gpsLat') as string) : null;
    const gpsLng = formData.get('gpsLng') ? parseFloat(formData.get('gpsLng') as string) : null;
    const gpsAccuracy = formData.get('gpsAccuracy') ? parseFloat(formData.get('gpsAccuracy') as string) : null;
    const gpsLocationName = formData.get('gpsLocationName') as string || 'Consignee Delivery Gate';
    const isOfflineSync = formData.get('isOfflineSync') === 'true';

    if (!tripId) {
      return NextResponse.json({ success: false, error: 'tripId is required' }, { status: 400 });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { pod: true, client: true },
    });

    if (!trip) {
      return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });
    }

    let imageBuffer: Buffer;
    let fileName: string;
    let mimeType = 'image/jpeg';
    let sizeKb = 120.0;

    if (file && typeof file.arrayBuffer === 'function') {
      const bytes = await file.arrayBuffer();
      imageBuffer = Buffer.from(bytes);
      mimeType = file.type || 'image/jpeg';
      sizeKb = Number((imageBuffer.length / 1024).toFixed(1));
      const ext = path.extname(file.name) || '.jpg';
      fileName = `${tripId}-${Date.now()}${ext}`;
    } else {
      // If no raw file passed in mock mode, use sample svg
      const samplePath = path.join(process.cwd(), 'public', 'sample-pods', 'TRP-66120-pod.svg');
      imageBuffer = fs.readFileSync(samplePath);
      mimeType = 'image/svg+xml';
      fileName = `${tripId}-${Date.now()}.svg`;
      sizeKb = 142.5;
    }

    // Save image to public uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const targetFilePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(targetFilePath, imageBuffer);

    const imageUrl = `/uploads/${fileName}`;

    // Current retake count
    const currentRetakes = trip.pod ? trip.pod.retakeCount : 0;

    // AI Vision inspection
    const analysis = await analyzePODImage({
      imageBuffer,
      mimeType,
      imageFileName: file ? file.name : fileName,
      tripContext: {
        id: trip.id,
        lrNumber: trip.lrNumber,
        expectedQty: trip.expectedQty,
        material: trip.material,
        currentRetakeCount: currentRetakes,
        clientName: trip.client.name,
        destination: trip.destination,
      },
    });

    const isRetake = analysis.recommendedStatus === 'RETAKE_REQUESTED';
    const nextRetakeCount = isRetake ? currentRetakes + 1 : currentRetakes;

    // Upsert Proof of Delivery
    const pod = await prisma.proofOfDelivery.upsert({
      where: { tripId: trip.id },
      create: {
        tripId: trip.id,
        imageUrl,
        compressedSizeKb: sizeKb,
        capturedAt: new Date(),
        gpsLat,
        gpsLng,
        gpsAccuracy,
        gpsLocationName,
        isOfflineSync,
        retakeCount: nextRetakeCount,
        aiConfidence: analysis.aiConfidence,
        lrNumberDetected: analysis.lrNumberDetected,
        lrMatchesTrip: analysis.lrMatchesTrip,
        stampDetected: analysis.stampDetected,
        stampClarityScore: analysis.stampClarityScore,
        signatureDetected: analysis.signatureDetected,
        qtyReceived: analysis.qtyReceived,
        qtyDiscrepancy: analysis.qtyDiscrepancy,
        remarksDetected: analysis.remarksDetected,
        isShortageOrDamage: analysis.isShortageOrDamage,
        aiRawResponse: JSON.stringify(analysis.rawAnalysis),
        executiveRemarks: analysis.executiveAlert,
      },
      update: {
        imageUrl,
        compressedSizeKb: sizeKb,
        capturedAt: new Date(),
        gpsLat: gpsLat || undefined,
        gpsLng: gpsLng || undefined,
        gpsAccuracy: gpsAccuracy || undefined,
        gpsLocationName: gpsLocationName || undefined,
        isOfflineSync,
        retakeCount: nextRetakeCount,
        aiConfidence: analysis.aiConfidence,
        lrNumberDetected: analysis.lrNumberDetected,
        lrMatchesTrip: analysis.lrMatchesTrip,
        stampDetected: analysis.stampDetected,
        stampClarityScore: analysis.stampClarityScore,
        signatureDetected: analysis.signatureDetected,
        qtyReceived: analysis.qtyReceived,
        qtyDiscrepancy: analysis.qtyDiscrepancy,
        remarksDetected: analysis.remarksDetected,
        isShortageOrDamage: analysis.isShortageOrDamage,
        aiRawResponse: JSON.stringify(analysis.rawAnalysis),
        executiveRemarks: analysis.executiveAlert,
      },
    });

    // Update trip status
    await prisma.trip.update({
      where: { id: trip.id },
      data: {
        podStatus: analysis.recommendedStatus,
        remarks: analysis.retakeReason || analysis.executiveAlert || trip.remarks,
        deliveredDate: trip.deliveredDate || new Date(),
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'POD_CAPTURED',
        actorRole: 'DRIVER',
        actorName: trip.driverName,
        details: `POD uploaded for ${trip.id}. AI decision: ${analysis.recommendedStatus} (Confidence: ${Math.round(analysis.aiConfidence * 100)}%). Size: ${sizeKb}KB. GPS: ${gpsLat}, ${gpsLng}`,
      },
    });

    return NextResponse.json({
      success: true,
      pod,
      analysis,
      tripStatus: analysis.recommendedStatus,
      retakeCount: nextRetakeCount,
      canRetake: nextRetakeCount < 2,
    });
  } catch (error) {
    console.error('Failed to upload/analyze POD:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process POD upload', details: String(error) },
      { status: 500 }
    );
  }
}
