import type { Metadata } from 'next'
import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { DashboardTopbar } from '@/components/dashboard/topbar'
import { DashboardStoreProvider } from '@/components/dashboard/store'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export const metadata: Metadata = {
  title: 'AI Assistant — NexaFi',
  description: 'Your NexaFi AI Financial Coach.',
}

export default function AiAssistantLayout({
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
