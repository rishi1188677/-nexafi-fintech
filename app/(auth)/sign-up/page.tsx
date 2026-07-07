import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthForm } from '@/components/auth/auth-form'
import { UnlockExperience } from '@/components/experience/unlock-experience'

export const metadata: Metadata = {
  title: 'Create account — NexaFi',
  description: 'Create your NexaFi account and start managing smarter.',
}

export default function SignUpPage() {
  return (
    <UnlockExperience>
      <Suspense>
        <AuthForm mode="sign-up" />
      </Suspense>
    </UnlockExperience>
  )
}
