'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Truck, ShieldCheck, PhoneCall, AlertCircle } from 'lucide-react';
import DriverCaptureView, { DriverTripData } from '@/components/DriverCaptureView';

export default function HiredDriverUploadPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const [trip, setTrip] = useState<DriverTripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrip = async () => {
    try {
      const res = await fetch(`/api/trips/${tripId}`);
      const data = await res.json();
      if (data.success && data.trip) {
        setTrip(data.trip);
      } else {
        setError(data.error || 'Trip not found or link expired.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load trip details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripId) {
      fetchTrip();
    }
  }, [tripId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">लोड करत आहे... (Loading Trip details)</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-6 text-center border border-slate-200 shadow-sm space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">पावती लिंक आढळली नाही (Link Invalid)</h2>
          <p className="text-xs text-slate-500">{error || 'Please contact Company A transport office.'}</p>
          <a
            href="tel:1800200000"
            className="inline-flex items-center gap-2 bg-brand-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl"
          >
            <PhoneCall className="w-4 h-4" />
            <span>कार्यालयाशी संपर्क साधा (Call Support)</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4">
      <div className="max-w-lg mx-auto space-y-4">
        {/* SMS Magic Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-brand-300 font-semibold">
              <Truck className="w-4 h-4" />
              <span>कंपनी ए लॉजिस्टिक्स (SMS Quick POD)</span>
            </div>
            <h1 className="text-base font-bold mt-0.5">बाजारू / भाडोत्री गाडी पावती अपलोड</h1>
          </div>
          <span className="bg-brand-500/30 text-brand-200 text-[10px] font-bold px-2 py-1 rounded border border-brand-400/40">
            One-Tap SMS Link
          </span>
        </div>

        {/* Capture Stage */}
        <DriverCaptureView trip={trip} onSuccess={fetchTrip} isMagicLink={true} />

        {/* Privacy & Compliance Footer */}
        <div className="text-center text-[11px] text-slate-500 space-y-1">
          <p className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>DPDP Act 2023: ग्राहक व चालक माहिती पूर्णपणे सुरक्षित आहे.</span>
          </p>
          <p>DeliverIQ • Chhatrapati Sambhajinagar FTL Operations</p>
        </div>
      </div>
    </div>
  );
}
