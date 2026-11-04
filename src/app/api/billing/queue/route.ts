import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        trips: {
          where: {
            podStatus: { in: ['VERIFIED', 'INVOICED'] },
          },
          include: {
            pod: true,
          },
          orderBy: { deliveredDate: 'desc' },
        },
      },
    });

    const clientBatches = clients.map((client) => {
      const verifiedTrips = client.trips.filter((t) => t.podStatus === 'VERIFIED');
      const invoicedTrips = client.trips.filter((t) => t.podStatus === 'INVOICED');

      const verifiedFreightTotal = verifiedTrips.reduce((acc, t) => acc + t.freightAmount, 0);
      const invoicedFreightTotal = invoicedTrips.reduce((acc, t) => acc + t.freightAmount, 0);

      return {
        client,
        verifiedTrips,
        invoicedTrips,
        verifiedFreightTotal,
        invoicedFreightTotal,
        readyForBillingCount: verifiedTrips.length,
      };
    });

    return NextResponse.json({ success: true, clientBatches });
  } catch (error) {
    console.error('Failed to fetch billing queue:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
