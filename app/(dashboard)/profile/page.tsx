import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, getUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
  Zap,
  Mail,
  CalendarDays,
  ClipboardList,
  Trophy,
  Sparkles,
  CheckCircle2,
  CreditCard,
} from 'lucide-react'
import BillingButton from './_components/billing-button'

export default async function ProfilePage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = await createClient()
  const admin = createAdminClient()

  const [
    { data: sub },
    { data: usage },
    { data: apps },
  ] = await Promise.all([
    admin
      .from('user_subscriptions')
      .select('status, renews_at, ends_at')
      .eq('user_id', user.id)
      .maybeSingle(),
    admin
      .from('user_usage')
      .select('ai_uses_count')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('job_applications')
      .select('status'),
  ])

  const isSubscribed = sub?.status === 'active' || sub?.status === 'on_trial'
  const aiUses = usage?.ai_uses_count ?? 0
  const totalApps = apps?.length ?? 0
  const interviews = apps?.filter(a => a.status === 'interview').length ?? 0
  const offers = apps?.filter(a => a.status === 'offer').length ?? 0

  const initials = (user.email ?? '').split('@')[0].slice(0, 2).toUpperCase()
  const displayName = (user.email ?? '').split('@')[0]
  const memberSince = user.created_at
    ? format(new Date(user.created_at), 'MMMM d, yyyy')
    : null

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">

      {/* ── Page title ─────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your account details and plan</p>
      </div>

      {/* ── Identity card — full width ─────────────────────── */}
      <div className="rounded-xl border border-border bg-card p-5 flex items-center gap-5">
        <div className={cn(
          'h-14 w-14 rounded-full shrink-0 flex items-center justify-center text-lg font-bold text-primary-foreground ring-4',
          isSubscribed ? 'bg-primary ring-amber-400/30' : 'bg-primary ring-primary/15'
        )}>
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-semibold capitalize">{displayName}</h2>
            {isSubscribed && (
              <Badge className="h-4 px-1.5 text-[9px] font-bold tracking-wide bg-amber-400/15 text-amber-600 border-amber-400/30 dark:text-amber-400">
                PRO
              </Badge>
            )}
          </div>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-0.5 mt-1">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              {user.email}
            </span>
            {memberSince && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                <CalendarDays className="h-3 w-3 shrink-0" />
                Member since {memberSince}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Two-column layout ──────────────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-5">

        {/* ── Left: Plan & Billing ───────────────────────────── */}
        <div className={cn(
          'rounded-xl border bg-card p-6',
          isSubscribed
            ? 'border-amber-300/40 bg-amber-50/30 dark:bg-amber-950/10'
            : 'border-border'
        )}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Current Plan
          </p>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              {isSubscribed ? (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-amber-500 shrink-0" />
                    <span className="text-xl font-bold text-amber-600 dark:text-amber-400">Pro</span>
                  </div>
                  {sub?.renews_at && (
                    <p className="text-sm text-muted-foreground">
                      Renews {format(new Date(sub.renews_at), 'MMMM d, yyyy')}
                    </p>
                  )}
                  {sub?.ends_at && sub.status === 'cancelled' && (
                    <p className="text-sm text-amber-600">
                      Access until {format(new Date(sub.ends_at), 'MMMM d, yyyy')}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground/60">₱299/month · Unlimited AI access</p>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold">Free</p>
                  <p className="text-sm text-muted-foreground">{aiUses} of 3 free AI uses used</p>
                  <p className="text-xs text-muted-foreground/60">Upgrade for unlimited AI access</p>
                </>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {isSubscribed ? (
                <BillingButton />
              ) : (
                <Link href="/pricing">
                  <Button size="sm" className="gap-2">
                    <Zap className="h-3.5 w-3.5" />
                    Upgrade to Pro
                  </Button>
                </Link>
              )}
              <Link href="/pricing">
                <Button variant="ghost" size="sm" className="text-muted-foreground w-full gap-1.5 text-xs justify-center">
                  <CreditCard className="h-3.5 w-3.5" />
                  View pricing
                </Button>
              </Link>
            </div>
          </div>

          {/* AI usage bar — free only */}
          {!isSubscribed && (
            <div className="mt-5 pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">AI uses remaining</span>
                <span className={cn(
                  'text-xs font-semibold tabular-nums',
                  aiUses >= 3 ? 'text-destructive' : 'text-foreground'
                )}>
                  {3 - aiUses} left
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    aiUses >= 3 ? 'bg-destructive' : 'bg-primary'
                  )}
                  style={{ width: `${Math.min((aiUses / 3) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Stats ───────────────────────────────────── */}
        <div className="space-y-3">
          {/* Stat rows */}
          {[
            {
              icon: ClipboardList,
              label: 'Total Applications',
              value: totalApps,
              color: 'text-primary',
              bg: 'bg-primary/10',
            },
            {
              icon: Trophy,
              label: 'Interviews',
              value: interviews,
              color: 'text-violet-500',
              bg: 'bg-violet-500/10',
            },
            {
              icon: Sparkles,
              label: 'Offers Received',
              value: offers,
              color: 'text-emerald-500',
              bg: 'bg-emerald-500/10',
            },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-card px-5 py-4 flex items-center gap-4"
            >
              <div className={cn('inline-flex items-center justify-center w-9 h-9 rounded-lg shrink-0', bg)}>
                <Icon className={cn('h-4.5 w-4.5', color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
              <p className="text-2xl font-bold tabular-nums shrink-0">{value}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
