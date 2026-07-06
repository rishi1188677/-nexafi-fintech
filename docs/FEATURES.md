# NexaFi Product Features & UI Guide

This guide details the features, interaction models, and configuration details for NexaFi.

---

## 📊 1. Overview Dashboard
The dashboard serves as the central cockpit for your personal finances.
- **KPI Metrics**: View total cash balance, monthly credits (Income), and monthly outflows (Expenses).
- **Savings Rate**: Tracks what percentage of your income you saved this month.
- **Category breakdown**: Visual donut and progress graphs displaying category ratios.
- **Budget warning banner**: Displays warning notifications if any category exceeds 80% of its budget limit.

---

## 💳 2. Transactions & Importer
NexaFi provides a ledger along with a bank statement import wizard.
- **Manual Transactions**: Quick entry inputs for amount, category, merchant, payment mode, date, and notes.
- **Smart Importer Preset Mappings**: Drag-and-drop statements. Pre-configured filters map:
  - HDFC Bank Statements
  - ICICI Bank Statements
  - SBI Bank Statements
  - Axis Bank Statements
  - Kotak Bank Statements
  - Generic CSV
- **Review and Fix Row Spikes**: Checks parsed CSV outputs. Users can fix unrecognized headers, change category defaults (which default to `Other`), and inspect debit/credit mappings before committing.
- **Skip duplicates**: Automatically skips duplicates to prevent double counting.

---

## 📅 3. Recurring Payments & Scheduled Bills
Tracks committed expenses and expected regular credits.
- **Auto-Detection**: Scans transaction intervals to detect repeated transactions.
- **Explainable Cards**: Displays details explaining why a recurring pattern was identified (e.g. *“3 similar Zomato payments about 7 days apart.”*).
- **Manual Bills**: Lets you log rent, utility bills, or subscriptions with custom notes.
- **Pill Indicators**: Cards are labeled **"Detected"** (for auto-detected patterns) or **"Manual"** (for user-created items).
- **Upcoming Payments**: Chronologically lists all bills or income expected in the next 30 days.

---

## 🤖 4. AI Coach Workspace
An interactive, full-screen AI finance assistant page.
- **Left prompt controller panel**: Vertically stacked cards for suggested prompts (e.g. "Where did my money go?", "What should I watch next?").
- **Right report canvas workspace**: User queries appear as top capsules, and the coach's replies are formatted as observations and action checklists.
- **Risk Check ("What should I watch next?")**: Scans budgets near limit, low savings rates, goal deadlines, and upcoming bills.

---

## 📖 5. Monthly Reports & Money Story
Aggregates your financial data into a monthly summary page.
- **Money Story Narrative**: Displays a paragraph summary of your month.
- **Circular Health Score**: Computes a Financial Health Index score.
- **Safe-to-Spend**: Calculates how much budget room you have left.
- **Exporting**: Layout is optimized for clean printing and exporting to PDF.
