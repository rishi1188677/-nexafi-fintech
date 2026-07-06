export interface RecurringItem {
  id: string
  merchant: string
  amount: number
  transaction_type: 'income' | 'expense'
  category: string
  frequency: 'weekly' | 'monthly' | 'uncertain'
  last_occurrence: string
  estimated_next: string
  confidence: number
  source: 'auto-detected' | 'manual'
  status: 'active' | 'ignored' | 'not-recurring'
  payment_method?: string
  notes?: string
  explanation?: string
}

export interface UpcomingPayment {
  id: string
  merchant: string
  amount: number
  transaction_type: 'income' | 'expense'
  category: string
  dueDate: string
  frequency: 'weekly' | 'monthly' | 'uncertain'
  source: 'auto-detected' | 'manual'
}

interface DBTransaction {
  id: string
  user_id: string
  merchant: string
  amount: number
  transaction_type: 'income' | 'expense'
  category: string
  payment_method: string
  transaction_date: string
  notes: string | null
  created_at: string
}

// Helper to parse date string
const parseDate = (dStr: string) => new Date(dStr).getTime()

// Helper to count days between two timestamps
const daysBetween = (t1: number, t2: number) => {
  const diffMs = Math.abs(t2 - t1)
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

// Detect recurring payments from a user's transactions list
export function detectRecurringPatterns(
  transactions: DBTransaction[],
  userPrefs: {
    confirmedIds?: string[]
    ignoredIds?: string[]
    notRecurringIds?: string[]
    manualItems?: RecurringItem[]
  } = {}
): RecurringItem[] {
  const { confirmedIds = [], ignoredIds = [], notRecurringIds = [], manualItems = [] } = userPrefs

  // Group by merchant and transaction type
  const groups: Record<string, DBTransaction[]> = {}
  transactions.forEach(t => {
    const key = `${t.merchant.toLowerCase().trim()}::${t.transaction_type}`
    if (!groups[key]) groups[key] = []
    groups[key].push(t)
  })

  const autoDetected: RecurringItem[] = []

  Object.entries(groups).forEach(([groupKey, groupTxs]) => {
    if (groupTxs.length < 2) return

    // Sort ascending by transaction date
    const sorted = [...groupTxs].sort((a, b) => parseDate(a.transaction_date) - parseDate(b.transaction_date))
    const firstTx = sorted[0]
    const latestTx = sorted[sorted.length - 1]

    // Calculate intervals (in days)
    const intervals: number[] = []
    for (let i = 1; i < sorted.length; i++) {
      const prevTime = parseDate(sorted[i - 1].transaction_date)
      const currTime = parseDate(sorted[i].transaction_date)
      intervals.push(daysBetween(prevTime, currTime))
    }

    // Average interval
    const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length

    // Determine frequency based on avgInterval
    let frequency: 'weekly' | 'monthly' | 'uncertain' = 'uncertain'
    if (avgInterval >= 5 && avgInterval <= 9) {
      frequency = 'weekly'
    } else if (avgInterval >= 25 && avgInterval <= 35) {
      frequency = 'monthly'
    }

    // Typical amount (average)
    const avgAmount = groupTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0) / groupTxs.length

    // Calculate confidence score
    let confidence = 50 // Base score for 2 occurrences
    if (sorted.length >= 3) confidence += 15
    if (sorted.length >= 5) confidence += 15

    // Check variance in amounts
    const amountDeviations = groupTxs.map(t => Math.abs(Math.abs(t.amount) - avgAmount) / avgAmount)
    const maxDeviation = Math.max(...amountDeviations)
    if (maxDeviation < 0.05) {
      confidence += 15 // Very consistent amount
    } else if (maxDeviation < 0.15) {
      confidence += 5
    }

    // Check variance in intervals
    if (intervals.length > 1) {
      const intervalDeviations = intervals.map(inter => Math.abs(inter - avgInterval))
      const maxIntervalDev = Math.max(...intervalDeviations)
      if (maxIntervalDev <= 2) {
        confidence += 15 // Highly regular interval
      } else if (maxIntervalDev <= 5) {
        confidence += 5
      }
    }

    // Cap confidence
    confidence = Math.min(99, confidence)

    // Calculate next expected occurrence date
    // Add intervals to last occurrence date until it's in the future
    const lastOccurTime = parseDate(latestTx.transaction_date)
    const todayTime = new Date().setHours(0, 0, 0, 0)
    let nextOccurTime = lastOccurTime

    const addDays = frequency === 'weekly' ? 7 : frequency === 'monthly' ? 30 : Math.round(avgInterval || 30)
    
    // Add intervals until nextOccurTime is in the future
    while (nextOccurTime <= todayTime) {
      nextOccurTime += addDays * 24 * 60 * 60 * 1000
    }

    const estimatedNext = new Date(nextOccurTime).toISOString().split('T')[0]
    
    // Generate a unique ID based on the signature
    const autoId = `auto::${latestTx.merchant.toLowerCase().replace(/\s+/g, '-')}-${latestTx.transaction_type}`

    // Determine status from preferences
    let status: 'active' | 'ignored' | 'not-recurring' = 'active'
    if (ignoredIds.includes(autoId)) {
      status = 'ignored'
    } else if (notRecurringIds.includes(autoId)) {
      status = 'not-recurring'
    }

    const occurrencesCount = sorted.length
    const diffDays = Math.round(avgInterval || 30)
    const explanation = `${occurrencesCount} similar ${latestTx.merchant} payments about ${diffDays} days apart.`

    autoDetected.push({
      id: autoId,
      merchant: latestTx.merchant,
      amount: Math.round(avgAmount),
      transaction_type: latestTx.transaction_type,
      category: latestTx.category,
      frequency,
      last_occurrence: latestTx.transaction_date,
      estimated_next: estimatedNext,
      confidence,
      source: 'auto-detected',
      status,
      explanation
    })
  })

  // Combine manual recurring items and auto-detected active items
  const manualParsed = manualItems.map(item => {
    // Recalculate estimated_next date for manual items if they are in the past
    const lastOccurTime = parseDate(item.last_occurrence)
    const todayTime = new Date().setHours(0, 0, 0, 0)
    let nextOccurTime = lastOccurTime
    const addDays = item.frequency === 'weekly' ? 7 : item.frequency === 'monthly' ? 30 : 30

    while (nextOccurTime <= todayTime) {
      nextOccurTime += addDays * 24 * 60 * 60 * 1000
    }

    return {
      ...item,
      estimated_next: new Date(nextOccurTime).toISOString().split('T')[0]
    }
  })

  // Merge lists (ignore auto-detected ones that are overridden by manual items of the same merchant & type)
  const filteredAuto = autoDetected.filter(auto => {
    const hasManualOverride = manualParsed.some(man => 
      man.merchant.toLowerCase().trim() === auto.merchant.toLowerCase().trim() &&
      man.transaction_type === auto.transaction_type
    )
    return !hasManualOverride
  })

  return [...manualParsed, ...filteredAuto]
}

// Compute upcoming payments in next 30 days from recurring items list
export function getUpcomingPayments(recurringItems: RecurringItem[], daysLimit = 30): UpcomingPayment[] {
  const activeItems = recurringItems.filter(item => item.status === 'active')
  const upcoming: UpcomingPayment[] = []

  const todayTime = new Date().setHours(0, 0, 0, 0)
  const limitTime = todayTime + daysLimit * 24 * 60 * 60 * 1000

  activeItems.forEach(item => {
    const nextDate = item.estimated_next
    const nextTime = parseDate(nextDate)

    if (nextTime >= todayTime && nextTime <= limitTime) {
      upcoming.push({
        id: `upcoming::${item.id}-${nextDate}`,
        merchant: item.merchant,
        amount: item.amount,
        transaction_type: item.transaction_type,
        category: item.category,
        dueDate: nextDate,
        frequency: item.frequency,
        source: item.source
      })
    }
  })

  // Sort upcoming chronologically
  return upcoming.sort((a, b) => parseDate(a.dueDate) - parseDate(b.dueDate))
}
