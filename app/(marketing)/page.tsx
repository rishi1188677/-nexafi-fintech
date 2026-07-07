import { HeroSection } from '@/components/landing/hero-section'
import { DashboardShowcase } from '@/components/landing/dashboard-showcase'
import { AiAgentShowcase } from '@/components/landing/ai-agent-showcase'
import { InteractiveAiDemo } from '@/components/landing/interactive-ai-demo'
import { FeaturesSection } from '@/components/landing/features-section'
import { DailyBriefingTeaser } from '@/components/landing/daily-briefing-teaser'
import { SecuritySection } from '@/components/landing/security-section'
import { CtaSection } from '@/components/landing/cta-section'

export const metadata = {
  title: 'NexaFi — Your AI Money Command Center',
  description:
    'NexaFi turns your real spending, budgets, goals, and recurring payments into clear daily insights — so you always know what changed, what matters, and what to do next.',
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <DashboardShowcase />
      <AiAgentShowcase />
      <InteractiveAiDemo />
      <FeaturesSection />
      <DailyBriefingTeaser />
      <SecuritySection />
      <CtaSection />
    </>
  )
}
