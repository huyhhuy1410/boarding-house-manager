# RentalHub — Express & React Full-Stack Boarding House Management System

> **Full-Stack PWA & Mobile-First Management App for Rental Properties**  
> *The original full-stack implementation of RentalHub, featuring a React 18 / Vite PWA frontend and an Express.js / TypeScript / PostgreSQL REST API backend.*

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-PWA-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Express](https://img.shields.io/badge/Express-Node.js-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)

---

## 📌 Domain Origin & Evolution

**RentalHub** was built to solve a real-world operational pain point: replacing manual handwritten paper logs used by small boarding house owners with a streamlined digital workflow.

This repository represents the **original full-stack Express.js implementation**. It provides a complete end-to-end user experience, from an iOS-style mobile-first Progressive Web App (PWA) to a TypeScript/Express REST API backed by PostgreSQL and Prisma ORM.

*(Note: For the production-oriented NestJS backend architecture rewrite, see [`boarding-house-manager-nestjs-rmk`](../boarding-house-manager-nestjs-rmk/)).*

---

## ⚙️ Core Application Features

1. **End-to-End Property & Room Management**
   - Manage boarding houses, individual rooms, and rental pricing.
   - Filter rooms by status (`Available`, `Rented`, `Under Maintenance`).
2. **Tenant Profiles & Contract Lifecycle**
   - Store tenant details (contact, ID/CCCD, deposit amount, vehicles).
   - Atomic tenant room transfers: Moves tenant to a new room within a database transaction, finalizing old room balances and transferring deposit records.
3. **Meter Reading & Utility Invoicing**
   - Log electricity (kWh) and water ($m^3$) readings with support for fixed service rates or bundled utilities.
   - Single invoice constraint per room/month (`DRAFT → ISSUED → PAID/CANCELLED`).
4. **Receipt Generation & Messaging Sharing**
   - Generates digital image receipts and copyable text summaries formatted for instant sharing via Zalo, Telegram, or SMS.
5. **Telegram Bot Integration (`/bill`)**
   - Accepts `/bill` commands authenticated by `TELEGRAM_CHAT_ID`, fetching live database invoice statuses and returning formatted tenant receipts.
6. **Mobile-First PWA & Offline Support**
   - Built with React 18, Tailwind CSS, Lucide icons, Recharts analytics, and `vite-plugin-pwa` for offline caching and mobile app shell installation.

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
* Node.js 18+ and `npm` installed.
* PostgreSQL database instance running (or Supabase URL).

### 1. Backend Setup

```bash
# Navigate to backend directory
cd boarding-house-manager/backend

# Create environment configuration
cp .env.example .env  # Add your DATABASE_URL

# Install dependencies & push Prisma schema
npm install
npx prisma db push

# Start Express development server
npm run dev
```
*Backend runs at `http://localhost:5005`.*

### 2. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd boarding-house-manager/frontend

# Install dependencies and start Vite dev server
npm install
npm run dev
```
*Frontend runs at `http://localhost:3005` and automatically proxies `/api` requests to port `5005`.*

---

## 📂 Project Directory Architecture

```text
boarding-house-manager/
├── backend/                  # Express.js REST API
│   ├── prisma/               # Prisma schema & migrations
│   └── src/
│       ├── controllers/      # HTTP request handlers
│       ├── repositories/     # Data access layer
│       ├── services/         # Business logic & calculations
│       ├── schemas/          # Zod validation schemas
│       └── routes/           # REST API route definitions
├── frontend/                 # React 18 PWA Frontend
│   └── src/
│       ├── components/       # Tabs, modals, & iOS-style UI components
│       ├── services/         # Axios API clients
│       └── App.tsx           # Application state coordinator
└── docs/                     # Architecture notes & technical documentation
```

---

## 🧪 Testing & Verification Builds

Verify that both frontend and backend build cleanly without errors:

```bash
cd backend && npm run build
cd frontend && npm run build
```

---

## 📄 License & Provenance Notice

This project is an **independent full-stack software application** created by Vo Quang Huy. It contains no proprietary code, private company secrets, or unauthorized third-party credentials.
