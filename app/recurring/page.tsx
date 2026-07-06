import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RecurringClient } from '@/components/recurring/recurring-client'

export default async function RecurringPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  if (!claims?.sub) {
    redirect('/sign-in')
  }

  return <RecurringClient userId={claims.sub} />
}
