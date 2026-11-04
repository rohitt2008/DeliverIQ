'use client';

import React, { useState, useEffect } from 'react';
import { Truck, AlertCircle, CheckCircle2, ChevronRight, HelpCircle, PhoneCall, Sparkles } from 'lucide-react';
import DriverCaptureView, { DriverTripData } from '@/components/DriverCaptureView';

export default function DriverPage() {
  const [trips, setTrips] = useState<DriverTripData[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<DriverTripData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTrips = async () => {
    try {
      const res = await fetch('/api/trips');
      const data = await res.json();
      if (data.success) {
        setTrips(data.trips);
        // Default to first active or missing trip
        if (!selectedTrip && data.trips.length > 0) {
          const firstPending = data.trips.find(
            (t: DriverTripData) => t.podStatus === 'MISSING' || t.podStatus === 'RETAKE_REQUESTED'
          ) || data.trips[0];
          setSelectedTrip(firstPending);
        } else if (selectedTrip) {
          const updated = data.trips.find((t: DriverTripData) => t.id === selectedTrip.id);
          if (updated) setSelectedTrip(updated);
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

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Driver Profile Header */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-brand-600/20">
              RP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-slate-900">Ramesh Pawar (चालक / Driver)</h1>
                <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  Active Duty
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Company A FTL Fleet • Truck <strong className="text-slate-800">MH20 EL 4521</strong> • Hub: Sambhajinagar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">Need assistance?</span>
            <a
              href="tel:1800200000"
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition"
            >
              <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
              <span>हेल्पलाइन (Dispatch)</span>
            </a>
          </div>
        </div>

        {/* Trip Selector Strip */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-600" />
              <span>तुमच्या आजच्या फेऱ्या (Assigned Trips)</span>
            </h2>
            <span className="text-xs text-slate-500">Tap to capture POD</span>
          </div>

          {loading ? (
            <div className="py-6 text-center text-xs text-slate-400">Loading trips...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {trips.slice(0, 3).map((t) => {
                const isSelected = selectedTrip?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTrip(t)}
                    className={`p-3 rounded-xl text-left border transition relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">{t.id}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            t.podStatus === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : t.podStatus === 'RETAKE_REQUESTED'
                              ? 'bg-amber-100 text-amber-800'
                              : t.podStatus === 'NEEDS_REVIEW'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {t.podStatus}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 mt-1 truncate">
                        {t.destination} ({t.material.split(' ')[0]})
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{t.vehicleNo}</p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] flex items-center justify-between text-slate-600">
                      <span>LR: {t.lrNumber}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Trip Capture Interface */}
        {selectedTrip ? (
          <div>
            <DriverCaptureView trip={selectedTrip} onSuccess={fetchTrips} />
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 text-sm">No trips assigned.</p>
          </div>
        )}

        {/* Driver Quick Tips Accordion */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <HelpCircle className="w-4 h-4 text-brand-600" />
            <span>चालकांसाठी महत्त्वाच्या सूचना (Driver Guidelines)</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
            <li>पावतीवरील <strong>ग्राहकाचा शिक्का आणि सही</strong> चौकोनात स्पष्ट असावी.</li>
            <li>कॅमेरा लेन्स पुसून स्वच्छ प्रकाशात फोटो काढावा.</li>
            <li>हायवेवर इंटरनेट नसल्यास घाबरू नका, फोटो आपोआप सेव्ह होतो आणि रेंज आल्यावर पोहोचतो.</li>
            <li>तूट असल्यास बिलिंग टीम थेट कंपनीशी चर्चा करून बिल तयार करेल.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
