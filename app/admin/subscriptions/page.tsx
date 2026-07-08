import { createAdminClient } from '@/lib/supabase/admin'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { SubscriptionStatus } from '@/types'

function fmt(date: string | null | undefined) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const STATUS_STYLES: Record<SubscriptionStatus, string> = {
  active: 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400',
  on_trial: 'bg-teal-500/10 text-teal-600 border-teal-500/20 dark:text-teal-400',
  paused: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  cancelled: 'bg-muted text-muted-foreground',
  expired: 'bg-muted text-muted-foreground',
  past_due: 'bg-red-500/10 text-red-600 border-red-500/20',
  unpaid: 'bg-red-500/10 text-red-600 border-red-500/20',
}

export default async function AdminSubscriptionsPage() {
  const supabase = createAdminClient()

  const [
    { data: { users } },
    { data: subscriptions },
  ] = await Promise.all([
    supabase.auth.admin.listUsers({ perPage: 1000 }),
    supabase.from('user_subscriptions').select('*').order('created_at', { ascending: false }),
  ])

  const emailMap = new Map(users.map(u => [u.id, u.email]))

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {subscriptions?.filter(s => s.status === 'active' || s.status === 'on_trial').length ?? 0} active
          {' · '}
          {subscriptions?.length ?? 0} total records
        </p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Renews</TableHead>
              <TableHead>Ends</TableHead>
              <TableHead>LS Subscription ID</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(subscriptions ?? []).map(s => (
              <TableRow key={s.id}>
                <TableCell>
                  <p className="text-sm font-medium">{emailMap.get(s.user_id) ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">{s.user_id.slice(0, 8)}…</p>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={STATUS_STYLES[s.status as SubscriptionStatus] ?? ''}
                  >
                    {s.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{fmt(s.renews_at)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{fmt(s.ends_at)}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground">
                  {s.ls_subscription_id ?? '—'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{fmt(s.created_at)}</TableCell>
              </TableRow>
            ))}
            {(subscriptions ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No subscriptions yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
