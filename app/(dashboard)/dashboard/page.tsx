import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/supabase/server'
import DashboardCharts from '@/components/dashboard-charts'
import { getDashboardData } from '@/lib/dashboard-data'
import { Button } from '@/components/ui/button'
import {
  ClipboardList, Plus, AlertCircle, CheckCircle2,
  Bell, TrendingUp, TrendingDown, Minus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  format, isBefore, isToday, isTomorrow,
  addDays, subDays, startOfDay, startOfWeek,
  differenceInCalendarDays,
} from 'date-fns'

const PIPELINE_STAGES = [
  { key: 'applied',   label: 'Applied',   color: 'bg-blue-500',    track: 'bg-blue-100' },
  { key: 'screening', label: 'Screening', color: 'bg-amber-500',   track: 'bg-amber-100' },
  { key: 'interview', label: 'Interview', color: 'bg-violet-500',  track: 'bg-violet-100' },
  { key: 'offer',     label: 'Offer',     color: 'bg-emerald-500', track: 'bg-emerald-100' },
] as const

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default async function DashboardPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const { stats, pipeline, followUps, allApplications, staleApps, noFollowUpCount } =
    await getDashboardData(user.id)

  const today = startOfDay(new Date())
  const total = stats.total
  const displayName = user.email?.split('@')[0] ?? 'there'

  // Follow-up buckets
  const overdueFollowUps = followUps.filter((a) =>
    isBefore(new Date(`${a.next_follow_up}T00:00:00`), today)
  )
  const soonFollowUps = followUps.filter((a) => {
    const d = new Date(`${a.next_follow_up}T00:00:00`)
    return !isBefore(d, today) && d <= addDays(today, 3)
  })
  const allFollowUps = followUps.slice(0, 8)

  // Weekly stats
  const mondayThisWeek = startOfWeek(today, { weekStartsOn: 1 })
  const mondayLastWeek = subDays(mondayThisWeek, 7)
  const sundayLastWeek = subDays(mondayThisWeek, 1)

  const thisWeekCount = (allApplications ?? []).filter((a) => {
    if (!a.applied_date) return false
    const d = new Date(a.applied_date + 'T00:00:00')
    return d >= mondayThisWeek && d <= today
  }).length

  const lastWeekCount = (allApplications ?? []).filter((a) => {
    if (!a.applied_date) return false
    const d = new Date(a.applied_date + 'T00:00:00')
    return d >= mondayLastWeek && d <= sundayLastWeek
  }).length

  const dailyCounts = WEEK_DAYS.map((_, i) => {
    const day = addDays(mondayThisWeek, i)
    const dayStr = format(day, 'yyyy-MM-dd')
    return (allApplications ?? []).filter((a) => a.applied_date === dayStr).length
  })
  const maxDaily = Math.max(...dailyCounts, 1)
  const weekDiff = thisWeekCount - lastWeekCount

  const hasActions = overdueFollowUps.length > 0 || staleApps.length > 0 || noFollowUpCount > 0

  const STAT_COLS = [
    { label: 'Applied',    value: total,             color: 'text-foreground' },
    { label: 'Active',     value: stats.active,      color: 'text-emerald-600' },
    { label: 'Interviews', value: stats.interviews,  color: 'text-violet-600' },
    { label: 'Offers',     value: stats.offers,      color: 'text-amber-600' },
  ]

  return (
    <div className="p-6 space-y-4">

      {/* ── Header strip ────────────────────────────────────── */}
      <div className="rounded-2xl border bg-gradient-to-br from-primary/[0.06] via-card to-card px-7 py-5 flex items-center justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Good {getGreeting()}, {displayName} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Inline stat pills */}
        <div className="flex items-stretch divide-x rounded-xl border bg-background/80 overflow-hidden shadow-sm">
          {STAT_COLS.map((s) => (
            <div key={s.label} className="flex flex-col items-center justify-center px-6 py-3 min-w-[84px]">
              <span className={cn('text-2xl font-bold tabular-nums leading-none', s.color)}>
                {s.value}
              </span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row: Today's Focus (2/3) + This Week (1/3) ──────── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Today's Focus */}
        <div className="col-span-2 rounded-2xl border bg-card flex flex-col">
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <div className="flex items-center gap-2">
              {hasActions
                ? <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                : <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
              <span className="text-base font-semibold">Today&apos;s Focus</span>
            </div>
          </div>

          <div className="px-6 pb-6 flex-1 space-y-2.5">
            {total === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center rounded-xl bg-muted/40">
                <ClipboardList className="h-7 w-7 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No applications yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1 mb-3">Start tracking your job search</p>
                <Link href="/tracker">
                  <Button size="sm" variant="outline">
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add your first application
                  </Button>
                </Link>
              </div>
            ) : !hasActions ? (
              <div className="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-4">
                <div className="rounded-full bg-emerald-100 p-1.5 shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">You&apos;re all caught up!</p>
                  <p className="text-xs text-emerald-700/70 mt-0.5 leading-relaxed">
                    No overdue follow-ups and all active applications are up to date.
                    Keep applying to build momentum.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {overdueFollowUps.length > 0 && (
                  <div className="group flex items-center gap-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0 animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-red-800">
                        {overdueFollowUps.length} overdue follow-up{overdueFollowUps.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-red-600/70 mt-0.5 truncate">
                        {overdueFollowUps.slice(0, 3).map((a) => a.company_name).join('  ·  ')}
                        {overdueFollowUps.length > 3 && `  +${overdueFollowUps.length - 3} more`}
                      </p>
                    </div>
                    <Link href="/tracker">
                      <Button variant="ghost" size="sm" className="shrink-0 text-red-700 hover:bg-red-100 h-7 text-xs px-2.5">
                        View →
                      </Button>
                    </Link>
                  </div>
                )}

                {staleApps.length > 0 && (
                  <div className="flex items-center gap-4 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-amber-800">
                        {staleApps.length} application{staleApps.length !== 1 ? 's' : ''} not updated in 2+ weeks
                      </p>
                      <p className="text-xs text-amber-700/70 mt-0.5 truncate">
                        {staleApps.slice(0, 3).map((a) => a.company_name).join('  ·  ')}
                        {staleApps.length > 3 && `  +${staleApps.length - 3} more`}
                      </p>
                    </div>
                    <Link href="/tracker">
                      <Button variant="ghost" size="sm" className="shrink-0 text-amber-700 hover:bg-amber-100 h-7 text-xs px-2.5">
                        Review →
                      </Button>
                    </Link>
                  </div>
                )}

                {noFollowUpCount > 0 && (
                  <div className="flex items-center gap-4 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-blue-800">
                        {noFollowUpCount} active application{noFollowUpCount !== 1 ? 's' : ''} without a follow-up date
                      </p>
                      <p className="text-xs text-blue-700/70 mt-0.5">
                        Set reminders so nothing falls through the cracks
                      </p>
                    </div>
                    <Link href="/tracker">
                      <Button variant="ghost" size="sm" className="shrink-0 text-blue-700 hover:bg-blue-100 h-7 text-xs px-2.5">
                        Set dates →
                      </Button>
                    </Link>
                  </div>
                )}

                {soonFollowUps.length > 0 && overdueFollowUps.length === 0 && (
                  <p className="text-xs text-muted-foreground pl-1 pt-0.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400 mr-1.5 align-middle" />
                    {soonFollowUps.length} follow-up{soonFollowUps.length !== 1 ? 's' : ''} due within 3 days
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* This Week */}
        <div className="rounded-2xl border bg-card px-6 py-5 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <span className="text-base font-semibold">This Week</span>
            {(weekDiff !== 0 || lastWeekCount > 0) && (
              <span className={cn(
                'flex items-center gap-1 text-xs font-medium',
                weekDiff > 0 ? 'text-emerald-600' : weekDiff < 0 ? 'text-red-500' : 'text-muted-foreground'
              )}>
                {weekDiff > 0 ? <TrendingUp className="h-3.5 w-3.5" /> :
                 weekDiff < 0 ? <TrendingDown className="h-3.5 w-3.5" /> :
                 <Minus className="h-3.5 w-3.5" />}
                {weekDiff > 0 ? `+${weekDiff}` : weekDiff}
              </span>
            )}
          </div>

          <div className="mb-1">
            <span className="text-5xl font-bold tabular-nums leading-none">{thisWeekCount}</span>
            <p className="text-xs text-muted-foreground mt-1.5">
              application{thisWeekCount !== 1 ? 's' : ''} applied
              {lastWeekCount > 0 && (
                <span className="text-muted-foreground/50"> · {lastWeekCount} last week</span>
              )}
            </p>
          </div>

          {/* Daily bars — pushed to bottom */}
          <div className="flex items-end gap-1.5 mt-auto pt-5">
            {WEEK_DAYS.map((day, i) => {
              const count = dailyCounts[i]
              const dayDate = addDays(mondayThisWeek, i)
              const isPast = dayDate <= today
              const barH = count === 0 ? 3 : Math.max(8, Math.round((count / maxDaily) * 48))
              return (
                <div key={day} className="flex flex-col items-center gap-1.5 flex-1">
                  <div
                    className={cn(
                      'w-full rounded-sm transition-all duration-300',
                      count > 0
                        ? 'bg-primary'
                        : isPast
                          ? 'bg-muted-foreground/15'
                          : 'bg-muted/30'
                    )}
                    style={{ height: `${barH}px` }}
                  />
                  <span className="text-[9px] font-medium text-muted-foreground/50 leading-none">
                    {day[0]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Row: Activity chart (1/2) + Follow-ups (1/2) ────── */}
      <div className="grid grid-cols-2 gap-4">
        <DashboardCharts applications={allApplications || []} />

        {/* Follow-ups */}
        <div className="rounded-2xl border bg-card px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-base font-semibold">Follow-ups</span>
            </div>
            {allFollowUps.length > 0 && (
              <Link href="/tracker">
                <Button variant="ghost" size="sm" className="text-[10px] text-muted-foreground hover:text-primary h-6 px-2 -mr-1">
                  See all
                </Button>
              </Link>
            )}
          </div>

          {allFollowUps.length > 0 ? (
            <div className="space-y-2.5">
              {allFollowUps.map((app) => {
                const d = new Date(`${app.next_follow_up}T00:00:00`)
                const overdue = isBefore(d, today)
                const dueToday = isToday(d)
                const dueTomorrow = isTomorrow(d)
                const daysOut = differenceInCalendarDays(d, today)

                const dot = overdue ? 'bg-red-500' : (dueToday || dueTomorrow) ? 'bg-amber-400' : 'bg-primary/30'
                const label = overdue ? 'Overdue' : dueToday ? 'Today' : dueTomorrow ? 'Tomorrow' : `In ${daysOut}d`
                const labelCls = overdue ? 'text-red-600' : (dueToday || dueTomorrow) ? 'text-amber-600' : 'text-muted-foreground'

                return (
                  <div key={app.id} className="flex items-start gap-2.5">
                    <div className={cn('mt-1.5 h-1.5 w-1.5 rounded-full shrink-0', dot)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{app.company_name}</p>
                      {app.job_title && (
                        <p className="text-[10px] text-muted-foreground truncate">{app.job_title}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn('text-[10px] font-semibold', labelCls)}>{label}</p>
                      <p className="text-[10px] text-muted-foreground/50">{format(d, 'MMM d')}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 rounded-xl bg-muted/30">
              <Bell className="h-5 w-5 text-muted-foreground/30 mb-2" />
              <p className="text-xs font-medium text-muted-foreground">No follow-ups scheduled</p>
              <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                Set follow-up dates in your applications
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Pipeline ────────────────────────────────────────── */}
      <div className="rounded-2xl border bg-card px-6 py-5">
        <div className="flex items-center justify-between mb-5">
          <span className="text-base font-semibold">Pipeline</span>
          {total > 0 && (
            <span className="text-xs text-muted-foreground">{total} total</span>
          )}
        </div>

        {total > 0 ? (
          <div className="grid grid-cols-4 gap-6">
            {PIPELINE_STAGES.map(({ key, label, color, track }) => {
              const count = pipeline.stages[key] ?? 0
              const pct = Math.round((count / total) * 100)
              return (
                <div key={key}>
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">{label}</span>
                    <span className="text-lg font-bold tabular-nums leading-none">{count}</span>
                  </div>
                  <div className={cn('h-1.5 rounded-full overflow-hidden', track)}>
                    <div
                      className={cn('h-full rounded-full transition-all duration-700', color)}
                      style={{ width: pct > 0 ? `${Math.max(pct, 3)}%` : '0%' }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 mt-1">{pct}%</p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 rounded-xl bg-muted/30">
            <ClipboardList className="h-6 w-6 text-muted-foreground/30 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Pipeline is empty</p>
            <p className="text-xs text-muted-foreground/60 mt-1 mb-3">Track applications to see your funnel</p>
            <Link href="/tracker">
              <Button variant="outline" size="sm">
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Get started
              </Button>
            </Link>
          </div>
        )}

        {pipeline.closed > 0 && total > 0 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <span className="text-xs text-muted-foreground/60">Closed (rejected · withdrawn · ghosted · expired)</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground/40">
                {Math.round((pipeline.closed / total) * 100)}%
              </span>
              <span className="text-sm font-semibold tabular-nums">{pipeline.closed}</span>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
