import {
  Brain,
  CalendarClock,
  Gauge,
  PiggyBank,
  Repeat,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

export type Feature = {
  icon: LucideIcon
  title: string
  description: string
}

export const features: Feature[] = [
  {
    icon: Brain,
    title: 'Smart spending insights',
    description:
      'NexaFi reads your everyday activity and surfaces clear, plain-language observations about where your money actually goes.',
  },
  {
    icon: Wallet,
    title: 'Budget planning',
    description:
      'Set flexible monthly budgets by category and watch your progress update in real time — no spreadsheets required.',
  },
  {
    icon: PiggyBank,
    title: 'Savings goals',
    description:
      'Create goals with target amounts and monthly contributions, and see a realistic completion date for each one.',
  },
  {
    icon: CalendarClock,
    title: 'Cash-flow forecasting',
    description:
      'Project your month-end balance from recurring income and spending patterns so there are no surprises.',
  },
  {
    icon: Repeat,
    title: 'Subscription tracking',
    description:
      'Automatically detect recurring payments and understand the true monthly cost of everything you subscribe to.',
  },
  {
    icon: Gauge,
    title: 'Financial health score',
    description:
      'A single, honest score that blends savings rate, spending stability and cash flow into one clear signal.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy-first data handling',
    description:
      'Your financial information is designed to remain private, secure, and under your control at every step.',
  },
]
