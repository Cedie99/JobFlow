import { startOfDay, subDays, addDays, formatISO, subWeeks, startOfWeek } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import type { ApplicationStatus, JobApplication } from '@/types'
import type { SupabaseClient } from '@supabase/supabase-js'

const FOLLOW_UP_COLUMNS = 'id, company_name, job_title, status, next_follow_up'
const STALE_COLUMNS = 'id, company_name, job_title, status'

export type DashboardFollowUp = Pick<
  JobApplication,
  'id' | 'company_name' | 'job_title' | 'status' | 'next_follow_up'
>

export type DashboardStaleApp = Pick<
  JobApplication,
  'id' | 'company_name' | 'job_title' | 'status'
>

export interface DashboardStats {
  total: number
  active: number
  interviews: number
  offers: number
  rejections: number
  interviewRate: number
  offerRate: number
}

export interface DashboardPipeline {
  total: number
  stages: Record<'applied' | 'screening' | 'interview' | 'offer', number>
  closed: number
}

export interface DashboardData {
  stats: DashboardStats
  pipeline: DashboardPipeline
  followUps: DashboardFollowUp[]
  allApplications: Pick<JobApplication, 'applied_date'>[]
  staleApps: DashboardStaleApp[]
  noFollowUpCount: number
}

async function countByStatus(
  supabase: SupabaseClient,
  userId: string,
  status?: ApplicationStatus
): Promise<number> {
  let query = supabase.from('job_applications').select('id', {
    count: 'exact',
    head: true,
  })

  query = query.eq('user_id', userId)

  if (status) {
    query = query.eq('status', status)
  }

  const { count, error } = await query
  if (error) {
    throw error
  }

  return count ?? 0
}

type StatusCounts = {
  total: number
  perStatus: Record<ApplicationStatus, number>
}

async function fetchStatusCounts(supabase: SupabaseClient, userId: string): Promise<StatusCounts> {
  const [total, applied, screening, interview, offer, accepted, rejected, withdrawn, ghosted, on_hold, expired] = await Promise.all([
    countByStatus(supabase, userId),
    countByStatus(supabase, userId, 'applied'),
    countByStatus(supabase, userId, 'screening'),
    countByStatus(supabase, userId, 'interview'),
    countByStatus(supabase, userId, 'offer'),
    countByStatus(supabase, userId, 'accepted'),
    countByStatus(supabase, userId, 'rejected'),
    countByStatus(supabase, userId, 'withdrawn'),
    countByStatus(supabase, userId, 'ghosted'),
    countByStatus(supabase, userId, 'on_hold'),
    countByStatus(supabase, userId, 'expired'),
  ])

  return {
    total,
    perStatus: {
      applied,
      screening,
      interview,
      offer,
      accepted,
      rejected,
      withdrawn,
      ghosted,
      on_hold,
      expired,
    },
  }
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  // These queries only grab the minimal amount of data necessary for the dashboard
  // so we can keep payloads tiny and return HTML faster.
  const supabase = await createClient()

  const today = startOfDay(new Date())
  const lookback = formatISO(subDays(today, 7), { representation: 'date' })
  const lookAhead = formatISO(addDays(today, 30), { representation: 'date' })
  const fourteenDaysAgo = subDays(today, 14).toISOString()

  const followUpPromise = supabase
    .from('job_applications')
    .select(FOLLOW_UP_COLUMNS)
    .not('next_follow_up', 'is', null)
    .gte('next_follow_up', lookback)
    .lte('next_follow_up', lookAhead)
    .order('next_follow_up', { ascending: true })
    .limit(20)

  const allApplicationsPromise = supabase
    .from('job_applications')
    .select('applied_date')
    .order('applied_date', { ascending: true })

  const stalePromise = supabase
    .from('job_applications')
    .select(STALE_COLUMNS)
    .in('status', ['applied', 'screening'])
    .lt('updated_at', fourteenDaysAgo)
    .order('updated_at', { ascending: true })
    .limit(5)

  const noFollowUpPromise = supabase
    .from('job_applications')
    .select('*', { count: 'exact', head: true })
    .in('status', ['applied', 'screening', 'interview', 'on_hold'])
    .is('next_follow_up', null)

  const [
    { data: followUpData, error: followUpError },
    { data: allAppsData, error: allAppsError },
    { data: staleData, error: staleError },
    { count: noFollowUpCount },
    statusCounts,
  ] = await Promise.all([
    followUpPromise.eq('user_id', userId),
    allApplicationsPromise.eq('user_id', userId),
    stalePromise.eq('user_id', userId),
    noFollowUpPromise.eq('user_id', userId),
    fetchStatusCounts(supabase, userId),
  ])

  if (followUpError) throw followUpError
  if (allAppsError) throw allAppsError
  if (staleError) throw staleError

  const followUps = (followUpData ?? []) as DashboardFollowUp[]
  const allApplications = (allAppsData ?? []) as Pick<JobApplication, 'applied_date'>[]
  const staleApps = (staleData ?? []) as DashboardStaleApp[]

  const closed =
    statusCounts.perStatus.rejected +
    statusCounts.perStatus.withdrawn +
    statusCounts.perStatus.ghosted +
    statusCounts.perStatus.expired
  const active = Math.max(statusCounts.total - closed, 0)

  const stats: DashboardStats = {
    total: statusCounts.total,
    active,
    interviews: statusCounts.perStatus.interview,
    offers: statusCounts.perStatus.offer,
    rejections: statusCounts.perStatus.rejected,
    interviewRate:
      statusCounts.total > 0
        ? Math.round((statusCounts.perStatus.interview / statusCounts.total) * 100)
        : 0,
    offerRate:
      statusCounts.perStatus.interview > 0
        ? Math.round((statusCounts.perStatus.offer / statusCounts.perStatus.interview) * 100)
        : 0,
  }

  const pipeline: DashboardPipeline = {
    total: statusCounts.total,
    stages: {
      applied: statusCounts.perStatus.applied,
      screening: statusCounts.perStatus.screening,
      interview: statusCounts.perStatus.interview,
      offer: statusCounts.perStatus.offer,
    },
    closed,
  }

  return {
    stats,
    pipeline,
    followUps,
    allApplications,
    staleApps,
    noFollowUpCount: noFollowUpCount ?? 0,
  }
}
