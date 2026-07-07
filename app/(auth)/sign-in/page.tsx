import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthForm } from '@/components/auth/auth-form'
import { UnlockExperience } from '@/components/experience/unlock-experience'

export const metadata: Metadata = {
  title: 'Sign in — NexaFi',
  description: 'Sign in to your NexaFi workspace.',
}

export default function SignInPage() {
  return (
    <UnlockExperience>
      <Suspense>
        <AuthForm mode="sign-in" />
      </Suspense>
    </UnlockExperience>
  )
}
