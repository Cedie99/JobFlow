export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const MAX_BYTES = 50 * 1024 * 1024 // 50 MB
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large (max 50 MB)' }, { status: 413 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const filename = file.name.toLowerCase()
    let text = ''

    if (filename.endsWith('.pdf')) {
      const { extractText } = await import('unpdf')
      const { text: pages } = await extractText(new Uint8Array(buffer), { mergePages: true })
      text = Array.isArray(pages) ? pages.join('\n') : pages
    } else if (filename.endsWith('.docx')) {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else if (filename.endsWith('.txt')) {
      text = buffer.toString('utf-8')
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    if (!text.trim()) {
      return NextResponse.json({ error: 'Could not extract text from file' }, { status: 422 })
    }

    return NextResponse.json({ text: text.trim() })
  } catch (err) {
    console.error('Extract error:', err)
    return NextResponse.json({ error: 'Failed to extract text' }, { status: 500 })
  }
}
