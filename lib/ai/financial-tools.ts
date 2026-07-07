import { categories, type CategoryId } from '@/lib/data'
import { formatINR } from '@/lib/format'
import { detectRecurringPatterns, getUpcomingPayments } from '@/lib/recurring-helper'

export interface ToolResult {
  toolName: string
  facts: Record<string, any>
  formattedFacts: string
}

// 1. Merchant Spending Tool
export function calculateMerchantSpend(
  transactions: any[],
  merchantName: string,
  currentMonth: string
): ToolResult {
  const normalizedMerchant = merchantName.toLowerCase().trim()
  const currentMonthTxs = transactions.filter(
    t => t.transaction_date.slice(0, 7) === currentMonth &&
         t.merchant.toLowerCase().trim().includes(normalizedMerchant)
  )

  const expenses = currentMonthTxs.filter(t => t.transaction_type === 'expense')
  const totalSpend = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const count = expenses.length

  const sorted = [...expenses].sort(
    (a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
  )
  const latest3 = sorted.slice(0, 3).map(t => `- Date: ${t.transaction_date}, Amount: ${formatINR(Math.abs(t.amount))}, Category: ${categories[t.category as CategoryId]?.label || t.category}`)

  const formattedFacts = `Merchant Spend Analysis for "${merchantName}" (Month: ${currentMonth}):
- Total Amount Spent: ${formatINR(totalSpend)}
- Number of Transactions: ${count}
- Latest transactions:
${latest3.join('\n') || '  No transactions found.'}`

  return {
    toolName: 'Merchant Spending Tool',
    facts: { merchantName, totalSpend, count, latestTransactions: latest3 },
    formattedFacts
  }
}

// 2. Category Spending Tool
export function calculateCategorySpend(
  transactions: any[],
  categoryKey: string,
  currentMonth: string
): ToolResult {
  const currentMonthTxs = transactions.filter(
    t => t.transaction_date.slice(0, 7) === currentMonth &&
         t.transaction_type === 'expense'
  )

  const totalMonthlyExpenses = currentMonthTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0)
  
  const categoryTxs = currentMonthTxs.filter(
    t => t.category === categoryKey
  )
  const categorySpend = categoryTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const count = categoryTxs.length
  const ratio = totalMonthlyExpenses > 0 ? (categorySpend / totalMonthlyExpenses) * 100 : 0
  const catLabel = categories[categoryKey as CategoryId]?.label || categoryKey

  const formattedFacts = `Category Spend Analysis for "${catLabel}":
- Total Amount Spent: ${formatINR(categorySpend)}
- Number of Transactions: ${count}
- Percentage of Total Monthly Outflows: ${Math.round(ratio)}%`

  return {
    toolName: 'Category Spending Tool',
    facts: { categoryKey, catLabel, categorySpend, count, ratio },
    formattedFacts
  }
}

// 3. Month Summary Tool
export function calculateMonthSummary(
  transactions: any[],
  currentMonth: string
): ToolResult {
  const currentMonthTxs = transactions.filter(t => t.transaction_date.slice(0, 7) === currentMonth)
  const incomeTxs = currentMonthTxs.filter(t => t.transaction_type === 'income')
  const expenseTxs = currentMonthTxs.filter(t => t.transaction_type === 'expense')

  const totalIncome = incomeTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const totalExpenses = expenseTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const netCashflow = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? Math.round((netCashflow / totalIncome) * 100) : 0

  const categoryTotals: Record<string, number> = {}
  expenseTxs.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount)
  })
  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat, amt]) => `- ${categories[cat as CategoryId]?.label || cat}: ${formatINR(amt)}`)

  const formattedFacts = `Cashflow Snapshot for ${currentMonth}:
- Total Inflow (Income): ${formatINR(totalIncome)}
- Total Outflow (Expenses): ${formatINR(totalExpenses)}
- Net Cashflow: ${formatINR(netCashflow)}
- Savings Rate: ${savingsRate}%
- Top Expenses by Category:
${topCategories.join('\n') || '  No expenses recorded.'}`

  return {
    toolName: 'Month Summary Tool',
    facts: { totalIncome, totalExpenses, netCashflow, savingsRate, topCategories },
    formattedFacts
  }
}

// 4. Budget Tool
export function calculateBudgetStatus(
  transactions: any[],
  budgets: any[],
  currentMonth: string
): ToolResult {
  const activeBudgets = budgets.filter(b => b.month.slice(0, 7) === currentMonth)
  
  const budgetsAnalysis = activeBudgets.map(b => {
    const spent = transactions
      .filter(t => t.category === b.category && t.transaction_type === 'expense' && t.transaction_date.slice(0, 7) === currentMonth)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    return {
      category: b.category,
      label: categories[b.category as CategoryId]?.label || b.category,
      limit: b.budget_amount,
      spent,
      ratio: b.budget_amount > 0 ? spent / b.budget_amount : 0
    }
  })

  const overBudgets = budgetsAnalysis.filter(b => b.ratio >= 1.0)
  const nearBudgets = budgetsAnalysis.filter(b => b.ratio >= 0.8 && b.ratio < 1.0)
  const remainingSafeToSpend = Math.max(
    0,
    activeBudgets.reduce((sum, b) => sum + b.budget_amount, 0) -
      budgetsAnalysis.reduce((sum, b) => sum + b.spent, 0)
  )

  const overStr = overBudgets.map(b => `- ${b.label}: Exceeded by ${formatINR(b.spent - b.limit)}`).join('\n')
  const nearStr = nearBudgets.map(b => `- ${b.label}: Utilized ${Math.round(b.ratio * 100)}% (${formatINR(b.spent)} / ${formatINR(b.limit)})`).join('\n')

  const formattedFacts = `Budget Performance Analysis:
- Active Budgets: ${activeBudgets.length}
- Categories Over Limit: ${overBudgets.length}
${overStr ? `${overStr}\n` : ''}- Categories Near Limit (>=80%): ${nearBudgets.length}
${nearStr ? `${nearStr}\n` : ''}- Remaining Safe-to-Spend Budget: ${formatINR(remainingSafeToSpend)}`

  return {
    toolName: 'Budget Tool',
    facts: { activeCount: activeBudgets.length, overLimit: overBudgets, nearLimit: nearBudgets, remainingSafeToSpend },
    formattedFacts
  }
}

// 5. Goal Tool
export function calculateGoalStatus(goals: any[]): ToolResult {
  const activeGoals = goals.filter(g => g.current_amount < g.target_amount)
  
  const goalsAnalysis = activeGoals.map(g => {
    const pct = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0
    return `- ${g.title}: ${Math.round(pct)}% saved (${formatINR(g.current_amount)} / ${formatINR(g.target_amount)}), Monthly Target: ${formatINR(g.monthly_contribution)}`
  })

  const formattedFacts = `Savings Goals Tracker Status:
- Active Goals: ${activeGoals.length}
- Targets progress:
${goalsAnalysis.join('\n') || '  No active savings goals found.'}`

  return {
    toolName: 'Goal Tool',
    facts: { activeCount: activeGoals.length, goalsProgress: goalsAnalysis },
    formattedFacts
  }
}

// 6. Affordability Check Tool
export function calculateAffordability(
  transactions: any[],
  goals: any[],
  recurringPrefs: any,
  targetAmount: number,
  itemName: string,
  currentMonth: string
): ToolResult {
  // Average monthly savings over last 3 months
  const months = Array.from(new Set(transactions.map(t => t.transaction_date.slice(0, 7)))).sort()
  const recentMonths = months.slice(-3)
  
  let totalSavings = 0
  recentMonths.forEach(m => {
    const mTxs = transactions.filter(t => t.transaction_date.slice(0, 7) === m)
    const inc = mTxs.filter(t => t.transaction_type === 'income').reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const exp = mTxs.filter(t => t.transaction_type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0)
    totalSavings += (inc - exp)
  })

  const avgMonthlySavings = recentMonths.length > 0 ? Math.max(0, totalSavings / recentMonths.length) : 0

  // Goals monthly target commitments
  const goalObligations = goals
    .filter(g => g.current_amount < g.target_amount)
    .reduce((sum, g) => sum + g.monthly_contribution, 0)

  // Recurring payments
  const detected = detectRecurringPatterns(transactions, recurringPrefs)
  const recurringExpense = detected
    .filter(item => item.transaction_type === 'expense' && item.status === 'active')
    .reduce((sum, item) => sum + item.amount, 0)

  // Remaining disposable surplus
  const netDisposableSurplus = Math.max(0, avgMonthlySavings - goalObligations)
  const monthsToAfford = netDisposableSurplus > 0 ? Math.ceil(targetAmount / netDisposableSurplus) : 999

  const canAffordImmediately = netDisposableSurplus >= targetAmount

  const formattedFacts = `Affordability Evaluation for "${itemName}" (Cost: ${formatINR(targetAmount)}):
- Average Monthly Net Savings: ${formatINR(avgMonthlySavings)}
- Monthly Goals Commitments: ${formatINR(goalObligations)}
- Committed Recurring Bills: ${formatINR(recurringExpense)}
- Monthly Disposable Surplus: ${formatINR(netDisposableSurplus)}
- Can afford immediately: ${canAffordImmediately ? 'Yes' : 'No'}
- Projected time to save (excluding reserves): ${monthsToAfford === 999 ? 'Indefinite (negative savings)' : `${monthsToAfford} month(s)`}`

  return {
    toolName: 'Affordability Tool',
    facts: { targetAmount, itemName, avgMonthlySavings, goalObligations, netDisposableSurplus, canAffordImmediately, monthsToAfford },
    formattedFacts
  }
}

// 7. Trend Analysis Tool
export function calculateTrends(
  transactions: any[],
  currentMonth: string
): ToolResult {
  const today = new Date()
  const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const prevMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`

  const currentTxs = transactions.filter(t => t.transaction_date.slice(0, 7) === currentMonth && t.transaction_type === 'expense')
  const prevTxs = transactions.filter(t => t.transaction_date.slice(0, 7) === prevMonth && t.transaction_type === 'expense')

  const currentTotal = currentTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const prevTotal = prevTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const totalChange = currentTotal - prevTotal

  // Category breakdown differences
  const currentCategoryTotals: Record<string, number> = {}
  currentTxs.forEach(t => {
    currentCategoryTotals[t.category] = (currentCategoryTotals[t.category] || 0) + Math.abs(t.amount)
  })

  const prevCategoryTotals: Record<string, number> = {}
  prevTxs.forEach(t => {
    prevCategoryTotals[t.category] = (prevCategoryTotals[t.category] || 0) + Math.abs(t.amount)
  })

  const categoryIncreases: string[] = []
  Object.keys(currentCategoryTotals).forEach(cat => {
    const currVal = currentCategoryTotals[cat]
    const prevVal = prevCategoryTotals[cat] || 0
    if (currVal > prevVal) {
      categoryIncreases.push(`- ${categories[cat as CategoryId]?.label || cat}: Increased spending by ${formatINR(currVal - prevVal)} (${formatINR(prevVal)} -> ${formatINR(currVal)})`)
    }
  })

  const formattedFacts = `Monthly Expenditure Trends (Comparing ${prevMonth} -> ${currentMonth}):
- Previous Month Spend: ${formatINR(prevTotal)}
- Current Month Spend: ${formatINR(currentTotal)}
- Net Change: ${totalChange >= 0 ? '+' : ''}${formatINR(totalChange)}
- Significant Category Spend Increases:
${categoryIncreases.join('\n') || '  No significant category spend increases.'}`

  return {
    toolName: 'Trend Tool',
    facts: { prevTotal, currentTotal, totalChange, categoryIncreases },
    formattedFacts
  }
}

// 8. Recurring Payments Tool
export function calculateRecurringCommitments(
  transactions: any[],
  recurringPrefs: any
): ToolResult {
  const detected = detectRecurringPatterns(transactions, recurringPrefs)
  const upcoming = getUpcomingPayments(detected, 30)

  const recurringIncome = detected
    .filter(item => item.transaction_type === 'income' && item.status === 'active')
    .reduce((sum, item) => sum + item.amount, 0)

  const recurringExpense = detected
    .filter(item => item.transaction_type === 'expense' && item.status === 'active')
    .reduce((sum, item) => sum + item.amount, 0)

  const upcomingList = upcoming.slice(0, 5).map(u => `- ${u.merchant}: ${formatINR(u.amount)} due on ${u.dueDate}`)

  const formattedFacts = `Recurring Schedule Commitments Summary:
- Expected Monthly Income Credits: +${formatINR(recurringIncome)}
- Expected Monthly Outflow Commitments: -${formatINR(recurringExpense)}
- Upcoming Expected Items in 30 Days:
${upcomingList.join('\n') || '  No upcoming scheduled items found.'}`

  return {
    toolName: 'Recurring Tool',
    facts: { recurringIncome, recurringExpense, upcoming },
    formattedFacts
  }
}
