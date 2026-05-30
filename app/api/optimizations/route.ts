import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildResumePrintHTML } from '@/lib/resume-print'
import type { OptimizeResponse } from '@/types'

function isMissingResumePdfColumn(error: { code?: string; message?: string } | null) {
  return error?.code === '42703' && error.message?.includes('resume_pdf_html')
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let { data, error } = await supabase
    .from('resume_optimizations')
    .select('id, label, created_at, resume_pdf_html')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (isMissingResumePdfColumn(error)) {
    const fallback = await supabase
      .from('resume_optimizations')
      .select('id, label, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    data = fallback.data?.map(item => ({ ...item, resume_pdf_html: null })) ?? null
    error = fallback.error
  }

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

  let body: { label?: string; result?: OptimizeResponse; job_description?: string; resume_pdf_html?: string | null }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const { label, result, job_description = '' } = body
  if (!label?.trim() || !result) return NextResponse.json({ error: 'label and result are required' }, { status: 400 })
  const resumePdfHtml = body.resume_pdf_html ?? buildResumePrintHTML(result)

  let { data, error } = await supabase
    .from('resume_optimizations')
    .insert({ user_id: user.id, label: label.trim(), job_description, result, resume_pdf_html: resumePdfHtml })
    .select('id')
    .single()

  if (isMissingResumePdfColumn(error)) {
    const fallback = await supabase
      .from('resume_optimizations')
      .insert({ user_id: user.id, label: label.trim(), job_description, result })
      .select('id')
      .single()

    data = fallback.data
    error = fallback.error
  }

  if (error) {
    console.error('Save optimization error:', error)
    return NextResponse.json({ error: error.message, details: error.details, hint: error.hint }, { status: 500 })
  }
  if (!data) return NextResponse.json({ error: 'Save failed' }, { status: 500 })
  return NextResponse.json({ id: data.id })
}
