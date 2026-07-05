'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ArrowLeftRight,
  LayoutDashboard,
  LineChart,
  Settings,
  Sparkles,
  Target,
  Wallet,
  LogOut,
} from 'lucide-react'
import { Logo } from '@/components/logo'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useProfile, getDisplayName, getInitials } from './profile-context'

const mainNav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/budgets', label: 'Budgets', icon: Wallet },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/dashboard/insights', label: 'Insights', icon: LineChart },
  { href: '/dashboard/assistant', label: 'AI Assistant', icon: Sparkles },
]

const secondaryNav = [{ href: '/settings', label: 'Settings', icon: Settings }]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, loading, signOut } = useProfile()

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  const displayName = getDisplayName(profile, user)
  const initials = getInitials(displayName)
  const email = user?.email || ''

  async function handleSignOut() {
    await signOut()
    router.push('/')
    router.refresh()
  }

  const footerContent = (
    <button className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:px-0 transition-colors duration-150 border-none bg-transparent outline-none">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-medium text-primary">
        {loading ? '' : initials}
      </span>
      <div className="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
        {loading ? (
          <div className="space-y-1.5">
            <div className="h-3 w-20 bg-muted/40 animate-pulse rounded" />
            <div className="h-2.5 w-28 bg-muted/30 animate-pulse rounded" />
          </div>
        ) : (
          <>
            <p className="truncate text-sm font-medium text-foreground">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </>
        )}
      </div>
    </button>
  )

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center px-2 py-1.5">
          <Logo />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                     isActive={isActive(item.href)}
                     tooltip={item.label}
                     render={
                       <Link href={item.href}>
                         <item.icon />
                         <span>{item.label}</span>
                       </Link>
                     }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {secondaryNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                     isActive={isActive(item.href)}
                     tooltip={item.label}
                     render={
                       <Link href={item.href}>
                         <item.icon />
                         <span>{item.label}</span>
                       </Link>
                     }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        {loading ? (
          <div className="flex items-center gap-2.5 px-1.5 py-1.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/5 text-sm font-medium text-primary animate-pulse" />
            <div className="min-w-0 flex-1 space-y-1.5 group-data-[collapsible=icon]:hidden">
              <div className="h-3 w-20 bg-muted/40 animate-pulse rounded" />
              <div className="h-2.5 w-28 bg-muted/30 animate-pulse rounded" />
            </div>
          </div>
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger render={footerContent} />
            <DropdownMenuContent className="w-56 bg-card border border-border/80 text-foreground" align="end" side="top">
              <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer gap-2">
                <Settings className="size-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/60" />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive">
                <LogOut className="size-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </SidebarFooter>
    </Sidebar>
  )
}
