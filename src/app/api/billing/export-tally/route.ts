import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateTallyXML, generateBillingCSV } from '@/lib/tallyExport';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId, tripIds, billingPeriod = '2026-W45', format = 'xml' } = body;

    if (!clientId || !Array.isArray(tripIds) || tripIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'clientId and non-empty tripIds array are required' },
        { status: 400 }
      );
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json({ success: false, error: 'Client not found' }, { status: 404 });
    }

    const trips = await prisma.trip.findMany({
      where: {
        id: { in: tripIds },
        clientId,
      },
      include: { pod: true },
    });

    if (trips.length === 0) {
      return NextResponse.json({ success: false, error: 'No matching trips found' }, { status: 400 });
    }

    const totalFreight = trips.reduce((sum, t) => sum + t.freightAmount, 0);
    // Any shortage deductions
    const deductions = trips.reduce((sum, t) => {
      if (t.pod && t.pod.qtyDiscrepancy > 0) {
        // e.g. approx ₹500 per short unit deduction
        return sum + t.pod.qtyDiscrepancy * 500;
      }
      return sum;
    }, 0);
    const netPayable = Math.max(0, totalFreight - deductions);

    // Generate Invoice Number
    const invoiceCount = await prisma.invoice.count();
    const invoiceNumber = `INV-2026-${String(invoiceCount + 101).padStart(4, '0')}`;

    // Create Invoice record
    const invoice = await prisma.invoice.create({
      data: {
        id: invoiceNumber,
        clientId: client.id,
        billingPeriod,
        totalFreight,
        deductions,
        netPayable,
        status: 'TALLY_EXPORTED',
        tallyExportedAt: new Date(),
      },
    });

    // Update trips to INVOICED
    await prisma.trip.updateMany({
      where: { id: { in: tripIds } },
      data: {
        invoiceId: invoice.id,
        podStatus: 'INVOICED',
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'TALLY_EXPORTED',
        actorRole: 'BILLING_EXECUTIVE',
        actorName: 'Priya Sharma (Billing Executive)',
        details: `Generated Invoice ${invoiceNumber} for ${client.name} with ${trips.length} trips. Net: INR ${netPayable.toLocaleString('en-IN')}`,
      },
    });

    const exportData = {
      invoiceNumber,
      clientName: client.name,
      gstin: client.gstin,
      invoiceDate: new Date(),
      trips: trips.map((t) => ({
        id: t.id,
        lrNumber: t.lrNumber,
        ewayBillNumber: t.ewayBillNumber,
        vehicleNo: t.vehicleNo,
        origin: t.origin,
        destination: t.destination,
        freightAmount: t.freightAmount,
        material: t.material,
        deliveredDate: t.deliveredDate,
        podImageUrl: t.pod?.imageUrl || null,
      })),
      totalFreight,
      deductions,
      netPayable,
    };

    const xmlOutput = generateTallyXML(exportData);
    const csvOutput = generateBillingCSV(exportData.trips, client.name);

    return NextResponse.json({
      success: true,
      invoice,
      xml: xmlOutput,
      csv: csvOutput,
      tripsExportedCount: trips.length,
      netPayable,
    });
  } catch (error) {
    console.error('Failed to generate Tally export:', error);
    return NextResponse.json({ success: false, error: 'Export failed' }, { status: 500 });
  }
}
