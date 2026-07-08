'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'
import { Menu, LogOut, Shield, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import JobLogo from '@/components/job-logo'
import FeedbackDialog from '@/components/feedback-dialog'
import { navGroups } from '@/components/sidebar'

interface MobileNavProps {
  isAdmin?: boolean
}

export default function MobileNav({ isAdmin }: MobileNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)

  // Close the drawer whenever navigation happens
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  async function handleSignOut() {
    await supabase.auth.signOut()
    toast.success('Signed out')
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="md:hidden flex items-center justify-center h-9 w-9 rounded-md text-foreground hover:bg-muted transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="w-72 max-w-[85vw] p-0 bg-sidebar text-sidebar-foreground border-sidebar-border flex flex-col gap-0 overflow-y-auto"
        >
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>

          <div className="flex items-center h-14 px-4 border-b border-sidebar-border shrink-0">
            <JobLogo size="md" light />
          </div>

          <nav className="flex-1 py-3 px-3">
            {navGroups.map((group, gi) => (
              <div key={gi} className={gi > 0 ? 'mt-4' : ''}>
                {group.label && (
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-sidebar-foreground/50 px-3 mb-1.5 select-none">
                    {group.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {group.items.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                    return (
                      <Link key={href} href={href}>
                        <div
                          className={cn(
                            'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-sidebar-accent text-sidebar-foreground font-semibold nav-item-active'
                              : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                          )}
                        >
                          <span className={cn(
                            'inline-flex items-center justify-center w-7 h-7 rounded-md shrink-0',
                            isActive && 'bg-sidebar-primary text-sidebar-primary-foreground'
                          )}>
                            <Icon className="h-4 w-4" />
                          </span>
                          {label}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}

            {isAdmin && (
              <div className="mt-4">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-sidebar-foreground/50 px-3 mb-1.5 select-none">
                  Admin
                </p>
                <Link href="/admin">
                  <div className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    pathname.startsWith('/admin')
                      ? 'bg-sidebar-accent text-sidebar-foreground font-semibold nav-item-active'
                      : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                  )}>
                    <span className={cn(
                      'inline-flex items-center justify-center w-7 h-7 rounded-md shrink-0',
                      pathname.startsWith('/admin') && 'bg-sidebar-primary text-sidebar-primary-foreground'
                    )}>
                      <Shield className="h-4 w-4" />
                    </span>
                    Admin Panel
                  </div>
                </Link>
              </div>
            )}

            <div className="mt-4">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-sidebar-foreground/50 px-3 mb-1.5 select-none">
                Account
              </p>
              <Link href="/pricing">
                <div className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  pathname === '/pricing'
                    ? 'bg-sidebar-accent text-sidebar-foreground font-semibold nav-item-active'
                    : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                )}>
                  <span className={cn(
                    'inline-flex items-center justify-center w-7 h-7 rounded-md shrink-0',
                    pathname === '/pricing' && 'bg-sidebar-primary text-sidebar-primary-foreground'
                  )}>
                    <CreditCard className="h-4 w-4" />
                  </span>
                  Plans &amp; Billing
                </div>
              </Link>
            </div>
          </nav>

          <div className="border-t border-sidebar-border px-3 py-3 shrink-0">
            <FeedbackDialog />
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:text-red-300 hover:bg-red-900/30 transition-colors"
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-md shrink-0">
                <LogOut className="h-4 w-4" />
              </span>
              Sign out
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
