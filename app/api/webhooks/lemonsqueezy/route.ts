export const runtime = 'nodejs'

import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const SUBSCRIPTION_EVENTS = new Set([
  'subscription_created',
  'subscription_updated',
  'subscription_cancelled',
  'subscription_expired',
  'subscription_resumed',
  'subscription_paused',
  'subscription_unpaused',
])

function verifySignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? ''
  const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-signature') ?? ''

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const meta = payload.meta as Record<string, unknown> | undefined
  const eventName = meta?.event_name as string | undefined
  const customData = meta?.custom_data as Record<string, unknown> | undefined
  const userId = customData?.user_id as string | undefined

  if (!eventName || !SUBSCRIPTION_EVENTS.has(eventName) || !userId) {
    return NextResponse.json({ received: true })
  }

  const data = payload.data as Record<string, unknown>
  const attrs = data?.attributes as Record<string, unknown>

  const supabase = createAdminClient()

  await supabase
    .from('user_subscriptions')
    .upsert(
      {
        user_id: userId,
        ls_subscription_id: String(data.id),
        ls_customer_id: String(attrs.customer_id ?? ''),
        ls_order_id: String(attrs.order_id ?? ''),
        ls_product_id: String(attrs.product_id ?? ''),
        ls_variant_id: String(attrs.variant_id ?? ''),
        status: attrs.status as string,
        renews_at: (attrs.renews_at as string | null) ?? null,
        ends_at: (attrs.ends_at as string | null) ?? null,
        trial_ends_at: (attrs.trial_ends_at as string | null) ?? null,
      },
      { onConflict: 'user_id' },
    )

  return NextResponse.json({ received: true })
}
