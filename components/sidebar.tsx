'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  FileText,
  LayoutDashboard,
  LogOut,
  ClipboardList,
  PanelLeftClose,
  PanelLeftOpen,
  Wand2,
  Layers,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import JobLogo from '@/components/job-logo'
import type { UsageStatus } from '@/types'

interface SidebarProps {
  userEmail: string
}

const navGroups = [
  {
    label: null as string | null,
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'AI Resume Builder',
    items: [
      { href: '/profiles', label: 'Career Profiles', icon: Layers },
      { href: '/build', label: 'Build Resume', icon: Wand2 },
    ],
  },
  {
    label: null as string | null,
    items: [
      { href: '/resume', label: 'Resume Optimizer', icon: FileText },
      { href: '/tracker', label: 'Application Tracker', icon: ClipboardList },
    ],
  },
]

export default function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [collapsed, setCollapsed] = useState(false)
  const [usage, setUsage] = useState<UsageStatus | null>(null)

  useEffect(() => {
    fetch('/api/usage')
      .then(r => r.ok ? r.json() : null)
      .then(data => setUsage(data))
      .catch(() => {})
  }, [pathname])

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/login')
    router.refresh()
  }

  const initials = userEmail.split('@')[0].slice(0, 2).toUpperCase()

  return (
    <aside
      className={cn(
        'shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border h-full transition-[width] duration-200 ease-in-out overflow-hidden',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div
        className={cn(
          'flex items-center h-14 px-3 border-b border-sidebar-border shrink-0',
          collapsed ? 'justify-center' : 'justify-between gap-2'
        )}
      >
        {!collapsed && (
          <div className="pl-1">
            <JobLogo size="md" />
          </div>
        )}

        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex items-center justify-center rounded-md transition-colors shrink-0',
            'text-muted-foreground hover:text-foreground hover:bg-sidebar-accent',
            collapsed ? 'h-9 w-9' : 'h-7 w-7'
          )}
        >
          {collapsed
            ? <PanelLeftOpen  className="h-4 w-4" />
            : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* ── Nav ────────────────────────────────────────────── */}
      <nav className={cn('flex-1 py-3', collapsed ? 'px-2' : 'px-3')}>
        {navGroups.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-4' : ''}>
            {/* Section label */}
            {group.label && !collapsed && (
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/40 px-3 mb-1.5 select-none">
                {group.label}
              </p>
            )}
            {/* Collapsed divider */}
            {group.label && collapsed && (
              <div className="h-px bg-sidebar-border mx-1 mb-2 mt-1" />
            )}

            <div className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                return (
                  <Link key={href} href={href} title={collapsed ? label : undefined}>
                    <div
                      className={cn(
                        'group relative flex items-center gap-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                        collapsed ? 'justify-center p-2.5' : 'px-3 py-2',
                        isActive
                          ? 'bg-primary/[0.08] text-primary font-semibold ring-1 ring-primary/[0.12]'
                          : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground hover:translate-x-0.5'
                      )}
                    >
                      {/* Left accent bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-primary rounded-r-full" />
                      )}

                      {/* Icon roundel */}
                      <span className={cn(
                        'inline-flex items-center justify-center w-7 h-7 rounded-md shrink-0 transition-colors duration-150',
                        isActive
                          ? 'bg-primary/15'
                          : 'group-hover:bg-primary/[0.06]'
                      )}>
                        <Icon className={cn(
                          'h-4 w-4 shrink-0 transition-transform duration-150',
                          !isActive && 'group-hover:scale-110'
                        )} />
                      </span>

                      {!collapsed && label}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Upgrade / Usage ────────────────────────────────── */}
      {usage && !usage.isSubscribed && !collapsed && (
        <div className="mx-3 mb-2 rounded-lg border border-dashed border-primary/30 bg-primary/[0.04] p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Free uses</span>
            <span className={cn(
              'font-semibold tabular-nums',
              usage.usesCount >= usage.limit ? 'text-destructive' : 'text-foreground'
            )}>
              {usage.usesCount}/{usage.limit}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                usage.usesCount >= usage.limit ? 'bg-destructive' : 'bg-primary'
              )}
              style={{ width: `${Math.min((usage.usesCount / usage.limit) * 100, 100)}%` }}
            />
          </div>
          <Link href="/pricing" className="block">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors">
              <Zap className="h-3 w-3" />
              Upgrade to Pro — unlimited
            </div>
          </Link>
        </div>
      )}

      {usage && !usage.isSubscribed && collapsed && (
        <div className="flex justify-center mb-1">
          <Link href="/pricing" title="Upgrade to Pro">
            <div className="flex items-center justify-center h-9 w-9 rounded-md text-primary hover:bg-primary/10 transition-colors">
              <Zap className="h-4 w-4" />
            </div>
          </Link>
        </div>
      )}

      {/* ── User ───────────────────────────────────────────── */}
      <div className={cn(
        'border-t border-sidebar-border',
        collapsed ? 'flex flex-col items-center gap-1 p-2' : 'px-3 py-3'
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3 mb-2 px-1">
            <Avatar className="h-7 w-7 shrink-0 ring-2 ring-primary/20">
              <AvatarFallback className="text-[10px] bg-primary text-primary-foreground font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground/80 truncate max-w-[130px]">
                {userEmail.split('@')[0]}
              </p>
              <p className="text-[10px] text-muted-foreground truncate max-w-[130px]">
                {userEmail}
              </p>
            </div>
          </div>
        )}

        {collapsed ? (
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="group flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4 transition-transform duration-150 group-hover:scale-110" />
          </button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-red-50 group"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2 transition-transform duration-150 group-hover:scale-110" />
            Sign out
          </Button>
        )}
      </div>
    </aside>
  )
}
