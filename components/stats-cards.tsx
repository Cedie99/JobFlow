import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Briefcase, TrendingUp, Clock, Award, ArrowRight } from 'lucide-react'
import type { DashboardStats } from '@/lib/dashboard-data'
import type { JobApplication } from '@/types'

interface StatsCardsProps {
  stats: DashboardStats
}

export function buildStatsFromApplications(applications: JobApplication[]): DashboardStats {
  const total = applications.length
  const rejected = applications.filter((a) => a.status === 'rejected').length
  const withdrawn = applications.filter((a) => a.status === 'withdrawn').length
  const interviews = applications.filter((a) => a.status === 'interview').length
  const offers = applications.filter((a) => a.status === 'offer').length
  const active = total - rejected - withdrawn

  return {
    total,
    active,
    interviews,
    offers,
    rejections: rejected,
    interviewRate: total > 0 ? Math.round((interviews / total) * 100) : 0,
    offerRate: interviews > 0 ? Math.round((offers / interviews) * 100) : 0,
  }
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor,
  href,
}: {
  label: string
  value: number
  sub: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  href: string
}) {
  return (
    <Link href={href}>
      <Card className="group relative overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30">
        {/* Subtle top-border accent on hover */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
              <p className="text-2xl font-bold tabular-nums count-pop">{value}</p>
              <p className="text-xs text-muted-foreground mt-1 truncate">{sub}</p>
            </div>
            <div className={`rounded-lg p-2 shrink-0 ${iconBg} transition-transform duration-200 group-hover:scale-110`}>
              <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <span>View in tracker</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const { total, active, interviews, offers, rejections, interviewRate, offerRate } = stats

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        label="Total Applied"
        value={total}
        sub={rejections > 0 ? `${rejections} rejection${rejections !== 1 ? 's' : ''}` : 'No rejections yet'}
        icon={Briefcase}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
        href="/tracker"
      />
      <StatCard
        label="Active"
        value={active}
        sub={total > 0 ? `${Math.round((active / total) * 100)}% of applications` : 'No applications yet'}
        icon={TrendingUp}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
        href="/tracker"
      />
      <StatCard
        label="Interviews"
        value={interviews}
        sub={`${interviewRate}% interview rate`}
        icon={Clock}
        iconBg="bg-violet-50"
        iconColor="text-violet-600"
        href="/tracker"
      />
      <StatCard
        label="Offers"
        value={offers}
        sub={offerRate > 0 ? `${offerRate}% offer rate` : interviews > 0 ? 'Keep going!' : '—'}
        icon={Award}
        iconBg="bg-amber-50"
        iconColor="text-amber-600"
        href="/tracker"
      />
    </div>
  )
}
