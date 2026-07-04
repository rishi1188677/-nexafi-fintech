import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GoalsClient } from '@/components/goals/goals-client'

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  if (!claims?.sub) {
    redirect('/sign-in')
  }

  return <GoalsClient userId={claims.sub} />
}
