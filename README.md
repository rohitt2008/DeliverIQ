# DeliverIQ — FTL Proof of Delivery (POD) & Tally Automation Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io/)
[![DPDP Act 2023](https://img.shields.io/badge/Compliance-DPDP_Act_2023-emerald)](#dpdp-act-2023-compliance)
[![Tally Prime](https://img.shields.io/badge/Accounting-Tally_Prime_XML-orange)](#tally-prime-integration)
[![Test Suite](https://img.shields.io/badge/Tests-10%20Passed%20(100%25)-brightgreen)](#automated-testing)

> **Client**: Company A, Chhatrapati Sambhajinagar, Maharashtra  
> **Operations**: Full-Truckload (FTL) Freight Carrier for Cement, Steel, and FMCG  
> **Fleet Scale**: 140 Owned Trucks + ~200 Hired Market Trucks | 210 Staff | ₹75–90 Cr Annual Turnover  
> **Core Objective**: Bring signed PODs from 800 km away into the system in 24 hours, slash billing cycle from 18 days to 4 days, and unlock **₹3.24 Crore** in working capital.

---

## 🚀 Live Demo & Quick Start

DeliverIQ runs with **zero external database dependencies** out of the box using an embedded high-performance SQLite engine.

```bash
# 1. Clone repository
git clone https://github.com/rohitt2008/DeliverIQ.git
cd DeliverIQ

# 2. Install dependencies (Prisma client is generated automatically)
npm install

# 3. Initialize SQLite schema
npx prisma db push

# 4. Seed with realistic Maharashtra FTL data (including TRP-66120, TRP-66134, TRP-66141)
npm run seed

# 5. Start development server
npm run dev
```

Visit: **[http://localhost:3000](http://localhost:3000)**

---

## 🎯 Reviewer Demo Credentials

Use the **1-click role switcher buttons** on [`/login`](http://localhost:3000/login) or in the navigation bar to experience each workflow:

| Role | Name & Focus | Demo Email | Password / PIN | Direct URL |
| :--- | :--- | :--- | :--- | :--- |
| **🚚 Driver** | Ramesh Pawar (Truck MH20 EL 4521, Marathi/Hindi audio) | `driver@deliveriq.in` | `1234` | [`/driver`](http://localhost:3000/driver) |
| **📑 Billing Executive** | Priya Sharma (Review queue, stamp zoom, Tally export) | `billing@deliveriq.in` | `deliveriq2026` | [`/review`](http://localhost:3000/review) |
| **📊 Operations Head** | Rajesh Deshmukh (Missing PODs, branch turnaround) | `ops@deliveriq.in` | `deliveriq2026` | [`/dashboard`](http://localhost:3000/dashboard) |
| **🏢 Consignor Client** | Amit Kulkarni (Company B Inward Logistics) | `client@deliveriq.in` | `deliveriq2026` | [`/client-portal`](http://localhost:3000/client-portal) |

---

## 💼 The Problem & Financial Impact

### Financial Assumptions & ROI (from Problem Statement)
- **Turnover [A-1]**: 2,200 trips/month @ ₹32,000 average freight = **₹84.48 Crore/year**.
- **Working Capital Delay [A-2]**: POD-to-invoice takes 18 days baseline. Reducing to 4 days brings billing 14 days forward:
  $$\frac{₹84.48\text{ Cr} \times 14\text{ days}}{365} = ₹3.24\text{ Crore working capital unlocked}$$
  At a 12% cash-credit interest rate, this saves **₹38.9 Lakh/year** in interest cost alone.
- **Dispute & Lost POD Leakage [A-3]**: 1.5% of PODs (396 trips/year) are lost or disputed, losing half freight ($396 \times ₹16,000 = ₹63.36\text{ Lakh}$). DeliverIQ reduces disputes to 0.5%, saving **₹42.24 Lakh/year**.
- **Total Annual Leakage Plugged [A-4]**: **₹1.02 Crore / year** in direct EBITDA expansion.

---

## 🌟 Key Features & Core Build Slices

### 1. Driver Gate App (`/driver`)
- **One Big Primary Button**: Designed for low-literacy drivers—no forms to type.
- **Marathi & Hindi Audio Prompts**: Integrated Web Speech synthesis speaks clear guidance (*"कृपया पावतीचा स्वच्छ फोटो घ्या..."*) audible over truck engine noise.
- **GPS Timestamp & Geotag**: Point-of-delivery coordinates and accuracy embedded automatically.
- **Offline Highway Queue**: Captures taken in dead zones are stored in IndexedDB and sync automatically upon 4G reconnect.
- **Client-Side Compression**: Compresses 12MP photos to < 300 KB WebP/JPEG before upload.

### 2. Hired Driver SMS Magic Link (`/upload/[tripId]`)
- One-tap link sent via SMS/WhatsApp for the 200 market/hired trucks who will not install an app.
- No login or password required. Stamped with gate GPS and instant feedback.

### 3. Dual-Engine Logistics Vision AI
- Checks: **LR Number, Consignee Rubber Stamp, Receiver Signature, Delivered Qty, and Shortage/Damage Remarks**.
- **Human-in-the-Loop Safeguards**:
  - **The Image Remains the Source of Truth**: Original high-res documents are permanently archived.
  - **Retake Limit Capped at 2**: If the rubber stamp is faint or missing, the driver gets a retake prompt. If still not resolved after 2 retakes, the driver is cleared at the gate and the trip routes to the Billing Executive (`NEEDS_REVIEW`).
  - **Invoices Never Sent Automatically**: Shortages (e.g. TRP-66141) pause billing until executive debit note review.

### 4. Billing Review Queue (`/review`)
- Split-screen inspection workbench: Left side features POD image pan, zoom ($1\times$ to $3\times$), and $90^\circ$ rotation; right side compares manifest fields against AI findings.
- Field correction, shortage note resolution, and retake audit controls.

### 5. Billing Queue & Tally Prime Export (`/billing`)
- Filter verified trips by client (Company B Cement, Company C Steel, Company D FMCG) and billing cycle.
- **Native Tally Prime XML Export**: Exports Sales Vouchers with ledger allocations, bill references, and digital POD hyperlinks in ledger narrations.
- Proforma Tax Invoice preview with embedded POD certificate and QR verification seal.

### 6. Operations Dashboard (`/dashboard`)
- Missing POD count by branch (Chhatrapati Sambhajinagar, Pune, Nagpur, Indore, Mumbai).
- **Interactive Working Capital Simulator**: Live slider calculating interest saved and capital unlocked.
- Daily trip CSV/bulk import with LR and e-way bill generation.

### 7. Consignor Client Portal (`/client-portal` & `/verify/[id]`)
- Self-service portal for enterprise clients to inspect authenticated PODs with consignee stamps and GPS audit trails.

---

## 🔒 DPDP Act 2023 Compliance

Consignee names and telephone numbers are classified as personal data under India's Digital Personal Data Protection Act 2023:
- Phone numbers are dynamically masked on driver screens, public links, and unprivileged views (`+91 98•••• 4321`).
- Billing executives can audit and unmask sensitive fields with all access events logged immutably in `AuditLog`.

---

## 🧪 Automated Testing

DeliverIQ includes an automated test suite executed with Node's native test runner:

```bash
npm test
```

Verifies:
1. AI vision verification and stamp detection.
2. Missing stamp retake request prompt.
3. Strict enforcement of the 2-retake cap.
4. Shortage remark escalation to billing executive.
5. DPDP Act 2023 phone and name masking.
6. Tally Prime XML envelope and voucher schema validity.
7. Billing CSV export format.
8. Working capital and interest savings formulas.

---

## 📦 Submission Deliverables

Per the evaluation requirements, the submission ZIP file **`DeliverIQ_Submission.zip`** contains:
1. **`Technical_Design_Document.pdf`**: Publication-quality technical design document including architecture diagrams, data model, labeled financial assumptions, and scope roadmap.
2. **`deployment.md`**: Step-by-step local run manual, environment variables, demo login details, and deployment guide.

To repackage the submission ZIP at any time:
```bash
python3 scripts/generate-tdd-pdf.py
node scripts/package-submission.mjs
```

---

## 📄 License
Developed for Company A Logistics, Chhatrapati Sambhajinagar, Maharashtra. All rights reserved.
