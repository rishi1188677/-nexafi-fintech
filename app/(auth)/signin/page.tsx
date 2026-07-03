import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/auth-form'

export const metadata: Metadata = {
  title: 'Sign in — NexaFi',
  description: 'Sign in to your NexaFi workspace.',
}

export default function SignInPage() {
  return <AuthForm mode="signin" />
}
