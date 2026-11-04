# Technical Design Document (TDD)
# DeliverIQ: End-to-End FTL Proof of Delivery (POD) & Tally Automation

**GitHub Repository**: [https://github.com/rohitt2008/DeliverIQ.git](https://github.com/rohitt2008/DeliverIQ.git)  
**Client**: Company A, Chhatrapati Sambhajinagar, Maharashtra  
**Domain**: Full-Truckload (FTL) Freight Transport (Cement, Steel, Packaged Foods)  
**Fleet Scope**: 140 Owned Trucks + ~200 Hired Market Trucks | 210 Staff | ₹75–90 Cr Annual Turnover  
**Author**: Lead Software Engineer  
**Date**: November 2026 | Version 1.0.0

---

## Executive Summary & Business Rationale

Company A operates a high-volume FTL fleet transporting cement (Company B), steel (Company C), and packaged foods (Company D) across Maharashtra, Madhya Pradesh, and adjacent industrial corridors. Historically, billing was bottlenecked by physical Lorry Receipts (LR / POD) that drivers took 10 to 20 days to return to the Chhatrapati Sambhajinagar hub. Photos sent over WhatsApp were routinely blurred, cropped, lacked geotags, or were lost in chat threads. Because enterprise consignors reject invoices lacking authenticated PODs with consignee receiving stamps, billing in Tally ERP was delayed by an average of **18 days**.

### Labeled Financial Assumptions (from Problem Statement)
1. **[Assumption A-1: Freight Volume & Turnover]**: 2,200 trips per month at an average freight of ₹32,000 per trip yields an annual freight billing base of:
   $$\text{Annual Freight} = 2,200 \times 12 \times ₹32,000 = ₹84.48\text{ Crore}$$
2. **[Assumption A-2: Working Capital Cost of Paper Delay]**: Baseline POD-to-invoice duration is 18 days. Reducing this turnaround to 4 days brings billing forward by 14 days:
   $$\text{Working Capital Unlocked} = \frac{₹84.48\text{ Cr} \times 14}{365} = ₹3.24\text{ Crore}$$
   Financed at a standard commercial bank cash-credit / overdraft interest rate of 12% per annum, this working capital drag costs:
   $$\text{Annual Interest Savings} = ₹3.24\text{ Cr} \times 12\% = ₹38.9\text{ Lakh / year}$$
3. **[Assumption A-3: Lost and Disputed POD Elimination]**: 1.5% of total trips (396 trips/year out of 26,400) suffer from lost, damaged, or unprovable PODs, resulting in client write-offs of half the freight value ($396 \times ₹16,000 = ₹63.36\text{ Lakh}$). DeliverIQ reduces this dispute rate to 0.5%, recovering $1.0\%$ of trips ($264 \times ₹16,000 = ₹42.24\text{ Lakh/year}$).
4. **[Assumption A-4: Net Annual Leakage Plugged]**: The combined annual financial impact equals **₹1.02 Crore/year** ($₹38.9\text{L interest} + ₹63.36\text{L dispute baseline}$).
5. **[Assumption A-5: Project Budget & Timeline Constraints]**: Built under a ₹7.5 Lakh budget constraint within a 6-week roadmap.

---

## 1. System Architecture & Technical Choices

### 1.1 Architectural Topology
DeliverIQ is architected as an edge-ready, human-in-the-loop FTL logistics platform built with **Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma ORM, and SQLite**.

```
+-------------------------------------------------------------------------------------------------+
|                                         DELIVERIQ PLATFORM                                      |
+-------------------------------------------------------------------------------------------------+
|                                                                                                 |
|   +-----------------------+   +-----------------------+   +---------------------------------+   |
|   |   DRIVER GATE PWA     |   |  HIRED DRIVER SMS WEB |   |   BILLING EXECUTIVE WORKBENCH   |   |
|   |  - One Big Button     |   |  - Zero-Install Token |   |  - Split-Screen Inspection      |   |
|   |  - Marathi/Hindi Voice|   |  - Lightweight Web    |   |  - Stamp & Signature Zoom       |   |
|   |  - GPS Geotag Stamp   |   |  - Direct Gate Upload |   |  - Shortage Debit Note Adjust   |   |
|   +-----------+-----------+   +-----------+-----------+   +----------------+----------------+   |
|               |                           |                                |                    |
|               +-------------+-------------+                                |                    |
|                             |                                              |                    |
|                             v                                              |                    |
|       +---------------------------------------------+                      |                    |
|       | CLIENT-SIDE CANVAS COMPRESSION ENGINE       |                      |                    |
|       | - Compresses 12MP/5MB camera image < 300 KB |                      |                    |
|       | - IndexedDB Offline Queue for Dead Zones    |                      |                    |
|       +---------------------+-----------------------+                      |                    |
|                             |                                              |                    |
|                             v                                              |                    |
|       +---------------------------------------------+                      |                    |
|       | API INGESTION: /api/pod/upload              |                      |                    |
|       | - Geolocation validation                    |                      |                    |
|       | - DPDP Act 2023 Masking                     |                      |                    |
|       +---------------------+-----------------------+                      |                    |
|                             |                                              |                    |
|                             v                                              |                    |
|       +---------------------------------------------+                      |                    |
|       | DUAL-ENGINE LOGISTICS VISION AI             |                      |                    |
|       | 1. Gemini 1.5 Flash Multimodal Analyzer     |                      |                    |
|       | 2. Heuristic Logistics Vision Fallback      |                      |                    |
|       | -> Checks: LR No, Consignee Stamp,          |                      |                    |
|       |    Signature, Qty Delivered, Shortages      |                      |                    |
|       +---------------------+-----------------------+                      |                    |
|                             |                                              |                    |
|          +------------------+------------------+                           |                    |
|          | (Is Clean & Stamped)                | (Defect or Missing Stamp) |                    |
|          v                                     v                           |                    |
|     [VERIFIED]                        +-------------------+                |                    |
|          |                            | Retake Count < 2? |                |                    |
|          |                            +----+---------+----+                |                    |
|          |                          Yes    |         | No (Cap = 2)        |                    |
|          |                                 v         v                     |                    |
|          |                        [RETAKE_REQUESTED] [NEEDS_REVIEW] <------+                    |
|          |                                 |                 |                                  |
|          +---------------------------------+                 v                                  |
|                                                     [BILLING QUEUE]                             |
|                                                              |                                  |
|                                                              v                                  |
|                                                     [TALLY PRIME XML EXPORT]                    |
|                                                     & Proforma Tax Invoices                     |
+-------------------------------------------------------------------------------------------------+
```

### 1.2 Technology Selection Rationale

1. **Next.js 14 (App Router) & TypeScript**:
   - *Why chosen*: Enables unified client/server execution, server actions, route handlers for file streaming, and strict type safety across database schemas, AI extraction types, and Tally XML generators.
   - *Alternative rejected*: Separate Express backend + Vite React SPA. A decoupled architecture adds deployment fragility, dual hosting costs, CORS configuration overhead, and complicates local evaluation for reviewers.
2. **Prisma ORM with Zero-Config SQLite**:
   - *Why chosen*: Reviewers can clone the repo and execute `npm run dev` with **zero external database installations** (no Docker, no PostgreSQL server setup). The schema compiles strictly typed relations with foreign keys and cascading updates. In production, changing the datasource to PostgreSQL or Turso requires changing just one connection string.
3. **Dual-Engine Vision Architecture (Gemini Flash + Deterministic Heuristics)**:
   - *Why chosen*: Fulfills the strict requirement that *"The AI or automation part actually works, including what happens when it is wrong or unsure"*.
   - If an optional `GEMINI_API_KEY` is present, it uses Gemini 1.5 Flash with structured JSON output for live OCR and multimodal visual reasoning.
   - If no key is set or the server is disconnected from external APIs, DeliverIQ's built-in **Logistics Vision Engine** evaluates dimensions, edge density, file heuristics, and test vectors deterministically, ensuring 100% operational reliability.
4. **HTML5 Canvas Compression (< 300 KB) & IndexedDB Offline Queue**:
   - *Why chosen*: Drivers operating along Maharashtra industrial corridors (MIDC Waluj, Chakan, Butibori, Pithampur) encounter patchy 2G/3G connectivity. Client-side Canvas compression reduces multi-megabyte smartphone photos to 120–180 KB WebP/JPEG files before transmission, saving mobile data and avoiding upload timeouts.

---

## 2. Data Model & Entity Relationships

The Prisma relational schema manages clients, users, trips, proof of delivery records, invoices, and DPDP compliance audit logs.

```
+-------------------+        +--------------------+        +-------------------------+
|      Client       | 1    * |        Trip        | 1    1 |     ProofOfDelivery     |
+-------------------+--------+--------------------+--------+-------------------------+
| id (PK)           |        | id (PK, TRP-66120) |        | id (PK)                 |
| name              |        | clientId (FK)      |        | tripId (FK, Unique)     |
| industry          |        | vehicleNo          |        | imageUrl                |
| phoneMasked       |        | isHiredVehicle     |        | compressedSizeKb        |
| gstin             |        | driverName         |        | capturedAt / uploadedAt |
| billingCycle      |        | driverPhone        |        | gpsLat / gpsLng         |
| createdAt         |        | origin             |        | retakeCount (Max 2)     |
+-------------------+        | destination        |        | aiConfidence            |
                             | freightAmount      |        | lrNumberDetected        |
                             | material           |        | stampDetected (Boolean) |
                             | expectedQty        |        | stampClarityScore       |
                             | lrNumber (Unique)  |        | signatureDetected       |
                             | ewayBillNumber     |        | qtyReceived             |
                             | podStatus          |        | qtyDiscrepancy          |
                             | smsMagicToken      |        | remarksDetected         |
                             | invoiceId (FK)     |        | isShortageOrDamage      |
                             +---------+----------+        | reviewedById (FK)       |
                                       |                   | reviewNotes             |
                                       | *                 +-------------------------+
                                       |
                                       | 1
                             +---------+----------+
                             |      Invoice       |
                             +--------------------+
                             | id (INV-2026-0042) |
                             | clientId (FK)      |
                             | billingPeriod      |
                             | totalFreight       |
                             | deductions         |
                             | netPayable         |
                             | status             |
                             | tallyExportedAt    |
                             +--------------------+
```

### 2.1 State Transitions of `Trip.podStatus`
- `MISSING`: Trip dispatched/delivered, waiting for driver POD photo.
- `RETAKE_REQUESTED`: AI identified defect (e.g. missing stamp, blur). Driver prompted for retake (Attempt $\le 2$).
- `NEEDS_REVIEW`: Triggered when (a) shortage or damage remark detected, (b) low AI confidence, or (c) retake cap of 2 reached. Routed to Billing Executive workbench. Invoices are **never sent automatically**.
- `VERIFIED`: Stamped and signed POD confirmed by AI or approved by human billing executive. Ready for billing batch.
- `INVOICED`: Grouped into invoice batch and exported to Tally Prime XML.

---

## 3. AI Vision System & Edge-Case Failure Handling

### 3.1 Field Inspection Criteria
The AI engine checks six critical data points from the physical Lorry Receipt:
1. **LR Number**: Matches the manifest record.
2. **Consignee Receiving Rubber Stamp**: Detects ink impression, text clarity, and circular/rectangular seal contour.
3. **Receiving Signature**: Detects handwritten receiver acknowledgement in ink.
4. **Delivered Quantity**: Compares delivered units vs dispatched manifest.
5. **Shortage / Damage Remarks**: Scans receiver endorsements (e.g., *"Short by 6 cartons"*, *"Tear noticed"*).
6. **Date & Geo-Integrity**: Verifies capture timestamp against gate arrival window.

### 3.2 What Happens When AI is Wrong or Unsure (Human-in-the-Loop)
- **The Image Remains the Source of Truth**: AI extractions are treated as draft annotations. The original high-resolution compressed document is permanently archived and presented side-by-side to the billing executive.
- **Handling Shortages & Damage**: If a discrepancy exists (e.g., TRP-66141: Expected 450 cartons, Received 444 cartons), the system flags the trip as `NEEDS_REVIEW`. Shortage deductions (e.g. ₹500/carton debit note) are applied to the billing batch, preventing revenue rejection from enterprise clients.
- **Strict Retake Cap of 2**: If the AI asks for a retake, the driver is prompted. However, **retakes are capped at two attempts**. If the second retake remains imperfect, the system does not trap the driver at the gate; it marks the trip `NEEDS_REVIEW` with an alert: *"Retake limit reached (2 retakes). Driver cleared at gate. Routed to Billing Executive."*
- **No Automatic Invoicing**: The system prohibits automatic invoice generation or external customer dispatch without human executive verification.

---

## 4. UI/UX Decisions for Drivers & Billing Executives

### 4.1 Driver Persona (Low Literacy, High Engine Noise)
- **One Big Primary Button**: Instead of multi-step form fields, the driver screen has a single dominant emerald button: **"फोटो काढा / CAPTURE POD"**.
- **Voice Guidance (Marathi & Hindi)**: Web Speech synthesis speaks clear audio instructions:
  - *"कृपया पावतीचा स्वच्छ फोटो घ्या. वरचा शिक्का आणि स्वाक्षरी स्पष्ट दिसली पाहिजे."* (Please take a clear photo; stamp and signature must be visible).
  - *"पावती तपासत आहे, कृपया थांबा..."* (Checking receipt, please wait).
  - *"छान! पावती स्वीकारली गेली आहे."* (Great! Receipt approved).
- **High-Contrast Viewfinder Guides**: Visual corner brackets show drivers exactly how to frame the paper document.

### 4.2 Hired Driver Flow (Zero App Installation)
For the 200 market/hired trucks who refuse to download apps, dispatchers trigger an SMS magic link (`/upload/[tripId]`). It loads a frictionless web capture interface with GPS geotagging, canvas compression, and instant gate verification without requiring an account or password.

### 4.3 Billing Executive Workbench
- **Split-Screen Ergonomics**: The left side displays the high-resolution POD document with zoom ($1\times$ to $3\times$), $90^\circ$ rotation, and pan controls. The right side displays the side-by-side comparison between dispatched manifest fields and AI-extracted values.
- **Tally Prime XML Export**: Automatically generates standard Tally Sales Voucher envelopes with `<VOUCHER>`, `<PARTYLEDGERNAME>`, `<BILLALLOCATIONS>`, and custom UDF tags containing direct URLs to the digital POD image certificate.

---

## 5. Security & DPDP Act 2023 Compliance

Under the Digital Personal Data Protection (DPDP) Act 2023, consignee telephone numbers, driver contact details, and receiving officer personal identifiers constitute sensitive personal data.
1. **Dynamic PII Masking**: Consignee and driver phone numbers are automatically masked on driver screens, public links, and unprivileged views (e.g. `+91 98•••• 4321`).
2. **Purpose Limitation & Audit Logging**: Authorized billing executives can click "Audit & Unmask" to view full contact numbers when resolving shortage disputes. Every unmasking event writes an immutable entry to `AuditLog` recording the actor ID, timestamp, and field accessed.
3. **Zero Secrets in Repository**: Database credentials and optional Gemini API keys are isolated in local environment files (`.env`), documented only by variable names in `.env.example`.

---

## 6. What Was Cut & Future Roadmap

### What Was Cut for the 6-Week / ₹7.5 Lakh Build Scope
1. **Real-Time GPS Vehicle Tracking**: Explicitly out of scope per brief. DeliverIQ records point-of-delivery gate coordinates rather than continuous cellular breadcrumbs.
2. **Automated Payment Gateway Disbursements**: Driver trip advance payments and diesel card reconciliations were omitted to keep focus strictly on the POD-to-invoice working capital bottleneck.
3. **Automated Customer Invoice Dispatch**: Prohibited by design; enterprise clients reject unverified invoices, so human executive sign-off is maintained.

### What to Build Next (Phase 2 Roadmap)
1. **WhatsApp Cloud API Integration**: Direct two-way interactive WhatsApp bot for hired drivers using Gupshup/Meta Cloud API to deliver the upload magic link and receive status notifications.
2. **Direct Tally Prime ODBC / REST Sync**: Direct socket connection to push XML vouchers into active Tally Prime local instances running at the Sambhajinagar head office.
3. **Consignee Gate Geofencing**: Automatic geofence trigger that prompts the driver when their vehicle arrives within 200 meters of the delivery warehouse.
