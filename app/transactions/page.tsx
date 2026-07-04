import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TransactionsClient } from '@/components/transactions/transactions-client'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  if (!claims?.sub) {
    redirect('/sign-in')
  }

  return <TransactionsClient userId={claims.sub} />
}
