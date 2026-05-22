export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()

  const [{ data: allActive }, { data: dismissed }] = await Promise.all([
    supabase
      .from('announcements')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false }),
    supabase
      .from('dismissed_announcements')
      .select('announcement_id')
      .eq('user_id', user.id),
  ])

  const dismissedIds = new Set((dismissed ?? []).map(d => d.announcement_id))
  const visible = (allActive ?? []).filter(a => !dismissedIds.has(a.id))

  return NextResponse.json(visible)
}
