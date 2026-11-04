import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { maskPhoneNumber } from '@/lib/dpdp';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        client: true,
        pod: {
          include: {
            reviewedBy: true,
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      trip: {
        ...trip,
        driverPhoneMasked: maskPhoneNumber(trip.driverPhone),
      },
    });
  } catch (error) {
    console.error('Failed to fetch trip by id:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
