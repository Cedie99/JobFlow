import { redirect } from 'next/navigation'
import { getUser } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import AdminNav from './_components/admin-nav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  if (!user || !isAdminEmail(user.email)) {
    redirect('/dashboard')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminNav />
      <main className="flex-1 overflow-y-auto bg-muted/30">
        {children}
      </main>
    </div>
  )
}
