export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { createCheckoutUrl } from '@/lib/lemonsqueezy'

export async function POST() {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = await createCheckoutUrl(user.email ?? '', user.id)
    return NextResponse.json({ url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create checkout' },
      { status: 500 },
    )
  }
}
