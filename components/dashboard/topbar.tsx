'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

const titles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/transactions': 'Transactions',
  '/budgets': 'Budgets',
  '/goals': 'Goals',
  '/dashboard/insights': 'Insights',
  '/dashboard/assistant': 'AI Assistant',
  '/dashboard/settings': 'Settings',
}

export function DashboardTopbar() {
  const pathname = usePathname()
  const title = titles[pathname] ?? 'Dashboard'

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-xl sm:px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mx-1 h-5" />
      <h1 className="text-sm font-medium">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="sm" className="hidden sm:inline-flex" nativeButton={false} render={<Link href="/" />}>
          View site
          <ExternalLink className="size-3.5" />
        </Button>
      </div>
    </header>
  )
}
