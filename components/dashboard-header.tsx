'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import Link from 'next/link'
import MobileNav from '@/components/mobile-nav'
import JobLogo from '@/components/job-logo'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface DashboardHeaderProps {
  userEmail: string
  isAdmin?: boolean
}

export default function DashboardHeader({ userEmail, isAdmin }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const initials = userEmail.split('@')[0].slice(0, 2).toUpperCase()

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur shrink-0 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <MobileNav isAdmin={isAdmin} />
        <div className="md:hidden">
          <JobLogo size="sm" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link href="/profile" className="flex items-center gap-3 pl-3 border-l border-border">
          <Avatar className="h-9 w-9 cursor-pointer hover:opacity-80 transition-opacity">
            <AvatarFallback className="bg-gradient-to-br from-primary to-flame text-primary-foreground font-semibold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-foreground">{userEmail.split('@')[0]}</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
        </Link>
      </div>
    </header>
  )
}
