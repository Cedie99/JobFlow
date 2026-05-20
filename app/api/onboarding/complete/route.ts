export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import type { ChatMessage } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const PROFILE_SCHEMA = {
  type: 'object' as const,
  additionalProperties: false,
  properties: {
    fullName: { type: 'string' },
    email: { type: 'string' },
    phone: { type: 'string' },
    location: { type: 'string' },
    linkedin: { type: 'string' },
    github: { type: 'string' },
    summary: { type: 'string' },
    workStyle: { type: 'string' },
    careerGoals: { type: 'string' },
    personalityTraits: { type: 'array', items: { type: 'string' } },
    experience: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          title: { type: 'string' }, company: { type: 'string' },
          location: { type: 'string' }, duration: { type: 'string' },
          bullets: { type: 'array', items: { type: 'string' } },
        },
        required: ['title', 'company', 'location', 'duration', 'bullets'],
      },
    },
    education: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          degree: { type: 'string' }, institution: { type: 'string' },
          location: { type: 'string' }, year: { type: 'string' }, gpa: { type: 'string' },
        },
        required: ['degree', 'institution', 'location', 'year', 'gpa'],
      },
    },
    projects: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          name: { type: 'string' }, techStack: { type: 'string' },
          duration: { type: 'string' }, bullets: { type: 'array', items: { type: 'string' } },
        },
        required: ['name', 'techStack', 'duration', 'bullets'],
      },
    },
    skills: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: {
          category: { type: 'string' },
          items: { type: 'array', items: { type: 'string' } },
        },
        required: ['category', 'items'],
      },
    },
    awards: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: { name: { type: 'string' }, issuer: { type: 'string' }, year: { type: 'string' } },
        required: ['name', 'issuer', 'year'],
      },
    },
    certifications: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        properties: { name: { type: 'string' }, issuer: { type: 'string' }, year: { type: 'string' } },
        required: ['name', 'issuer', 'year'],
      },
    },
  },
  required: [
    'fullName', 'email', 'phone', 'location', 'linkedin', 'github',
    'summary', 'workStyle', 'careerGoals', 'personalityTraits',
    'experience', 'education', 'projects', 'skills', 'awards', 'certifications',
  ],
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { messages, profileId }: { messages: ChatMessage[], profileId: string } = await request.json()

    const conversation = messages
      .map(m => `${m.role === 'assistant' ? 'Cedie' : 'User'}: ${m.content}`)
      .join('\n\n')

    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 4000,
      thinking: { type: 'adaptive' },
      output_config: { format: { type: 'json_schema' as const, schema: PROFILE_SCHEMA } },
      system: `Extract a structured professional profile from this interview transcript. Only include information explicitly mentioned. Use "" or [] for missing fields. Write summary in first person (2–3 sentences). workStyle is a paragraph on how they work and collaborate. careerGoals is a paragraph on their ambitions. personalityTraits is 3–6 short descriptive phrases.`,
      messages: [{ role: 'user', content: `Interview transcript:\n\n${conversation}\n\nExtract the complete profile.` }],
    })

    const textBlock = response.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    const profile = JSON.parse(textBlock.text)

    await supabase
      .from('career_profiles')
      .update({ interview_messages: messages, profile, completed: true })
      .eq('id', profileId)
      .eq('user_id', user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Complete error:', err)
    return NextResponse.json({ error: 'Failed to synthesize profile' }, { status: 500 })
  }
}
