# NexaFi Architecture Documentation

This document describes the technical architecture, directory structure, data layers, and security mechanisms of NexaFi.

---

## 🏗 Directory Layout

NexaFi is built using the **Next.js App Router** structure, maintaining a clean separation between protected pages, reusable UI components, and client-side utilities.

```text
nexa-fi-fintech-saa-s/
├── app/                      # Page Routers (Protected Dashboard Shells)
│   ├── ai-assistant/         # AI Financial Coach Workspace
│   ├── budgets/              # Budget limits ledger
│   ├── dashboard/            # Core overview statistics
│   ├── goals/                # Savings targets tracking
│   ├── insights/             # Deterministic analysis cards
│   ├── recurring/            # Recurring payments & bills
│   ├── reports/              # Monthly Money Story booklet
│   ├── settings/             # User preferences & currencies
│   └── transactions/         # Transactions CRUD & statement import
├── components/               # View Layers (Shadcn + Radix primitives)
│   ├── ai-assistant/         # Split pane chat views
│   ├── dashboard/            # Sidebar menus and header topbars
│   ├── recurring/            # Tabs lists and modal dialogs
│   ├── reports/              # Monthly statistics and charts
│   ├── transactions/         # CSV dialog and filters
│   └── ui/                   # Reusable base styles (Buttons, Inputs, Selects)
├── lib/                      # Helper libraries & data models
│   ├── supabase/             # Client/Server database configs
│   ├── data.ts               # Local static presets
│   ├── format.ts             # INR and currency formatter tools
│   └── recurring-helper.ts   # Analysis engine for recurring bills
```

---

## 🔒 Security & Data Isolation (Supabase RLS)

Data privacy is enforced by default in NexaFi using PostgreSQL Row Level Security (RLS) on the Supabase platform. 

### User Authentication Flow
1. Users register or log in using email/password. Supabase returns a JWT token identifying the session.
2. In server-rendered pages under `/app`, Next.js checks for authentic JWT claims (`claims.sub`). Unauthenticated queries trigger a Server-Side redirect:
   ```typescript
   const supabase = await createClient()
   const { data } = await supabase.auth.getClaims()
   if (!data?.claims?.sub) {
     redirect('/sign-in')
   }
   ```
3. In client-side components, network requests include the bearer token, matching database RLS filter keys:
   `auth.uid() = user_id`

---

## ⚡ Key Analytics Engines

NexaFi features several local math/analytics engines that run on the user's computer to ensure maximum privacy.

### 1. CSV Importer Engine
- Located in `components/transactions/import-csv-dialog.tsx`.
- Matches statement columns dynamically against aliases.
- Auto-detects row signatures, normalizes date strings (`YYYY-MM-DD`, `DD/MM/YYYY`, `MM/DD/YYYY`), parses Indian Rupee characters (`₹`), and checks for duplicates client-side.

### 2. Recurring Transactions Detector
- Located in `lib/recurring-helper.ts`.
- Clusters transactions by merchant and type. If a group has `count >= 2`, calculates the average interval in days (weekly spacing vs monthly spacing).
- Computes confidence percentages and estimates the next expected due date in the future.
- Synchronizes with user-configured confirmations, ignores, and manual bills stored in `localStorage` keyed by user UUID.

### 3. AI Financial Coach
- Located in `components/ai-assistant/ai-assistant-client.tsx`.
- Runs a client-side rule-based parser that evaluates transaction amounts, budget ratios, and goal dates, converting these metrics into structured markdown reports.

### 4. Monthly Money Story Reports
- Located in `components/reports/reports-client.tsx`.
- Dynamically groups and aggregates metrics by calendar month.
- Evaluates a **Financial Health Index** (0-100) based on savings percentages, budget overruns, and goal contributions.
