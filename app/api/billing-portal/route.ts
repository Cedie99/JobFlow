import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const { data: sub } = await admin
    .from('user_subscriptions')
    .select('ls_subscription_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!sub?.ls_subscription_id) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
  }

  // Fetch the latest portal URL directly from LemonSqueezy
  const res = await fetch(
    `https://api.lemonsqueezy.com/v1/subscriptions/${sub.ls_subscription_id}`,
    {
      headers: {
        Accept: 'application/vnd.api+json',
        Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      },
    }
  )

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch billing portal' }, { status: 502 })
  }

  const json = await res.json()
  const portalUrl: string | undefined = json.data?.attributes?.urls?.customer_portal

  if (!portalUrl) {
    return NextResponse.json({ error: 'Portal URL not available' }, { status: 404 })
  }

  return NextResponse.json({ url: portalUrl })
}
