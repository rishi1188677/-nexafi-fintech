import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { InsightsClient } from '@/components/insights/insights-client'

export default async function InsightsPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  if (!claims?.sub) {
    redirect('/sign-in')
  }

  return <InsightsClient userId={claims.sub} />
}
