import Link from 'next/link'
import { Check, Quote } from 'lucide-react'
import { Logo } from '@/components/logo'

const points = [
  'Clear insights from everyday activity',
  'Smarter budgets that update in real time',
  'A single, honest financial health score',
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden border-r border-border/70 bg-card lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
        <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
        <div className="relative">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <div className="relative">
          <h2 className="max-w-sm text-balance text-3xl font-semibold leading-tight tracking-tight">
            Understand your money. Build your future.
          </h2>
          <ul className="mt-8 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Check className="size-4 text-primary" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative rounded-xl border border-border bg-background/60 p-5">
          <Quote className="size-5 text-primary" />
          <p className="mt-3 text-sm leading-relaxed text-foreground/90">
            “NexaFi finally made my finances feel calm. I open it every morning and
            know exactly where I stand.”
          </p>
          <p className="mt-3 text-xs text-muted-foreground">Ananya · Product Designer</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Link href="/">
            <Logo />
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Back to home
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  )
}
