# DeliverIQ — Deployment & Operations Manual

> **GitHub Repository**: [https://github.com/rohitt2008/DeliverIQ.git](https://github.com/rohitt2008/DeliverIQ.git)  
> **Client**: Company A, Chhatrapati Sambhajinagar, Maharashtra (Full-Truckload Logistics)  
> **Target**: POD capture in 24h, reduce billing cycle from 18 days to 4 days, unlock ₹3.24 Cr working capital.

---

## 1. Quick Local Setup (Step-by-Step)

DeliverIQ runs with **zero external database dependencies** out of the box using an embedded high-performance SQLite engine.

### Prerequisites
- **Node.js**: v18.18+, v20+, or v24+
- **npm**: v9+ or v11+
- **Git**

### Step-by-Step Instructions

```bash
# 1. Clone the repository
git clone https://github.com/rohitt2008/DeliverIQ.git
cd DeliverIQ

# 2. Install dependencies (auto-generates Prisma client via postinstall)
npm install

# 3. Initialize SQLite database schema
npx prisma db push

# 4. Seed the database with realistic Maharashtra FTL data (including TRP-66120, TRP-66134, TRP-66141)
npm run seed

# 5. Start the local development server
npm run dev
```

Open your browser at: **[http://localhost:3000](http://localhost:3000)**

---

## 2. Running Automated Tests

DeliverIQ includes an automated test suite verifying AI vision decision logic, 2-retake cap enforcement, Tally Prime XML export structure, DPDP Act 2023 phone masking, and the working capital savings formula.

```bash
npm test
```

Expected output:
```text
✔ AI Vision: Clean POD with stamp and signature returns VERIFIED
✔ AI Vision: Missing stamp on initial attempt requests retake
✔ AI Vision: Retake cap enforcement (Capped at 2 retakes maximum)
✔ AI Vision: Shortage remark escalates to billing executive and never prompts retake
✔ DPDP Act 2023: Phone number masking protects driver & consignee personal data
✔ DPDP Act 2023: Personal name masking on public links protects individual privacy
✔ Tally Prime XML Export generates valid XML structure with ledger entries and POD links
✔ Billing CSV Export generates headers and formatted rows
✔ Working Capital Financial Logic conforms exactly to Company A Problem Statement
✔ Working Capital returns zero savings when cycle time equals baseline

ℹ tests 10 | pass 10 | fail 0
```

---

## 3. Environment Variables

Create a `.env` file in the project root (a pre-configured template is in `.env.example`):

| Variable Name | Required | Description |
| :--- | :---: | :--- |
| `DATABASE_URL` | **Yes** | SQLite database path (default: `file:./dev.db`) |
| `NEXT_PUBLIC_APP_URL` | **Yes** | Base application URL (e.g. `http://localhost:3000` or production domain) |
| `NODE_ENV` | **Yes** | Application environment (`development` or `production`) |
| `GEMINI_API_KEY` | Optional | Google Gemini 1.5 Flash Vision API key for live multimodal visual inspection. If omitted, DeliverIQ automatically uses its built-in deterministic Logistics Vision Engine with zero third-party dependencies. |

> **Security Note**: In accordance with the assessment security guidelines, **no secrets or API keys are committed** to the repository.

---

## 4. Demo Login Credentials for Reviewer

You can use the **1-click role switcher buttons** on the [`/login`](http://localhost:3000/login) page or in the top navigation bar, or enter these credentials:

| Role | Name & Context | Demo Email | Password / PIN | Target Landing Page |
| :--- | :--- | :--- | :--- | :--- |
| **Driver** | Ramesh Pawar (Truck MH20 EL 4521, Marathi/Hindi audio) | `driver@deliveriq.in` | `1234` | [`/driver`](http://localhost:3000/driver) |
| **Billing Executive** | Priya Sharma (Review queue & Tally exports) | `billing@deliveriq.in` | `deliveriq2026` | [`/review`](http://localhost:3000/review) |
| **Operations Head** | Rajesh Deshmukh (Missing PODs, branch turnaround) | `ops@deliveriq.in` | `deliveriq2026` | [`/dashboard`](http://localhost:3000/dashboard) |
| **Consignor Client** | Amit Kulkarni (Company B Inward Logistics) | `client@deliveriq.in` | `deliveriq2026` | [`/client-portal`](http://localhost:3000/client-portal) |

---

## 5. Key Review Flows & Sample Data

DeliverIQ is pre-seeded with the exact trips from the client problem statement:

1. **Trip `TRP-66120` (Verified Flow)**:
   - Client: Company B (cement) | Vehicle: MH20 EL 4521 | To: Nagpur | Freight: ₹38,500
   - Consignee rubber stamp and signature are present. AI verified. Ready for billing batch.
   - Inspect at [`/verify/TRP-66120`](http://localhost:3000/verify/TRP-66120).

2. **Trip `TRP-66134` (Retake Requested Flow)**:
   - Client: Company C (steel) | Vehicle: MH20 GT 7718 | To: Pune | Freight: ₹26,000
   - AI identified: Consignee rubber stamp is missing.
   - Action: Displays retake prompt with Marathi/Hindi voice guide: *"कृपया पुन्हा फोटो काढा: पावतीवर ग्राहकाचा शिक्का दिसत नाही."*
   - Try retaking at [`/driver`](http://localhost:3000/driver).

3. **Trip `TRP-66141` (Shortage & Needs Review Flow)**:
   - Client: Company D (packaged foods) | Vehicle: MH17 BY 3092 (hired) | To: Indore | Freight: ₹41,200
   - Receiver marked: *"Short by 6 cartons (444 received out of 450)"*.
   - Action: Invoices are never sent automatically. Routed to Billing Executive queue at [`/review`](http://localhost:3000/review). Executive can adjust quantity or attach debit note before Tally export.

4. **Hired Driver SMS Magic Link**:
   - Access directly without login: [`/upload/TRP-66141`](http://localhost:3000/upload/TRP-66141).
   - Designed for the 200 hired market trucks who will not download an app.

5. **Tally Prime XML Export**:
   - Visit [`/billing`](http://localhost:3000/billing), select verified trips for Company B or C, and click **Export to Tally Prime (XML)**. Imports cleanly into Tally ERP 9 / Tally Prime Sales Vouchers.

6. **Working Capital Simulator**:
   - Visit [`/dashboard`](http://localhost:3000/dashboard) and adjust the interactive slider from 18 days to 4 days to see live savings calculation: ₹3.24 Cr unlocked, ₹38.9 Lakh interest saved.

---

## 6. Production Deployment

### Option A: Vercel / Cloud Edge
1. Push repository to GitHub (`https://github.com/rohitt2008/DeliverIQ.git`).
2. Import project into Vercel.
3. For cloud serverless persistence, configure a PostgreSQL/Turso URL in `DATABASE_URL` (or attach a Vercel Postgres/Turso integration) and run `npx prisma db push`.
4. Deploy with build command: `npm run build`.

### Option B: Node.js Standalone / Docker
```bash
npm run build
npm run start
```
DeliverIQ will serve production-optimized SSR and static assets on port 3000.
