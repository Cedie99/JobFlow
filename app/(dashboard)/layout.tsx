import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import Sidebar from '@/components/sidebar'
import DashboardHeader from '@/components/dashboard-header'
import AnnouncementsBanner from '@/components/announcements-banner'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userEmail={user.email ?? ''} isAdmin={isAdminEmail(user.email)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader userEmail={user.email ?? ''} />
        <main className="flex-1 overflow-y-auto bg-muted/30">
          <AnnouncementsBanner />
          {children}
        </main>
      </div>
    </div>
  )
}
