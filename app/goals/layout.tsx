import type { Metadata } from 'next'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { DashboardTopbar } from '@/components/dashboard/topbar'
import { DashboardStoreProvider } from '@/components/dashboard/store'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export const metadata: Metadata = {
  title: 'Savings Goals — NexaFi',
  description: 'Your NexaFi savings goals.',
}

export default function GoalsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardStoreProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardTopbar />
          <div className="flex-1 p-4 sm:p-6">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </DashboardStoreProvider>
  )
}
