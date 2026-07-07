import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildBriefingFacts, formatBriefingContext } from '@/lib/ai/briefing-builder'
import { buildBriefingPrompt, parseBriefingResponse } from '@/lib/ai/briefing-prompts'

export async function POST(request: Request) {
  try {
    // 1. Authenticate
    const supabase = await createClient()
    const { data: claimsData } = await supabase.auth.getClaims()
    const claims = claimsData?.claims

    if (!claims?.sub) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const userId = claims.sub

    // 2. Parse optional recurring prefs from request body
    const body = await request.json().catch(() => ({}))
    const recurringPrefs = body?.recurringPrefs ?? {}

    // 3. Fetch all user financial data in parallel
    const [txRes, budgetsRes, goalsRes] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', userId).order('transaction_date', { ascending: false }),
      supabase.from('budgets').select('*').eq('user_id', userId),
      supabase.from('goals').select('*').eq('user_id', userId),
    ])

    const transactions = txRes.data ?? []
    const budgets = budgetsRes.data ?? []
    const goals = goalsRes.data ?? []

    // 4. Check Gemini key
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured.' }, { status: 500 })
    }

    // 5. Run deterministic calculations — no Gemini involved here
    const facts = buildBriefingFacts(transactions, budgets, goals, recurringPrefs)
    const context = formatBriefingContext(facts)
    const prompt = buildBriefingPrompt(facts, context)

    // 6. Call Gemini Flash
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.25, maxOutputTokens: 1200 },
      }),
    })

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error('[briefing] Gemini error:', errText)
      throw new Error(`Gemini returned status ${geminiRes.status}`)
    }

    const geminiData = await geminiRes.json()
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!rawText) throw new Error('Empty Gemini response')

    // 7. Parse structured sections
    const sections = parseBriefingResponse(rawText)

    // 8. Return facts + sections to the client
    // NOTE: We never log full transaction data
    return NextResponse.json({
      sections,
      facts: {
        currentMonth: facts.currentMonth,
        totalIncome: facts.totalIncome,
        totalExpenses: facts.totalExpenses,
        netSavings: facts.netSavings,
        savingsRate: facts.savingsRate,
        topCategory: facts.topCategory,
        topCategoryAmount: facts.topCategoryAmount,
        biggestMerchant: facts.biggestMerchant,
        biggestMerchantAmount: facts.biggestMerchantAmount,
        expenseChange: facts.expenseChange,
        expenseChangePct: facts.expenseChangePct,
        prevMonthExpenses: facts.prevMonthExpenses,
        overBudgets: facts.overBudgets,
        nearBudgets: facts.nearBudgets,
        safeToSpend: facts.safeToSpend,
        goals: facts.goals,
        upcomingBills: facts.upcomingBills,
        recurringMonthlyExpense: facts.recurringMonthlyExpense,
        toolsUsed: facts.toolsUsed,
      },
    })
  } catch (err: any) {
    console.error('[briefing route] error:', err)
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
