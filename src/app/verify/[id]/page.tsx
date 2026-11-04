'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Calendar,
  FileCheck,
  Download,
  Printer,
  ArrowLeft,
  Truck
} from 'lucide-react';

export default function VerifyPODPage() {
  const params = useParams();
  const tripId = params.id as string;
  const [trip, setTrip] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await fetch(`/api/trips/${tripId}`);
        const data = await res.json();
        if (data.success) {
          setTrip(data.trip);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (tripId) fetchTrip();
  }, [tripId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Verifying cryptographic POD record...</p>
        </div>
      </div>
    );
  }

  if (!trip || !trip.pod) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl max-w-md text-center space-y-3 border border-slate-200">
          <h2 className="text-base font-bold text-slate-800">No Verified POD Found</h2>
          <p className="text-xs text-slate-500">Trip record {tripId} has no uploaded proof of delivery yet.</p>
          <Link href="/client-portal" className="inline-block text-xs font-bold text-brand-600 hover:underline">
            Back to Client Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Back link */}
        <Link
          href="/client-portal"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Shipments</span>
        </Link>

        {/* Certificate Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Certificate Header Strip */}
          <div className="bg-slate-900 text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <span className="font-mono text-xs uppercase tracking-widest text-emerald-400 font-bold">
                  AUTHENTICATED DIGITAL POD CERTIFICATE
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight mt-1">Trip Record {trip.id}</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Company A FTL Logistics Division • Chhatrapati Sambhajinagar Hub
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold font-mono">
                ✓ VERIFIED &amp; AUDITED
              </span>
              <p className="text-[10px] text-slate-400 font-mono mt-1">
                Ref: LR-{trip.lrNumber}
              </p>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6">
            {/* Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">CONSIGNOR (CLIENT):</span>
                <strong className="text-slate-900 text-xs">{trip.client.name}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">DESTINATION:</span>
                <strong className="text-slate-900 text-xs">{trip.destination}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">VEHICLE NUMBER:</span>
                <strong className="text-slate-900 text-xs font-mono">{trip.vehicleNo}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">E-WAY BILL:</span>
                <span className="text-slate-800 font-mono">{trip.ewayBillNumber}</span>
              </div>
            </div>

            {/* Geo Stamp & Time Audit */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Geotagged Gate Inward Acceptance</span>
                </span>
                <span className="font-mono text-[11px] text-emerald-700">
                  {new Date(trip.pod.capturedAt).toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Gate: <strong>{trip.pod.gpsLocationName || `${trip.destination} Inward Gate`}</strong> (Coordinates: {trip.pod.gpsLat}°, {trip.pod.gpsLng}°, Accuracy: ±{trip.pod.gpsAccuracy}m)
              </p>
            </div>

            {/* Document Image Showcase */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-wider">
                  Physical Consignee Proof of Delivery (Source of Truth)
                </h3>
                <div className="flex items-center gap-2">
                  <a
                    href={trip.pod.imageUrl}
                    download
                    className="text-brand-600 hover:text-brand-800 text-xs font-semibold flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download SVG/Image</span>
                  </a>
                  <button
                    onClick={() => window.print()}
                    className="text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800 overflow-hidden">
                <img
                  src={trip.pod.imageUrl}
                  alt="Verified Proof of Delivery"
                  className="max-h-[550px] w-auto rounded shadow-2xl"
                />
              </div>
            </div>

            {/* DPDP Act Compliance Footer */}
            <div className="border-t border-slate-200 pt-4 text-center text-[11px] text-slate-400 space-y-1">
              <p>
                DPDP Act 2023 Compliant: Consignee personal telephone and gatekeeper names are masked in compliance with digital privacy standards.
              </p>
              <p className="font-mono text-[10px]">
                DeliverIQ Trust Network • Company A Logistics Pvt Ltd • Sambhajinagar
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
