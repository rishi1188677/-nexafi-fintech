import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/auth-form'

export const metadata: Metadata = {
  title: 'Get started — NexaFi',
  description: 'Create your NexaFi workspace and start managing smarter.',
}

export default function GetStartedPage() {
  return <AuthForm mode="signup" />
}
