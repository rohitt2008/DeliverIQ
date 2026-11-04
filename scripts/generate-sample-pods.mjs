import fs from 'fs';
import path from 'path';

const outputDir = path.join(process.cwd(), 'public', 'sample-pods');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function generatePODSvg({
  lrNumber,
  tripId,
  clientName,
  vehicleNo,
  origin,
  destination,
  material,
  qtyExpected,
  qtyReceived,
  consigneeName,
  hasStamp = true,
  hasSignature = true,
  shortageRemark = null,
  date = '2026-11-02'
}) {
  const isShortage = shortageRemark !== null;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="800" height="1100">
  <defs>
    <filter id="paper-texture" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
      <feDiffuseLighting in="noise" lighting-color="#fff" surfaceScale="1" result="light">
        <feDistantLight azimuth="45" elevation="60" />
      </feDiffuseLighting>
      <feBlend mode="multiply" in="SourceGraphic" in2="light" />
    </filter>
  </defs>

  <!-- Background Paper -->
  <rect width="800" height="1100" fill="#fbfaf6" stroke="#c4bead" stroke-width="2"/>

  <!-- Watermark border -->
  <rect x="25" y="25" width="750" height="1050" fill="none" stroke="#2c3e50" stroke-width="1.5" stroke-dasharray="8 4"/>
  <rect x="30" y="30" width="740" height="1040" fill="none" stroke="#2c3e50" stroke-width="0.8"/>

  <!-- Transporter Header -->
  <g transform="translate(45, 50)">
    <text x="355" y="30" font-family="Helvetica, Arial, sans-serif" font-size="24" font-weight="bold" fill="#0f2b48" text-anchor="middle">COMPANY A LOGISTICS (FTL DIVISION)</text>
    <text x="355" y="52" font-family="Helvetica, Arial, sans-serif" font-size="12" fill="#4a5568" text-anchor="middle">Plot 42, MIDC Industrial Area, Waluj, Chhatrapati Sambhajinagar - 431136, Maharashtra</text>
    <text x="355" y="68" font-family="Helvetica, Arial, sans-serif" font-size="11" fill="#4a5568" text-anchor="middle">Phone: +91 240 255XXXX | GSTIN: 27AABCA1234F1Z8</text>
    <line x1="0" y1="85" x2="710" y2="85" stroke="#0f2b48" stroke-width="2"/>
  </g>

  <!-- Document Title & Meta -->
  <g transform="translate(45, 150)">
    <rect x="0" y="0" width="350" height="40" fill="#0f2b48" rx="4"/>
    <text x="175" y="26" font-family="Helvetica, Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">CONSIGNEE PROOF OF DELIVERY (POD)</text>

    <text x="400" y="18" font-family="monospace" font-size="13" font-weight="bold" fill="#1a202c">TRIP ID: ${tripId}</text>
    <text x="400" y="36" font-family="monospace" font-size="13" font-weight="bold" fill="#1a202c">LR NO:   ${lrNumber}</text>
    <text x="600" y="18" font-family="monospace" font-size="12" fill="#4a5568">DATE: ${date}</text>
    <text x="600" y="36" font-family="monospace" font-size="12" fill="#4a5568">VEHICLE: ${vehicleNo}</text>
  </g>

  <!-- Consignment Info Grid -->
  <g transform="translate(45, 215)">
    <rect x="0" y="0" width="710" height="150" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.2"/>
    
    <!-- Row 1 -->
    <rect x="0" y="0" width="710" height="28" fill="#f1f5f9"/>
    <text x="15" y="19" font-family="sans-serif" font-size="11" font-weight="bold" fill="#334155">CONSIGNOR / CLIENT</text>
    <text x="365" y="19" font-family="sans-serif" font-size="11" font-weight="bold" fill="#334155">CONSIGNEE (DELIVERY TO)</text>
    <line x1="355" y1="0" x2="355" y2="150" stroke="#cbd5e1"/>

    <!-- Left Details -->
    <text x="15" y="50" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0f172a">${clientName}</text>
    <text x="15" y="70" font-family="sans-serif" font-size="12" fill="#475569">Origin Hub: ${origin}</text>
    <text x="15" y="90" font-family="sans-serif" font-size="12" fill="#475569">Material: ${material}</text>
    <text x="15" y="110" font-family="sans-serif" font-size="12" fill="#475569">E-Way Bill: 2418 9032 4118</text>

    <!-- Right Details -->
    <text x="370" y="50" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0f172a">${consigneeName}</text>
    <text x="370" y="70" font-family="sans-serif" font-size="12" fill="#475569">Destination: ${destination}</text>
    <text x="370" y="90" font-family="sans-serif" font-size="12" fill="#475569">Consignee GST: 27AABCK9928D1ZQ</text>
    <text x="370" y="110" font-family="sans-serif" font-size="12" fill="#475569">Unloading Gate: Inward Gate #2</text>
  </g>

  <!-- Items Table -->
  <g transform="translate(45, 390)">
    <rect x="0" y="0" width="710" height="240" fill="#ffffff" stroke="#cbd5e1"/>
    <!-- Table Header -->
    <rect x="0" y="0" width="710" height="32" fill="#e2e8f0"/>
    <text x="15" y="21" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1e293b">ITEM / DESCRIPTION</text>
    <text x="330" y="21" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1e293b">EXP QTY</text>
    <text x="440" y="21" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1e293b">RCVD QTY</text>
    <text x="560" y="21" font-family="sans-serif" font-size="11" font-weight="bold" fill="#1e293b">CONDITION</text>
    <line x1="0" y1="32" x2="710" y2="32" stroke="#94a3b8"/>

    <!-- Table Rows -->
    <line x1="315" y1="0" x2="315" y2="240" stroke="#cbd5e1"/>
    <line x1="425" y1="0" x2="425" y2="240" stroke="#cbd5e1"/>
    <line x1="545" y1="0" x2="545" y2="240" stroke="#cbd5e1"/>

    <text x="15" y="70" font-family="sans-serif" font-size="13" font-weight="600" fill="#0f172a">${material}</text>
    <text x="15" y="92" font-family="sans-serif" font-size="11" fill="#64748b">Batch #MH-2026-X4 | FTL Standard Packaging</text>

    <text x="330" y="70" font-family="monospace" font-size="14" font-weight="bold" fill="#0f172a">${qtyExpected}</text>
    <text x="440" y="70" font-family="monospace" font-size="14" font-weight="bold" fill="${isShortage ? '#dc2626' : '#0f172a'}">${qtyReceived}</text>
    <text x="560" y="70" font-family="sans-serif" font-size="13" font-weight="bold" fill="${isShortage ? '#dc2626' : '#16a34a'}">
      ${isShortage ? 'DEFICIT / DAMAGE' : 'GOOD & SOUND'}
    </text>

    <!-- Shortage Remarks Box -->
    <rect x="15" y="140" width="680" height="80" fill="#fef2f2" stroke="#fca5a5" stroke-dasharray="4 2"/>
    <text x="25" y="162" font-family="sans-serif" font-size="11" font-weight="bold" fill="#991b1b">RECEIVER REMARKS / SHORTAGE / DAMAGE NOTE:</text>
    <text x="25" y="195" font-family="'Caveat', cursive, 'Brush Script MT', sans-serif" font-size="22" font-weight="bold" fill="#b91c1c">
      ${shortageRemark ? shortageRemark : 'All packages received in intact, seal-verified condition. No shortage or leakage noticed.'}
    </text>
  </g>

  <!-- Consignee Acceptance & Seal Box -->
  <g transform="translate(45, 655)">
    <rect x="0" y="0" width="710" height="340" fill="#ffffff" stroke="#0f2b48" stroke-width="1.5"/>
    <rect x="0" y="0" width="710" height="28" fill="#0f2b48"/>
    <text x="15" y="19" font-family="sans-serif" font-size="12" font-weight="bold" fill="#ffffff">CONSIGNEE ACKNOWLEDGEMENT &amp; PHYSICAL VERIFICATION</text>

    <!-- Disclaimer -->
    <text x="15" y="55" font-family="sans-serif" font-size="10" fill="#64748b">
      Certified that the goods described above have been received in the quantity and condition stated.
    </text>

    <!-- Signatures & Seals Grid -->
    <line x1="355" y1="28" x2="355" y2="340" stroke="#cbd5e1" stroke-dasharray="4 4"/>

    <!-- Left: Driver signature -->
    <text x="25" y="90" font-family="sans-serif" font-size="11" font-weight="bold" fill="#334155">DRIVER SIGNATURE &amp; THUMB:</text>
    <path d="M 40 180 Q 90 120 140 170 T 240 150" fill="none" stroke="#1e3a8a" stroke-width="2.5" />
    <text x="40" y="220" font-family="sans-serif" font-size="12" fill="#334155">Driver: R. Pawar (Vehicle ${vehicleNo})</text>
    <text x="40" y="240" font-family="sans-serif" font-size="10" fill="#64748b">Date &amp; Time: ${date} 16:45 IST</text>

    <!-- Right: Consignee Stamp & Sign -->
    <text x="380" y="90" font-family="sans-serif" font-size="11" font-weight="bold" fill="#334155">CONSIGNEE OFFICIAL STAMP &amp; SIGNATURE:</text>
    ${hasStamp ? `
    <!-- Realistic Blue Consignee Stamp -->
    <g transform="translate(480, 195) rotate(-6)">
      <circle cx="0" cy="0" r="72" fill="none" stroke="#1d4ed8" stroke-width="3.5" opacity="0.85" stroke-dasharray="120 6"/>
      <circle cx="0" cy="0" r="62" fill="none" stroke="#1d4ed8" stroke-width="1.5" opacity="0.85"/>
      <text x="0" y="-38" font-family="Impact, Arial Black, sans-serif" font-size="10.5" fill="#1d4ed8" opacity="0.85" text-anchor="middle" letter-spacing="1.5">${consigneeName.toUpperCase()}</text>
      <text x="0" y="-8" font-family="sans-serif" font-size="9" font-weight="bold" fill="#1d4ed8" opacity="0.85" text-anchor="middle">GOODS RECEIVED</text>
      <text x="0" y="10" font-family="monospace" font-size="11" font-weight="bold" fill="#1d4ed8" opacity="0.9" text-anchor="middle">${date}</text>
      <text x="0" y="32" font-family="sans-serif" font-size="8.5" font-weight="bold" fill="#1d4ed8" opacity="0.85" text-anchor="middle">INWARD GATE VERIFIED</text>
      <text x="0" y="48" font-family="sans-serif" font-size="8" fill="#1d4ed8" opacity="0.85" text-anchor="middle">CENTRAL DEPOT</text>
    </g>
    ` : `
    <!-- Stamp Missing Placeholder Warning Box -->
    <rect x="420" y="120" width="220" height="120" fill="#fff1f2" stroke="#f43f5e" stroke-width="2" stroke-dasharray="6 4" rx="8"/>
    <text x="530" y="175" font-family="sans-serif" font-size="13" font-weight="bold" fill="#e11d48" text-anchor="middle">[ STAMP NOT AFFIXED ]</text>
    <text x="530" y="200" font-family="sans-serif" font-size="10" fill="#9f1239" text-anchor="middle">Consignee gate stamp missing</text>
    `}

    ${hasSignature ? `
    <!-- Consignee Signature in dark blue ink -->
    <path d="M 400 280 C 430 250, 480 290, 520 260 S 580 270, 620 255" fill="none" stroke="#0f172a" stroke-width="2.2" opacity="0.9"/>
    <text x="400" y="315" font-family="sans-serif" font-size="11" fill="#475569">Authorized Gate Receiving Officer</text>
    ` : ''}
  </g>

  <!-- DeliverIQ Digital Geo-Stamp Barcode Footer -->
  <g transform="translate(45, 1020)">
    <rect x="0" y="0" width="710" height="42" fill="#f8fafc" stroke="#cbd5e1" rx="4"/>
    <text x="15" y="18" font-family="monospace" font-size="10" font-weight="bold" fill="#0f2b48">DELIVERIQ SECURE GEO-POD</text>
    <text x="15" y="32" font-family="monospace" font-size="9" fill="#64748b">GPS: 19.8762° N, 75.3433° E | ACCURACY: 4.8m | CAPTURED: ${date}T16:48:12Z</text>
    <text x="520" y="25" font-family="monospace" font-size="10" fill="#059669" font-weight="bold">✓ SHA-256 INTEGRITY VERIFIED</text>
  </g>
</svg>`;
}

// Generate the exact brief sample PODs
const samples = [
  {
    fileName: 'TRP-66120-pod.svg',
    tripId: 'TRP-66120',
    lrNumber: 'LR-NGP-8812',
    clientName: 'Company B (cement)',
    vehicleNo: 'MH20 EL 4521',
    origin: 'Chhatrapati Sambhajinagar',
    destination: 'Nagpur',
    material: 'Portland Pozzolana Cement (50kg)',
    qtyExpected: 700,
    qtyReceived: 700,
    consigneeName: 'Vidarbha Infra Dealers',
    hasStamp: true,
    hasSignature: true,
    shortageRemark: null,
    date: '2026-11-02'
  },
  {
    fileName: 'TRP-66134-pod.svg',
    tripId: 'TRP-66134',
    lrNumber: 'LR-PUN-3490',
    clientName: 'Company C (steel)',
    vehicleNo: 'MH20 GT 7718',
    origin: 'Chhatrapati Sambhajinagar',
    destination: 'Pune',
    material: 'Fe550D TMT Reinforcement Bars (12mm)',
    qtyExpected: 520,
    qtyReceived: 520,
    consigneeName: 'Chakan Precast Works',
    hasStamp: false, // STAMP MISSING! Triggers Retake Requested
    hasSignature: true,
    shortageRemark: null,
    date: '2026-11-03'
  },
  {
    fileName: 'TRP-66141-pod.svg',
    tripId: 'TRP-66141',
    lrNumber: 'LR-IND-5012',
    clientName: 'Company D (packaged foods)',
    vehicleNo: 'MH17 BY 3092 (hired)',
    origin: 'Chhatrapati Sambhajinagar',
    destination: 'Indore',
    material: 'Refined Edible Oil 1L Pouches (Cartons)',
    qtyExpected: 450,
    qtyReceived: 444, // SHORT BY 6 CARTONS!
    consigneeName: 'Malwa Super Stockists',
    hasStamp: true,
    hasSignature: true,
    shortageRemark: 'Short by 6 cartons (444 rcvd out of 450). 2 cartons punctured in transit.',
    date: '2026-11-03'
  },
  {
    fileName: 'TRP-66155-pod.svg',
    tripId: 'TRP-66155',
    lrNumber: 'LR-BOM-9102',
    clientName: 'Company B (cement)',
    vehicleNo: 'MH20 CT 4001',
    origin: 'Chhatrapati Sambhajinagar',
    destination: 'Mumbai (Bhiwandi Hub)',
    material: 'Ordinary Portland Cement 53 Grade',
    qtyExpected: 600,
    qtyReceived: 600,
    consigneeName: 'Metro Concrete ReadyMix',
    hasStamp: true,
    hasSignature: true,
    shortageRemark: null,
    date: '2026-11-01'
  }
];

for (const sample of samples) {
  const filePath = path.join(outputDir, sample.fileName);
  fs.writeFileSync(filePath, generatePODSvg(sample));
  console.log(`Generated sample POD: ${sample.fileName}`);
}
