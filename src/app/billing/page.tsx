'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  CheckSquare,
  Square,
  Building2,
  Calendar,
  FileCheck,
  Printer,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface BillingClientBatch {
  client: {
    id: string;
    name: string;
    industry: string;
    billingCycle: string;
    gstin?: string | null;
  };
  verifiedTrips: Array<{
    id: string;
    lrNumber: string;
    ewayBillNumber: string;
    vehicleNo: string;
    destination: string;
    freightAmount: number;
    material: string;
    deliveredDate: string | null;
    pod?: {
      imageUrl: string;
      qtyDiscrepancy: number;
    } | null;
  }>;
  invoicedTrips: Array<{
    id: string;
    lrNumber: string;
    vehicleNo: string;
    freightAmount: number;
  }>;
  verifiedFreightTotal: number;
  invoicedFreightTotal: number;
  readyForBillingCount: number;
}

export default function BillingQueuePage() {
  const [batches, setBatches] = useState<BillingClientBatch[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedTripIds, setSelectedTripIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState<{
    invoiceNumber: string;
    netPayable: number;
    tripCount: number;
  } | null>(null);

  // Invoice Preview Modal State
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/billing/queue');
      const data = await res.json();
      if (data.success && data.clientBatches.length > 0) {
        setBatches(data.clientBatches);
        if (!selectedClientId) {
          const firstWithTrips = data.clientBatches.find((b: BillingClientBatch) => b.readyForBillingCount > 0) || data.clientBatches[0];
          setSelectedClientId(firstWithTrips.client.id);
          setSelectedTripIds(firstWithTrips.verifiedTrips.map((t: any) => t.id));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const activeBatch = batches.find((b) => b.client.id === selectedClientId);

  const toggleSelectAll = () => {
    if (!activeBatch) return;
    if (selectedTripIds.length === activeBatch.verifiedTrips.length) {
      setSelectedTripIds([]);
    } else {
      setSelectedTripIds(activeBatch.verifiedTrips.map((t) => t.id));
    }
  };

  const toggleTripSelection = (tripId: string) => {
    setSelectedTripIds((prev) =>
      prev.includes(tripId) ? prev.filter((id) => id !== tripId) : [...prev, tripId]
    );
  };

  const handleExportTally = async (format: 'xml' | 'csv') => {
    if (!activeBatch || selectedTripIds.length === 0) return;
    setIsExporting(true);

    try {
      const res = await fetch('/api/billing/export-tally', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: activeBatch.client.id,
          tripIds: selectedTripIds,
          billingPeriod: '2026-W45',
          format,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Export failed');
      }

      setLastExport({
        invoiceNumber: data.invoice.id,
        netPayable: data.netPayable,
        tripCount: data.tripsExportedCount,
      });

      // Trigger automatic browser download
      const content = format === 'xml' ? data.xml : data.csv;
      const mime = format === 'xml' ? 'application/xml' : 'text/csv';
      const ext = format === 'xml' ? '.xml' : '.csv';
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Tally_${data.invoice.id}_${activeBatch.client.name.replace(/[^a-zA-Z0-9]/g, '_')}${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Refresh queue
      await fetchQueue();
    } catch (err: any) {
      alert(err.message || 'Export error');
    } finally {
      setIsExporting(false);
    }
  };

  const selectedTripsData = activeBatch?.verifiedTrips.filter((t) => selectedTripIds.includes(t.id)) || [];
  const selectedFreightTotal = selectedTripsData.reduce((sum, t) => sum + t.freightAmount, 0);

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-brand-600" />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Billing &amp; Tally Export Queue
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                Zero Physical Invoicing Delay
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Export verified FTL trips directly to Tally Prime with digital POD photo hyperlinks embedded in ledger narrations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setInvoiceModalOpen(true)}
              disabled={selectedTripIds.length === 0}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs flex items-center gap-2 transition disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Preview Invoice with POD Certificate</span>
            </button>
          </div>
        </div>

        {/* Client Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {batches.map((batch) => {
            const isSelected = selectedClientId === batch.client.id;
            return (
              <div
                key={batch.client.id}
                onClick={() => {
                  setSelectedClientId(batch.client.id);
                  setSelectedTripIds(batch.verifiedTrips.map((t) => t.id));
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition text-left relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-brand-600 ring-2 ring-brand-500/20 shadow-sm'
                    : 'bg-white/80 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {batch.client.billingCycle} CYCLE
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        batch.readyForBillingCount > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {batch.readyForBillingCount} Trips Ready
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm mt-1">{batch.client.name}</h3>
                  <p className="text-xs text-slate-500">{batch.client.industry}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Unbilled Freight:</span>
                  <strong className="text-slate-900 font-mono">
                    ₹{batch.verifiedFreightTotal.toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>

        {/* Export Action Card */}
        {lastExport && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <strong>Exported Invoice {lastExport.invoiceNumber}</strong>
                <p className="text-emerald-700 text-[11px] mt-0.5">
                  {lastExport.tripCount} trips successfully bundled. Net Freight: ₹{lastExport.netPayable.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
            <span className="font-mono bg-emerald-100 px-2.5 py-1 rounded font-bold text-emerald-800">
              Tally Prime XML Generated
            </span>
          </div>
        )}

        {/* Trips Table & Export Action Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Action Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900"
              >
                {activeBatch && selectedTripIds.length === activeBatch.verifiedTrips.length ? (
                  <CheckSquare className="w-4 h-4 text-brand-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>Select All ({activeBatch?.verifiedTrips.length || 0})</span>
              </button>

              <span className="text-slate-300">|</span>

              <span className="text-xs text-slate-600">
                Selected: <strong className="text-slate-900 font-bold">{selectedTripIds.length} trips</strong> (₹
                {selectedFreightTotal.toLocaleString('en-IN')})
              </span>
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportTally('csv')}
                disabled={isExporting || selectedTripIds.length === 0}
                className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => handleExportTally('xml')}
                disabled={isExporting || selectedTripIds.length === 0}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isExporting ? 'Generating XML...' : 'EXPORT TO TALLY PRIME (XML)'}
                </span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="p-3 w-10"></th>
                  <th className="p-3">Trip / LR Details</th>
                  <th className="p-3">Vehicle &amp; Dest</th>
                  <th className="p-3">Material &amp; Consignment</th>
                  <th className="p-3 text-right">Freight (INR)</th>
                  <th className="p-3 text-center">POD Verification</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeBatch && activeBatch.verifiedTrips.length > 0 ? (
                  activeBatch.verifiedTrips.map((trip) => {
                    const isChecked = selectedTripIds.includes(trip.id);
                    return (
                      <tr
                        key={trip.id}
                        className={`hover:bg-slate-50/70 transition ${
                          isChecked ? 'bg-brand-50/30' : ''
                        }`}
                      >
                        <td className="p-3 text-center">
                          <button
                            onClick={() => toggleTripSelection(trip.id)}
                            className="text-slate-400 hover:text-slate-700"
                          >
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-brand-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300" />
                            )}
                          </button>
                        </td>

                        <td className="p-3">
                          <span className="font-extrabold text-slate-900 block">{trip.id}</span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            LR: {trip.lrNumber} • e-Way: {trip.ewayBillNumber}
                          </span>
                        </td>

                        <td className="p-3">
                          <span className="font-semibold text-slate-800 block">{trip.vehicleNo}</span>
                          <span className="text-slate-500 text-[11px]">→ {trip.destination}</span>
                        </td>

                        <td className="p-3">
                          <span className="text-slate-700 font-medium block truncate max-w-xs">{trip.material}</span>
                          <span className="text-slate-400 text-[10px]">
                            Delivered: {trip.deliveredDate ? new Date(trip.deliveredDate).toLocaleDateString('en-IN') : 'Recent'}
                          </span>
                        </td>

                        <td className="p-3 text-right font-mono font-bold text-slate-900">
                          ₹{trip.freightAmount.toLocaleString('en-IN')}
                        </td>

                        <td className="p-3 text-center">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Stamp &amp; Sign Verified</span>
                          </span>
                        </td>

                        <td className="p-3 text-center">
                          {trip.pod?.imageUrl && (
                            <a
                              href={trip.pod.imageUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-brand-600 hover:text-brand-800 text-[11px] font-semibold inline-flex items-center gap-1 hover:underline"
                            >
                              <span>View POD</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                      No verified trips pending for this client batch.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Combined Tax Invoice & POD Certificate */}
        {invoiceModalOpen && activeBatch && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-brand-600" />
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Tax Invoice Preview with Digital POD Certificates
                  </h3>
                </div>
                <button
                  onClick={() => setInvoiceModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Printable Invoice Sheet */}
              <div className="p-5 border border-slate-300 rounded-xl bg-white text-xs space-y-4 shadow-inner">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h2 className="font-black text-sm text-slate-900">COMPANY A LOGISTICS (FTL DIVISION)</h2>
                    <p className="text-[10px] text-slate-500">
                      Plot 42, MIDC Industrial Area, Waluj, Chhatrapati Sambhajinagar - 431136
                    </p>
                    <p className="text-[10px] text-slate-500">GSTIN: 27AABCA1234F1Z8</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-slate-900 block">PROFORMA INVOICE</span>
                    <span className="text-[10px] text-slate-500">Date: {new Date().toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                {/* Bill To */}
                <div className="bg-slate-50 p-3 rounded-lg flex justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">BILLED TO (CONSIGNOR):</span>
                    <strong className="text-slate-900 text-xs">{activeBatch.client.name}</strong>
                    <p className="text-[11px] text-slate-500">{activeBatch.client.industry}</p>
                    <p className="text-[10px] text-slate-400 font-mono">GSTIN: {activeBatch.client.gstin || '27AABCS8821K1ZM'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold block">PAYMENT TERMS:</span>
                    <span className="text-slate-700 font-semibold">{activeBatch.client.billingCycle} Cycle</span>
                  </div>
                </div>

                {/* Items */}
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold">
                      <th className="py-1">Trip ID</th>
                      <th className="py-1">LR Number</th>
                      <th className="py-1">Vehicle</th>
                      <th className="py-1">Destination</th>
                      <th className="py-1 text-right">Freight (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedTripsData.map((t) => (
                      <tr key={t.id}>
                        <td className="py-1.5 font-bold">{t.id}</td>
                        <td className="py-1.5 font-mono">{t.lrNumber}</td>
                        <td className="py-1.5">{t.vehicleNo}</td>
                        <td className="py-1.5">{t.destination}</td>
                        <td className="py-1.5 text-right font-mono font-semibold">
                          ₹{t.freightAmount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Total */}
                <div className="pt-2 border-t border-slate-300 flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-700">Total Net Amount:</span>
                  <span className="font-mono font-extrabold text-slate-900 text-base">
                    ₹{selectedFreightTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Embedded Digital POD Proof Box */}
                <div className="mt-3 p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>DeliverIQ Authenticated Digital POD Certificate Attached</span>
                  </div>
                  <p className="text-[10px] text-emerald-700">
                    Each trip listed in this invoice has been geo-stamped and verified with consignee physical stamp &amp; signature. Physical paper transit delay reduced from 18 days to 4 days.
                  </p>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setInvoiceModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Tax Invoice</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
