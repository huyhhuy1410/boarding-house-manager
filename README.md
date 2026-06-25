# RentalHub - Property & Utility Billing Manager

A lightweight, production-ready property management system designed to streamline tenant tracking, automated utility billing (electricity & water meters), and tenant notifications.

---

## Key Features

*   **Dynamic Property Management:** Multi-property / boarding house routing and filtering managed dynamically via database relations.
*   **Flexible Billing Rules:** 
    *   Automatic bill calculation based on meter chênh lệch (new vs. old readings).
    *   Inclusive utility configuration support (e.g., "Electricity Included" rates where billing amount is 0 but meter records are maintained).
    *   Tenant lease-start index detection for accurate first-month billing.
*   **Unified Deposit Model:** Automatic calculation of combined room and utility deposits (e.g. electric deposit tracking).
*   **One-Click Sharing:** Formatted bill receipt generation optimized for direct sharing via messaging apps (Zalo, SMS, iMessage).
*   **Chatbot Integration (Upcoming):** Telegram Bot webhook integration for remote utility logging and expense tracking.
*   **Analytics Dashboard (Upcoming):** Financial visualization (Net Revenue vs. Maintenance Costs) using Recharts.

---

## Tech Stack

*   **Frontend:** React (Vite, TypeScript, Vanilla CSS, Lucide Icons, Axios)
*   **Backend:** Node.js, Express, TypeScript, Zod (API Validation Middleware)
*   **Database:** PostgreSQL (Supabase Cloud), Prisma ORM
*   **Testing:** Playwright (E2E Integration Testing)

---

## Project Structure

```text
boarding-house-manager/
├── backend/                  # REST API Service
│   ├── prisma/               # Database Schema & Migrations
│   ├── src/
│   │   ├── controllers/      # Route controllers (HTTP requests handler)
│   │   ├── repositories/     # Data Access Objects (Prisma client wrapper)
│   │   ├── services/         # Core business logic & calculation rules
│   │   ├── schemas/          # Zod validation schemas
│   │   └── routes/           # Express router definitions
│
└── frontend/                 # React UI
    ├── src/
    │   ├── services/         # Axios API clients
    │   ├── App.tsx           # Main application state and view router
    │   └── index.css         # Design system & tokens
```

---

## Getting Started

### 1. Database Setup
Copy `backend/.env.example` to `backend/.env` and update the connection strings:
```env
DATABASE_URL="postgresql://postgres:[password]@db.[project-id].supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres"
```

Push the database schema and seed mock data:
```bash
cd backend
npm install
npx prisma db push --force-reset
npm run dev # Launches API server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev # Launches dev server on http://localhost:3000
```

### 3. Run E2E Integration Tests
```bash
cd scratch
node test-fe-details.js
```
