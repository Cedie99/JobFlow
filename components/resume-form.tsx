'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { UploadCloud, FileText, X, Loader2, Lock, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'
import type { OptimizeResponse } from '@/types'

interface ResumeFormProps {
  onResult: (result: OptimizeResponse) => void
  onLoading: (loading: boolean) => void
  loading: boolean
}

export default function ResumeForm({ onResult, onLoading, loading }: ResumeFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [progress, setProgress] = useState(0)
  const [limitReached, setLimitReached] = useState(false)

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) {
      setFile(accepted[0])
      setResumeText('')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDropRejected: () => toast.error('File must be PDF, DOCX, or TXT under 10MB'),
  })

  function removeFile() {
    setFile(null)
  }

  async function extractTextFromFile(f: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', f)
    const res = await fetch('/api/extract', { method: 'POST', body: formData })
    if (!res.ok) throw new Error('Failed to extract text from file')
    const data = await res.json()
    return data.text
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!file && !resumeText.trim()) {
      toast.error('Please upload a resume or paste your resume text')
      return
    }
    if (!jobDescription.trim()) {
      toast.error('Please paste the job description')
      return
    }

    onLoading(true)
    setProgress(10)

    try {
      let finalResumeText = resumeText

      if (file) {
        setProgress(25)
        finalResumeText = await extractTextFromFile(file)
        setProgress(40)
      }

      setProgress(50)
      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: finalResumeText, jobDescription }),
      })

      setProgress(90)

      if (!res.ok) {
        const err = await res.json()
        if (err.error === 'limit_reached') {
          setLimitReached(true)
          return
        }
        throw new Error(err.error ?? 'Optimization failed')
      }

      const result: OptimizeResponse = await res.json()
      setProgress(100)
      onResult(result)
      toast.success('Resume optimized successfully!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      onLoading(false)
      setProgress(0)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Resume Upload */}
      <div className="space-y-2">
        <Label>Your Resume</Label>
        {!file ? (
          <>
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
                isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary hover:bg-muted/30'
              )}
            >
              <input {...getInputProps()} />
              <UploadCloud className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">
                {isDragActive ? 'Drop your resume here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, or TXT · Max 10MB</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              or paste your resume text
              <div className="h-px flex-1 bg-border" />
            </div>
            <Textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume content here..."
              className="min-h-[120px] text-sm"
            />
          </>
        ) : (
          <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/40">
            <FileText className="h-8 w-8 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(0)} KB
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={removeFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Job Description */}
      <div className="space-y-2">
        <Label htmlFor="job-desc">Job Description</Label>
        <Textarea
          id="job-desc"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here..."
          className="min-h-[160px] text-sm"
          required
        />
      </div>

      {/* Progress */}
      {loading && progress > 0 && (
        <div className="space-y-1.5">
          <Progress value={progress} className="h-1.5" />
          <p className="text-xs text-muted-foreground text-center">
            {progress < 40 ? 'Extracting resume text...' :
             progress < 80 ? 'Claude is optimizing your resume...' :
             'Finalizing...'}
          </p>
        </div>
      )}

      {limitReached && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
          <div className="flex gap-3">
            <div className="rounded-lg bg-amber-100 p-2 shrink-0">
              <Lock className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">You've used all 3 free optimizations</p>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                Upgrade to Pro for unlimited AI resume optimizations, cover letters, and application emails.
              </p>
            </div>
          </div>
          <Link href="/pricing" className="block">
            <Button size="sm" className="w-full gap-1.5 bg-amber-600 hover:bg-amber-700 text-white">
              <Sparkles className="h-3.5 w-3.5" />
              Upgrade to Pro — Unlimited Access
            </Button>
          </Link>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading || limitReached} size="lg">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Optimizing...
          </>
        ) : (
          'Optimize Resume'
        )}
      </Button>
    </form>
  )
}
