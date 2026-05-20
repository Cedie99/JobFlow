import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatsCards from '@/components/stats-cards'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FileText, ClipboardList, Plus, AlertCircle, CheckCircle2,
  ExternalLink, Bell, Calendar, ArrowRight, Layers, Wand2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNowStrict, isBefore, isToday, isTomorrow, addDays, startOfDay, differenceInCalendarDays } from 'date-fns'
import type { JobApplication } from '@/types'

const STATUS_BADGE: Record<string, string> = {
  applied: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  screening: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  interview: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  offer: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  rejected: 'bg-red-50 text-red-600 ring-1 ring-red-200',
  withdrawn: 'bg-zinc-100 text-zinc-600 ring-1 ring-zinc-300',
}

const PIPELINE_STAGES = [
  { key: 'applied',   label: 'Applied',   color: 'bg-blue-500' },
  { key: 'screening', label: 'Screening', color: 'bg-amber-500' },
  { key: 'interview', label: 'Interview', color: 'bg-violet-500' },
  { key: 'offer',     label: 'Offer',     color: 'bg-emerald-500' },
] as const

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: recentApps } = await supabase
    .from('job_applications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: allApps } = await supabase
    .from('job_applications')
    .select('*')

  const today = startOfDay(new Date())
  const inThreeDays = addDays(today, 3)

  const followUpsDue = (allApps ?? []).filter((a: JobApplication) => {
    if (!a.next_follow_up) return false
    const d = new Date(a.next_follow_up + 'T00:00:00')
    return d <= inThreeDays
  }).sort((a: JobApplication, b: JobApplication) =>
    new Date(a.next_follow_up! + 'T00:00:00').getTime() -
    new Date(b.next_follow_up! + 'T00:00:00').getTime()
  )

  const allFollowUps = (allApps ?? [])
    .filter((a: JobApplication) => !!a.next_follow_up)
    .sort((a: JobApplication, b: JobApplication) =>
      new Date(a.next_follow_up! + 'T00:00:00').getTime() -
      new Date(b.next_follow_up! + 'T00:00:00').getTime()
    )
    .slice(0, 7)

  const total = (allApps ?? []).length
  const displayName = user.email?.split('@')[0] ?? 'there'

  return (
    <div className="p-6">
      <div className="flex gap-6 items-start">

        {/* ── Main column ─────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">
                Good {getGreeting()}, {displayName} 👋
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
                {total > 0 && ` · ${total} application${total !== 1 ? 's' : ''} tracked`}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link href="/resume">
                <Button variant="outline" size="sm" className="hover:border-primary/40 hover:text-primary transition-colors">
                  <FileText className="h-4 w-4 mr-2" />
                  Optimize Resume
                </Button>
              </Link>
              <Link href="/tracker">
                <Button size="sm" className="shadow-sm hover:shadow transition-shadow">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Application
                </Button>
              </Link>
            </div>
          </div>

          <StatsCards applications={(allApps as JobApplication[]) ?? []} />

          {/* Follow-up alert banner */}
          {followUpsDue.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-amber-800">
                  {followUpsDue.length} follow-up{followUpsDue.length !== 1 ? 's' : ''} due within 3 days
                </p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                  {followUpsDue.slice(0, 3).map((a: JobApplication) => {
                    const d = new Date(a.next_follow_up! + 'T00:00:00')
                    const overdue = isBefore(d, today)
                    return (
                      <span key={a.id} className="text-xs text-amber-700">
                        {a.company_name}
                        <span className="text-amber-500 ml-1">
                          ({overdue ? 'overdue' : format(d, 'MMM d')})
                        </span>
                      </span>
                    )
                  })}
                  {followUpsDue.length > 3 && (
                    <span className="text-xs text-amber-600">+{followUpsDue.length - 3} more</span>
                  )}
                </div>
              </div>
              <Link href="/tracker" className="ml-auto shrink-0">
                <Button variant="ghost" size="sm" className="text-amber-700 hover:bg-amber-100 h-7 text-xs px-2">
                  View all
                </Button>
              </Link>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Applications */}
            <Card className="hover:shadow-sm transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Recent Applications</CardTitle>
                <Link href="/tracker">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary -mr-2">
                    View all
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentApps && recentApps.length > 0 ? (
                  <div className="space-y-2">
                    {recentApps.map((app: JobApplication) => (
                      <div
                        key={app.id}
                        className="group flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-muted/50 transition-colors -mx-2 cursor-default"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium truncate">{app.company_name}</p>
                            {app.job_posting_url && (
                              <a
                                href={app.job_posting_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {app.job_title ?? 'No title'}
                            {app.applied_date && (
                              <span className="ml-1.5 opacity-60">
                                · {formatDistanceToNowStrict(new Date(app.applied_date + 'T00:00:00'), { addSuffix: true })}
                              </span>
                            )}
                          </p>
                        </div>
                        <span className={cn(
                          'inline-flex shrink-0 items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                          STATUS_BADGE[app.status]
                        )}>
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <div className="rounded-full bg-muted p-4 w-fit mx-auto mb-3">
                      <ClipboardList className="h-6 w-6 opacity-40" />
                    </div>
                    <p className="text-sm font-medium">No applications yet</p>
                    <p className="text-xs mt-1 mb-3">Start tracking your job search</p>
                    <Link href="/tracker">
                      <Button variant="outline" size="sm" className="hover:border-primary/40 hover:text-primary">
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Add your first one
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pipeline */}
            <Card className="hover:shadow-sm transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">Pipeline</CardTitle>
                {total > 0 && (
                  <span className="text-xs text-muted-foreground font-normal">{total} total</span>
                )}
              </CardHeader>
              <CardContent>
                {total > 0 ? (
                  <div className="space-y-4">
                    {PIPELINE_STAGES.map(({ key, label, color }) => {
                      const count = (allApps ?? []).filter((a: JobApplication) => a.status === key).length
                      const pct = Math.round((count / total) * 100)
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm text-muted-foreground">{label}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground/60">{pct}%</span>
                              <span className="text-sm font-semibold tabular-nums w-5 text-right">{count}</span>
                            </div>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn('h-full rounded-full transition-all duration-700', color)}
                              style={{ width: pct > 0 ? `${Math.max(pct, 2)}%` : '0%' }}
                            />
                          </div>
                        </div>
                      )
                    })}
                    {(() => {
                      const closed = (allApps ?? []).filter(
                        (a: JobApplication) => a.status === 'rejected' || a.status === 'withdrawn'
                      ).length
                      const closedPct = Math.round((closed / total) * 100)
                      if (closed === 0) return null
                      return (
                        <div className="pt-1 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground/60">Closed (rejected / withdrawn)</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground/40">{closedPct}%</span>
                              <span className="text-xs font-medium text-muted-foreground tabular-nums w-5 text-right">{closed}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <div className="rounded-full bg-muted p-4 w-fit mx-auto mb-3">
                      <CheckCircle2 className="h-6 w-6 opacity-40" />
                    </div>
                    <p className="text-sm font-medium">Pipeline is empty</p>
                    <p className="text-xs mt-1 mb-3">Track applications to see your funnel</p>
                    <Link href="/tracker">
                      <Button variant="outline" size="sm" className="hover:border-primary/40 hover:text-primary">
                        Get started
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Right panel ─────────────────────────────────── */}
        <div className="w-72 shrink-0 space-y-4 sticky top-6">

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* AI Resume Builder — shown as a connected pair */}
              <div className="rounded-lg border border-primary/15 bg-primary/[0.02] overflow-hidden">
                <p className="px-3 pt-2 pb-1 text-[9px] font-semibold uppercase tracking-widest text-primary/50 select-none">
                  AI Resume Builder
                </p>
                <Link href="/profiles" className="block">
                  <div className="flex items-center gap-3 px-3 py-2 hover:bg-primary/[0.06] transition-colors group cursor-pointer border-t border-primary/10">
                    <div className="rounded-md bg-primary/10 p-1.5 shrink-0">
                      <Layers className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">Career Profiles</p>
                      <p className="text-[10px] text-muted-foreground">AI interview for each career path</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-primary/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
                <Link href="/build" className="block">
                  <div className="flex items-center gap-3 px-3 py-2 hover:bg-primary/[0.06] transition-colors group cursor-pointer border-t border-primary/10">
                    <div className="rounded-md bg-primary/10 p-1.5 shrink-0">
                      <Wand2 className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">Build Resume</p>
                      <p className="text-[10px] text-muted-foreground">Paste job → tailored resume</p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-primary/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              </div>

              <Link href="/resume" className="block">
                <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 hover:border-primary/30 hover:bg-primary/[0.03] transition-all group cursor-pointer">
                  <div className="rounded-md bg-primary/10 p-1.5 shrink-0">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">Optimize Resume</p>
                    <p className="text-[10px] text-muted-foreground">Tailor it with AI</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
              <Link href="/tracker" className="block">
                <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 hover:border-primary/30 hover:bg-primary/[0.03] transition-all group cursor-pointer">
                  <div className="rounded-md bg-primary/10 p-1.5 shrink-0">
                    <Plus className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">Add Application</p>
                    <p className="text-[10px] text-muted-foreground">Log a new job</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Upcoming Follow-ups */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold">Follow-ups</CardTitle>
              {allFollowUps.length > 0 && (
                <Link href="/tracker">
                  <Button variant="ghost" size="sm" className="text-[10px] text-muted-foreground hover:text-primary h-6 px-2 -mr-1">
                    See all
                  </Button>
                </Link>
              )}
            </CardHeader>
            <CardContent>
              {allFollowUps.length > 0 ? (
                <div className="space-y-2">
                  {allFollowUps.map((app: JobApplication) => {
                    const d = new Date(app.next_follow_up! + 'T00:00:00')
                    const overdue = isBefore(d, today)
                    const dueToday = isToday(d)
                    const dueTomorrow = isTomorrow(d)
                    const daysOut = differenceInCalendarDays(d, today)

                    const urgencyDot = overdue
                      ? 'bg-red-500'
                      : dueToday || dueTomorrow
                        ? 'bg-amber-400'
                        : 'bg-primary/40'

                    const dateLabel = overdue
                      ? 'Overdue'
                      : dueToday
                        ? 'Today'
                        : dueTomorrow
                          ? 'Tomorrow'
                          : `In ${daysOut}d`

                    const dateLabelColor = overdue
                      ? 'text-red-600'
                      : dueToday || dueTomorrow
                        ? 'text-amber-600'
                        : 'text-muted-foreground'

                    return (
                      <div key={app.id} className="flex items-start gap-2.5">
                        <div className={cn('mt-1.5 h-1.5 w-1.5 rounded-full shrink-0', urgencyDot)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{app.company_name}</p>
                          {app.job_title && (
                            <p className="text-[10px] text-muted-foreground truncate">{app.job_title}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className={cn('text-[10px] font-medium', dateLabelColor)}>{dateLabel}</p>
                          <p className="text-[10px] text-muted-foreground/50">{format(d, 'MMM d')}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="rounded-full bg-muted p-3 w-fit mx-auto mb-2">
                    <Bell className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">No follow-ups scheduled</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    Set follow-up dates in your applications
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job search tip */}
          <Card className="border-primary/20 bg-primary/[0.02]">
            <CardContent className="pt-4 pb-4">
              <div className="flex gap-2.5">
                <Calendar className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-primary">Pro tip</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    Follow up within 5–7 days of applying. A short, polite email can set you apart from other candidates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
