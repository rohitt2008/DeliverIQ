'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Clock,
  Building2,
  DollarSign,
  UploadCloud,
  FileCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  MapPin,
  RefreshCw,
  Sliders,
  CheckCircle2
} from 'lucide-react';

interface DashboardData {
  summary: {
    totalTrips: number;
    missingCount: number;
    retakeCount: number;
    needsReviewCount: number;
    verifiedCount: number;
    invoicedCount: number;
    complianceRate24h: number;
    avgCycleDays: number;
    baselineCycleDays: number;
  };
  workingCapital: {
    annualTurnoverCrores: number;
    baselineDays: number;
    currentDays: number;
    daysSaved: number;
    workingCapitalUnlockedCr: number;
    annualInterestSavingsLakhs: number;
    disputeSavingsLakhs: number;
    totalAnnualSavingsLakhs: number;
    totalAnnualSavingsFormatted: string;
  };
  branchStats: Array<{
    branch: string;
    totalTrips: number;
    missingPODs: number;
    verifiedPODs: number;
    complianceRate: number;
    avgDaysToInvoice: number;
  }>;
  recentAuditLogs: Array<{
    id: string;
    action: string;
    actorRole: string;
    actorName: string;
    details: string;
    timestamp: string;
  }>;
}

export default function OperationsDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Interactive Working Capital Slider
  const [simulatedDays, setSimulatedDays] = useState<number>(3.8);

  // Daily Trip Import Form State
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/analytics/dashboard');
      const json = await res.json();
      if (json.success) {
        setData(json);
        setSimulatedDays(json.summary.avgCycleDays);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Compute live savings based on slider
  const annualTurnoverInr = 844800000; // ₹84.48 Cr
  const baselineDays = 18;
  const daysSaved = Math.max(0, baselineDays - simulatedDays);
  const simWorkingCapitalUnlockedCr = Number(((annualTurnoverInr * daysSaved) / 365 / 10000000).toFixed(2));
  const simInterestSavingsLakhs = Number((((annualTurnoverInr * daysSaved) / 365) * 0.12 / 100000).toFixed(2));
  const simDisputeSavingsLakhs = 42.24; // 1% reduction of 26,400 trips * ₹16,000 = ₹42.24L
  const simTotalSavingsLakhs = Number((simInterestSavingsLakhs + simDisputeSavingsLakhs).toFixed(2));
  const simTotalSavingsCr = (simTotalSavingsLakhs / 100).toFixed(2);

  const handleQuickImport = async () => {
    setIsImporting(true);
    setImportSuccess(null);

    const sampleDailyTrips = [
      {
        id: `TRP-${Math.floor(66170 + Math.random() * 20)}`,
        clientName: 'Company B (cement)',
        vehicleNo: 'MH20 EL 8899',
        isHiredVehicle: false,
        driverName: 'Maruti Shinde',
        driverPhone: '+91 98224 55112',
        origin: 'Chhatrapati Sambhajinagar',
        destination: 'Nagpur',
        branch: 'Nagpur',
        freightAmount: 39000,
        material: 'Pozzolana Cement 50kg Bags',
        expectedQty: 700,
        unit: 'bags',
        lrNumber: `LR-NGP-${Math.floor(1000 + Math.random() * 9000)}`,
        ewayBillNumber: `2418-9912-${Math.floor(1000 + Math.random() * 9000)}`,
      },
      {
        id: `TRP-${Math.floor(66190 + Math.random() * 20)}`,
        clientName: 'Company C (steel)',
        vehicleNo: 'MH12 RN 4012 (hired)',
        isHiredVehicle: true,
        driverName: 'Sanjay Pawar (Hired)',
        driverPhone: '+91 98229 33441',
        origin: 'Chhatrapati Sambhajinagar',
        destination: 'Pune',
        branch: 'Pune',
        freightAmount: 28500,
        material: 'TMT Steel Billets & Bars',
        expectedQty: 480,
        unit: 'bars',
        lrNumber: `LR-PUN-${Math.floor(1000 + Math.random() * 9000)}`,
        ewayBillNumber: `2418-8833-${Math.floor(1000 + Math.random() * 9000)}`,
      },
    ];

    try {
      const res = await fetch('/api/trips/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trips: sampleDailyTrips }),
      });

      const json = await res.json();
      if (json.success) {
        setImportSuccess(`Successfully imported ${json.importedCount} new trips with e-Way and LR numbers!`);
        await fetchDashboard();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading Operations Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-brand-600" />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Operations &amp; Missing-POD Dashboard
              </h1>
              <span className="bg-slate-900 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                Head of Ops: Rajesh Deshmukh
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time monitoring of 340 FTL trucks across Maharashtra &amp; MP depots. Working capital recovery &amp; dispute analytics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickImport}
              disabled={isImporting}
              className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isImporting ? 'Importing...' : 'Daily Trip Import (CSV)'}</span>
            </button>
          </div>
        </div>

        {/* Import Banner */}
        {importSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
            <span className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {importSuccess}
            </span>
            <button onClick={() => setImportSuccess(null)} className="font-bold text-emerald-700">Dismiss</button>
          </div>
        )}

        {/* 4 Primary Operational KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Missing PODs */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Missing PODs</span>
              <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-rose-600 font-mono">{data.summary.missingCount} Trips</div>
              <p className="text-[11px] text-slate-500 mt-1">
                At risk freight: <strong className="text-slate-800">₹{(data.summary.missingCount * 32000).toLocaleString('en-IN')}</strong>
              </p>
            </div>
          </div>

          {/* Metric 2: 24h POD Capture Rate */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">24h Capture Rate</span>
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-emerald-600 font-mono">
                {data.summary.complianceRate24h}%
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Target: 80% • <strong className="text-emerald-700 font-semibold">+4.5% above SLA</strong>
              </p>
            </div>
          </div>

          {/* Metric 3: POD-to-Invoice Days */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">POD-to-Invoice</span>
              <span className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-brand-700 font-mono">
                {data.summary.avgCycleDays} Days
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Baseline was 18 days • <strong className="text-brand-700">14.2 days faster</strong>
              </p>
            </div>
          </div>

          {/* Metric 4: Annual Leakage Recovered */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Annual Leakage Saved</span>
              <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-black text-purple-700 font-mono">
                ₹{simTotalSavingsCr} Cr
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Working capital + dispute recovery
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Working Capital Savings Calculator */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                Working Capital &amp; Interest Recovery Engine
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Company A transports ₹84.48 Crore freight per year (2,200 trips/mo @ ₹32,000). Every day cut from the 18-day physical POD transit unlocks immediate cash and eliminates bank overdraft interest @ 12% p.a.
            </p>

            {/* Interactive Slider */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-brand-400" />
                  <span>Simulate POD-to-Invoice Days:</span>
                </span>
                <span className="font-mono text-base font-extrabold text-brand-300 bg-brand-500/20 px-3 py-0.5 rounded-full border border-brand-400/30">
                  {simulatedDays} Days (Baseline: 18 Days)
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="18"
                step="0.2"
                value={simulatedDays}
                onChange={(e) => setSimulatedDays(parseFloat(e.target.value))}
                className="w-full accent-brand-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>1 Day (Instant Gate AI)</span>
                <span>4 Days (DeliverIQ Target)</span>
                <span>18 Days (Old Paper Process)</span>
              </div>
            </div>

            {/* Calculated Impact Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[11px] text-slate-400 font-medium block">Working Capital Unlocked</span>
                <strong className="text-xl font-black font-mono text-white mt-1 block">
                  ₹{simWorkingCapitalUnlockedCr} Cr
                </strong>
                <span className="text-[10px] text-slate-400">₹84.48 Cr × ({daysSaved} days / 365)</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[11px] text-slate-400 font-medium block">Bank Overdraft Saved (12%)</span>
                <strong className="text-xl font-black font-mono text-emerald-400 mt-1 block">
                  ₹{simInterestSavingsLakhs} Lakh / yr
                </strong>
                <span className="text-[10px] text-slate-400">Direct cashflow interest reduction</span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[11px] text-slate-400 font-medium block">Disputed POD Recovery</span>
                <strong className="text-xl font-black font-mono text-brand-400 mt-1 block">
                  ₹{simDisputeSavingsLakhs} Lakh / yr
                </strong>
                <span className="text-[10px] text-slate-400">1.5% dispute rate down to 0.5%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Branch Breakdown Table & Live Audit Logs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Branch Performance Table (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-600" />
                <span>Branch Performance &amp; Turnaround Days</span>
              </h3>
              <span className="text-[11px] text-slate-500">5 Depots</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                    <th className="pb-2">Branch Depot</th>
                    <th className="pb-2 text-center">Total Trips</th>
                    <th className="pb-2 text-center">Missing PODs</th>
                    <th className="pb-2 text-center">24h Compliance</th>
                    <th className="pb-2 text-right">Avg Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.branchStats.map((b) => (
                    <tr key={b.branch} className="hover:bg-slate-50/70">
                      <td className="py-2.5 font-bold text-slate-900">{b.branch}</td>
                      <td className="py-2.5 text-center font-mono">{b.totalTrips}</td>
                      <td className="py-2.5 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.missingPODs > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {b.missingPODs}
                        </span>
                      </td>
                      <td className="py-2.5 text-center">
                        <div className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                          <span>{b.complianceRate}%</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                        {b.avgDaysToInvoice}d
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real-time System Audit Stream (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" />
                <span>Audit &amp; DPDP Activity Trail</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Immutable</span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 text-xs">
              {data.recentAuditLogs.map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] line-clamp-2">{log.details}</p>
                  <p className="text-[10px] text-slate-400">Actor: {log.actorName} ({log.actorRole})</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
