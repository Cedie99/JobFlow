import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('resume_optimizations')
    .select('id, label, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('List optimizations error:', error)
    return NextResponse.json({ error: error.message, details: error.details, hint: error.hint }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { label, result } = await req.json()
  if (!label?.trim() || !result) return NextResponse.json({ error: 'label and result are required' }, { status: 400 })

  const { data, error } = await supabase
    .from('resume_optimizations')
    .insert({ user_id: user.id, label: label.trim(), job_description: '', result })
    .select('id')
    .single()

  if (error) {
    console.error('Save optimization error:', error)
    return NextResponse.json({ error: error.message, details: error.details, hint: error.hint }, { status: 500 })
  }
  return NextResponse.json({ id: data.id })
}
