import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase
      .from('user_profiles')
      .select('gender')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ gender: data?.gender ?? 'male' })
  } catch (err) {
    console.error('GET /api/user/gender', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let body: { gender: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    if (!['male', 'female'].includes(body.gender)) {
      return NextResponse.json({ error: 'Gender must be male or female' }, { status: 400 })
    }

    const { error } = await supabase
      .from('user_profiles')
      .upsert({ user_id: user.id, gender: body.gender }, { onConflict: 'user_id' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ gender: body.gender })
  } catch (err) {
    console.error('PATCH /api/user/gender', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
