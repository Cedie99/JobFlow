export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { getUsageStatus } from '@/lib/subscription'

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const status = await getUsageStatus(user.id)
  return NextResponse.json(status)
}
