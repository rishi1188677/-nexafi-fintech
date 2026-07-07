import { categories, type CategoryId } from '@/lib/data'
import {
  calculateMerchantSpend,
  calculateCategorySpend,
  calculateMonthSummary,
  calculateBudgetStatus,
  calculateGoalStatus,
  calculateAffordability,
  calculateTrends,
  calculateRecurringCommitments,
  type ToolResult
} from './financial-tools'

export interface IntentRouterResult {
  intent: string
  toolResult: ToolResult
}

export function routeIntent(
  question: string,
  transactions: any[],
  budgets: any[],
  goals: any[],
  recurringPrefs: any,
  currentMonth: string
): IntentRouterResult {
  const lower = question.toLowerCase().trim()

  // 1. Detect Affordability Check
  const isAffordability = lower.includes('can i buy') || lower.includes('can i afford') || lower.includes('buy a') || lower.includes('afford a') || lower.includes('afford to')
  if (isAffordability) {
    // Parse amount using regex
    const amountRegex = /(?:₹|rs\.?|inr)?\s*(\d[\d,]*)/gi
    let match
    let targetAmount = 0
    let lastNumberStr = ''

    while ((match = amountRegex.exec(lower)) !== null) {
      const cleanNum = match[1].replace(/,/g, '')
      if (Number(cleanNum) > 100) { // filter out small numbers/years
        targetAmount = Number(cleanNum)
        lastNumberStr = match[0]
      }
    }

    if (targetAmount > 0) {
      // Extract item name (remove target amount and trigger keywords)
      let itemName = question
        .replace(new RegExp(lastNumberStr, 'i'), '')
        .replace(/can i buy/i, '')
        .replace(/can i afford/i, '')
        .replace(/buy a/i, '')
        .replace(/afford a/i, '')
        .replace(/afford to/i, '')
        .replace(/\?/g, '')
        .trim()

      if (!itemName) itemName = 'Requested Item'

      const toolResult = calculateAffordability(transactions, goals, recurringPrefs, targetAmount, itemName, currentMonth)
      return { intent: 'affordability_check', toolResult }
    }
  }

  // 2. Detect Merchant Spend (Match unique merchants from transaction history)
  const uniqueMerchants = Array.from(new Set(transactions.map(t => t.merchant.trim())))
  let matchedMerchant = ''
  for (const merchant of uniqueMerchants) {
    if (merchant.length >= 3 && lower.includes(merchant.toLowerCase())) {
      matchedMerchant = merchant
      break
    }
  }

  if (matchedMerchant) {
    const toolResult = calculateMerchantSpend(transactions, matchedMerchant, currentMonth)
    return { intent: 'spending_by_merchant', toolResult }
  }

  // 3. Detect Category Spend
  let matchedCategoryKey = ''
  Object.entries(categories).forEach(([key, val]) => {
    if (lower.includes(val.label.toLowerCase()) || lower.includes(key)) {
      matchedCategoryKey = key
    }
  })

  if (matchedCategoryKey) {
    const toolResult = calculateCategorySpend(transactions, matchedCategoryKey, currentMonth)
    return { intent: 'spending_by_category', toolResult }
  }

  // 4. Detect Budget Status
  if (lower.includes('budget') || lower.includes('budgets') || lower.includes('staying within limit') || lower.includes('spending limit')) {
    const toolResult = calculateBudgetStatus(transactions, budgets, currentMonth)
    return { intent: 'budget_status', toolResult }
  }

  // 5. Detect Goal Status
  if (lower.includes('goal') || lower.includes('goals') || lower.includes('savings target') || lower.includes('on track')) {
    const toolResult = calculateGoalStatus(goals)
    return { intent: 'goal_status', toolResult }
  }

  // 6. Detect Trend Analysis
  if (lower.includes('increase') || lower.includes('decrease') || lower.includes('compare') || lower.includes('month over month') || lower.includes('why did my expenses') || lower.includes('trend') || lower.includes('trends')) {
    const toolResult = calculateTrends(transactions, currentMonth)
    return { intent: 'trend_analysis', toolResult }
  }

  // 7. Detect Recurring Payments
  if (lower.includes('recurring') || lower.includes('subscription') || lower.includes('subscriptions') || lower.includes('bills due') || lower.includes('bills expected')) {
    const toolResult = calculateRecurringCommitments(transactions, recurringPrefs)
    return { intent: 'recurring_payments', toolResult }
  }

  // 8. Detect Month Summary
  if (lower.includes('summarize my month') || lower.includes('summary') || lower.includes('month summary') || lower.includes('how did i do') || lower.includes('overview')) {
    const toolResult = calculateMonthSummary(transactions, currentMonth)
    return { intent: 'month_summary', toolResult }
  }

  // 9. Fallback to general summary facts to feed Gemini
  const toolResult = calculateMonthSummary(transactions, currentMonth)
  return { intent: 'general_finance_question', toolResult }
}
