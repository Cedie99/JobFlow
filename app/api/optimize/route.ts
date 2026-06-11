export const runtime = 'nodejs'
export const maxDuration = 300

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { getUsageStatus, incrementUsage } from '@/lib/subscription'
import { buildResumePrintHTML } from '@/lib/resume-print'
import type { OptimizeResponse } from '@/types'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

function deriveLabel(jobDescription: string): string {
  const firstLine = jobDescription.split('\n').find((l) => l.trim().length > 3)?.trim() ?? 'Optimization'
  return firstLine.length > 80 ? firstLine.slice(0, 77) + '...' : firstLine
}

const RESPONSE_SCHEMA = {
  type: 'object' as const,
  additionalProperties: false,
  properties: {
    optimizedResume: {
      type: 'object',
      additionalProperties: false,
      properties: {
        contactInfo: {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            location: { type: 'string' },
            linkedin: { type: 'string' },
            github: { type: 'string' },
          },
          required: ['name', 'email', 'phone', 'location', 'linkedin', 'github'],
        },
        summary: { type: 'string' },
        skills: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              category: { type: 'string' },
              items: { type: 'array', items: { type: 'string' } },
            },
            required: ['category', 'items'],
          },
        },
        experience: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              title: { type: 'string' },
              company: { type: 'string' },
              location: { type: 'string' },
              duration: { type: 'string' },
              bullets: { type: 'array', items: { type: 'string' } },
            },
            required: ['title', 'company', 'location', 'duration', 'bullets'],
          },
        },
        projects: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              name: { type: 'string' },
              techStack: { type: 'string' },
              duration: { type: 'string' },
              bullets: { type: 'array', items: { type: 'string' } },
            },
            required: ['name', 'techStack', 'duration', 'bullets'],
          },
        },
        education: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              degree: { type: 'string' },
              institution: { type: 'string' },
              location: { type: 'string' },
              year: { type: 'string' },
              gpa: { type: 'string' },
            },
            required: ['degree', 'institution', 'location', 'year', 'gpa'],
          },
        },
        awards: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              name: { type: 'string' },
              issuer: { type: 'string' },
              year: { type: 'string' },
            },
            required: ['name', 'issuer', 'year'],
          },
        },
        certifications: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: false,
            properties: {
              name: { type: 'string' },
              issuer: { type: 'string' },
              year: { type: 'string' },
            },
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

    const usage = await getUsageStatus(user.id)
    if (!usage.allowed) {
      return NextResponse.json(
        { error: 'limit_reached', usesCount: usage.usesCount, limit: usage.limit },
        { status: 402 },
      )
    }

    const { resumeText, jobDescription } = await request.json()

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: 'resumeText and jobDescription are required' },
        { status: 400 }
      )
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      thinking: { type: 'enabled', budget_tokens: 2000 },
      output_config: {
        format: {
          type: 'json_schema' as const,
          schema: RESPONSE_SCHEMA,
        },
      },
      system: `You are an expert resume writer and career coach specializing in ATS-optimized resumes. Your task is to produce a COMPLETE resume with every section filled in.

RESUME SECTIONS (all required, output in this order):
1. contactInfo — Extract name, email, phone, location, LinkedIn, GitHub from the resume. Use "" if genuinely not present.
2. summary — 3–4 sentence professional summary targeting the specific role with keywords from the job description.
3. education — ALL education entries with degree, institution, location, graduation year, and GPA (use "" if not listed).
4. experience — ALL work experiences from the resume. Each role gets 4–6 bullet points using STAR/CAR/XYZ frameworks with quantified achievements.
5. projects — ALL personal/academic/side projects from the resume. Include tech stack and 2–4 bullet points per project. Return [] if none.
6. skills — Categorized skill groups (e.g. "Languages", "Frameworks & Libraries", "Databases", "Tools & Platforms", "Cloud & DevOps"). Each category has 4–8 items. Match keywords from the job description.
7. awards — ALL awards, honors, and recognition from the resume. Return [] if none.
8. certifications — ALL certifications and licenses. Return [] if none.

BULLET POINT RULES:
- Every bullet must use one of: STAR (Situation→Task→Action→Result), CAR (Challenge→Action→Result), XYZ (Accomplished X, measured by Y, by doing Z)
- Lead with a strong action verb
- Include quantified outcomes wherever possible (%, $, time saved, users, scale)
- Embed keywords from the job description naturally

OUTPUT ALSO INCLUDES:
- coverLetter: 3–4 paragraphs (hook → relevant experience → why this company → call to action)
- emailMessage: professional application email with subject line at the top
- matchScore: integer 0–100 evaluating how well the resume background genuinely aligns with the job description (100 = near-perfect match, 0 = completely unrelated fields/skills). Be honest.
- matchWarning: if matchScore < 60, write 1–2 sentences explaining the mismatch (e.g. "Your background is in marketing but this role requires 5+ years of systems engineering experience."). Otherwise return an empty string "".`,
      messages: [
        {
          role: 'user',
          content: `Here is my current resume:\n\n${resumeText}\n\n---\n\nHere is the job description I'm applying for:\n\n${jobDescription}\n\nPlease optimize my resume for this role, create a cover letter, and draft a professional email.`,
        },
      ],
    })

    const textBlock = message.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No text response from AI' }, { status: 500 })
    }

    const result = JSON.parse(textBlock.text) as OptimizeResponse
    const resumePdfHtml = buildResumePrintHTML(result)

    let savedId: string | null = null
    try {
      const { data } = await supabase
        .from('resume_optimizations')
        .insert({ user_id: user.id, label: deriveLabel(jobDescription), job_description: jobDescription, result, resume_pdf_html: resumePdfHtml })
        .select('id')
        .single()
      savedId = data?.id ?? null
    } catch { /* non-fatal */ }

    if (!usage.isSubscribed) {
      await incrementUsage(user.id).catch(() => {})
    }

    return NextResponse.json({ ...result, savedId, resumePdfHtml })
  } catch (err) {
    console.error('Optimize API error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
