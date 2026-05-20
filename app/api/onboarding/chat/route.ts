export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import type { ChatMessage } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

function buildSystemPrompt(profileName: string) {
  return `You are Cedie, a warm and genuinely curious AI who gets to know professionals on a human level — not just their resume. You work for jobflow, an AI job search assistant. The user is building a career profile for: ${profileName}.

Your goal is to understand who this person really is through real conversation — their story, what drives them, how they think, and where they want to go in the ${profileName} space. Focus your curiosity on experiences, skills, and goals relevant to this career direction, but let the conversation flow naturally.

By the end you should naturally have learned: their relevant work history, technical and soft skills for this career, projects or accomplishments, education, what kind of work energizes them, how they collaborate, and their goals in this field. But don't treat these as a checklist — let them emerge organically.

Tone and style rules — follow these strictly:
- Write in plain conversational prose. No asterisks, no bold, no bullet points, no markdown of any kind.
- Be warm, human, and encouraging — like a smart friend who actually cares.
- Keep responses short: 1–3 sentences of genuine reaction, then one question. Never more than one question at a time.
- React authentically to what they share before asking the next thing.
- Follow interesting threads before jumping to a new topic.
- When the conversation has covered their story well (typically 12–18 exchanges), wrap up naturally and end your message with exactly: [INTERVIEW_COMPLETE]

Start with one casual sentence introducing yourself and one open question about where they are in their ${profileName} journey right now.`
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { messages, profileId, profileName }: {
      messages: ChatMessage[]
      profileId: string
      profileName: string
    } = await request.json()

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: buildSystemPrompt(profileName),
      messages: messages.length === 0
        ? [{ role: 'user', content: 'Start the conversation.' }]
        : messages.map(m => ({ role: m.role, content: m.content })),
    })

    const text = response.content.find(b => b.type === 'text')?.text ?? ''
    const isComplete = text.includes('[INTERVIEW_COMPLETE]')
    const message = text.replace('[INTERVIEW_COMPLETE]', '').trim()

    // Persist messages to career_profiles (best-effort)
    try {
      const updatedMessages = [...messages, { role: 'assistant' as const, content: message }]
      await supabase
        .from('career_profiles')
        .update({ interview_messages: updatedMessages })
        .eq('id', profileId)
        .eq('user_id', user.id)
    } catch { /* non-fatal */ }

    return NextResponse.json({ message, isComplete })
  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 })
  }
}
