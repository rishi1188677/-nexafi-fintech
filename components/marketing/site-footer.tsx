import Link from 'next/link'
import { Logo } from '@/components/logo'

const columns = [
  {
    title: 'Product',
    links: [
      { href: '/features', label: 'Features' },
      { href: '/product', label: 'Product overview' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/dashboard', label: 'Live demo' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/security', label: 'Security & privacy' },
      { href: '/features', label: 'Why NexaFi' },
      { href: '/get-started', label: 'Get started' },
      { href: '/signin', label: 'Sign in' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/product', label: 'Documentation' },
      { href: '/security', label: 'Trust center' },
      { href: '/features', label: 'Changelog' },
      { href: '/pricing', label: 'Support' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Financial intelligence for young professionals. Clear insights,
              smarter budgets, better decisions.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-medium text-foreground">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border/70 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} NexaFi. A product experience demo. Not a
            bank and not financial advice.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/security" className="text-xs text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
            <Link href="/security" className="text-xs text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="/security" className="text-xs text-muted-foreground hover:text-foreground">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
