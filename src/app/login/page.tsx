'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, ShieldCheck, UserCheck, ArrowRight, CheckCircle2, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    {
      role: 'DRIVER',
      title: '🚚 Driver Portal',
      name: 'Ramesh Pawar',
      email: 'driver@deliveriq.in',
      hint: 'Basic mobile UI, Marathi/Hindi audio prompts, big camera button',
      target: '/driver',
      color: 'border-emerald-200 hover:border-emerald-500 bg-emerald-50/40',
    },
    {
      role: 'BILLING_EXECUTIVE',
      title: '📑 Billing Executive',
      name: 'Priya Sharma',
      email: 'billing@deliveriq.in',
      hint: 'Split-screen OCR workbench, stamp verification, shortage notes',
      target: '/review',
      color: 'border-blue-200 hover:border-blue-500 bg-blue-50/40',
    },
    {
      role: 'OPERATIONS_HEAD',
      title: '📊 Operations Head',
      name: 'Rajesh Deshmukh',
      email: 'ops@deliveriq.in',
      hint: 'Missing POD dashboard, ₹3.24 Cr working capital tracker, branch turnaround',
      target: '/dashboard',
      color: 'border-purple-200 hover:border-purple-500 bg-purple-50/40',
    },
    {
      role: 'CLIENT_VIEWER',
      title: '🏢 Consignor Client',
      name: 'Amit Kulkarni (Company B)',
      email: 'client@deliveriq.in',
      hint: 'Self-service POD search, consignee stamp verification certificate',
      target: '/client-portal',
      color: 'border-slate-200 hover:border-slate-400 bg-slate-50',
    },
  ];

  const handleDemoLogin = (account: typeof demoAccounts[0]) => {
    setEmail(account.email);
    setPassword('deliveriq2026');
    setLoading(true);
    setTimeout(() => {
      router.push(account.target);
    }, 400);
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (email.includes('driver')) {
        router.push('/driver');
      } else if (email.includes('ops')) {
        router.push('/dashboard');
      } else if (email.includes('client')) {
        router.push('/client-portal');
      } else {
        router.push('/review');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md shadow-brand-600/20">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign in to DeliverIQ</h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Role-based access control for Company A FTL transport management, Sambhajinagar.
          </p>
        </div>

        {/* 1-Click Demo Reviewer Role Switcher */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Reviewer Demo Accounts (1-Click Instant Login):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {demoAccounts.map((account) => (
              <button
                key={account.role}
                onClick={() => handleDemoLogin(account)}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 ${account.color} group`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{account.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[11px] font-semibold text-slate-700 mt-0.5">{account.name}</p>
                  <p className="text-[10px] text-slate-500 mt-1 leading-snug">{account.hint}</p>
                </div>
                <span className="text-[10px] font-mono text-brand-700 font-bold">
                  {account.email}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Traditional Form Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Or Sign in with Email
          </span>
        </div>

        {/* Custom Form */}
        <form onSubmit={handleCustomLogin} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@deliveriq.in"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Password / Driver PIN</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Security badge */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>DPDP Act 2023 Compliant Session</span>
          </span>
          <span>v1.0 FTL Build</span>
        </div>
      </div>
    </div>
  );
}
