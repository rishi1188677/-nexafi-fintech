import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { categories, type CategoryId } from '@/lib/data'
import { formatINR } from '@/lib/format'

export async function POST(request: Request) {
  try {
    // 1. Verify user session via server-side Supabase client
    const supabase = await createClient()
    const { data: claimsData } = await supabase.auth.getClaims()
    const claims = claimsData?.claims

    if (!claims?.sub) {
      return NextResponse.json({ error: 'Unauthorized session.' }, { status: 401 })
    }

    const userId = claims.sub

    // 2. Parse request payload
    const { question, recurringItems = [] } = await request.json()
    if (!question || typeof question !== 'string') {
      return NextResponse.json({ error: 'Missing user question.' }, { status: 400 })
    }

    // 3. Fetch user financial records from Supabase in parallel
    const [txResponse, budgetsResponse, goalsResponse] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', userId),
      supabase.from('budgets').select('*').eq('user_id', userId),
      supabase.from('goals').select('*').eq('user_id', userId)
    ])

    const transactions = txResponse.data || []
    const budgets = budgetsResponse.data || []
    const goals = goalsResponse.data || []

    // 4. Check for Gemini API key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured.' }, { status: 500 })
    }

    // 5. Build compact financial context
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
    const currentMonthTxs = transactions.filter(t => t.transaction_date.slice(0, 7) === currentMonth)
    const incomeTxs = currentMonthTxs.filter(t => t.transaction_type === 'income')
    const expenseTxs = currentMonthTxs.filter(t => t.transaction_type === 'expense')

    const totalIncome = incomeTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const totalExpenses = expenseTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const netCashflow = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? Math.round((netCashflow / totalIncome) * 100) : 0

    // Category breakdown
    const categoryTotals: Record<string, number> = {}
    expenseTxs.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount)
    })
    const categoryDetails = Object.entries(categoryTotals)
      .map(([cat, amt]) => `${categories[cat as CategoryId]?.label || cat}: ${formatINR(amt)}`)
      .join(', ')

    // Budgets breakdown
    const budgetDetails = budgets
      .filter(b => b.month.slice(0, 7) === currentMonth)
      .map(b => {
        const spent = transactions
          .filter(t => t.category === b.category && t.transaction_type === 'expense' && t.transaction_date.slice(0, 7) === currentMonth)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0)
        return `- ${categories[b.category as CategoryId]?.label || b.category}: Budget ${formatINR(b.budget_amount)}, Spent ${formatINR(spent)} (${b.budget_amount > 0 ? Math.round((spent / b.budget_amount) * 100) : 0}%)`
      })
      .join('\n')

    // Goals breakdown
    const goalDetails = goals
      .map(g => `- ${g.title}: Target ${formatINR(g.target_amount)}, Saved ${formatINR(g.current_amount)} (${g.target_amount > 0 ? Math.round((g.current_amount / g.target_amount) * 100) : 0}%), Monthly Target: ${formatINR(g.monthly_contribution)}`)
      .join('\n')

    // Recurring items
    const recurringDetails = recurringItems
      .filter((item: any) => item.status === 'active')
      .map((item: any) => `- ${item.merchant} (${item.frequency}): ${formatINR(item.amount)} [Next expected: ${item.estimated_next}]`)
      .join('\n')

    // Construct prompt
    const promptText = `You are the NexaFi AI Financial Coach, a premium personal finance assistant.
Analyze the user's financial context below and answer their question.

USER FINANCIAL CONTEXT:
- Current Month: ${currentMonth}
- Monthly Income: ${formatINR(totalIncome)}
- Monthly Expenses: ${formatINR(totalExpenses)}
- Net Cashflow: ${formatINR(netCashflow)}
- Savings Rate: ${savingsRate}%
- Expenses by Category: ${categoryDetails || 'None'}

ACTIVE BUDGET CONSTRAINTS:
${budgetDetails || 'No budgets configured for this month.'}

ACTIVE SAVINGS TARGETS (GOALS):
${goalDetails || 'No savings goals set.'}

SCHEDULED RECURRING BILLS & UTILITIES:
${recurringDetails || 'No recurring subscriptions mapped.'}

USER QUESTION: "${question}"

RESPONSE FORMAT INSTRUCTIONS (CRITICAL):
You MUST format your output exactly in the following structured layout. Use plain sentences, and bold keywords only using double asterisks (**bold**). Do not use markdown headers (# or ##) or inline code blocks.

[Write a concise summary paragraph answering the question here. Focus on the real data provided in the context.]

Observations:
- [Write observation item 1 here]
- [Write observation item 2 here]

Action suggestions:
1. [Write actionable suggestion item 1 here]
2. [Write actionable suggestion item 2 here]

Disclaimer:
This advice is for educational purposes only and does not constitute professional financial advice. All numbers are based on transactions recorded by the user.`

    // 6. Call Google Gemini Flash API via HTTPS REST call
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: promptText
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API call failed:', errorText)
      throw new Error(`Gemini API failed with status ${response.status}`)
    }

    const resJson = await response.json()
    const rawAnswer = resJson?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!rawAnswer) {
      throw new Error('Malformed response from Gemini API.')
    }

    return NextResponse.json({ answer: rawAnswer })
  } catch (err: any) {
    console.error('Server error inside AI API route:', err)
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
