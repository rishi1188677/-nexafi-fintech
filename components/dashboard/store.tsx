'use client'

import * as React from 'react'
import {
  type Budget,
  type CategoryId,
  type Goal,
  type Transaction,
  budgets as seedBudgets,
  goals as seedGoals,
  overviewStats,
  transactions as seedTransactions,
} from '@/lib/data'

type NewTransaction = {
  merchant: string
  description: string
  category: CategoryId
  amount: number // signed: negative expense, positive income
  date: string
  account: string
  method: string
}

type Stats = {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  savingsRate: number
  healthScore: number
}

type StoreValue = {
  transactions: Transaction[]
  budgets: Budget[]
  goals: Goal[]
  stats: Stats
  addTransaction: (t: NewTransaction) => void
  createBudget: (category: CategoryId, limit: number) => void
  contribute: (goalId: string, amount: number) => void
}

const StoreContext = React.createContext<StoreValue | null>(null)

function computeHealthScore(savingsRate: number) {
  return Math.max(0, Math.min(100, Math.round(savingsRate * 1.4 + 28)))
}

export function DashboardStoreProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = React.useState<Transaction[]>(seedTransactions)
  const [budgets, setBudgets] = React.useState<Budget[]>(seedBudgets)
  const [goals, setGoals] = React.useState<Goal[]>(seedGoals)
  const [delta, setDelta] = React.useState({ income: 0, expenses: 0, balance: 0 })

  const addTransaction = React.useCallback((t: NewTransaction) => {
    const tx: Transaction = {
      id: `user-${Date.now()}`,
      date: t.date,
      merchant: t.merchant,
      description: t.description,
      category: t.category,
      amount: t.amount,
      account: t.account,
      method: t.method,
      status: 'completed',
    }
    setTransactions((prev) => [tx, ...prev])

    const isIncome = t.amount > 0
    const abs = Math.abs(t.amount)
    setDelta((prev) => ({
      income: prev.income + (isIncome ? abs : 0),
      expenses: prev.expenses + (isIncome ? 0 : abs),
      balance: prev.balance + t.amount,
    }))

    if (!isIncome) {
      setBudgets((prev) =>
        prev.map((b) => (b.category === t.category ? { ...b, spent: b.spent + abs } : b)),
      )
    }
  }, [])

  const createBudget = React.useCallback((category: CategoryId, limit: number) => {
    setBudgets((prev) => {
      if (prev.some((b) => b.category === category)) {
        return prev.map((b) => (b.category === category ? { ...b, limit } : b))
      }
      return [...prev, { category, limit, spent: 0 }]
    })
  }, [])

  const contribute = React.useCallback((goalId: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, saved: Math.min(g.target, g.saved + amount) } : g,
      ),
    )
    setDelta((prev) => ({ ...prev, balance: prev.balance - amount }))
  }, [])

  const stats = React.useMemo<Stats>(() => {
    const monthlyIncome = overviewStats.monthlyIncome + delta.income
    const monthlyExpenses = overviewStats.monthlyExpenses + delta.expenses
    const totalBalance = overviewStats.totalBalance + delta.balance
    const savingsRate =
      monthlyIncome > 0
        ? Math.max(0, Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100))
        : 0
    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      healthScore: computeHealthScore(savingsRate),
    }
  }, [delta])

  const value = React.useMemo<StoreValue>(
    () => ({ transactions, budgets, goals, stats, addTransaction, createBudget, contribute }),
    [transactions, budgets, goals, stats, addTransaction, createBudget, contribute],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useDashboardStore() {
  const ctx = React.useContext(StoreContext)
  if (!ctx) throw new Error('useDashboardStore must be used within DashboardStoreProvider')
  return ctx
}
