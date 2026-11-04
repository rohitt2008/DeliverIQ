import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { trips } = body;

    if (!Array.isArray(trips) || trips.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Expected an array of trips to import' },
        { status: 400 }
      );
    }

    // Fetch existing clients to map
    const clients = await prisma.client.findMany();
    const defaultClient = clients[0];

    const createdTrips = [];

    for (const t of trips) {
      const tripId = t.id || `TRP-${Math.floor(10000 + Math.random() * 90000)}`;
      const lrNumber = t.lrNumber || `LR-${Math.floor(1000 + Math.random() * 9000)}`;
      const ewayBillNumber = t.ewayBillNumber || `2418-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const smsMagicToken = `tok_${tripId.toLowerCase()}_${Math.random().toString(36).substring(2, 7)}`;

      // Match client by name or default
      const matchedClient = clients.find((c) => c.name.toLowerCase().includes((t.clientName || '').toLowerCase())) || defaultClient;

      const newTrip = await prisma.trip.upsert({
        where: { id: tripId },
        create: {
          id: tripId,
          clientId: matchedClient.id,
          vehicleNo: t.vehicleNo || 'MH20 EL 0000',
          isHiredVehicle: Boolean(t.isHiredVehicle || (t.vehicleNo || '').includes('hired')),
          driverName: t.driverName || 'Designated Driver',
          driverPhone: t.driverPhone || '+91 98220 00000',
          origin: t.origin || 'Chhatrapati Sambhajinagar',
          destination: t.destination || 'Pune',
          branch: t.branch || t.destination || 'Chhatrapati Sambhajinagar',
          freightAmount: Number(t.freightAmount) || 32000,
          material: t.material || 'General FTL Cargo',
          expectedQty: Number(t.expectedQty) || 500,
          unit: t.unit || 'units',
          lrNumber,
          ewayBillNumber,
          dispatchDate: t.dispatchDate ? new Date(t.dispatchDate) : new Date(),
          podStatus: 'MISSING',
          remarks: t.remarks || null,
          smsMagicToken,
        },
        update: {
          freightAmount: Number(t.freightAmount) || undefined,
          material: t.material || undefined,
          expectedQty: Number(t.expectedQty) || undefined,
        },
      });

      createdTrips.push(newTrip);
    }

    await prisma.auditLog.create({
      data: {
        action: 'TRIP_BATCH_IMPORTED',
        actorRole: 'OPERATIONS_HEAD',
        actorName: 'Operations Dispatch',
        details: `Imported ${createdTrips.length} daily trips with LR and e-Way Bill numbers.`,
      },
    });

    return NextResponse.json({
      success: true,
      importedCount: createdTrips.length,
      trips: createdTrips,
    });
  } catch (error) {
    console.error('Failed to import trips:', error);
    return NextResponse.json({ success: false, error: 'Failed to import trips', details: String(error) }, { status: 500 });
  }
}
