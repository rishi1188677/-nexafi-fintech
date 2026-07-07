import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { formatINR } from '@/lib/format'
import { routeIntent } from '@/lib/ai/intent-router'

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

    // 5. Run Intent router and deterministic math tools
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

    const { intent, toolResult } = routeIntent(
      question,
      transactions,
      budgets,
      goals,
      recurringItems,
      currentMonth
    )

    // Calculate baseline summary context metrics for helper context
    const currentMonthTxs = transactions.filter(t => t.transaction_date.slice(0, 7) === currentMonth)
    const incomeTxs = currentMonthTxs.filter(t => t.transaction_type === 'income')
    const expenseTxs = currentMonthTxs.filter(t => t.transaction_type === 'expense')

    const totalIncome = incomeTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const totalExpenses = expenseTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const netCashflow = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? Math.round((netCashflow / totalIncome) * 100) : 0

    // Construct prompt with deterministic facts
    const promptText = `You are the NexaFi AI Financial Coach, a premium personal finance assistant.
Analyze the user's financial context below and answer their question using the computed facts.

USER FINANCIAL CONTEXT SUMMARY:
- Current Month: ${currentMonth}
- Total Monthly Income: ${formatINR(totalIncome)}
- Total Monthly Expenses: ${formatINR(totalExpenses)}
- Savings Rate: ${savingsRate}%

DETERMINISTIC FACTS CALCULATED BY INTERNAL TOOLS:
Tool Used: ${toolResult.toolName}
Facts:
${toolResult.formattedFacts}

USER QUESTION: "${question}"

SAFETY CONSTRAINTS:
- Do NOT recommend specific stocks, crypto tokens, mutual funds, or tax/legal advice. Keep recommendations educational and focused on savings, budgets, and cash flow structures.
- Do NOT hallucinate any unsupported numbers; rely strictly on the calculated facts above.
- If the calculated facts do not contain enough information, explain what context is missing.

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

    return NextResponse.json({
      answer: rawAnswer,
      toolUsed: toolResult.toolName
    })
  } catch (err: any) {
    console.error('Server error inside AI API route:', err)
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}
