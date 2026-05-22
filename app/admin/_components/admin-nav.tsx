'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  MessageSquare,
  Bell,
  ArrowLeft,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
  { href: '/admin/announcements', label: 'Announcements', icon: Bell },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <aside className="shrink-0 flex flex-col w-56 bg-sidebar border-r border-sidebar-border h-full">
      {/* Header */}
      <div className="flex items-center gap-2.5 h-14 px-4 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-amber-500/15">
          <Shield className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <span className="text-sm font-semibold text-foreground">Admin Panel</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link key={href} href={href}>
              <div className={cn(
                'group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold ring-1 ring-amber-500/20'
                  : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground hover:translate-x-0.5'
              )}>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-amber-500 rounded-r-full" />
                )}
                <span className={cn(
                  'inline-flex items-center justify-center w-7 h-7 rounded-md shrink-0',
                  isActive ? 'bg-amber-500/15' : 'group-hover:bg-amber-500/10'
                )}>
                  <Icon className="h-4 w-4 shrink-0" />
                </span>
                {label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Back link */}
      <div className="px-3 py-3 border-t border-sidebar-border">
        <Link href="/dashboard">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </span>
            Back to App
          </div>
        </Link>
      </div>
    </aside>
  )
}
