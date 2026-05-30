import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildResumePrintHTML } from '@/lib/resume-print'
import type { OptimizeResponse } from '@/types'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('resume_optimizations')
    .select('id, label, created_at, result, resume_pdf_html')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('Get optimization error:', error)
    return NextResponse.json({ error: error.message, details: error.details, hint: error.hint }, { status: 500 })
  }
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const updates: Record<string, unknown> = {}
  if (body.label !== undefined) updates.label = body.label
  if (body.result !== undefined) {
    updates.result = body.result
    updates.resume_pdf_html = body.resume_pdf_html ?? buildResumePrintHTML(body.result as OptimizeResponse)
  } else if (body.resume_pdf_html !== undefined) {
    updates.resume_pdf_html = body.resume_pdf_html
  }
  if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

  const { error } = await supabase
    .from('resume_optimizations')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('resume_optimizations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
