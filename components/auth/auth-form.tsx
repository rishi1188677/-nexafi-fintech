'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type AuthMode = 'sign-in' | 'sign-up'

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isSignUp = mode === 'sign-up'

  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const callbackError = !isSignUp && searchParams.get('error') === 'auth_callback_failed'

  React.useEffect(() => {
    if (callbackError) {
      setError('Email confirmation failed. Please try signing in again.')
    }
  }, [callbackError])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '').trim()
    const password = String(formData.get('password') ?? '')

    if (isSignUp) {
      const fullName = String(formData.get('fullName') ?? '').trim()
      const confirmPassword = String(formData.get('confirmPassword') ?? '')

      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }

      setLoading(true)

      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { full_name: fullName },
        },
      })

      setLoading(false)

      if (signUpError) {
        setError('Unable to create your account right now. Please try again.')
        return
      }

      setSuccess(true)
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (signInError) {
      setError('Unable to sign in. Check your email and password.')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/90 p-8 shadow-2xl shadow-black/20 ring-1 ring-foreground/5 backdrop-blur-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid opacity-30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[120%] -translate-x-1/2 bg-radial-glow opacity-60"
      />

      <div className="relative">
        <Link href="/" aria-label="NexaFi home">
          <Logo />
        </Link>

        {success ? (
          <div className="mt-8 space-y-4 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
              <CheckCircle2 className="size-6" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Check your email
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Check your email to confirm your account.
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-2 h-10 w-full"
              nativeButton={false}
              render={<Link href="/sign-in" />}
            >
              Back to sign in
            </Button>
          </div>
        ) : (
          <>
            <h1 className="mt-8 text-2xl font-semibold tracking-tight">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isSignUp
                ? 'Join NexaFi and start building a clearer financial picture.'
                : 'Sign in to continue to your NexaFi workspace.'}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="Rishi Verma"
                    autoComplete="name"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  minLength={8}
                />
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                </div>
              )}

              {error && (
                <p
                  role="alert"
                  className={cn(
                    'rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive',
                  )}
                >
                  {error}
                </p>
              )}

              <Button type="submit" className="mt-2 h-10 w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {isSignUp ? 'Creating account…' : 'Signing in…'}
                  </>
                ) : (
                  <>
                    {isSignUp ? 'Create account' : 'Sign in'}
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {isSignUp ? (
                <>
                  Already have an account?{' '}
                  <Link
                    href="/sign-in"
                    className="font-medium text-foreground hover:underline"
                  >
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  New to NexaFi?{' '}
                  <Link
                    href="/sign-up"
                    className="font-medium text-foreground hover:underline"
                  >
                    Create an account
                  </Link>
                </>
              )}
            </p>
          </>
        )}

        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
          NexaFi provides educational financial insights and is not financial advice.
        </p>
      </div>
    </div>
  )
}
