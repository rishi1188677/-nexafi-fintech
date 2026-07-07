import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DailyBriefingCard } from '@/components/dashboard/daily-briefing-card'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Daily Briefing — NexaFi',
  description: 'Your personalized AI financial briefing based on real transaction data.',
}

export default async function BriefingPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  if (!claims?.sub) {
    redirect('/sign-in')
  }

  return <DailyBriefingCard />
}
