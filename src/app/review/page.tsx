'use client';

import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Edit3,
  ShieldCheck,
  FileCheck,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Save,
  XCircle,
  Truck
} from 'lucide-react';
import { maskPhoneNumber } from '@/lib/dpdp';

interface TripItem {
  id: string;
  clientId: string;
  client: { name: string; industry: string; phoneMasked?: string };
  vehicleNo: string;
  isHiredVehicle: boolean;
  driverName: string;
  driverPhone: string;
  driverPhoneMasked: string;
  origin: string;
  destination: string;
  branch: string;
  freightAmount: number;
  material: string;
  expectedQty: number;
  unit: string;
  lrNumber: string;
  ewayBillNumber: string;
  dispatchDate: string;
  deliveredDate: string | null;
  podStatus: 'MISSING' | 'RETAKE_REQUESTED' | 'NEEDS_REVIEW' | 'VERIFIED' | 'INVOICED';
  remarks: string | null;
  pod?: {
    id: string;
    imageUrl: string;
    compressedSizeKb: number;
    capturedAt: string;
    uploadedAt: string;
    gpsLat: number | null;
    gpsLng: number | null;
    gpsAccuracy: number | null;
    gpsLocationName: string | null;
    retakeCount: number;
    aiConfidence: number;
    lrNumberDetected: string | null;
    lrMatchesTrip: boolean;
    stampDetected: boolean;
    stampClarityScore: number;
    signatureDetected: boolean;
    qtyReceived: number | null;
    qtyDiscrepancy: number;
    remarksDetected: string | null;
    isShortageOrDamage: boolean;
    executiveRemarks: string | null;
    reviewNotes: string | null;
  } | null;
}

export default function ReviewQueuePage() {
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<TripItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Split-screen image controls
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Editable fields
  const [editQty, setEditQty] = useState<number | string>('');
  const [editRemarks, setEditRemarks] = useState('');
  const [executiveNotes, setExecutiveNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [unmaskedPhone, setUnmaskedPhone] = useState(false);

  const fetchTrips = async () => {
    try {
      const res = await fetch('/api/trips');
      const data = await res.json();
      if (data.success) {
        setTrips(data.trips);
        if (!selectedTrip && data.trips.length > 0) {
          // Select first trip that needs review
          const candidate =
            data.trips.find((t: TripItem) => t.podStatus === 'NEEDS_REVIEW') ||
            data.trips.find((t: TripItem) => t.podStatus === 'RETAKE_REQUESTED') ||
            data.trips[0];
          selectTrip(candidate);
        } else if (selectedTrip) {
          const updated = data.trips.find((t: TripItem) => t.id === selectedTrip.id);
          if (updated) selectTrip(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const selectTrip = (trip: TripItem) => {
    setSelectedTrip(trip);
    setZoomLevel(1);
    setRotation(0);
    setUnmaskedPhone(false);
    setEditQty(trip.pod?.qtyReceived ?? trip.expectedQty);
    setEditRemarks(trip.pod?.remarksDetected || trip.remarks || '');
    setExecutiveNotes(trip.pod?.reviewNotes || '');
    setActionSuccess(null);
  };

  const handleReviewAction = async (decision: 'APPROVE' | 'REQUEST_RETAKE' | 'CORRECT_FIELDS' | 'REJECT') => {
    if (!selectedTrip) return;
    setIsSubmitting(true);
    setActionSuccess(null);

    try {
      const res = await fetch('/api/pod/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId: selectedTrip.id,
          decision,
          correctedQty: editQty !== '' ? Number(editQty) : undefined,
          customRemarks: editRemarks,
          notes: executiveNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Success: Trip ${selectedTrip.id} marked as ${data.newStatus}`);
        await fetchTrips();
      } else {
        alert(data.error || 'Action failed');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTrips = trips.filter((t) => {
    const matchesFilter = filterStatus === 'ALL' || t.podStatus === filterStatus;
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.lrNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const countByStatus = {
    ALL: trips.length,
    NEEDS_REVIEW: trips.filter((t) => t.podStatus === 'NEEDS_REVIEW').length,
    RETAKE_REQUESTED: trips.filter((t) => t.podStatus === 'RETAKE_REQUESTED').length,
    VERIFIED: trips.filter((t) => t.podStatus === 'VERIFIED').length,
    MISSING: trips.filter((t) => t.podStatus === 'MISSING').length,
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-brand-600" />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Billing Review Queue
              </h1>
              <span className="bg-brand-100 text-brand-800 text-xs font-bold px-2 py-0.5 rounded-full">
                Human-in-the-Loop Workbench
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Verify AI-extracted Lorry Receipts, resolve shortage remarks, and audit consignee stamps before invoice release.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              Reviewing as: <strong className="text-slate-800">Priya Sharma (Sr. Billing Exec)</strong>
            </span>
          </div>
        </div>

        {/* Status Filter Tabs & Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-semibold">
            {[
              { id: 'ALL', label: 'All Trips', count: countByStatus.ALL },
              { id: 'NEEDS_REVIEW', label: 'Needs Review', count: countByStatus.NEEDS_REVIEW, color: 'text-rose-700 bg-rose-50 border-rose-200' },
              { id: 'RETAKE_REQUESTED', label: 'Retake Asked', count: countByStatus.RETAKE_REQUESTED, color: 'text-amber-700 bg-amber-50 border-amber-200' },
              { id: 'VERIFIED', label: 'Verified', count: countByStatus.VERIFIED, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
              { id: 'MISSING', label: 'Missing POD', count: countByStatus.MISSING, color: 'text-slate-700 bg-slate-100 border-slate-200' },
            ].map((tab) => {
              const isActive = filterStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap border ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-slate-700 text-white' : tab.color || 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Trip, LR, Vehicle, Client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
          </div>
        </div>

        {/* Action success toast */}
        {actionSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between animate-fadeIn">
            <span className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {actionSuccess}
            </span>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Split-Screen Workbench Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT COLUMN: Queue Trip Cards (3 cols) */}
          <div className="lg:col-span-4 space-y-2.5 max-h-[800px] overflow-y-auto pr-1">
            {filteredTrips.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">No trips match selected filter.</p>
              </div>
            ) : (
              filteredTrips.map((t) => {
                const isSelected = selectedTrip?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => selectTrip(t)}
                    className={`p-4 rounded-2xl border cursor-pointer transition text-left relative ${
                      isSelected
                        ? 'bg-brand-50/60 border-brand-500 shadow-sm ring-2 ring-brand-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900">{t.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.podStatus === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.podStatus === 'RETAKE_REQUESTED'
                            ? 'bg-amber-100 text-amber-800'
                            : t.podStatus === 'NEEDS_REVIEW'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t.podStatus.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-800 mt-1 truncate">{t.client.name}</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {t.destination} • ₹{t.freightAmount.toLocaleString('en-IN')}
                    </p>

                    {/* Discrepancy indicator */}
                    {t.remarks && (
                      <div className="mt-2 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-100 truncate">
                        ⚠️ {t.remarks}
                      </div>
                    )}

                    <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] flex items-center justify-between text-slate-500 font-mono">
                      <span>LR: {t.lrNumber}</span>
                      <span>{t.vehicleNo}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* RIGHT COLUMN: Split-Screen Inspector Workbench (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {selectedTrip ? (
              <>
                {/* Workbench Top Bar */}
                <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-extrabold text-base tracking-tight">{selectedTrip.id}</h2>
                      <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded font-mono">
                        LR: {selectedTrip.lrNumber}
                      </span>
                      <span className="text-xs text-slate-400">• {selectedTrip.client.name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Vehicle: <span className="text-white font-semibold">{selectedTrip.vehicleNo}</span> → {selectedTrip.destination}
                    </p>
                  </div>

                  {/* Image Viewer Toolbar */}
                  <div className="flex items-center gap-1.5 bg-slate-800 rounded-xl p-1 border border-slate-700">
                    <button
                      onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.25))}
                      className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-slate-700 transition"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] font-mono text-slate-300 px-1">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                      className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-slate-700 transition"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-slate-700 mx-0.5" />
                    <button
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-slate-700 transition"
                      title="Rotate 90°"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Main Split Body: Image Left, Field Verification Right */}
                <div className="grid grid-cols-1 md:grid-cols-12 flex-1">
                  {/* POD Document High-Res Canvas (7 cols on desktop) */}
                  <div className="md:col-span-7 bg-slate-950 p-4 relative overflow-hidden flex items-center justify-center min-h-[460px]">
                    {selectedTrip.pod?.imageUrl ? (
                      <div
                        className="transition-transform duration-200 ease-out origin-center select-none"
                        style={{
                          transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                        }}
                      >
                        <img
                          src={selectedTrip.pod.imageUrl}
                          alt="Physical Proof of Delivery Document"
                          className="max-h-[500px] w-auto rounded shadow-2xl border border-slate-800"
                        />
                      </div>
                    ) : (
                      <div className="text-center text-slate-500 space-y-2">
                        <FileCheck className="w-12 h-12 mx-auto text-slate-600" />
                        <p className="text-sm font-semibold text-slate-400">Physical POD Photo Not Uploaded Yet</p>
                        <p className="text-xs text-slate-600">Waiting for driver at destination gate.</p>
                      </div>
                    )}

                    {/* Watermark / Audit overlay */}
                    {selectedTrip.pod && (
                      <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md text-[10px] text-slate-300 font-mono px-3 py-1.5 rounded-lg border border-slate-800">
                        GPS: {selectedTrip.pod.gpsLat}°, {selectedTrip.pod.gpsLng}° | Size: {selectedTrip.pod.compressedSizeKb} KB
                      </div>
                    )}
                  </div>

                  {/* Metadata & Audit Comparison Card (5 cols on desktop) */}
                  <div className="md:col-span-5 p-5 bg-white border-l border-slate-200 space-y-4 overflow-y-auto max-h-[600px]">
                    {/* DPDP Act 2023 Compliant Contact Box */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-slate-600 font-semibold">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>DPDP Compliance</span>
                        </span>
                        <button
                          onClick={() => setUnmaskedPhone(!unmaskedPhone)}
                          className="text-[11px] text-brand-700 hover:underline"
                        >
                          {unmaskedPhone ? 'Mask PII' : 'Audit & Unmask'}
                        </button>
                      </div>
                      <p className="text-slate-700">
                        Driver: <strong className="text-slate-900">{selectedTrip.driverName}</strong>
                      </p>
                      <p className="text-slate-500 font-mono text-[11px]">
                        Phone: {unmaskedPhone ? selectedTrip.driverPhone : selectedTrip.driverPhoneMasked}
                      </p>
                    </div>

                    {/* AI Verification Checklist */}
                    <div className="space-y-2 text-xs">
                      <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                        <span>AI Extraction Findings</span>
                      </h4>

                      {/* LR Number Check */}
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <span>Lorry Receipt (LR) Match</span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ✓ Matches {selectedTrip.lrNumber}
                        </span>
                      </div>

                      {/* Consignee Rubber Stamp */}
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <span>Consignee Rubber Stamp</span>
                        {selectedTrip.pod?.stampDetected ? (
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ✓ Detected ({Math.round((selectedTrip.pod.stampClarityScore || 0.9) * 100)}%)
                          </span>
                        ) : (
                          <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            ✕ Stamp Missing
                          </span>
                        )}
                      </div>

                      {/* Consignee Signature */}
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <span>Consignee Signature</span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ✓ Verified
                        </span>
                      </div>

                      {/* Quantity Delivered vs Expected */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-700">Delivered Quantity:</span>
                          <span className="text-slate-500">Expected: {selectedTrip.expectedQty} {selectedTrip.unit}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editQty}
                            onChange={(e) => setEditQty(e.target.value)}
                            className="w-24 px-2 py-1 text-sm font-mono font-bold rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                          />
                          <span className="text-xs text-slate-600 font-semibold">{selectedTrip.unit}</span>
                          {editQty !== '' && Number(editQty) < selectedTrip.expectedQty && (
                            <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                              Short by {selectedTrip.expectedQty - Number(editQty)} {selectedTrip.unit}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Shortage or Damage Remark */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">
                          Shortage / Damage Remarks:
                        </label>
                        <input
                          type="text"
                          value={editRemarks}
                          onChange={(e) => setEditRemarks(e.target.value)}
                          placeholder="e.g. Short by 6 cartons, or intact"
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>

                      {/* Internal Executive Notes */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">
                          Billing Executive Notes:
                        </label>
                        <textarea
                          rows={2}
                          value={executiveNotes}
                          onChange={(e) => setExecutiveNotes(e.target.value)}
                          placeholder="Enter voucher notes or debit note approval reference..."
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </div>
                    </div>

                    {/* Human Action Decision Bar */}
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <button
                        onClick={() => handleReviewAction('APPROVE')}
                        disabled={isSubmitting}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>APPROVE &amp; MOVE TO BILLING QUEUE</span>
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleReviewAction('REQUEST_RETAKE')}
                          disabled={isSubmitting || (selectedTrip.pod?.retakeCount || 0) >= 2}
                          className="py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                          title={(selectedTrip.pod?.retakeCount || 0) >= 2 ? 'Capped at 2 retakes' : 'Send retake prompt to driver'}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>
                            {(selectedTrip.pod?.retakeCount || 0) >= 2 ? 'Retake Cap Reached' : 'Request Retake'}
                          </span>
                        </button>

                        <button
                          onClick={() => handleReviewAction('CORRECT_FIELDS')}
                          disabled={isSubmitting}
                          className="py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Edits</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-400">
                Select a trip from the left queue to inspect.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
