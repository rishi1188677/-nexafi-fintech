'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AuthForm({ mode }: { mode: 'signin' | 'signup' }) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const isSignup = mode === 'signup'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    // Demo only — no real authentication. Route into the product workspace.
    setTimeout(() => router.push('/dashboard'), 700)
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        {isSignup ? 'Create your account' : 'Welcome back'}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {isSignup
          ? 'Start managing smarter with a realistic demo workspace.'
          : 'Sign in to continue to your NexaFi workspace.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {isSignup && (
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" placeholder="Rishi Verma" autoComplete="name" required />
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {!isSignup && (
              <button type="button" className="text-xs text-muted-foreground hover:text-foreground">
                Forgot password?
              </button>
            )}
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            required
          />
        </div>

        <Button type="submit" className="mt-2 h-10 w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {isSignup ? 'Creating account…' : 'Signing in…'}
            </>
          ) : (
            <>
              {isSignup ? 'Create account' : 'Sign in'}
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isSignup ? 'Already have an account? ' : "Don't have an account? "}
        <Link
          href={isSignup ? '/signin' : '/get-started'}
          className="font-medium text-foreground hover:underline"
        >
          {isSignup ? 'Sign in' : 'Get started'}
        </Link>
      </p>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Demo experience. No real account is created and no bank is connected.
      </p>
    </div>
  )
}
