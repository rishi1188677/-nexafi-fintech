import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BudgetsClient } from '@/components/budgets/budgets-client'

export default async function BudgetsPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  if (!claims?.sub) {
    redirect('/sign-in')
  }

  return <BudgetsClient userId={claims.sub} />
}
