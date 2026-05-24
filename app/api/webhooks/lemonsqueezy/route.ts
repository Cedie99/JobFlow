import { type NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const SUBSCRIPTION_EVENTS = [
  'subscription_created',
  'subscription_updated',
  'subscription_cancelled',
  'subscription_expired',
  'subscription_resumed',
  'subscription_paused',
  'subscription_unpaused',
  'subscription_payment_failed',
]

async function verifySignature(rawBody: string, signature: string): Promise<boolean> {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? ''
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody))
  const digest = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return digest === signature
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-signature') ?? ''

    const valid = await verifySignature(rawBody, signature)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(rawBody)
    const eventName: string = payload?.meta?.event_name ?? ''
    const userId: string = payload?.meta?.custom_data?.user_id ?? ''

    if (!SUBSCRIPTION_EVENTS.includes(eventName) || !userId) {
      return NextResponse.json({ received: true })
    }

    const attrs = payload.data?.attributes ?? {}

    const supabase = createAdminClient()
    await supabase.from('user_subscriptions').upsert(
      {
        user_id: userId,
        ls_subscription_id: String(payload.data.id),
        ls_customer_id: String(attrs.customer_id ?? ''),
        ls_order_id: String(attrs.order_id ?? ''),
        ls_product_id: String(attrs.product_id ?? ''),
        ls_variant_id: String(attrs.variant_id ?? ''),
        status: String(attrs.status ?? ''),
        renews_at: attrs.renews_at ?? null,
        ends_at: attrs.ends_at ?? null,
        trial_ends_at: attrs.trial_ends_at ?? null,
      },
      { onConflict: 'user_id' },
    )

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
