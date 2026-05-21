import { redirect } from 'next/navigation'
import { createClient, getUser } from '@/lib/supabase/server'
import TrackerClient from '@/components/tracker-client'
import type { JobApplication } from '@/types'

export default async function TrackerPage() {
  const [user, supabase] = await Promise.all([getUser(), createClient()])
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('job_applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return <TrackerClient initialApplications={(data ?? []) as JobApplication[]} />
}
