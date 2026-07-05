import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AiAssistantClient } from '@/components/ai-assistant/ai-assistant-client'

export default async function AiAssistantPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  if (!claims?.sub) {
    redirect('/sign-in')
  }

  return <AiAssistantClient userId={claims.sub} />
}
