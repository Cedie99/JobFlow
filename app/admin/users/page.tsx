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

function fmt(date: string | null | undefined) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function AdminUsersPage() {
  const supabase = createAdminClient()

  const [
    { data: { users } },
    { data: subscriptions },
    { data: usage },
    { data: appCounts },
  ] = await Promise.all([
    supabase.auth.admin.listUsers({ perPage: 1000 }),
    supabase.from('user_subscriptions').select('user_id, status'),
    supabase.from('user_usage').select('user_id, ai_uses_count'),
    supabase.from('job_applications').select('user_id'),
  ])

  const subMap = new Map((subscriptions ?? []).map(s => [s.user_id, s.status]))
  const usageMap = new Map((usage ?? []).map(u => [u.user_id, u.ai_uses_count]))

  const appCountMap = new Map<string, number>()
  for (const app of appCounts ?? []) {
    appCountMap.set(app.user_id, (appCountMap.get(app.user_id) ?? 0) + 1)
  }

  const sorted = [...users].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">{users.length} total accounts</p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead className="text-right">AI Uses</TableHead>
              <TableHead className="text-right">Applications</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map(u => {
              const status = subMap.get(u.id)
              const isPro = status === 'active' || status === 'on_trial'
              const aiUses = usageMap.get(u.id) ?? 0
              const apps = appCountMap.get(u.id) ?? 0

              return (
                <TableRow key={u.id}>
                  <TableCell>
                    <p className="font-medium text-sm">{u.email}</p>
                    <p className="text-xs text-muted-foreground">{u.id.slice(0, 8)}…</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{fmt(u.created_at)}</TableCell>
                  <TableCell>
                    {isPro ? (
                      <Badge className="bg-amber-400/15 text-amber-600 border-amber-400/30 dark:text-amber-400">
                        Pro {status === 'on_trial' ? '(trial)' : ''}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Free</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-sm">{aiUses}</TableCell>
                  <TableCell className="text-right text-sm">{apps}</TableCell>
                </TableRow>
              )
            })}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No users yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
