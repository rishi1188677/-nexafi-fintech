import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReportsClient } from '@/components/reports/reports-client'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  if (!claims?.sub) {
    redirect('/sign-in')
  }

  return <ReportsClient userId={claims.sub} />
}
