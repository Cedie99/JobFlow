import { createAdminClient } from '@/lib/supabase/admin'

export const FREE_AI_LIMIT = 3

export interface UsageStatus {
  allowed: boolean
  isSubscribed: boolean
  usesCount: number
  limit: number
}

export async function getUsageStatus(userId: string): Promise<UsageStatus> {
  const supabase = createAdminClient()

  const [{ data: sub }, { data: usage }] = await Promise.all([
    supabase
      .from('user_subscriptions')
      .select('status')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('user_usage')
      .select('ai_uses_count')
      .eq('user_id', userId)
      .maybeSingle(),
  ])

  const isSubscribed = sub?.status === 'active' || sub?.status === 'on_trial'
  const usesCount = usage?.ai_uses_count ?? 0

  return {
    allowed: isSubscribed || usesCount < FREE_AI_LIMIT,
    isSubscribed,
    usesCount,
    limit: FREE_AI_LIMIT,
  }
}

export async function incrementUsage(userId: string): Promise<void> {
  const supabase = createAdminClient()

  const { data: existing } = await supabase
    .from('user_usage')
    .select('ai_uses_count')
    .eq('user_id', userId)
    .maybeSingle()

  await supabase
    .from('user_usage')
    .upsert(
      { user_id: userId, ai_uses_count: (existing?.ai_uses_count ?? 0) + 1 },
      { onConflict: 'user_id' },
    )
}
