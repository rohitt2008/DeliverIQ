'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Truck,
  ClipboardCheck,
  FileSpreadsheet,
  BarChart3,
  Building2,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Layers,
  Smartphone,
  Flame,
  FileCheck
} from 'lucide-react';

export default function HomePage() {
  const [stats, setStats] = useState({
    missingCount: 3,
    verifiedCount: 5,
    needsReviewCount: 2,
    workingCapitalSaved: '₹3.24 Cr',
    annualInterestSaved: '₹38.9 L',
  });

  useEffect(() => {
    fetch('/api/analytics/dashboard')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats({
            missingCount: data.summary.missingCount,
            verifiedCount: data.summary.verifiedCount,
            needsReviewCount: data.summary.needsReviewCount,
            workingCapitalSaved: `₹${data.workingCapital.workingCapitalUnlockedCr} Cr`,
            annualInterestSaved: `₹${data.workingCapital.annualInterestSavingsLakhs} L`,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Client Problem Statement Alert Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-bold">CLIENT CASE:</span>
            <span>Company A • Chhatrapati Sambhajinagar, Maharashtra (₹75–90 Cr FTL Transport)</span>
          </div>
          <span className="text-slate-400 text-[11px] font-mono">
            140 Fleet Trucks + 200 Hired Trucks • 2,200 Trips/Mo
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-800 px-3 py-1 rounded-full text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Full-Truckload POD Automation &amp; Tally Prime Integration</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.1]">
              "I can't bill until a piece of paper comes back from <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-800">800 km away.</span>"
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
              <strong>DeliverIQ</strong> enables drivers to take one photo at the consignee gate and be done.
              Multimodal AI audits LR numbers, rubber stamps, signatures, and shortage notes while the driver is still at the gate—slashing POD-to-invoice from <span className="text-rose-600 font-bold line-through">18 days</span> to <strong className="text-emerald-700">4 days</strong> and unlocking <strong>₹3.24 Crore</strong> in working capital.
            </p>

            {/* Quick Launch Personas Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/driver"
                className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 flex items-center gap-2.5 transition"
              >
                <Truck className="w-5 h-5" />
                <span>Driver Gate App (Marathi / Hindi)</span>
              </Link>

              <Link
                href="/review"
                className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-sm shadow-md flex items-center gap-2.5 transition"
              >
                <ClipboardCheck className="w-5 h-5 text-brand-400" />
                <span>Billing Review Queue</span>
              </Link>

              <Link
                href="/billing"
                className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-sm shadow-xs flex items-center gap-2 transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-brand-600" />
                <span>Tally XML Export</span>
              </Link>

              <Link
                href="/dashboard"
                className="px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-sm shadow-xs flex items-center gap-2 transition"
              >
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span>Ops Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Financial Impact Banner */}
      <section className="bg-slate-900 text-white py-8 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="border-r border-slate-800 last:border-none">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Working Capital Freed
              </span>
              <strong className="text-2xl sm:text-3xl font-black text-brand-400 font-mono mt-1 block">
                {stats.workingCapitalSaved}
              </strong>
              <span className="text-[10px] text-slate-400">14 days forward billing</span>
            </div>

            <div className="border-r border-slate-800 last:border-none">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Interest Saved @ 12%
              </span>
              <strong className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1 block">
                {stats.annualInterestSaved} / yr
              </strong>
              <span className="text-[10px] text-slate-400">Eliminates cash credit overdraft</span>
            </div>

            <div className="border-r border-slate-800 last:border-none">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Lost POD Leakage
              </span>
              <strong className="text-2xl sm:text-3xl font-black text-purple-400 font-mono mt-1 block">
                ₹63.36 L → ₹21.1 L
              </strong>
              <span className="text-[10px] text-slate-400">Disputes down from 1.5% to 0.5%</span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Annual Value
              </span>
              <strong className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1 block">
                ₹1.02 Crore / yr
              </strong>
              <span className="text-[10px] text-slate-400">Direct EBITDA expansion</span>
            </div>
          </div>
        </div>
      </section>

      {/* SAMPLE DATA SHOWCASE: Test the 3 Brief Trips */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-brand-600" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Sample Trips from the Brief
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Explore the exact sample trips specified in the client brief across various edge-case states.
              </p>
            </div>
            <Link
              href="/review"
              className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1"
            >
              <span>Open Full Review Queue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Trip 1: TRP-66120 */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition flex flex-col justify-between space-y-4 shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900">TRP-66120</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-sm mt-1">Company B (cement)</h3>
                <p className="text-xs text-slate-500">Vehicle: MH20 EL 4521 → Nagpur</p>
                <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600 space-y-1">
                  <p>Freight: <strong className="text-slate-900 font-mono">₹38,500</strong></p>
                  <p>AI Finding: <span className="text-emerald-700 font-semibold">✓ Stamp &amp; Sign Verified (None)</span></p>
                  <p className="text-[11px] text-slate-400">700 Portland Cement 50kg bags verified intact.</p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <Link
                  href="/review"
                  className="w-full py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-center text-xs font-bold text-slate-700 transition"
                >
                  Inspect in Workbench
                </Link>
                <Link
                  href="/verify/TRP-66120"
                  className="px-3 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-bold transition"
                  title="Client Public Link"
                >
                  Certificate
                </Link>
              </div>
            </div>

            {/* Trip 2: TRP-66134 */}
            <div className="p-5 rounded-2xl border-2 border-amber-300 bg-amber-50/40 hover:bg-amber-50/70 transition flex flex-col justify-between space-y-4 shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900">TRP-66134</span>
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                    Retake Requested
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-sm mt-1">Company C (steel)</h3>
                <p className="text-xs text-slate-500">Vehicle: MH20 GT 7718 → Pune</p>
                <div className="mt-3 pt-3 border-t border-amber-200 text-xs text-slate-700 space-y-1">
                  <p>Freight: <strong className="text-slate-900 font-mono">₹26,000</strong></p>
                  <p className="text-amber-900 font-bold">⚠️ Stamp not visible (Attempt 1 of 2)</p>
                  <p className="text-[11px] text-amber-800">
                    AI identified missing consignee gate stamp. Audio prompt guided driver to ask gatekeeper.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <Link
                  href="/driver"
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-center text-xs font-bold transition"
                >
                  Test Retake in Driver App
                </Link>
              </div>
            </div>

            {/* Trip 3: TRP-66141 */}
            <div className="p-5 rounded-2xl border-2 border-blue-300 bg-blue-50/40 hover:bg-blue-50/70 transition flex flex-col justify-between space-y-4 shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-slate-900">TRP-66141</span>
                  <span className="bg-blue-100 text-blue-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-300">
                    Needs Review
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-sm mt-1">Company D (packaged foods)</h3>
                <p className="text-xs text-slate-500">Vehicle: MH17 BY 3092 (Hired) → Indore</p>
                <div className="mt-3 pt-3 border-t border-blue-200 text-xs text-slate-700 space-y-1">
                  <p>Freight: <strong className="text-slate-900 font-mono">₹41,200</strong></p>
                  <p className="text-rose-700 font-bold">⚠️ Short by 6 cartons</p>
                  <p className="text-[11px] text-slate-600">
                    Hired truck SMS link capture. AI extracted receiver's shortage note. Invoices never sent automatically!
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <Link
                  href="/upload/TRP-66141"
                  className="w-1/2 py-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-center text-xs font-bold text-slate-700 transition"
                >
                  SMS Link View
                </Link>
                <Link
                  href="/review"
                  className="w-1/2 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-center text-xs font-bold transition"
                >
                  Resolve Shortage
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature & Design Architecture Highlights */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Engineered for Maharashtra Highway Realities
            </h2>
            <p className="text-xs text-slate-500">
              Low literacy, intermittent 2G coverage, and strict enterprise audit standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">One Big Button &amp; Voice Prompts</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Zero typing. Clear spoken voice feedback in Marathi (मराठी) and Hindi (हिन्दी) via Web Speech API so drivers hear instructions clearly over truck engine noise.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Offline &amp; Compressed &lt; 300 KB</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Client-side HTML5 canvas compression ensures uploads remain under 300 KB. IndexedDB queue stores captures offline in highway dead zones.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">AI Retake Capped at 2</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Vision AI verifies LR number, stamp presence, and signature. Retakes are strictly capped at 2 so drivers are never blocked indefinitely at consignee gates.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">DPDP Act 2023 &amp; Tally Prime</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Driver and consignee telephone numbers are dynamically masked. Tally ERP 9 / Prime XML exports include hyperlinks to digital POD certificates.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
