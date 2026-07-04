import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SignOutButton } from '@/components/auth/sign-out-button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  if (!claims?.sub) {
    redirect('/sign-in')
  }

  const metadata = claims.user_metadata as { full_name?: string } | undefined
  const email = typeof claims.email === 'string' ? claims.email : undefined
  const name =
    metadata?.full_name?.trim() ||
    email?.split('@')[0] ||
    'there'

  return (
    <div className="flex min-h-[50vh] flex-col items-start justify-center gap-6">
      <div className="space-y-3">
        <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Signed in
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome to NexaFi, {name}
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Your workspace is ready. Full dashboard features will appear here as you
          continue building your financial picture.
        </p>
      </div>
      <SignOutButton />
    </div>
  )
}
