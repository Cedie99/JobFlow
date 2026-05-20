export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import type { OptimizeResponse, ProfileData } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

function profileToText(p: ProfileData): string {
  const lines: string[] = []
  lines.push(`Name: ${p.fullName}`)
  if (p.email) lines.push(`Email: ${p.email}`)
  if (p.phone) lines.push(`Phone: ${p.phone}`)
  if (p.location) lines.push(`Location: ${p.location}`)
  if (p.linkedin) lines.push(`LinkedIn: ${p.linkedin}`)
  if (p.github) lines.push(`GitHub: ${p.github}`)
  lines.push(`\nProfessional Summary:\n${p.summary}`)
  if (p.experience?.length) {
    lines.push('\nWork Experience:')
    p.experience.forEach(e => {
      lines.push(`  ${e.title} at ${e.company} (${e.duration})${e.location ? ' · ' + e.location : ''}`)
      e.bullets.forEach(b => lines.push(`    • ${b}`))
    })
  }
  if (p.education?.length) {
    lines.push('\nEducation:')
    p.education.forEach(e => {
      lines.push(`  ${e.degree} — ${e.institution} (${e.year})${e.gpa ? ' · GPA: ' + e.gpa : ''}`)
    })
  }
  if (p.projects?.length) {
    lines.push('\nProjects:')
    p.projects.forEach(proj => {
      lines.push(`  ${proj.name} | ${proj.techStack}${proj.duration ? ' | ' + proj.duration : ''}`)
      proj.bullets.forEach(b => lines.push(`    • ${b}`))
    })
  }
  if (p.skills?.length) {
    lines.push('\nSkills:')
    p.skills.forEach(s => lines.push(`  ${s.category}: ${s.items.join(', ')}`))
  }
  if (p.awards?.length) {
    lines.push('\nAwards:')
    p.awards.forEach(a => lines.push(`  ${a.name} — ${a.issuer} (${a.year})`))
  }
  if (p.certifications?.length) {
    lines.push('\nCertifications:')
    p.certifications.forEach(c => lines.push(`  ${c.name} — ${c.issuer} (${c.year})`))
  }
  lines.push(`\nWork Style:\n${p.workStyle}`)
  lines.push(`\nCareer Goals:\n${p.careerGoals}`)
  if (p.personalityTraits?.length) {
    lines.push(`\nPersonality Traits: ${p.personalityTraits.join(', ')}`)
  }
  return lines.join('\n')
}

function deriveLabel(jd: string): string {
  const first = jd.split('\n').find(l => l.trim().length > 3)?.trim() ?? 'Resume'
  return first.length > 80 ? first.slice(0, 77) + '...' : first
}

const RESPONSE_SCHEMA = {
  type: 'object' as const,
  additionalProperties: false,
  properties: {
    optimizedResume: {
      type: 'object', additionalProperties: false,
      properties: {
        contactInfo: {
          type: 'object', additionalProperties: false,
          properties: {
            name: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' },
            location: { type: 'string' }, linkedin: { type: 'string' }, github: { type: 'string' },
          },
          required: ['name', 'email', 'phone', 'location', 'linkedin', 'github'],
        },
        summary: { type: 'string' },
        skills: {
          type: 'array',
          items: {
            type: 'object', additionalProperties: false,
            properties: { category: { type: 'string' }, items: { type: 'array', items: { type: 'string' } } },
            required: ['category', 'items'],
          },
        },
        experience: {
          type: 'array',
          items: {
            type: 'object', additionalProperties: false,
            properties: {
              title: { type: 'string' }, company: { type: 'string' }, location: { type: 'string' },
              duration: { type: 'string' }, bullets: { type: 'array', items: { type: 'string' } },
            },
            required: ['title', 'company', 'location', 'duration', 'bullets'],
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
        education: {
          type: 'array',
          items: {
            type: 'object', additionalProperties: false,
            properties: {
              degree: { type: 'string' }, institution: { type: 'string' }, location: { type: 'string' },
              year: { type: 'string' }, gpa: { type: 'string' },
            },
            required: ['degree', 'institution', 'location', 'year', 'gpa'],
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
      required: ['contactInfo', 'summary', 'education', 'experience', 'projects', 'skills', 'awards', 'certifications'],
    },
    coverLetter: { type: 'string' },
    emailMessage: { type: 'string' },
    matchScore: { type: 'integer' },
    matchWarning: { type: 'string' },
  },
  required: ['optimizedResume', 'coverLetter', 'emailMessage', 'matchScore', 'matchWarning'],
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { jobDescription, profileId } = await request.json()
    if (!jobDescription) return NextResponse.json({ error: 'jobDescription is required' }, { status: 400 })
    if (!profileId) return NextResponse.json({ error: 'profileId is required' }, { status: 400 })

    const { data: profileRow } = await supabase
      .from('career_profiles')
      .select('profile')
      .eq('id', profileId)
      .eq('user_id', user.id)
      .single()

    if (!profileRow?.profile) {
      return NextResponse.json({ error: 'Profile not found. Complete onboarding first.' }, { status: 404 })
    }

    const profileText = profileToText(profileRow.profile as ProfileData)

    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 8000,
      thinking: { type: 'adaptive' },
      output_config: { format: { type: 'json_schema' as const, schema: RESPONSE_SCHEMA } },
      system: `You are an expert resume writer. Given a professional profile and a job description, create a complete, polished, ATS-optimized resume from scratch. Use STAR/CAR/XYZ frameworks for bullet points. Quantify achievements wherever the profile provides data. Tailor everything to the specific job description.

Also include:
- coverLetter: 3–4 paragraphs tailored to the role
- emailMessage: professional application email with subject line
- matchScore: 0–100 match between the profile and this role
- matchWarning: brief warning if matchScore < 60, otherwise ""`,
      messages: [{
        role: 'user',
        content: `Here is my professional profile:\n\n${profileText}\n\n---\n\nHere is the job description I want to apply for:\n\n${jobDescription}\n\nPlease build a complete tailored resume, cover letter, and application email.`,
      }],
    })

    const textBlock = message.content.find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    const result = JSON.parse(textBlock.text) as OptimizeResponse

    let savedId: string | null = null
    try {
      const { data } = await supabase
        .from('resume_optimizations')
        .insert({ user_id: user.id, label: deriveLabel(jobDescription), job_description: jobDescription, result })
        .select('id')
        .single()
      savedId = data?.id ?? null
    } catch { /* non-fatal */ }

    return NextResponse.json({ ...result, savedId })
  } catch (err) {
    console.error('Build resume error:', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 })
  }
}
