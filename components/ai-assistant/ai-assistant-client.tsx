'use client'

import * as React from 'react'
import {
  Sparkles,
  Send,
  RotateCcw,
  Copy,
  Check,
  User,
  ShieldCheck,
  AlertTriangle,
  Receipt,
  ArrowUpRight,
  TrendingUp,
  Target,
  Wallet,
  Loader2,
  Info,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { categoryList, type CategoryId, categories } from '@/lib/data'
import { formatINR } from '@/lib/format'
import { cn } from '@/lib/utils'

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

interface DBBudget {
  id: string
  user_id: string
  category: string
  budget_amount: number
  month: string
}

interface DBGoal {
  id: string
  user_id: string
  title: string
  target_amount: number
  current_amount: number
  monthly_contribution: number
  target_date: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const SUGGESTED_PROMPTS = [
  { text: 'Where did my money go this month?', id: 'money-go', icon: Receipt, helper: 'Analyze where your cash flowed this month' },
  { text: 'How can I save more?', id: 'save-more', icon: TrendingUp, helper: 'Get insights to improve your savings rate' },
  { text: 'Am I staying within budget?', id: 'budget-check', icon: Wallet, helper: 'Check category limits and overspending' },
  { text: 'Am I on track for my goals?', id: 'goals-track', icon: Target, helper: 'Evaluate savings goals progress and ETAs' },
  { text: 'Summarize my month.', id: 'summary', icon: ArrowUpRight, helper: 'Get a high-level cashflow summary report' },
  { text: 'What should I watch next?', id: 'watch-next', icon: Sparkles, helper: 'Monitor financial risks and repeat merchants' }
]

// Custom formatting parser for bold text (**bold**)
function parseBoldText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/)
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-foreground">
          {part.substring(2, part.length - 2)}
        </strong>
      )
    }
    return part
  })
}

interface ParsedResponse {
  summary: string
  observations: string[]
  actions: string[]
  disclaimer: string
}

// Parses raw deterministic engine text into isolated blocks for elegant styled rendering
function parseStructuredResponse(content: string): ParsedResponse {
  const result: ParsedResponse = {
    summary: '',
    observations: [],
    actions: [],
    disclaimer: ''
  }

  const lines = content.split('\n')
  let currentSection: 'summary' | 'observations' | 'actions' | 'disclaimer' = 'summary'

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Detect section headers
    if (trimmed.toLowerCase().includes('observations:')) {
      currentSection = 'observations'
      continue
    }
    if (trimmed.toLowerCase().includes('action suggestions:')) {
      currentSection = 'actions'
      continue
    }
    if (trimmed.toLowerCase().includes('disclaimer:') || trimmed.startsWith('*') || trimmed.toLowerCase().includes('educational purposes only')) {
      currentSection = 'disclaimer'
      let text = trimmed
      if (text.startsWith('*') && text.endsWith('*')) {
        text = text.substring(1, text.length - 1)
      }
      result.disclaimer = text
      continue
    }

    // Populate data based on section
    if (currentSection === 'summary') {
      if (result.summary) {
        result.summary += '\n' + trimmed
      } else {
        result.summary = trimmed
      }
    } else if (currentSection === 'observations') {
      const cleanOb = trimmed.replace(/^[-*\s]+/, '')
      result.observations.push(cleanOb)
    } else if (currentSection === 'actions') {
      const cleanAc = trimmed.replace(/^[\d+.\s]+/, '')
      result.actions.push(cleanAc)
    } else if (currentSection === 'disclaimer') {
      if (result.disclaimer) {
        result.disclaimer += '\n' + trimmed
      } else {
        result.disclaimer = trimmed
      }
    }
  }

  return result
}

export function AiAssistantClient({ userId }: { userId: string }) {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [inputVal, setInputVal] = React.useState('')
  const [typing, setTyping] = React.useState(false)
  const [copiedId, setCopiedId] = React.useState<number | null>(null)

  // DB Data States
  const [transactions, setTransactions] = React.useState<DBTransaction[]>([])
  const [budgets, setBudgets] = React.useState<DBBudget[]>([])
  const [goals, setGoals] = React.useState<DBGoal[]>([])
  const [loading, setLoading] = React.useState(true)

  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const currentMonth = React.useMemo(() => new Date().toISOString().slice(0, 7), [])

  // Fetch Supabase records on load
  React.useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const supabase = createClient()
      try {
        const { data: txData } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)

        const { data: budgetsData } = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', userId)

        const { data: goalsData } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', userId)

        setTransactions(txData || [])
        setBudgets(budgetsData || [])
        setGoals(goalsData || [])
      } catch (err) {
        console.error('Failed to load data for AI Coach:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [userId])

  // Initialize chat history with welcome message
  React.useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Hello! I'm your NexaFi AI Financial Coach. I can analyze your transactions, active budgets, and savings goals to give you personalized, educational guidance.\n\nSelect one of the suggested prompts to the left, or type your query to start analyzing your numbers!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])
  }, [])

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  React.useEffect(() => {
    scrollToBottom()
  }, [messages, typing])

  // Copy response
  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedId(idx)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Clear chat history
  const handleResetChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Hello! I'm your NexaFi AI Financial Coach. I can analyze your transactions, active budgets, and savings goals to give you personalized, educational guidance.\n\nSelect one of the suggested prompts to the left, or type your query to start analyzing your numbers!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])
  }

  // Local Rule-Based reasoning engine
  const generateResponse = React.useCallback((promptText: string): string => {
    if (transactions.length === 0) {
      return `I cannot analyze your financial data because your NexaFi workspace is currently empty.\n\n**Observations:**\n- No transactions found in your account history.\n- No category-specific expenses or income flows detected.\n\n**Action suggestions:**\n1. Head over to the **Transactions** page and click "Import Bank Statement" to load statement files.\n2. Or add a transaction manually by clicking "Add Transaction".\n\n*Disclaimer: This advice is for educational purposes only and does not constitute professional financial advice.*`
    }

    const lower = promptText.toLowerCase().trim()

    // Filter current month transactions
    const currentMonthTx = transactions.filter(t => t.transaction_date.slice(0, 7) === currentMonth)
    const incomeTx = currentMonthTx.filter(t => t.transaction_type === 'income')
    const expenseTx = currentMonthTx.filter(t => t.transaction_type === 'expense')

    const totalIncome = incomeTx.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const totalExpenses = expenseTx.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const netCashflow = totalIncome - totalExpenses

    let savingsRateStr = '0%'
    if (totalIncome > 0) {
      const rate = ((totalIncome - totalExpenses) / totalIncome) * 100
      savingsRateStr = `${Math.round(rate)}%`
    }

    // Category breakdown
    const categoryTotals: Record<string, number> = {}
    expenseTx.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount)
    })
    const sortedCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => ({
        id: cat,
        label: categories[cat as CategoryId]?.label || cat,
        amount: amt
      }))

    // Budgets checks
    const activeBudgets = budgets.filter(b => b.month.slice(0, 7) === currentMonth)
    const budgetsWithSpent = activeBudgets.map(b => {
      const spent = transactions
        .filter(t => t.category === b.category && t.transaction_type === 'expense' && t.transaction_date.slice(0, 7) === currentMonth)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      return { ...b, spent, ratio: b.budget_amount > 0 ? spent / b.budget_amount : 0 }
    })
    const overBudgets = budgetsWithSpent.filter(b => b.ratio >= 1.0)
    const nearBudgets = budgetsWithSpent.filter(b => b.ratio >= 0.8 && b.ratio < 1.0)

    // Goals checks
    const activeGoals = goals.filter(g => g.current_amount < g.target_amount)

    // Match prompt structures
    const isMoneyGo = lower.includes('money go') || lower.includes('where did') || lower.includes('outflows') || lower.includes('spend')
    const isSaveMore = lower.includes('save more') || lower.includes('savings') || lower.includes('saving')
    const isBudgetCheck = lower.includes('staying within') || lower.includes('budget') || lower.includes('budgets')
    const isGoalsTrack = lower.includes('track') || lower.includes('goals') || lower.includes('goal')
    const isWatchNext = lower.includes('watch next') || lower.includes('financial risks') || lower.includes('risks') || lower.includes('recurring') || lower.includes('unusual')
    const isSummary = lower.includes('summarize') || lower.includes('summary') || lower.includes('month')

    // Scenario A: "Where did my money go this month?"
    if (isMoneyGo) {
      if (expenseTx.length === 0) {
        return `You haven't recorded any expenses in the current month (${currentMonth}) yet.\n\n**Observations:**\n- Expenses this month: ₹0.\n- Total income recorded: ${formatINR(totalIncome)}.\n\n**Action suggestions:**\n1. Add transaction logs for your daily outflows.\n2. Review previous month statements by importing them.\n\n*Disclaimer: This advice is for educational purposes only and does not constitute professional financial advice.*`
      }

      const topCatStr = sortedCategories.slice(0, 3).map(c => `- **${c.label}**: ${formatINR(c.amount)}`).join('\n')
      const largestTx = [...expenseTx].sort((a, b) => b.amount - a.amount)[0]

      return `This month, you have spent a total of **${formatINR(totalExpenses)}** across all expense categories.\n\n**Observations:**\n${topCatStr}\n${largestTx ? `- **Largest Outflow**: ${formatINR(largestTx.amount)} at **${largestTx.merchant}** on ${largestTx.transaction_date}.` : ''}\n\n**Action suggestions:**\n1. Look for ways to trim spending in your top category (**${sortedCategories[0]?.label || 'General'}**).\n2. Set a strict budget limit for high spending categories.\n\n*Disclaimer: This advice is for educational purposes only and does not constitute professional financial advice.*`
    }

    // Scenario B: "How can I save more?"
    if (isSaveMore) {
      const isPositiveCashflow = netCashflow > 0
      const currentRate = totalIncome > 0 ? Math.round((netCashflow / totalIncome) * 100) : 0

      return `Your current month savings rate is **${savingsRateStr}** (net savings of **${formatINR(Math.max(0, netCashflow))}**).\n\n**Observations:**\n- Total Monthly Income: ${formatINR(totalIncome)}\n- Total Monthly Expenses: ${formatINR(totalExpenses)}\n- Status: ${isPositiveCashflow ? 'Healthy positive cashflow' : 'Negative cashflow (expenses exceed income)'}\n\n**Action suggestions:**\n1. ${currentRate < 20 ? 'Aim to increase your savings rate to the recommended 20% threshold by trimming flexible category costs.' : 'Excellent savings! Keep pushing to invest this surplus.'}\n2. Set up automated contributions to your active savings goals.\n3. Cancel any unused subscriptions to lower fixed commitments.\n\n*Disclaimer: This advice is for educational purposes only and does not constitute professional financial advice.*`
    }

    // Scenario C: "Am I staying within budget?"
    if (isBudgetCheck) {
      if (activeBudgets.length === 0) {
        return `You do not have any budget limits configured for the current month (${currentMonth}).\n\n**Observations:**\n- No active budget templates detected.\n- Budgeted amount: ₹0.\n\n**Action suggestions:**\n1. Navigate to the **Budgets** page and click "Add Budget".\n2. Set spending limits for high outflow categories like Food & Dining or Shopping to prevent overspending.\n\n*Disclaimer: This advice is for educational purposes only and does not constitute professional financial advice.*`
      }

      const overBudgetStr = overBudgets.length > 0
        ? overBudgets.map(b => `- **${categories[b.category as CategoryId]?.label || b.category}**: Over spent by ${formatINR(b.spent - b.budget_amount)}`).join('\n')
        : '- None of your categories are over budget. Great job!'

      const nearBudgetStr = nearBudgets.length > 0
        ? nearBudgets.map(b => `- **${categories[b.category as CategoryId]?.label || b.category}**: Utilized ${Math.round(b.ratio * 100)}% (${formatINR(b.spent)} / ${formatINR(b.budget_amount)})`).join('\n')
        : '- No categories are currently near their limit.'

      return `You have **${activeBudgets.length} active budgets** set for this month.\n\n**Observations:**\n**Over Budget Categories:**\n${overBudgetStr}\n\n**Near Limit (>=80%):**\n${nearBudgetStr}\n\n**Action suggestions:**\n1. Reduce spending in categories exceeding their limit immediately.\n2. Review and adjust limits if category allocations feel too restrictive.\n\n*Disclaimer: This advice is for educational purposes only and does not constitute professional financial advice.*`
    }

    // Scenario D: "Am I on track for my goals?"
    if (isGoalsTrack) {
      if (activeGoals.length === 0) {
        return `You do not have any active savings goals configuration records.\n\n**Observations:**\n- No incomplete savings targets found.\n\n**Action suggestions:**\n1. Head to the **Goals** page and click "Create Savings Goal".\n2. Configure targets for emergencies, purchases, or travel to build wealth intentionally.\n\n*Disclaimer: This advice is for educational purposes only and does not constitute professional financial advice.*`
      }

      const goalsProgressStr = activeGoals.map(g => {
        const pct = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0
        return `- **${g.title}**: ${Math.round(pct)}% saved (${formatINR(g.current_amount)} / ${formatINR(g.target_amount)}), Monthly target: ${formatINR(g.monthly_contribution)}, Target Date: ${g.target_date}`
      }).join('\n')

      return `You are currently working on **${activeGoals.length} active savings goals**.\n\n**Observations:**\n${goalsProgressStr}\n\n**Action suggestions:**\n1. Verify if your monthly contribution rate meets your goal deadline targets.\n2. Allocate surplus cash flow directly to goals on payoff dates.\n\n*Disclaimer: This advice is for educational purposes only and does not constitute professional financial advice.*`
    }

    // Scenario E: "What should I watch next?" (Financial Risk Check)
    if (isWatchNext) {
      const observations: string[] = []

      // 1. Budget near limit
      if (nearBudgets.length > 0) {
        observations.push(`Budget limit alert: **${categories[nearBudgets[0].category as CategoryId]?.label}** has utilized ${Math.round(nearBudgets[0].ratio * 100)}% of its limit.`)
      }
      if (overBudgets.length > 0) {
        observations.push(`Budget alert: **${categories[overBudgets[0].category as CategoryId]?.label}** is over budget by ${formatINR(overBudgets[0].spent - overBudgets[0].budget_amount)}.`)
      }

      // 2. Low savings rate
      if (totalIncome > 0) {
        const rate = ((totalIncome - totalExpenses) / totalIncome) * 100
        if (rate < 15) {
          observations.push(`Low savings rate: Saving only ${Math.round(rate)}% of your income this month. Recommended baseline is 20%.`)
        }
      }

      // 3. Repeated merchants / subscriptions
      const merchantCounts: Record<string, number> = {}
      transactions.forEach(t => {
        merchantCounts[t.merchant] = (merchantCounts[t.merchant] || 0) + 1
      })
      const repeated = Object.entries(merchantCounts).filter(m => m[1] >= 3).slice(0, 2)
      if (repeated.length > 0) {
        observations.push(`Frequent merchants to monitor: **${repeated.map(m => `${m[0]} (${m[1]} times)`).join(', ')}** in transaction history.`)
      }

      // 4. Large recent expense
      const largeExpense = [...expenseTx].sort((a, b) => b.amount - a.amount)[0]
      if (largeExpense && largeExpense.amount >= 2000) {
        observations.push(`Large transaction: ₹${largeExpense.amount} spent at **${largeExpense.merchant}** on ${largeExpense.transaction_date}.`)
      }

      // 5. Goal deadlines
      const soonGoal = activeGoals[0]
      if (soonGoal) {
        observations.push(`Upcoming savings target: **${soonGoal.title}** (Goal: ${formatINR(soonGoal.target_amount)}, Current: ${formatINR(soonGoal.current_amount)}) by ${soonGoal.target_date}.`)
      }

      if (observations.length === 0) {
        return `I checked your accounts and everything looks completely healthy!\n\n**Observations:**\n- All budgets are comfortably within safe limits.\n- Savings rate is positive and cashflow is optimized.\n- No high unusual transaction spikes detected.\n\n**Action suggestions:**\n1. Review goals to increase target contributions.\n2. Start investing surplus cash systematically.\n\n*Disclaimer: This advice is for educational purposes only and does not constitute professional financial advice.*`
      }

      return `Here are the top financial elements, budgets, goals, or transaction patterns you should monitor closely next:\n\n**Observations:**\n${observations.map(o => `- ${o}`).join('\n')}\n\n**Action suggestions:**\n1. Adjust spending patterns in high outflow categories before month-end.\n2. Align monthly savings sweep allocations to cover budget deficits.\n\n*Disclaimer: This advice is for educational purposes only and does not constitute professional financial advice.*`
    }

    // Scenario F: "Summarize my month." (Default summary)
    const categoriesStr = sortedCategories.slice(0, 2).map(c => `${c.label} (${formatINR(c.amount)})`).join(' and ')

    return `Here is a high-level summary of your financial status for the month of **${currentMonth}**:\n\n**Observations:**\n- **Income vs Outflow**: Mapped **${formatINR(totalIncome)}** in income and **${formatINR(totalExpenses)}** in outflows.\n- **Net Savings**: Net cashflow is **${formatINR(netCashflow)}** with a savings rate of **${savingsRateStr}**.\n- **Top spending category**: ${categoriesStr ? `Outflows are led by ${categoriesStr}.` : 'No expenses recorded.'}\n- **Budget health**: Mapped ${activeBudgets.length} budgets. ${overBudgets.length} categories exceeded limits.\n- **Active goals**: Mapped ${activeGoals.length} savings goals in progress.\n\n**Action suggestions:**\n1. Ensure total expenses do not exceed monthly income.\n2. Keep your budget limits locked to limit discretionary spending.\n\n*Disclaimer: This advice is for educational purposes only and does not constitute professional financial advice.*`
  }, [transactions, budgets, goals, currentMonth])

  // Handle message sending
  const handleSend = (text: string) => {
    if (!text.trim()) return

    const newMsg: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, newMsg])
    setInputVal('')
    setTyping(true)

    // Simulate animated coach thinking delay
    setTimeout(() => {
      const responseContent = generateResponse(text)
      const coachMsg: Message = {
        role: 'assistant',
        content: responseContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, coachMsg])
      setTyping(false)
    }, 850)
  }

  // Elite Redesigned Workspace layout
  return (
    <div className="h-[calc(100vh-6.0rem)] flex flex-col overflow-hidden space-y-4">
      {loading ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground bg-card border border-border rounded-xl shadow-lg">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-medium">Synchronizing coach with database...</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12 flex-1 min-h-0 overflow-hidden">
          
          {/* LEFT PANEL — Prompt / Control Center (35% width / col-span-4) */}
          <div className="lg:col-span-4 flex flex-col h-full min-h-0 overflow-hidden bg-card/45 border border-border/75 rounded-xl p-5 shadow-lg space-y-4.5 justify-between backdrop-blur-sm">
            
            {/* Header section */}
            <div className="space-y-1.5 shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="size-4.5 text-primary" />
                  NexaFi AI Coach
                </h2>
                <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  Rule-based preview
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-normal">
                Ask questions about spending, budgets, goals, and cash flow.
              </p>
            </div>

            {/* Suggested Prompts action cards */}
            <div className="flex-1 overflow-y-auto pr-1 py-1 space-y-2.5 scrollbar-thin">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block mb-1 px-1">Suggested Topics</span>
              {SUGGESTED_PROMPTS.map((p) => {
                const Icon = p.icon
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSend(p.text)}
                    disabled={typing}
                    className="w-full text-left bg-background/65 hover:bg-muted/70 border border-border/70 hover:border-primary/40 p-3 rounded-lg transition-all duration-150 group cursor-pointer shadow-xs flex items-start gap-3 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-primary/10">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                        {p.text}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed truncate">
                        {p.helper}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Left footer details */}
            <div className="space-y-3 pt-3 border-t border-border/60 shrink-0">
              <div className="flex items-center justify-center gap-2 rounded-lg bg-muted/15 border border-border/50 py-2 px-3 text-[10px] text-muted-foreground text-center font-medium uppercase tracking-wider leading-none">
                <ShieldCheck className="size-3.5 text-primary shrink-0" />
                <span>Used: Transactions • Budgets • Goals</span>
              </div>
              <Button
                variant="outline"
                onClick={handleResetChat}
                className="w-full border-border/70 hover:bg-muted/40 h-9 text-xs gap-1.5 cursor-pointer font-medium"
              >
                <RotateCcw className="size-3.5" />
                Reset Conversation
              </Button>
            </div>
          </div>

          {/* RIGHT PANEL — AI Answer Workspace (65% width / col-span-8) */}
          <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
            <Card className="flex flex-col flex-1 border border-border bg-card/65 shadow-xl backdrop-blur-sm overflow-hidden h-full">
              
              {/* Answer Content scroll area */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-background/10">
                {messages.map((m, idx) => {
                  const isAssistant = m.role === 'assistant'
                  const parsed = parseStructuredResponse(m.content)

                  return (
                    <div key={idx} className="flex flex-col w-full">
                      {isAssistant ? (
                        // Beautiful formatted report card
                        <div className="bg-card border border-border/90 rounded-xl p-5 sm:p-6 shadow-sm relative group w-full mb-2">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
                              <Sparkles className="size-4 animate-pulse" />
                              <span>AI Financial Report</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground/60">{m.timestamp}</span>
                          </div>

                          <div className="space-y-4">
                            {/* Summary section */}
                            {parsed.summary && (
                              <div className="text-sm sm:text-base text-foreground font-semibold leading-relaxed">
                                {parseBoldText(parsed.summary)}
                              </div>
                            )}

                            {/* Observations list */}
                            {parsed.observations.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary">Key Observations</h4>
                                <div className="grid gap-2">
                                  {parsed.observations.map((obs, oIdx) => (
                                    <div key={oIdx} className="bg-muted/20 border border-border/50 rounded-lg p-3 text-xs sm:text-sm text-foreground/90 flex items-start gap-2.5 shadow-xs">
                                      <Info className="size-4 text-primary shrink-0 mt-0.5" />
                                      <span>{parseBoldText(obs)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Action recommendations list */}
                            {parsed.actions.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-450">Suggested Action Steps</h4>
                                <div className="grid gap-2">
                                  {parsed.actions.map((act, aIdx) => (
                                    <div key={aIdx} className="bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-3 text-xs sm:text-sm text-foreground/90 flex items-start gap-2.5 shadow-xs">
                                      <div className="size-4.5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                                        {aIdx + 1}
                                      </div>
                                      <span>{parseBoldText(act)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Educational Disclaimer */}
                            {parsed.disclaimer && (
                              <div className="text-[10px] sm:text-xs text-muted-foreground/60 italic border-t border-border/30 pt-3">
                                {parsed.disclaimer}
                              </div>
                            )}
                          </div>

                          {/* Copy button */}
                          {idx > 0 && (
                            <div className="mt-4 flex justify-end shrink-0">
                              <button
                                onClick={() => handleCopyText(m.content, idx)}
                                className="text-muted-foreground hover:text-foreground p-1.5 rounded-md bg-muted/40 hover:bg-muted transition-colors border border-border/20 flex items-center gap-1.5"
                                title="Copy response"
                              >
                                {copiedId === idx ? (
                                  <>
                                    <Check className="size-3.5 text-primary" />
                                    <span className="text-primary font-bold text-[10px]">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="size-3.5" />
                                    <span className="text-[10px]">Copy report</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        // User prompt rendered as a clean tag pill
                        <div className="flex gap-2 items-center text-xs text-muted-foreground bg-muted/45 border border-border/75 px-4 py-2 rounded-full mr-auto shadow-xs select-none mb-3">
                          <User className="size-3.5" />
                          <span>Question: <strong>{m.content}</strong></span>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Animated thinking loader card */}
                {typing && (
                  <div className="bg-card border border-border rounded-xl p-5 shadow-xs w-full">
                    <div className="flex items-center gap-2 text-xs text-primary font-semibold mb-2">
                      <Sparkles className="size-4 animate-pulse" />
                      <span>Financial Coach is generating report...</span>
                    </div>
                    <div className="flex gap-1.5 items-center py-1">
                      <span className="size-2 rounded-full bg-primary/80 animate-bounce [animation-delay:-0.3s]" />
                      <span className="size-2 rounded-full bg-primary/80 animate-bounce [animation-delay:-0.15s]" />
                      <span className="size-2 rounded-full bg-primary/80 animate-bounce" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Fixed Composer Panel */}
              <div className="border-t border-border bg-muted/10 p-4 shrink-0">
                <div className="space-y-2">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSend(inputVal)
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      placeholder="Ask your coach about spending, budgets, goals, and cash flow..."
                      className="flex-1 bg-background border-border h-10 text-xs sm:text-sm shadow-inner"
                      disabled={typing}
                    />
                    <Button
                      type="submit"
                      disabled={typing || !inputVal.trim()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4 shrink-0 shadow-sm cursor-pointer"
                    >
                      <Send className="size-4" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </form>
                  <div className="flex justify-between items-center text-[9px] text-muted-foreground/50 px-1 pt-1 shrink-0 leading-none">
                    <span>Client-side rule-based financial analysis</span>
                    <span>Press Enter to send</span>
                  </div>
                </div>
              </div>

            </Card>
          </div>

        </div>
      )}
    </div>
  )
}
