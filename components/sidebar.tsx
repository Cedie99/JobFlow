'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  FileText,
  LayoutDashboard,
  LogOut,
  BriefcaseBusiness,
  PanelLeftClose,
  PanelLeftOpen,
  Wand2,
  Layers,
  Zap,
  Shield,
  CreditCard,
  HelpCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import JobLogo from '@/components/job-logo'
import FeedbackDialog from '@/components/feedback-dialog'
import type { UsageStatus } from '@/types'

interface SidebarProps {
  userEmail: string
  isAdmin?: boolean
}

export const navGroups = [
  {
    label: 'General',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  
  {
    label: 'Resume Optimizer',
    items: [
      { href: '/resume', label: 'Resume Optimizer', icon: FileText },
    ],
  },
  {
    label: 'Interview Prep',
    items: [
      { href: '/interview-questions', label: 'Question Generator', icon: HelpCircle },
    ],
  },
  {
    label: 'Job Management',
    items: [
      { href: '/tracker', label: 'Application Tracker', icon: BriefcaseBusiness },
    ],
  },
  {
    label: 'For Career Shifting',
    items: [
      { href: '/profiles', label: 'Career Profiles', icon: Layers },
      { href: '/build', label: 'Build Resume', icon: Wand2 },
    ],
  },
]

export default function Sidebar({ userEmail, isAdmin }: SidebarProps) {
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

  return (
    <aside
      className={cn(
        'relative shrink-0 hidden md:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-full transition-[width] duration-200 ease-in-out overflow-hidden',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Ambient glow at the base */}
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-sidebar-primary/20 blur-3xl" />

      {/* ── Header ─────────────────────────────────────────── */}
      <div
        className={cn(
          'relative flex items-center h-14 px-3 border-b border-sidebar-border shrink-0',
          collapsed ? 'justify-center' : 'justify-between gap-2'
        )}
      >
        {!collapsed && (
          <div className="pl-1">
            <JobLogo size="md" light />
          </div>
        )}

        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex items-center justify-center rounded-md transition-colors shrink-0',
            'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent',
            collapsed ? 'h-9 w-9' : 'h-7 w-7'
          )}
        >
          {collapsed
            ? <PanelLeftOpen  className="h-4 w-4" />
            : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* ── Nav ────────────────────────────────────────────── */}
      <nav className={cn('relative flex-1 py-3', collapsed ? 'px-2' : 'px-3')}>
        {navGroups.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-4' : ''}>
            {/* Section label */}
            {group.label && !collapsed && (
              <p className="text-[9px] font-semibold uppercase tracking-widest text-sidebar-foreground/50 px-3 mb-1.5 select-none">
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
                          ? 'bg-sidebar-accent text-sidebar-foreground font-semibold nav-item-active'
                          : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground hover:translate-x-0.5'
                      )}
                    >
                      {/* Icon roundel */}
                      <span className={cn(
                        'inline-flex items-center justify-center w-7 h-7 rounded-md shrink-0 transition-colors duration-150',
                        isActive
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'group-hover:bg-sidebar-accent'
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

      {/* ── Admin ──────────────────────────────────────────── */}
      {isAdmin && (
        <div className={cn('relative px-3 mb-1', collapsed && 'px-2')}>
          {!collapsed && (
            <p className="text-[9px] font-semibold uppercase tracking-widest text-sidebar-foreground/50 px-3 mb-1.5 select-none">
              Admin
            </p>
          )}
          {collapsed && <div className="h-px bg-sidebar-border mx-1 mb-2 mt-1" />}
          <Link href="/admin" title={collapsed ? 'Admin Panel' : undefined}>
            <div className={cn(
              'group relative flex items-center gap-2.5 rounded-lg text-sm font-medium transition-all duration-150',
              collapsed ? 'justify-center p-2.5' : 'px-3 py-2',
              pathname.startsWith('/admin')
                ? 'bg-sidebar-accent text-sidebar-foreground font-semibold nav-item-active'
                : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground hover:translate-x-0.5'
            )}>
              <span className={cn(
                'inline-flex items-center justify-center w-7 h-7 rounded-md shrink-0',
                pathname.startsWith('/admin')
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'group-hover:bg-sidebar-accent'
              )}>
                <Shield className="h-4 w-4 shrink-0" />
              </span>
              {!collapsed && 'Admin Panel'}
            </div>
          </Link>
        </div>
      )}

      {/* ── Upgrade / Usage ────────────────────────────────── */}
      {usage && !usage.isSubscribed && !collapsed && (
        <div className="relative mx-3 mb-2 rounded-lg border border-sidebar-primary/40 bg-sidebar-accent/60 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-sidebar-foreground/70 font-medium">Free uses</span>
            <span className={cn(
              'font-semibold tabular-nums',
              usage.usesCount >= usage.limit ? 'text-red-300' : 'text-sidebar-foreground'
            )}>
              {usage.usesCount}/{usage.limit}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-sidebar-border overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                usage.usesCount >= usage.limit ? 'bg-destructive' : 'bg-sidebar-primary'
              )}
              style={{ width: `${Math.min((usage.usesCount / usage.limit) * 100, 100)}%` }}
            />
          </div>
          <Link href="/pricing" className="block">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sidebar-primary hover:brightness-110 transition-all">
              <Zap className="h-3 w-3" />
              Upgrade to Pro — unlimited
            </div>
          </Link>
        </div>
      )}

      {usage && !usage.isSubscribed && collapsed && (
        <div className="relative flex justify-center mb-1">
          <Link href="/pricing" title="Upgrade to Pro">
            <div className="flex items-center justify-center h-9 w-9 rounded-md text-sidebar-primary hover:bg-sidebar-accent transition-colors">
              <Zap className="h-4 w-4" />
            </div>
          </Link>
        </div>
      )}

      {/* ── Billing (Pro only) ─────────────────────────────── */}
      {usage?.isSubscribed && !collapsed && (
        <div className="relative mx-3 mb-2">
          <Link href="/pricing">
            <div className={cn(
              'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
              pathname === '/pricing'
                ? 'bg-sidebar-accent text-sidebar-foreground font-semibold'
                : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground hover:translate-x-0.5'
            )}>
              <span className={cn(
                'inline-flex items-center justify-center w-7 h-7 rounded-md shrink-0 transition-colors duration-150',
                pathname === '/pricing'
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'group-hover:bg-sidebar-accent'
              )}>
                <CreditCard className="h-4 w-4 shrink-0" />
              </span>
              Billing
            </div>
          </Link>
        </div>
      )}

      {usage?.isSubscribed && collapsed && (
        <div className="relative flex justify-center mb-1">
          <Link href="/pricing" title="Billing">
            <div className={cn(
              'flex items-center justify-center h-9 w-9 rounded-md transition-colors',
              pathname === '/pricing'
                ? 'bg-sidebar-accent text-sidebar-foreground'
                : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
            )}>
              <CreditCard className="h-4 w-4" />
            </div>
          </Link>
        </div>
      )}

      {/* ── Actions ─────────────────────────────────────────── */}
      <div className={cn(
        'relative border-t border-sidebar-border',
        collapsed ? 'flex flex-col items-center gap-1 p-2' : 'px-3 py-3'
      )}>
        {collapsed ? (
          <>
            <FeedbackDialog collapsed />
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="group flex items-center justify-center h-9 w-9 rounded-md text-sidebar-foreground/80 hover:text-red-300 hover:bg-red-900/30 transition-colors"
            >
              <LogOut className="h-4 w-4 transition-transform duration-150 group-hover:scale-110" />
            </button>
          </>
        ) : (
          <>
            <FeedbackDialog />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sidebar-foreground/80 hover:text-red-300 hover:bg-red-900/30 group"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2 transition-transform duration-150 group-hover:scale-110" />
              Sign out
            </Button>
          </>
        )}
      </div>
    </aside>
  )
}
