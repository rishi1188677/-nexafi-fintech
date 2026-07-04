import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/auth-form'

export const metadata: Metadata = {
  title: 'Create account — NexaFi',
  description: 'Create your NexaFi account and start managing smarter.',
}

export default function SignUpPage() {
  return <AuthForm mode="sign-up" />
}
