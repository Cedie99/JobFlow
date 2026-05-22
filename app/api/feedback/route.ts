export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, message } = await req.json()
  if (!type || !message?.trim()) {
    return NextResponse.json({ error: 'Type and message are required' }, { status: 400 })
  }
  if (!['bug', 'feature', 'general'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('user_feedback').insert({
    user_id: user.id,
    user_email: user.email,
    type,
    message: message.trim(),
    status: 'open',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
