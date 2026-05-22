export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { announcementId } = await req.json()
  if (!announcementId) return NextResponse.json({ error: 'Missing announcementId' }, { status: 400 })

  const supabase = createAdminClient()
  await supabase.from('dismissed_announcements').upsert({
    user_id: user.id,
    announcement_id: announcementId,
  })

  return NextResponse.json({ success: true })
}
