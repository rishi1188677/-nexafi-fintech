# NexaFi — Premium Personal Finance Workspace & AI Financial Coach

[![Live Demo](https://img.shields.io/badge/Demo-Live_Deployment-emerald?style=for-the-badge&logo=vercel)](https://nexafi-fintech.vercel.app/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15_App_Router-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database_%26_Auth-blueviolet?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

NexaFi is a state-of-the-art personal finance platform designed to provide beautiful, actionable, and privacy-first money insights. From bank statement imports and granular budgets to savings goal visualizations, recurring schedule scanners, and a rule-based AI Financial Coach, NexaFi empowers you to take control of your financial narrative.

---

## 🚀 Key Features

*   **📊 Overview Dashboard**: Tracks real-time headlines: total net worth balance, monthly credit inflows, category outflows, savings ratios, and budget limits alerts.
*   **💳 Transactions Ledger**: Add, edit, remove, and sort income and expenses.
*   **🏦 Bank Statement Importer**: Drag-and-drop CSV importer with smart presets for major Indian banks (HDFC, ICICI, SBI, Axis, Kotak). Maps columns dynamically, detects payment methods, reviews ambiguous rows, and checks for duplicates.
*   **🎯 Goals Tracking**: Set targets for emergency reserves, trips, or purchases, calculating contributions progress bars.
*   **💸 Recurring Payments Detector**: Client-side scanning engine mapping repeated subscriptions (e.g. Netflix, Spotify) or utility bills, detailing next estimated payments dates and confidence ratios.
*   **💡 Financial Insights**: Analyzes savings rates and identifies budget limits warnings.
*   **🤖 AI Financial Coach Workspace**: Elite split-panel workspace presenting observations and action checklists based on real account balances.
*   **📖 Monthly Money Story Reports**: Beautiful booklet summaries aggregating cash flow snapshots, category distributions, budget performance, and safety bounds (Safe-to-Spend).
*   **🌓 Unified Theme Controls**: Full responsive support for light, dark, and system-level themes.

---

## 🛠 Tech Stack

*   **Framework**: Next.js (App Router, Server Actions, React Client/Server components)
*   **Database**: Supabase PostgreSQL
*   **Authentication**: Supabase Auth (User signup, signing, callback redirects)
*   **Styling**: Tailwind CSS & Tailwind-compatible UI Components (Shadcn UI, Radix primitives)
*   **Icons**: Lucide React
*   **Data Persistence**: Supabase RLS policies (cloud storage) + LocalStorage (privacy-focused recurring parameters)

---

## 🏗 System Architecture & Database Design

NexaFi divides security roles using Postgres Row Level Security (RLS) to ensure users can only query, modify, or insert their own records.

### Database Tables (Supabase Schema)

#### 1. `transactions`
Stores user transaction events.
```sql
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  merchant text not null,
  amount numeric not null,
  transaction_type text check (transaction_type in ('income', 'expense')) not null,
  category text not null,
  payment_method text not null,
  transaction_date date not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### 2. `budgets`
Tracks monthly spending limits.
```sql
create table budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null,
  budget_amount numeric not null,
  month date not null, -- formatted as YYYY-MM-01
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

#### 3. `goals`
Tracks target savings allocations.
```sql
create table goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  target_amount numeric not null,
  current_amount numeric default 0 not null,
  monthly_contribution numeric not null,
  target_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### RLS Policies Example
```sql
alter table transactions enable row level security;

create policy "Users can modify their own transactions"
  on transactions for all
  using (auth.uid() = user_id);
```

---

## 🛠 Local Setup Instructions

Follow these instructions to run NexaFi locally on your system.

### Prerequisites
*   Node.js (v18.x or above)
*   npm or yarn
*   A Supabase account/project

### 1. Clone the repository and install dependencies
```bash
git clone https://github.com/your-username/nexafi-fintech.git
cd nexafi-fintech
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file at the root of the project:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key
```

### 3. Setup Database Schema
Execute the schema definitions inside the **Supabase SQL Editor** in your dashboard to generate the `transactions`, `budgets`, and `goals` tables. Ensure Row Level Security (RLS) is enabled.

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your web browser.

---

## 🔮 Roadmap
For a detailed look at future enhancements, see [ROADMAP.md](docs/ROADMAP.md).
- [ ] Push notifications for upcoming billing events
- [ ] Direct automated bank syncs via open-banking APIs (Plaid / Yodlee)
- [ ] Multi-currency support and conversion charts
- [ ] LLM AI model integrations (OpenAI / Gemini)
- [ ] Shared family budgets and cooperative goal vaults

---

## ⚠️ Disclaimer

*NexaFi is a financial utility providing educational summaries and pattern alerts based on user inputs. It does not provide certified financial advice or investment recommendations. All financial evaluations are deterministic summaries of entered transactions and should not replace professional wealth management consultations.*
