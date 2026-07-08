import { createAdminClient } from '@/lib/supabase/admin'
import { Users, CreditCard, MessageSquare, Bell } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function AdminOverviewPage() {
  const supabase = createAdminClient()

  const [
    { data: { users } },
    { count: subscriberCount },
    { count: openFeedbackCount },
    { count: activeAnnouncementCount },
  ] = await Promise.all([
    supabase.auth.admin.listUsers({ perPage: 1000 }),
    supabase.from('user_subscriptions').select('*', { count: 'exact', head: true }).in('status', ['active', 'on_trial']),
    supabase.from('user_feedback').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('announcements').select('*', { count: 'exact', head: true }).eq('active', true),
  ])

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users, color: 'text-teal-600', bg: 'bg-teal-500/10' },
    { label: 'Pro Subscribers', value: subscriberCount ?? 0, icon: CreditCard, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Open Feedback', value: openFeedbackCount ?? 0, icon: MessageSquare, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Active Announcements', value: activeAnnouncementCount ?? 0, icon: Bell, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ]

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform summary and recent activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="p-5">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${s.bg}`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Recent Signups */}
      <Card>
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold">Recent Signups</h2>
        </div>
        <div className="divide-y divide-border">
          {recentUsers.length === 0 ? (
            <p className="px-6 py-8 text-sm text-muted-foreground text-center">No users yet</p>
          ) : (
            recentUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium">{u.email}</p>
                  <p className="text-xs text-muted-foreground">{u.id}</p>
                </div>
                <div className="flex items-center gap-3">
                  {u.email_confirmed_at ? (
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950/20">
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Unverified
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">{fmt(u.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
