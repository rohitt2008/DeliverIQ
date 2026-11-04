/**
 * Tally ERP 9 & Tally Prime XML Voucher Export Engine
 * 
 * Formats FTL verified freight trips into native Tally XML format
 * with LR Number, e-Way Bill, Vehicle Number, and digital POD URL attached.
 */

export interface TallyTripExport {
  id: string;
  lrNumber: string;
  ewayBillNumber: string;
  vehicleNo: string;
  origin: string;
  destination: string;
  freightAmount: number;
  material: string;
  deliveredDate: Date | string | null;
  podImageUrl?: string | null;
}

export interface TallyBatchExport {
  invoiceNumber: string;
  clientName: string;
  gstin?: string | null;
  invoiceDate: Date | string;
  trips: TallyTripExport[];
  totalFreight: number;
  deductions: number;
  netPayable: number;
}

export function generateTallyXML(batch: TallyBatchExport): string {
  const dateObj = new Date(batch.invoiceDate);
  const tallyDate = dateObj.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const formattedDate = dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const narrationLines = [
    `Invoice: ${batch.invoiceNumber} | Client: ${batch.clientName}`,
    `Total FTL Trips: ${batch.trips.length} | Net Freight: INR ${batch.netPayable.toLocaleString('en-IN')}`,
    ...batch.trips.map(
      (t) => `• Trip: ${t.id} | LR: ${t.lrNumber} | Veh: ${t.vehicleNo} | Dest: ${t.destination} | e-Way: ${t.ewayBillNumber} | POD: ${t.podImageUrl || 'Verified'}`
    ),
  ].join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Company A Logistics Pvt Ltd</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Accounting Voucher View">
            <DATE>${tallyDate}</DATE>
            <GUID>DELIVERIQ-${batch.invoiceNumber}</GUID>
            <NARRATION><![CDATA[${narrationLines}]]></NARRATION>
            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${batch.invoiceNumber}</VOUCHERNUMBER>
            <PARTYLEDGERNAME><![CDATA[${batch.clientName}]]></PARTYLEDGERNAME>
            <REFERENCE>${batch.invoiceNumber}</REFERENCE>
            <EFFECTIVEDATE>${tallyDate}</EFFECTIVEDATE>
            
            <!-- Sundry Debtor Debit Entry -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME><![CDATA[${batch.clientName}]]></LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${batch.netPayable.toFixed(2)}</AMOUNT>
              <BILLALLOCATIONS.LIST>
                <NAME>${batch.invoiceNumber}</NAME>
                <BILLTYPE>New Ref</BILLTYPE>
                <AMOUNT>-${batch.netPayable.toFixed(2)}</AMOUNT>
              </BILLALLOCATIONS.LIST>
            </ALLLEDGERENTRIES.LIST>

            <!-- Freight Revenue Credit Entry -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Freight Income (FTL Interstate)</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${batch.totalFreight.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            
            ${batch.deductions > 0 ? `
            <!-- Shortage / Damage Deduction Credit Entry -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Transit Shortage &amp; Damage Deductions</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${batch.deductions.toFixed(2)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            ` : ''}

            <!-- DeliverIQ Custom UDF Metadata for direct POD access -->
            <UDF:DELIVERIQ_BATCH_ID desc="DeliverIQ Batch">${batch.invoiceNumber}</UDF:DELIVERIQ_BATCH_ID>
            <UDF:DELIVERIQ_POD_COUNT desc="Verified POD Count">${batch.trips.length}</UDF:DELIVERIQ_POD_COUNT>
            <UDF:DELIVERIQ_AUDIT_STATUS desc="Digital Audit">VERIFIED_WITH_GEO_STAMP</UDF:DELIVERIQ_AUDIT_STATUS>
          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

  return xml.trim();
}

/**
 * Generates CSV Export for Billing & Client Finance Teams
 */
export function generateBillingCSV(trips: TallyTripExport[], clientName: string): string {
  const headers = [
    'Trip ID',
    'LR Number',
    'e-Way Bill Number',
    'Vehicle Number',
    'Origin',
    'Destination',
    'Material',
    'Delivered Date',
    'Freight (INR)',
    'Client Name',
    'POD Image Link',
    'Audit Status'
  ];

  const rows = trips.map((t) => [
    t.id,
    t.lrNumber,
    t.ewayBillNumber,
    t.vehicleNo,
    `"${t.origin}"`,
    `"${t.destination}"`,
    `"${t.material}"`,
    t.deliveredDate ? new Date(t.deliveredDate).toISOString().slice(0, 10) : '—',
    t.freightAmount,
    `"${clientName}"`,
    t.podImageUrl || 'N/A',
    'VERIFIED'
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
