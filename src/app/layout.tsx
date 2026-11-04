import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'DeliverIQ | FTL Proof of Delivery (POD) & Tally Automation',
  description:
    'End-to-end full truckload POD capture, AI verification, billing queue with Tally Prime export for Company A, Chhatrapati Sambhajinagar.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">DeliverIQ v1.0</span>
              <span>•</span>
              <span>Company A Logistics FTL Division, Sambhajinagar</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>DPDP Act 2023 Compliant</span>
              <span>•</span>
              <span>Tally Prime Integration</span>
              <span>•</span>
              <span>Offline Ready</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
