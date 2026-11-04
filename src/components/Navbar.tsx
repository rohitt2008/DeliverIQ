'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Truck,
  ClipboardCheck,
  FileSpreadsheet,
  BarChart3,
  Building2,
  Wifi,
  WifiOff,
  UserCheck,
  Menu,
  X,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { getQueuedPODs, syncQueuedPODs } from './OfflineStorage';

export default function Navbar() {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);
  const [offlineCount, setOfflineCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<'DRIVER' | 'BILLING' | 'OPS' | 'CLIENT'>('BILLING');

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      handleSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check offline items
    checkQueue();
    const interval = setInterval(checkQueue, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const checkQueue = async () => {
    try {
      const queued = await getQueuedPODs();
      setOfflineCount(queued.length);
    } catch {
      // ignore
    }
  };

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await syncQueuedPODs();
      await checkQueue();
    } finally {
      setIsSyncing(false);
    }
  };

  const navLinks = [
    { href: '/driver', label: 'Driver Gate App', icon: Truck, role: 'DRIVER' },
    { href: '/review', label: 'Review Queue', icon: ClipboardCheck, role: 'BILLING' },
    { href: '/billing', label: 'Billing & Tally', icon: FileSpreadsheet, role: 'BILLING' },
    { href: '/dashboard', label: 'Ops Dashboard', icon: BarChart3, role: 'OPS' },
    { href: '/client-portal', label: 'Client Portal', icon: Building2, role: 'CLIENT' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Offline Alert Strip */}
      {!isOnline && (
        <div className="bg-amber-500 text-white text-xs font-medium px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3.5 h-3.5 animate-pulse" />
            <span>Highway Offline Mode Active: Photos stored securely on device and will sync automatically upon network return.</span>
          </div>
          {offlineCount > 0 && (
            <span className="bg-amber-700/60 px-2 py-0.5 rounded text-[11px] font-bold">
              {offlineCount} pending upload{offlineCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {isOnline && offlineCount > 0 && (
        <div className="bg-blue-600 text-white text-xs font-medium px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Back online! {offlineCount} offline POD{offlineCount > 1 ? 's' : ''} ready to sync.</span>
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="bg-white text-blue-700 px-3 py-0.5 rounded text-[11px] font-bold hover:bg-blue-50 transition"
          >
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Transporter Info */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg text-slate-900 tracking-tight">Deliver<span className="text-brand-600">IQ</span></span>
                  <span className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold px-1.5 py-0.5 rounded">FTL</span>
                </div>
                <p className="text-[11px] text-slate-500 -mt-0.5 hidden sm:block">Company A • Sambhajinagar</p>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Status Controls & Role Switcher */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Online Status Dot */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-full border border-slate-200">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`} />
              <span className="font-medium text-[11px]">{isOnline ? 'Network 4G' : 'Offline'}</span>
            </div>

            {/* Role Switcher Pill */}
            <div className="relative flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs font-medium">
              <button
                onClick={() => setActiveRole('DRIVER')}
                className={`px-2.5 py-1 rounded-md transition ${
                  activeRole === 'DRIVER' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Switch to Driver view"
              >
                🚚 Driver
              </button>
              <button
                onClick={() => setActiveRole('BILLING')}
                className={`px-2.5 py-1 rounded-md transition ${
                  activeRole === 'BILLING' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Switch to Billing Executive view"
              >
                📑 Billing
              </button>
              <button
                onClick={() => setActiveRole('OPS')}
                className={`px-2.5 py-1 rounded-md transition ${
                  activeRole === 'OPS' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Switch to Operations Head view"
              >
                📊 Ops
              </button>
            </div>
          </div>

          {/* Mobile Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5 text-slate-500" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
