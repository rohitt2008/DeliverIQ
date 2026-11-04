import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      tripId,
      decision, // APPROVE, REQUEST_RETAKE, CORRECT_FIELDS, REJECT
      reviewerId = 'USR-BILLING-01',
      reviewerName = 'Priya Sharma (Billing Executive)',
      notes,
      correctedQty,
      customRemarks,
    } = body;

    if (!tripId || !decision) {
      return NextResponse.json({ success: false, error: 'tripId and decision are required' }, { status: 400 });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { pod: true },
    });

    if (!trip) {
      return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });
    }

    let newStatus = trip.podStatus;
    let reviewNotes = notes || '';

    if (decision === 'APPROVE') {
      newStatus = 'VERIFIED';
      reviewNotes = notes || 'Approved by Billing Executive after visual inspection.';
    } else if (decision === 'REQUEST_RETAKE') {
      const currentRetakes = trip.pod?.retakeCount || 0;
      if (currentRetakes >= 2) {
        return NextResponse.json(
          { success: false, error: 'Retake limit reached (max 2 retakes permitted by transport policy).' },
          { status: 400 }
        );
      }
      newStatus = 'RETAKE_REQUESTED';
      reviewNotes = notes || 'Billing executive requested photo retake.';
    } else if (decision === 'CORRECT_FIELDS') {
      newStatus = 'VERIFIED';
      reviewNotes = notes || 'Fields manually corrected by Billing Executive based on physical voucher image.';
    } else if (decision === 'REJECT') {
      newStatus = 'MISSING';
      reviewNotes = notes || 'POD rejected. Re-upload required.';
    }

    // Update POD if exists
    if (trip.pod) {
      await prisma.proofOfDelivery.update({
        where: { tripId },
        data: {
          reviewedById: reviewerId,
          reviewedAt: new Date(),
          reviewNotes,
          qtyReceived: correctedQty !== undefined ? Number(correctedQty) : trip.pod.qtyReceived,
          qtyDiscrepancy: correctedQty !== undefined ? Math.max(0, trip.expectedQty - Number(correctedQty)) : trip.pod.qtyDiscrepancy,
          remarksDetected: customRemarks || trip.pod.remarksDetected,
        },
      });
    }

    // Update trip
    await prisma.trip.update({
      where: { id: tripId },
      data: {
        podStatus: newStatus,
        remarks: customRemarks || trip.remarks,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: `POD_${decision}`,
        actorRole: 'BILLING_EXECUTIVE',
        actorName: reviewerName,
        details: `Trip ${tripId}: Decision '${decision}' -> Status '${newStatus}'. Notes: ${reviewNotes}`,
      },
    });

    return NextResponse.json({
      success: true,
      tripId,
      newStatus,
      message: `Trip ${tripId} status updated to ${newStatus}`,
    });
  } catch (error) {
    console.error('Failed to review POD:', error);
    return NextResponse.json({ success: false, error: 'Review submission failed' }, { status: 500 });
  }
}
