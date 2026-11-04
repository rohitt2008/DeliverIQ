import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding DeliverIQ database with realistic Maharashtra FTL logistics data...');

  // Clean existing data
  await prisma.auditLog.deleteMany({});
  await prisma.proofOfDelivery.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.client.deleteMany({});

  // 1. Create Enterprise Clients
  const clientB = await prisma.client.create({
    data: {
      id: 'CL-COMP-B',
      name: 'Company B (cement)',
      industry: 'Cement & Building Materials',
      contactName: 'Sanjay Deshpande (Logistics VP)',
      email: 'sanjay.d@cementcorp-b.co.in',
      phoneMasked: '+91 98•••• 4120',
      gstin: '27AAACB2291E1ZQ',
      billingCycle: 'WEEKLY',
    },
  });

  const clientC = await prisma.client.create({
    data: {
      id: 'CL-COMP-C',
      name: 'Company C (steel)',
      industry: 'Steel & Infrastructure',
      contactName: 'Nitin Patil (Supply Chain Head)',
      email: 'nitin.patil@steelcorp-c.in',
      phoneMasked: '+91 94•••• 7718',
      gstin: '27AABCS8821K1ZM',
      billingCycle: 'FORTNIGHTLY',
    },
  });

  const clientD = await prisma.client.create({
    data: {
      id: 'CL-COMP-D',
      name: 'Company D (packaged foods)',
      industry: 'FMCG / Packaged Foods',
      contactName: 'Anita Rane (National Distribution)',
      email: 'arane@packagedfoods-d.com',
      phoneMasked: '+91 99•••• 3092',
      gstin: '27AACCD3319B1ZF',
      billingCycle: 'WEEKLY',
    },
  });

  // 2. Create Users
  const driverUser = await prisma.user.create({
    data: {
      id: 'USR-DRIVER-01',
      name: 'Ramesh Pawar (चालक / Driver)',
      email: 'driver@deliveriq.in',
      role: 'DRIVER',
      phone: '+91 98220 54321',
      language: 'mr',
    },
  });

  const billingUser = await prisma.user.create({
    data: {
      id: 'USR-BILLING-01',
      name: 'Priya Sharma (Senior Billing Executive)',
      email: 'billing@deliveriq.in',
      role: 'BILLING_EXECUTIVE',
      phone: '+91 98230 11223',
      language: 'en',
    },
  });

  const opsUser = await prisma.user.create({
    data: {
      id: 'USR-OPS-01',
      name: 'Rajesh Deshmukh (Head of Operations & Fleets)',
      email: 'ops@deliveriq.in',
      role: 'OPERATIONS_HEAD',
      phone: '+91 98224 88776',
      language: 'en',
    },
  });

  const clientUser = await prisma.user.create({
    data: {
      id: 'USR-CLIENT-01',
      name: 'Amit Kulkarni (Company B Inward Auditor)',
      email: 'client@deliveriq.in',
      role: 'CLIENT_VIEWER',
      phone: '+91 98221 99001',
      language: 'en',
    },
  });

  console.log('Created Users and Clients.');

  // 3. Seed Exact Trips from Brief
  // TRP-66120: Company B (cement), MH20 EL 4521, Nagpur, 38500, Verified, None
  const trip66120 = await prisma.trip.create({
    data: {
      id: 'TRP-66120',
      clientId: clientB.id,
      vehicleNo: 'MH20 EL 4521',
      isHiredVehicle: false,
      driverName: 'Ramesh Pawar',
      driverPhone: '+91 98220 54321',
      origin: 'Chhatrapati Sambhajinagar',
      destination: 'Nagpur',
      branch: 'Nagpur',
      freightAmount: 38500,
      material: 'Portland Pozzolana Cement (50kg bags)',
      expectedQty: 700,
      unit: 'bags',
      lrNumber: 'LR-NGP-8812',
      ewayBillNumber: '2418-9032-4118',
      dispatchDate: new Date('2026-11-01T08:00:00Z'),
      deliveredDate: new Date('2026-11-02T16:30:00Z'),
      podStatus: 'VERIFIED',
      remarks: null,
      smsMagicToken: 'tok_66120_nagpur',
    },
  });

  await prisma.proofOfDelivery.create({
    data: {
      tripId: trip66120.id,
      imageUrl: '/sample-pods/TRP-66120-pod.svg',
      compressedSizeKb: 142.5,
      capturedAt: new Date('2026-11-02T16:48:12Z'),
      uploadedAt: new Date('2026-11-02T16:49:05Z'),
      gpsLat: 21.1458,
      gpsLng: 79.0882,
      gpsAccuracy: 4.8,
      gpsLocationName: 'Vidarbha Infra Depot, MIDC Hingna, Nagpur',
      isOfflineSync: false,
      retakeCount: 0,
      aiConfidence: 0.98,
      lrNumberDetected: 'LR-NGP-8812',
      lrMatchesTrip: true,
      stampDetected: true,
      stampClarityScore: 0.96,
      signatureDetected: true,
      qtyReceived: 700,
      qtyDiscrepancy: 0,
      remarksDetected: 'All packages intact. Good condition.',
      isShortageOrDamage: false,
      reviewedById: billingUser.id,
      reviewedAt: new Date('2026-11-02T18:15:00Z'),
      reviewNotes: 'Stamp and signature match consignee master records. Approved for billing.',
    },
  });

  // TRP-66134: Company C (steel), MH20 GT 7718, Pune, 26000, Retake requested, Stamp not visible
  const trip66134 = await prisma.trip.create({
    data: {
      id: 'TRP-66134',
      clientId: clientC.id,
      vehicleNo: 'MH20 GT 7718',
      isHiredVehicle: false,
      driverName: 'Santosh Jadhav',
      driverPhone: '+91 98221 66554',
      origin: 'Chhatrapati Sambhajinagar',
      destination: 'Pune',
      branch: 'Pune',
      freightAmount: 26000,
      material: 'Fe550D TMT Reinforcement Bars (12mm)',
      expectedQty: 520,
      unit: 'bundles',
      lrNumber: 'LR-PUN-3490',
      ewayBillNumber: '2418-8819-3320',
      dispatchDate: new Date('2026-11-02T10:00:00Z'),
      deliveredDate: new Date('2026-11-03T14:15:00Z'),
      podStatus: 'RETAKE_REQUESTED',
      remarks: 'Stamp not visible',
      smsMagicToken: 'tok_66134_pune',
    },
  });

  await prisma.proofOfDelivery.create({
    data: {
      tripId: trip66134.id,
      imageUrl: '/sample-pods/TRP-66134-pod.svg',
      compressedSizeKb: 138.2,
      capturedAt: new Date('2026-11-03T14:22:00Z'),
      uploadedAt: new Date('2026-11-03T14:23:10Z'),
      gpsLat: 18.5204,
      gpsLng: 73.8567,
      gpsAccuracy: 6.2,
      gpsLocationName: 'Chakan MIDC Phase 2, Gate 4, Pune',
      isOfflineSync: false,
      retakeCount: 1, // First retake prompted
      aiConfidence: 0.62,
      lrNumberDetected: 'LR-PUN-3490',
      lrMatchesTrip: true,
      stampDetected: false, // STAMP NOT VISIBLE!
      stampClarityScore: 0.15,
      signatureDetected: true,
      qtyReceived: 520,
      qtyDiscrepancy: 0,
      remarksDetected: 'Stamp missing in acknowledgement box.',
      isShortageOrDamage: false,
      executiveRemarks: 'Driver requested to take photo with consignee inward rubber stamp visible.',
    },
  });

  // TRP-66141: Company D (packaged foods), MH17 BY 3092 (hired), Indore, 41200, Needs review, Short by 6 cartons
  const trip66141 = await prisma.trip.create({
    data: {
      id: 'TRP-66141',
      clientId: clientD.id,
      vehicleNo: 'MH17 BY 3092 (hired)',
      isHiredVehicle: true,
      driverName: 'Vikram Shinde (Hired Fleet)',
      driverPhone: '+91 98229 11990',
      origin: 'Chhatrapati Sambhajinagar',
      destination: 'Indore',
      branch: 'Indore',
      freightAmount: 41200,
      material: 'Refined Edible Oil 1L Pouches (Cartons)',
      expectedQty: 450,
      unit: 'cartons',
      lrNumber: 'LR-IND-5012',
      ewayBillNumber: '2418-7712-9901',
      dispatchDate: new Date('2026-11-02T06:00:00Z'),
      deliveredDate: new Date('2026-11-03T17:40:00Z'),
      podStatus: 'NEEDS_REVIEW',
      remarks: 'Short by 6 cartons',
      smsMagicToken: 'tok_66141_indore_hired',
    },
  });

  await prisma.proofOfDelivery.create({
    data: {
      tripId: trip66141.id,
      imageUrl: '/sample-pods/TRP-66141-pod.svg',
      compressedSizeKb: 156.4,
      capturedAt: new Date('2026-11-03T17:55:00Z'),
      uploadedAt: new Date('2026-11-03T17:56:45Z'),
      gpsLat: 22.7196,
      gpsLng: 75.8577,
      gpsAccuracy: 5.5,
      gpsLocationName: 'Pithampur Sector 3 Logistics Park, Indore',
      isOfflineSync: false,
      retakeCount: 0,
      aiConfidence: 0.94,
      lrNumberDetected: 'LR-IND-5012',
      lrMatchesTrip: true,
      stampDetected: true,
      stampClarityScore: 0.91,
      signatureDetected: true,
      qtyReceived: 444, // 6 cartons shortage
      qtyDiscrepancy: 6,
      remarksDetected: 'Short by 6 cartons (444 rcvd out of 450). 2 cartons punctured in transit.',
      isShortageOrDamage: true,
      executiveRemarks: 'Pending debit note agreement with Company D distribution lead before invoicing.',
    },
  });

  // Additional realistic trips across branches and statuses
  const extraTrips = [
    {
      id: 'TRP-66150',
      clientId: clientB.id,
      vehicleNo: 'MH20 EL 9912',
      isHiredVehicle: false,
      driverName: 'Sunil Gholap',
      driverPhone: '+91 98220 88210',
      origin: 'Chhatrapati Sambhajinagar',
      destination: 'Solapur',
      branch: 'Solapur',
      freightAmount: 31000,
      material: 'Cement 53 Grade (50kg)',
      expectedQty: 650,
      unit: 'bags',
      lrNumber: 'LR-SLP-4401',
      ewayBillNumber: '2418-6621-1190',
      dispatchDate: new Date('2026-11-03T09:00:00Z'),
      deliveredDate: new Date('2026-11-04T08:30:00Z'),
      podStatus: 'MISSING',
      remarks: null,
      smsMagicToken: 'tok_66150_solapur',
    },
    {
      id: 'TRP-66152',
      clientId: clientC.id,
      vehicleNo: 'MH15 DS 4410 (hired)',
      isHiredVehicle: true,
      driverName: 'Baban Rathod',
      driverPhone: '+91 94220 33112',
      origin: 'Chhatrapati Sambhajinagar',
      destination: 'Nashik',
      branch: 'Nashik',
      freightAmount: 22500,
      material: 'Mild Steel Wire Rods',
      expectedQty: 380,
      unit: 'coils',
      lrNumber: 'LR-NSK-1120',
      ewayBillNumber: '2418-5510-4499',
      dispatchDate: new Date('2026-11-03T11:00:00Z'),
      deliveredDate: new Date('2026-11-04T07:10:00Z'),
      podStatus: 'MISSING',
      remarks: null,
      smsMagicToken: 'tok_66152_nashik',
    },
    {
      id: 'TRP-66155',
      clientId: clientB.id,
      vehicleNo: 'MH20 CT 4001',
      isHiredVehicle: false,
      driverName: 'Kailash Kadam',
      driverPhone: '+91 98225 44331',
      origin: 'Chhatrapati Sambhajinagar',
      destination: 'Mumbai (Bhiwandi Hub)',
      branch: 'Mumbai',
      freightAmount: 44000,
      material: 'Ordinary Portland Cement 53 Grade',
      expectedQty: 600,
      unit: 'bags',
      lrNumber: 'LR-BOM-9102',
      ewayBillNumber: '2418-4499-1234',
      dispatchDate: new Date('2026-11-01T06:00:00Z'),
      deliveredDate: new Date('2026-11-02T11:00:00Z'),
      podStatus: 'VERIFIED',
      remarks: null,
      smsMagicToken: 'tok_66155_bhiwandi',
      hasPod: true,
      podImage: '/sample-pods/TRP-66155-pod.svg',
    },
    {
      id: 'TRP-66158',
      clientId: clientD.id,
      vehicleNo: 'MH20 EL 1102',
      isHiredVehicle: false,
      driverName: 'Ganesh More',
      driverPhone: '+91 98223 99881',
      origin: 'Chhatrapati Sambhajinagar',
      destination: 'Nagpur',
      branch: 'Nagpur',
      freightAmount: 37500,
      material: 'Biscuit & Confectionery Cases',
      expectedQty: 820,
      unit: 'cases',
      lrNumber: 'LR-NGP-9944',
      ewayBillNumber: '2418-3321-7711',
      dispatchDate: new Date('2026-11-01T14:00:00Z'),
      deliveredDate: new Date('2026-11-02T19:00:00Z'),
      podStatus: 'VERIFIED',
      remarks: null,
      smsMagicToken: 'tok_66158_nagpur',
      hasPod: true,
      podImage: '/sample-pods/TRP-66120-pod.svg',
    },
    {
      id: 'TRP-66160',
      clientId: clientC.id,
      vehicleNo: 'MH20 EL 8090',
      isHiredVehicle: false,
      driverName: 'Suresh Patil',
      driverPhone: '+91 98221 11229',
      origin: 'Chhatrapati Sambhajinagar',
      destination: 'Pune',
      branch: 'Pune',
      freightAmount: 27500,
      material: 'High Tensile Structural Plates',
      expectedQty: 300,
      unit: 'plates',
      lrNumber: 'LR-PUN-7721',
      ewayBillNumber: '2418-1122-8877',
      dispatchDate: new Date('2026-11-02T08:00:00Z'),
      deliveredDate: new Date('2026-11-03T11:30:00Z'),
      podStatus: 'VERIFIED',
      remarks: null,
      smsMagicToken: 'tok_66160_pune',
      hasPod: true,
      podImage: '/sample-pods/TRP-66120-pod.svg',
    },
    {
      id: 'TRP-66162',
      clientId: clientB.id,
      vehicleNo: 'MH20 EL 3012',
      isHiredVehicle: false,
      driverName: 'Dnyaneshwar Shinde',
      driverPhone: '+91 98224 44556',
      origin: 'Chhatrapati Sambhajinagar',
      destination: 'Indore',
      branch: 'Indore',
      freightAmount: 43000,
      material: 'White Cement 25kg Bags',
      expectedQty: 800,
      unit: 'bags',
      lrNumber: 'LR-IND-6632',
      ewayBillNumber: '2418-7788-9900',
      dispatchDate: new Date('2026-11-03T14:00:00Z'),
      deliveredDate: new Date('2026-11-04T09:30:00Z'),
      podStatus: 'MISSING',
      remarks: null,
      smsMagicToken: 'tok_66162_indore',
    },
    {
      id: 'TRP-66165',
      clientId: clientD.id,
      vehicleNo: 'MH12 AB 9081 (hired)',
      isHiredVehicle: true,
      driverName: 'Arjun Kale (Hired)',
      driverPhone: '+91 98228 77665',
      origin: 'Chhatrapati Sambhajinagar',
      destination: 'Pune',
      branch: 'Pune',
      freightAmount: 25000,
      material: 'Packaged Snacks Cartons',
      expectedQty: 500,
      unit: 'cartons',
      lrNumber: 'LR-PUN-8812',
      ewayBillNumber: '2418-9901-2244',
      dispatchDate: new Date('2026-11-02T16:00:00Z'),
      deliveredDate: new Date('2026-11-03T20:15:00Z'),
      podStatus: 'NEEDS_REVIEW',
      remarks: '2 cartons water damaged due to rain cover tear',
      smsMagicToken: 'tok_66165_pune_hired',
      hasPod: true,
      podImage: '/sample-pods/TRP-66141-pod.svg',
    }
  ];

  for (const t of extraTrips) {
    const createdTrip = await prisma.trip.create({
      data: {
        id: t.id,
        clientId: t.clientId,
        vehicleNo: t.vehicleNo,
        isHiredVehicle: t.isHiredVehicle,
        driverName: t.driverName,
        driverPhone: t.driverPhone,
        origin: t.origin,
        destination: t.destination,
        branch: t.branch,
        freightAmount: t.freightAmount,
        material: t.material,
        expectedQty: t.expectedQty,
        unit: t.unit,
        lrNumber: t.lrNumber,
        ewayBillNumber: t.ewayBillNumber,
        dispatchDate: t.dispatchDate,
        deliveredDate: t.deliveredDate,
        podStatus: t.podStatus,
        remarks: t.remarks,
        smsMagicToken: t.smsMagicToken,
      },
    });

    if (t.hasPod) {
      await prisma.proofOfDelivery.create({
        data: {
          tripId: createdTrip.id,
          imageUrl: t.podImage || '/sample-pods/TRP-66120-pod.svg',
          compressedSizeKb: 135.0,
          capturedAt: new Date(t.deliveredDate.getTime() + 15 * 60000),
          uploadedAt: new Date(t.deliveredDate.getTime() + 17 * 60000),
          gpsLat: 19.8762,
          gpsLng: 75.3433,
          gpsAccuracy: 5.0,
          gpsLocationName: `${t.destination} Industrial Gate`,
          isOfflineSync: false,
          retakeCount: 0,
          aiConfidence: 0.95,
          lrNumberDetected: t.lrNumber,
          lrMatchesTrip: true,
          stampDetected: true,
          stampClarityScore: 0.94,
          signatureDetected: true,
          qtyReceived: t.expectedQty - (t.remarks ? 2 : 0),
          qtyDiscrepancy: t.remarks ? 2 : 0,
          remarksDetected: t.remarks || 'No damage noticed',
          isShortageOrDamage: !!t.remarks,
        },
      });
    }
  }

  // 4. Create Sample Invoiced batch for Client B
  const sampleInvoice = await prisma.invoice.create({
    data: {
      id: 'INV-2026-0042',
      clientId: clientB.id,
      billingPeriod: '2026-W44 (Oct 28 - Nov 03)',
      totalFreight: 82500,
      deductions: 0,
      netPayable: 82500,
      status: 'TALLY_EXPORTED',
      tallyExportedAt: new Date('2026-11-03T11:00:00Z'),
    },
  });

  // Link verified trips to this invoice to show past cycle
  await prisma.trip.update({
    where: { id: 'TRP-66155' },
    data: {
      invoiceId: sampleInvoice.id,
      podStatus: 'INVOICED',
    },
  });

  // 5. Initial Audit Log
  await prisma.auditLog.create({
    data: {
      action: 'SYSTEM_INITIALIZED',
      actorRole: 'SYSTEM',
      actorName: 'DeliverIQ Migration Engine',
      details: 'Database seeded with Company A logistics fleet (140 owned + 200 market trucks), Chhatrapati Sambhajinagar hub.',
    },
  });

  console.log('✅ Seed completed successfully with 10 realistic trips across Company B, C, and D.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
