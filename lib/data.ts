import type { LucideIcon } from 'lucide-react'
import {
  Utensils,
  ShoppingBag,
  Plane,
  ReceiptText,
  HeartPulse,
  Clapperboard,
  Repeat,
  ArrowLeftRight,
  Wallet,
} from 'lucide-react'

export type CategoryId =
  | 'food'
  | 'shopping'
  | 'travel'
  | 'bills'
  | 'health'
  | 'entertainment'
  | 'subscriptions'
  | 'transfers'
  | 'income'

export type Category = {
  id: CategoryId
  label: string
  icon: LucideIcon
  /** chart token color */
  color: string
}

export const categories: Record<CategoryId, Category> = {
  food: { id: 'food', label: 'Food & Dining', icon: Utensils, color: 'var(--chart-1)' },
  shopping: { id: 'shopping', label: 'Shopping', icon: ShoppingBag, color: 'var(--chart-2)' },
  travel: { id: 'travel', label: 'Travel', icon: Plane, color: 'var(--chart-5)' },
  bills: { id: 'bills', label: 'Bills & Utilities', icon: ReceiptText, color: 'var(--chart-3)' },
  health: { id: 'health', label: 'Health', icon: HeartPulse, color: 'var(--chart-4)' },
  entertainment: {
    id: 'entertainment',
    label: 'Entertainment',
    icon: Clapperboard,
    color: 'oklch(0.7 0.12 300)',
  },
  subscriptions: {
    id: 'subscriptions',
    label: 'Subscriptions',
    icon: Repeat,
    color: 'oklch(0.68 0.13 200)',
  },
  transfers: { id: 'transfers', label: 'Transfers', icon: ArrowLeftRight, color: 'var(--chart-3)' },
  income: { id: 'income', label: 'Income', icon: Wallet, color: 'var(--chart-1)' },
}

export const categoryList = Object.values(categories)

export type Transaction = {
  id: string
  date: string // ISO
  merchant: string
  description: string
  category: CategoryId
  amount: number // negative = expense, positive = income
  account: string
  method: string
  recurring?: boolean
  status?: 'completed' | 'pending'
}

// Seeded, deterministic transaction history (Indian merchants, INR).
export const transactions: Transaction[] = [
  { id: 't1', date: '2026-03-05', merchant: 'Zomato', description: 'Dinner order', category: 'food', amount: -742, account: 'HDFC •• 4821', method: 'UPI', status: 'completed' },
  { id: 't2', date: '2026-03-05', merchant: 'Uber', description: 'Ride to office', category: 'travel', amount: -284, account: 'HDFC •• 4821', method: 'UPI', status: 'completed' },
  { id: 't3', date: '2026-03-04', merchant: 'Amazon', description: 'Wireless mouse', category: 'shopping', amount: -1899, account: 'ICICI •• 9032', method: 'Card', status: 'completed' },
  { id: 't4', date: '2026-03-04', merchant: 'Netflix', description: 'Premium plan', category: 'subscriptions', amount: -649, account: 'ICICI •• 9032', method: 'Card', recurring: true, status: 'completed' },
  { id: 't5', date: '2026-03-03', merchant: 'Swiggy', description: 'Lunch', category: 'food', amount: -389, account: 'HDFC •• 4821', method: 'UPI', status: 'completed' },
  { id: 't6', date: '2026-03-03', merchant: 'Reliance Fresh', description: 'Groceries', category: 'shopping', amount: -2340, account: 'HDFC •• 4821', method: 'Card', status: 'completed' },
  { id: 't7', date: '2026-03-02', merchant: 'UPI Transfer', description: 'To Aarav Sharma', category: 'transfers', amount: -3000, account: 'HDFC •• 4821', method: 'UPI', status: 'completed' },
  { id: 't8', date: '2026-03-01', merchant: 'Salary Credit', description: 'Monthly salary — Nexworks Pvt Ltd', category: 'income', amount: 48000, account: 'HDFC •• 4821', method: 'NEFT', recurring: true, status: 'completed' },
  { id: 't9', date: '2026-03-01', merchant: 'Airtel', description: 'Broadband bill', category: 'bills', amount: -1199, account: 'HDFC •• 4821', method: 'Auto-debit', recurring: true, status: 'completed' },
  { id: 't10', date: '2026-02-28', merchant: 'Spotify', description: 'Individual plan', category: 'subscriptions', amount: -119, account: 'ICICI •• 9032', method: 'Card', recurring: true, status: 'completed' },
  { id: 't11', date: '2026-02-27', merchant: 'Apollo Pharmacy', description: 'Medicines', category: 'health', amount: -860, account: 'HDFC •• 4821', method: 'UPI', status: 'completed' },
  { id: 't12', date: '2026-02-26', merchant: 'Zomato', description: 'Weekend order', category: 'food', amount: -1120, account: 'HDFC •• 4821', method: 'UPI', status: 'completed' },
  { id: 't13', date: '2026-02-25', merchant: 'BookMyShow', description: 'Movie tickets', category: 'entertainment', amount: -560, account: 'ICICI •• 9032', method: 'Card', status: 'completed' },
  { id: 't14', date: '2026-02-24', merchant: 'Amazon', description: 'Phone case & charger', category: 'shopping', amount: -1499, account: 'ICICI •• 9032', method: 'Card', status: 'completed' },
  { id: 't15', date: '2026-02-22', merchant: 'IndiGo', description: 'Flight — DEL to BLR', category: 'travel', amount: -4890, account: 'ICICI •• 9032', method: 'Card', status: 'completed' },
  { id: 't16', date: '2026-02-21', merchant: 'Swiggy', description: 'Groceries — Instamart', category: 'food', amount: -678, account: 'HDFC •• 4821', method: 'UPI', status: 'completed' },
  { id: 't17', date: '2026-02-20', merchant: 'Tata Power', description: 'Electricity bill', category: 'bills', amount: -1640, account: 'HDFC •• 4821', method: 'Auto-debit', recurring: true, status: 'completed' },
  { id: 't18', date: '2026-02-18', merchant: 'Freelance Payout', description: 'Design gig — Studio Ninefold', category: 'income', amount: 12000, account: 'HDFC •• 4821', method: 'IMPS', status: 'completed' },
  { id: 't19', date: '2026-02-17', merchant: 'Uber', description: 'Airport ride', category: 'travel', amount: -620, account: 'HDFC •• 4821', method: 'UPI', status: 'completed' },
  { id: 't20', date: '2026-02-16', merchant: 'Cult.fit', description: 'Gym membership', category: 'health', amount: -1499, account: 'ICICI •• 9032', method: 'Card', recurring: true, status: 'completed' },
  { id: 't21', date: '2026-02-14', merchant: 'Zomato', description: 'Dinner date', category: 'food', amount: -1340, account: 'ICICI •• 9032', method: 'Card', status: 'completed' },
  { id: 't22', date: '2026-02-12', merchant: 'Reliance Fresh', description: 'Monthly groceries', category: 'shopping', amount: -3120, account: 'HDFC •• 4821', method: 'Card', status: 'completed' },
  { id: 't23', date: '2026-02-10', merchant: 'Netflix', description: 'Premium plan', category: 'subscriptions', amount: -649, account: 'ICICI •• 9032', method: 'Card', recurring: true, status: 'completed' },
  { id: 't24', date: '2026-02-08', merchant: 'Amazon', description: 'Books', category: 'shopping', amount: -940, account: 'ICICI •• 9032', method: 'Card', status: 'completed' },
  { id: 't25', date: '2026-02-05', merchant: 'Swiggy', description: 'Team lunch', category: 'food', amount: -890, account: 'HDFC •• 4821', method: 'UPI', status: 'completed' },
  { id: 't26', date: '2026-02-03', merchant: 'UPI Transfer', description: 'Savings sweep', category: 'transfers', amount: -5000, account: 'HDFC •• 4821', method: 'UPI', status: 'completed' },
  { id: 't27', date: '2026-02-01', merchant: 'Salary Credit', description: 'Monthly salary — Nexworks Pvt Ltd', category: 'income', amount: 48000, account: 'HDFC •• 4821', method: 'NEFT', recurring: true, status: 'completed' },
  { id: 't28', date: '2026-02-01', merchant: 'Airtel', description: 'Broadband bill', category: 'bills', amount: -1199, account: 'HDFC •• 4821', method: 'Auto-debit', recurring: true, status: 'completed' },
  { id: 't29', date: '2026-01-30', merchant: 'BookMyShow', description: 'Concert tickets', category: 'entertainment', amount: -2400, account: 'ICICI •• 9032', method: 'Card', status: 'completed' },
  { id: 't30', date: '2026-01-28', merchant: 'Uber', description: 'Weekend rides', category: 'travel', amount: -510, account: 'HDFC •• 4821', method: 'UPI', status: 'completed' },
  { id: 't31', date: '2026-01-26', merchant: 'Amazon', description: 'Home essentials', category: 'shopping', amount: -1780, account: 'ICICI •• 9032', method: 'Card', status: 'completed' },
  { id: 't32', date: '2026-01-24', merchant: 'Apollo Pharmacy', description: 'Health checkup', category: 'health', amount: -1200, account: 'HDFC •• 4821', method: 'UPI', status: 'completed' },
]

export type Budget = {
  category: CategoryId
  limit: number
  spent: number
}

export const budgets: Budget[] = [
  { category: 'food', limit: 8000, spent: 6489 },
  { category: 'shopping', limit: 7000, spent: 7538 },
  { category: 'travel', limit: 6000, spent: 3520 },
  { category: 'bills', limit: 5000, spent: 4038 },
  { category: 'health', limit: 4000, spent: 2359 },
  { category: 'entertainment', limit: 3000, spent: 2960 },
]

export type Goal = {
  id: string
  name: string
  target: number
  saved: number
  monthly: number
  eta: string
  accent: string
}

export const goals: Goal[] = [
  { id: 'g1', name: 'Emergency Fund', target: 300000, saved: 186000, monthly: 15000, eta: 'Nov 2026', accent: 'var(--chart-1)' },
  { id: 'g2', name: 'MacBook Fund', target: 165000, saved: 92000, monthly: 12000, eta: 'Sep 2026', accent: 'var(--chart-2)' },
  { id: 'g3', name: 'Europe Trip', target: 250000, saved: 68000, monthly: 10000, eta: 'Apr 2027', accent: 'var(--chart-5)' },
]

export type CashFlowPoint = {
  month: string
  income: number
  expenses: number
}

export const cashFlow: CashFlowPoint[] = [
  { month: 'Oct', income: 48000, expenses: 31200 },
  { month: 'Nov', income: 52000, expenses: 33800 },
  { month: 'Dec', income: 60000, expenses: 41500 },
  { month: 'Jan', income: 48000, expenses: 28900 },
  { month: 'Feb', income: 60000, expenses: 30600 },
  { month: 'Mar', income: 48000, expenses: 29480 },
]

export type Insight = {
  id: string
  tone: 'positive' | 'warning' | 'neutral'
  title: string
  body: string
}

export const aiInsights: Insight[] = [
  {
    id: 'i1',
    tone: 'warning',
    title: 'Dining is trending up',
    body: 'Your dining expenses are 18% above your usual monthly average.',
  },
  {
    id: 'i2',
    tone: 'positive',
    title: 'On track to save',
    body: 'You are currently on track to save ₹15,200 this month.',
  },
  {
    id: 'i3',
    tone: 'neutral',
    title: 'Recurring subscriptions',
    body: 'Three recurring subscriptions are costing ₹1,247 each month.',
  },
  {
    id: 'i4',
    tone: 'positive',
    title: 'Projected balance',
    body: 'Your projected month-end balance is ₹18,600.',
  },
]

export type MerchantSpend = {
  merchant: string
  category: CategoryId
  amount: number
  count: number
}

export const topMerchants: MerchantSpend[] = [
  { merchant: 'Zomato', category: 'food', amount: 3202, count: 4 },
  { merchant: 'Amazon', category: 'shopping', amount: 8018, count: 5 },
  { merchant: 'Reliance Fresh', category: 'shopping', amount: 5460, count: 2 },
  { merchant: 'IndiGo', category: 'travel', amount: 4890, count: 1 },
  { merchant: 'Swiggy', category: 'food', amount: 2625, count: 4 },
  { merchant: 'BookMyShow', category: 'entertainment', amount: 2960, count: 2 },
]

export type SpendTrendPoint = {
  month: string
  amount: number
}

export const spendTrend: SpendTrendPoint[] = [
  { month: 'Oct', amount: 31200 },
  { month: 'Nov', amount: 33800 },
  { month: 'Dec', amount: 41500 },
  { month: 'Jan', amount: 28900 },
  { month: 'Feb', amount: 30600 },
  { month: 'Mar', amount: 29480 },
]

export type CategoryChange = {
  category: CategoryId
  current: number
  previous: number
}

export const categoryChanges: CategoryChange[] = [
  { category: 'food', current: 6489, previous: 5510 },
  { category: 'shopping', current: 7538, previous: 6620 },
  { category: 'travel', current: 3520, previous: 5410 },
  { category: 'bills', current: 4038, previous: 4038 },
  { category: 'health', current: 2359, previous: 1200 },
  { category: 'entertainment', current: 2960, previous: 2400 },
]

export type RecurringPayment = {
  merchant: string
  category: CategoryId
  amount: number
  cadence: string
  next: string
}

export const recurringPayments: RecurringPayment[] = [
  { merchant: 'Netflix', category: 'subscriptions', amount: 649, cadence: 'Monthly', next: '2026-04-04' },
  { merchant: 'Spotify', category: 'subscriptions', amount: 119, cadence: 'Monthly', next: '2026-03-28' },
  { merchant: 'Cult.fit', category: 'health', amount: 1499, cadence: 'Monthly', next: '2026-03-16' },
  { merchant: 'Airtel Broadband', category: 'bills', amount: 1199, cadence: 'Monthly', next: '2026-04-01' },
  { merchant: 'Tata Power', category: 'bills', amount: 1640, cadence: 'Monthly', next: '2026-03-20' },
]

// Headline metrics for the overview dashboard.
export const overviewStats = {
  totalBalance: 124850,
  monthlyIncome: 48000,
  monthlyExpenses: 29480,
  savingsRate: 38,
  healthScore: 82,
}
