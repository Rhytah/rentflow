# RentFlow

Rent and utilities management for landlords, property managers, tenants, and homeowners.

## Tech stack

- **Frontend** — React 18 + TypeScript + Vite
- **Styling** — Tailwind CSS
- **Backend / DB** — Supabase (PostgreSQL + Auth + RLS)
- **State** — TanStack Query (React Query)
- **Charts** — Recharts
- **Routing** — React Router v6

---

## Getting started

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Run the database migration

In your Supabase dashboard → **SQL Editor**, paste and run the full contents of:

```
supabase/migrations/001_initial_schema.sql
```

This creates all tables, enums, RLS policies, triggers, and views.

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in your Supabase project URL and anon key (found in Project Settings → API).

### 4. Install dependencies and run

```bash
npm install
npm run dev
```

---

## Project structure

```
src/
├── components/
│   ├── layout/          # Sidebar, AppLayout
│   └── shared/          # Reusable UI: Avatar, Modal, MetricCard, etc.
├── hooks/
│   ├── usePayments.ts   # Payment CRUD + summaries
│   └── useProperties.ts # Properties, units, leases, utilities
├── lib/
│   ├── auth.tsx         # Supabase auth context
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # Formatters (UGX, dates, etc.)
├── pages/
│   ├── DashboardPage.tsx
│   ├── PaymentsPage.tsx
│   ├── TenantsPage.tsx
│   ├── UtilitiesPage.tsx
│   ├── PropertiesPage.tsx
│   ├── LoginPage.tsx
│   └── SignUpPage.tsx
├── types/
│   └── database.ts      # Full TypeScript types matching Supabase schema
└── styles/
    └── globals.css      # Tailwind + component classes
```

---

## User roles

| Role | What they see |
|------|--------------|
| **Landlord** | All properties, payments, tenants, utilities they own |
| **Property Manager** | Portfolio across multiple owners, disbursement tracking |
| **Tenant** | Their own lease, payment history, pay now flow |
| **Homeowner** | Income summary, per-unit status, net disbursement |

Row Level Security enforces this in Supabase — each user only ever sees their own data.

---

## Key features built

- [x] Multi-role auth (Landlord, Manager, Tenant, Homeowner)
- [x] Property & unit management
- [x] Lease creation and tracking
- [x] Monthly rent payment recording
- [x] Partial payment support
- [x] Auto late fee calculation (via Postgres trigger)
- [x] Collection rate metrics
- [x] Utility bill tracking (UMEME, NWSC, etc.)
- [x] Payment method tracking (MTN MoMo, Airtel Money, Bank, Cash)
- [x] Tenant pay-now flow
- [x] Per-role dashboards
- [x] Full RLS — secure data isolation

## Modules still to build

- [ ] Automated SMS/WhatsApp reminders (Africa's Talking API)
- [ ] PDF receipt generation
- [ ] Lease document uploads (Supabase Storage)
- [ ] Maintenance requests full CRUD
- [ ] Owner disbursement reports
- [ ] Mobile app (React Native + same Supabase backend)
- [ ] Bulk payment import (CSV)
- [ ] Lease renewal workflow

---

## Supabase reminder automation (roadmap)

Use a Supabase Edge Function + pg_cron to run nightly:

```sql
-- Mark overdue payments (run nightly via pg_cron)
update payments
set status = 'overdue'
where status in ('pending', 'upcoming')
  and due_date < current_date;
```

Then trigger an Edge Function to send SMS via Africa's Talking to all tenants
whose payment was just marked overdue.
# rentflow
