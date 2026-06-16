export const runtime = 'nodejs'
export const maxDuration = 300

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getUsageStatus, incrementUsage } from '@/lib/subscription'
import type { InterviewQuestionsResponse } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const RESPONSE_SCHEMA = {
  type: 'object' as const,
  additionalProperties: false,
  properties: {
    jobTitle: { type: 'string' },
    focusAreas: {
      type: 'array',
      items: { type: 'string' },
    },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          category: { type: 'string' },
          question: { type: 'string' },
          whatTheyLookFor: { type: 'string' },
          sampleAnswer: { type: 'string' },
        },
        required: ['category', 'question', 'whatTheyLookFor'],
      },
    },
  },
  required: ['jobTitle', 'focusAreas', 'questions'],
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('interview_questions')
    .select('id, label, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('List interview questions error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const usage = await getUsageStatus(user.id)
    if (!usage.allowed) {
      return NextResponse.json(
        { error: 'limit_reached', usesCount: usage.usesCount, limit: usage.limit },
        { status: 402 },
      )
    }

    const { jobDescription, label } = await request.json()

    if (!jobDescription) {
      return NextResponse.json(
        { error: 'jobDescription is required' },
        { status: 400 }
      )
    }

    const itemLabel = label ?? jobDescription.split('\n').find((l: string) => l.trim().length > 3)?.trim().slice(0, 80) ?? 'Interview Questions'

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      thinking: { type: 'enabled', budget_tokens: 2000 },
      output_config: {
        format: {
          type: 'json_schema' as const,
          schema: RESPONSE_SCHEMA,
        },
      },
      system: `You are an expert interview coach and hiring manager. Given a job description, generate realistic, high-quality interview questions that a candidate is likely to face.

Generate 10-15 interview questions that cover:

1. **Technical/Skill-based questions** — questions specific to the tools, technologies, and hard skills mentioned in the JD
2. **Behavioral questions** — STAR-format questions about past experience, teamwork, conflict, leadership, etc.
3. **Situational questions** — hypothetical scenarios related to the role
4. **Role-specific questions** — questions about the industry, domain knowledge, or role-specific challenges

For EACH question, provide:
- category: One of "Technical", "Behavioral", "Situational", or "Role-Specific"
- question: The interview question itself
- whatTheyLookFor: 1-2 sentences explaining what a good answer demonstrates and what the interviewer is evaluating
- sampleAnswer: A model answer that demonstrates the ideal response (STAR format for behavioral, structured approach for technical, etc.)

Also determine:
- jobTitle: The most likely job title for this role based on the description
- focusAreas: 3-5 key areas the interview will likely focus on (e.g., "System Design", "Data Structures", "Team Collaboration", "Product Sense")`,
      messages: [
        {
          role: 'user',
          content: `Please generate interview questions for the following job description:\n\n${jobDescription}`,
        },
      ],
    })

    const textBlock = message.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No text response from AI' }, { status: 500 })
    }

    const result = JSON.parse(textBlock.text) as InterviewQuestionsResponse

    let savedId: string | null = null
    try {
      const { data } = await supabase
        .from('interview_questions')
        .insert({ user_id: user.id, label: itemLabel, job_description: jobDescription, result })
        .select('id')
        .single()
      savedId = data?.id ?? null
    } catch { /* non-fatal */ }

    if (!usage.isSubscribed) {
      await incrementUsage(user.id).catch(() => {})
    }

    return NextResponse.json({ ...result, savedId })
  } catch (err) {
    console.error('Interview Questions API error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
