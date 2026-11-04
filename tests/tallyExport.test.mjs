import test from 'node:test';
import assert from 'node:assert';
import { generateTallyXML, generateBillingCSV } from '../src/lib/tallyExport.ts';

test('Tally Prime XML Export generates valid XML structure with ledger entries and POD links', () => {
  const sampleBatch = {
    invoiceNumber: 'INV-2026-0042',
    clientName: 'Company B (cement)',
    gstin: '27AAACB2291E1ZQ',
    invoiceDate: '2026-11-04',
    trips: [
      {
        id: 'TRP-66120',
        lrNumber: 'LR-NGP-8812',
        ewayBillNumber: '2418-9032-4118',
        vehicleNo: 'MH20 EL 4521',
        origin: 'Chhatrapati Sambhajinagar',
        destination: 'Nagpur',
        freightAmount: 38500,
        material: 'Portland Pozzolana Cement (50kg)',
        deliveredDate: '2026-11-02',
        podImageUrl: '/uploads/TRP-66120.jpg',
      },
      {
        id: 'TRP-66155',
        lrNumber: 'LR-BOM-9102',
        ewayBillNumber: '2418-4499-1234',
        vehicleNo: 'MH20 CT 4001',
        origin: 'Chhatrapati Sambhajinagar',
        destination: 'Mumbai',
        freightAmount: 44000,
        material: 'Ordinary Portland Cement 53 Grade',
        deliveredDate: '2026-11-02',
        podImageUrl: '/uploads/TRP-66155.jpg',
      },
    ],
    totalFreight: 82500,
    deductions: 0,
    netPayable: 82500,
  };

  const xml = generateTallyXML(sampleBatch);

  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.ok(xml.includes('<TALLYREQUEST>Import Data</TALLYREQUEST>'));
  assert.ok(xml.includes('<VOUCHER VCHTYPE="Sales"'));
  assert.ok(xml.includes('<PARTYLEDGERNAME><![CDATA[Company B (cement)]]></PARTYLEDGERNAME>'));
  assert.ok(xml.includes('<AMOUNT>-82500.00</AMOUNT>'));
  assert.ok(xml.includes('LR-NGP-8812'));
  assert.ok(xml.includes('LR-BOM-9102'));
  assert.ok(xml.includes('/uploads/TRP-66120.jpg'));
  assert.ok(xml.includes('DELIVERIQ_POD_COUNT desc="Verified POD Count">2</UDF:DELIVERIQ_POD_COUNT>'));
});

test('Billing CSV Export generates headers and formatted rows', () => {
  const trips = [
    {
      id: 'TRP-66120',
      lrNumber: 'LR-NGP-8812',
      ewayBillNumber: '2418-9032-4118',
      vehicleNo: 'MH20 EL 4521',
      origin: 'Chhatrapati Sambhajinagar',
      destination: 'Nagpur',
      freightAmount: 38500,
      material: 'Cement',
      deliveredDate: '2026-11-02',
      podImageUrl: '/uploads/TRP-66120.jpg',
    },
  ];

  const csv = generateBillingCSV(trips, 'Company B (cement)');
  const lines = csv.split('\n');

  assert.strictEqual(lines.length, 2);
  assert.ok(lines[0].includes('Trip ID,LR Number,e-Way Bill Number'));
  assert.ok(lines[1].includes('TRP-66120,LR-NGP-8812,2418-9032-4118,MH20 EL 4521'));
  assert.ok(lines[1].includes('38500'));
});
