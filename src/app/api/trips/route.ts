import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { maskPhoneNumber } from '@/lib/dpdp';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');
    const branch = searchParams.get('branch');
    const search = searchParams.get('search');

    const whereClause: Record<string, unknown> = {};

    if (status && status !== 'ALL') {
      whereClause.podStatus = status;
    }

    if (clientId && clientId !== 'ALL') {
      whereClause.clientId = clientId;
    }

    if (branch && branch !== 'ALL') {
      whereClause.branch = branch;
    }

    if (search) {
      whereClause.OR = [
        { id: { contains: search } },
        { lrNumber: { contains: search } },
        { vehicleNo: { contains: search } },
        { destination: { contains: search } },
      ];
    }

    const trips = await prisma.trip.findMany({
      where: whereClause,
      include: {
        client: true,
        pod: true,
      },
      orderBy: { dispatchDate: 'desc' },
    });

    // Apply DPDP Act 2023 masking for privacy
    const sanitizedTrips = trips.map((t) => ({
      ...t,
      driverPhoneMasked: maskPhoneNumber(t.driverPhone),
    }));

    return NextResponse.json({ success: true, trips: sanitizedTrips });
  } catch (error) {
    console.error('Failed to fetch trips:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
