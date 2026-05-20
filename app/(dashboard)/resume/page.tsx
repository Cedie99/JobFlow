'use client'

import { useState } from 'react'
import ResumeForm from '@/components/resume-form'
import ResultsPanel from '@/components/results-panel'
import OptimizationHistory from '@/components/optimization-history'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Sparkles, X, FileText } from 'lucide-react'
import type { OptimizeResponse } from '@/types'

interface ModalData {
  result: OptimizeResponse
  label: string
}

export default function ResumePage() {
  const [result, setResult] = useState<OptimizeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [historyRevision, setHistoryRevision] = useState(0)
  const [modal, setModal] = useState<ModalData | null>(null)

  function handleNewResult(r: OptimizeResponse) {
    setResult(r)
    setHistoryRevision(v => v + 1)
  }

  function handleLoadFromHistory(r: OptimizeResponse, label: string) {
    setModal({ result: r, label })
  }

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Main content ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 flex flex-col min-h-full max-w-5xl">

          {/* Header */}
          <div className="mb-6 shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold">Rewrite your resume base on the job you're applying for</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Upload your resume and paste a job description. Claude will tailor your resume using STAR, CAR, and XYZ frameworks, then generate a cover letter and email.
            </p>
          </div>

          {/* Input + Results grid */}
          <div className={`grid gap-6 flex-1 min-h-0 ${result ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-2xl'}`}>
            <Card className="overflow-y-auto w-full">
              <CardHeader>
                <CardTitle className="text-base">Input</CardTitle>
                <CardDescription className="text-xs">
                  Upload or paste your resume, then add the job description
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResumeForm
                  onResult={handleNewResult}
                  onLoading={setLoading}
                  loading={loading}
                />
              </CardContent>
            </Card>

            {result && (
              <Card className="flex flex-col overflow-hidden">
                <CardHeader className="shrink-0">
                  <CardTitle className="text-base">AI-Generated Output</CardTitle>
                  <CardDescription className="text-xs">
                    Optimized resume · Cover letter · Application email
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 overflow-hidden pb-4">
                  <ResultsPanel result={result} onResultChange={setResult} />
                </CardContent>
              </Card>
            )}
          </div>

        </div>
      </div>

      {/* ── History sidebar ───────────────────────────────── */}
      <OptimizationHistory
        onLoad={handleLoadFromHistory}
        activeId={result?.savedId ?? null}
        refreshTrigger={historyRevision}
      />

      {/* ── History load modal ────────────────────────────── */}
      <Dialog open={!!modal} onOpenChange={(open) => { if (!open) setModal(null) }}>
        <DialogContent showCloseButton={false} className="sm:max-w-3xl w-full h-[90vh] flex flex-col gap-0 p-0 overflow-hidden">
          {/* Modal header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{modal?.label || 'Optimization'}</p>
              <p className="text-xs text-muted-foreground">Viewing saved optimization</p>
            </div>
            <button
              onClick={() => setModal(null)}
              className="flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Modal body */}
          <div className="flex-1 min-h-0 p-5 overflow-hidden">
            {modal && (
              <ResultsPanel
                result={modal.result}
                onResultChange={(r) => setModal(m => m ? { ...m, result: r } : null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
