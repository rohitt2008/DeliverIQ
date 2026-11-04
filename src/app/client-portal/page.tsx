'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Search,
  FileCheck,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Truck,
  Download,
  Eye
} from 'lucide-react';

interface ClientTrip {
  id: string;
  lrNumber: string;
  ewayBillNumber: string;
  vehicleNo: string;
  destination: string;
  material: string;
  expectedQty: number;
  unit: string;
  podStatus: string;
  deliveredDate: string | null;
  client: { name: string; industry: string };
  pod?: {
    imageUrl: string;
    capturedAt: string;
    stampDetected: boolean;
    stampClarityScore: number;
    signatureDetected: boolean;
    qtyReceived: number | null;
    gpsLocationName: string | null;
  } | null;
}

export default function ClientPortalPage() {
  const [trips, setTrips] = useState<ClientTrip[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('Company B (cement)');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await fetch('/api/trips');
        const data = await res.json();
        if (data.success) {
          setTrips(data.trips);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const clientTrips = trips.filter((t) => t.client.name === selectedClient);
  const filtered = clientTrips.filter((t) =>
    t.id.toLowerCase().includes(search.toLowerCase()) ||
    t.lrNumber.toLowerCase().includes(search.toLowerCase()) ||
    t.ewayBillNumber.toLowerCase().includes(search.toLowerCase()) ||
    t.vehicleNo.toLowerCase().includes(search.toLowerCase()) ||
    t.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-6 h-6 text-brand-600" />
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Client POD Access Portal
              </h1>
              <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">
                Self-Service Inward Verification
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Consignors can instantly search and inspect verified digital Proof of Delivery receipts with receiving stamps.
            </p>
          </div>

          {/* Client Account Switcher */}
          <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-slate-200 text-xs font-bold">
            {['Company B (cement)', 'Company C (steel)', 'Company D (packaged foods)'].map((clientName) => (
              <button
                key={clientName}
                onClick={() => setSelectedClient(clientName)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  selectedClient === clientName
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {clientName.split(' ')[0]} {clientName.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by LR number, e-Way bill number, Vehicle number or Destination..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
            Showing <strong className="text-slate-900">{filtered.length} shipments</strong> for {selectedClient}
          </span>
        </div>

        {/* Shipments Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-2 p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
              No shipments found matching your search.
            </div>
          ) : (
            filtered.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-slate-900">{trip.id}</span>
                        <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          LR: {trip.lrNumber}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 mt-1">
                        {trip.material} • {trip.expectedQty} {trip.unit}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        trip.podStatus === 'VERIFIED' || trip.podStatus === 'INVOICED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {trip.podStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 block">DESTINATION:</span>
                      <strong className="text-slate-800">{trip.destination}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">VEHICLE NO:</span>
                      <strong className="text-slate-800">{trip.vehicleNo}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">E-WAY BILL:</span>
                      <span className="font-mono text-slate-700">{trip.ewayBillNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">DELIVERED:</span>
                      <span className="text-slate-700">
                        {trip.deliveredDate ? new Date(trip.deliveredDate).toLocaleDateString('en-IN') : 'In transit'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* POD Section */}
                {trip.pod ? (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="font-bold text-slate-800 block">
                          Consignee Stamp &amp; Sign Verified
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Gate: {trip.pod.gpsLocationName || 'Consignee Gate'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/verify/${trip.id}`}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Link>
                      <a
                        href={trip.pod.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg transition"
                        title="Download Original SVG/Photo"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-center gap-2">
                    <span>Driver delivery photo pending at consignee gate.</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
