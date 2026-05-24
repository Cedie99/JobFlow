'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import ResultsPanel from '@/components/results-panel'
import OptimizationHistory from '@/components/optimization-history'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Wand2, Loader2, Briefcase, Code, Target, Layers,
  ChevronDown, CheckCircle, Clock, Plus, ArrowRight, Lock, Sparkles, X, FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import type { OptimizeResponse } from '@/types'

interface ProfileSummary {
  id: string
  name: string
  completed: boolean
  profile?: {
    fullName?: string
    summary?: string
    experience?: { title: string; company: string }[]
    skills?: { category: string; items: string[] }[]
    careerGoals?: string
    personalityTraits?: string[]
  }
}

function BuildPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const preselectedId = searchParams.get('profileId')

  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState<OptimizeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [limitReached, setLimitReached] = useState(false)
  const [profiles, setProfiles] = useState<ProfileSummary[]>([])
  const [profilesLoading, setProfilesLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string>(preselectedId ?? '')
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [historyRevision, setHistoryRevision] = useState(0)
  const [modal, setModal] = useState<{ result: OptimizeResponse; label: string } | null>(null)

  useEffect(() => {
    fetch('/api/career-profiles')
      .then(r => r.json())
      .then((data: ProfileSummary[]) => {
        setProfiles(data)
        // Auto-select: prefer preselected, else first completed one
        if (!selectedId && data.length > 0) {
          const first = data.find(p => p.completed) ?? data[0]
          setSelectedId(first.id)
        }
      })
      .catch(() => toast.error('Could not load profiles'))
      .finally(() => setProfilesLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedProfile = profiles.find(p => p.id === selectedId)

  async function handleGenerate() {
    if (!jobDescription.trim()) {
      toast.error('Please paste the job description')
      return
    }
    if (!selectedId) {
      toast.error('Please select a career profile')
      return
    }
    setLoading(true)
    setProgress(15)
    try {
      setProgress(40)
      const res = await fetch('/api/build-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, profileId: selectedId }),
      })
      setProgress(85)
      if (!res.ok) {
        const err = await res.json()
        if (err.error === 'limit_reached') {
          setLimitReached(true)
          return
        }
        throw new Error(err.error ?? 'Generation failed')
      }
      const data: OptimizeResponse = await res.json()
      setProgress(100)
      setResult(data)
      setHistoryRevision(v => v + 1)
      toast.success('Resume generated!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  const p = selectedProfile?.profile

  function handleLoadFromHistory(r: OptimizeResponse, label: string) {
    setModal({ result: r, label })
  }

  return (
    <div className="flex h-full overflow-hidden">
    <div className="flex-1 overflow-y-auto">
    <div className="p-6 flex flex-col min-h-full">
      <div className="mb-6 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <Wand2 className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Build Resume from Profile</h1>
        </div>
        {/* Visual flow indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-primary/70" />
            <span className="font-medium text-foreground/70">Career Profile</span>
          </span>
          <ArrowRight className="h-3.5 w-3.5 opacity-30" />
          <span className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5" />
            <span>Any Job Posting</span>
          </span>
          <ArrowRight className="h-3.5 w-3.5 opacity-30" />
          <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <Wand2 className="h-3.5 w-3.5" />
            Tailored Resume in Seconds
          </span>
        </div>
      </div>

      <div className={`grid gap-6 flex-1 min-h-0 ${result ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-3xl'}`}>

        {/* Left: Profile selector + JD input */}
        <div className="space-y-4 overflow-y-auto">

          {/* Profile selector */}
          <Card className={selectedProfile?.completed === false ? 'border-amber-200' : ''}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                Career Profile
              </CardTitle>
              <CardDescription className="text-xs">
                Choose which profile to build a resume from
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {profilesLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading profiles…
                </div>
              ) : profiles.length === 0 ? (
                <div className="space-y-4 py-1">
                  <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-primary/10 p-2 shrink-0 mt-0.5">
                        <Layers className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold">Career profiles power this builder</p>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                          Create a profile by doing a 10-minute AI interview about your background for a specific career path.
                          Once saved, paste any job description — software engineering, QA, marketing, customer service,
                          anything — and get a tailored resume in seconds.
                        </p>
                      </div>
                    </div>
                    <div className="pl-[44px] space-y-1.5">
                      {[
                        'One AI interview per career path (5–10 min)',
                        'Generate unlimited resumes from each profile',
                        'Works for IT and non-IT roles equally',
                      ].map((point, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-primary/50 shrink-0" />
                          <p className="text-[11px] text-muted-foreground">{point}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" className="w-full" onClick={() => router.push('/profiles')}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Create your first career profile
                  </Button>
                </div>
              ) : (
                <>
                  {/* Dropdown trigger */}
                  <button
                    onClick={() => setSelectorOpen(o => !o)}
                    className="w-full flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm hover:border-primary/30 transition-colors"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      {selectedProfile ? (
                        <>
                          <span className={cn(
                            'shrink-0 h-1.5 w-1.5 rounded-full',
                            selectedProfile.completed ? 'bg-emerald-500' : 'bg-amber-400'
                          )} />
                          <span className="font-medium truncate">{selectedProfile.name}</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Select a profile…</span>
                      )}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${selectorOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown list */}
                  {selectorOpen && (
                    <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
                      {profiles.map(profile => (
                        <button
                          key={profile.id}
                          onClick={() => { setSelectedId(profile.id); setSelectorOpen(false) }}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left hover:bg-muted transition-colors',
                            selectedId === profile.id && 'bg-primary/[0.06]'
                          )}
                        >
                          <span className={cn(
                            'shrink-0 h-1.5 w-1.5 rounded-full',
                            profile.completed ? 'bg-emerald-500' : 'bg-amber-400'
                          )} />
                          <span className="flex-1 min-w-0">
                            <span className="font-medium block truncate">{profile.name}</span>
                          </span>
                          {profile.completed
                            ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            : <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                        </button>
                      ))}
                      <div className="border-t border-border">
                        <button
                          onClick={() => { setSelectorOpen(false); router.push('/profiles') }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          New Profile
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Warning if profile is incomplete */}
                  {selectedProfile && !selectedProfile.completed && (
                    <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5">
                      <Clock className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-amber-700 font-medium">Profile incomplete</p>
                        <p className="text-xs text-amber-600 mt-0.5">
                          Finish the Cedie interview for better results.{' '}
                          <button
                            onClick={() => router.push(`/profiles/${selectedId}`)}
                            className="underline font-medium"
                          >
                            Continue interview
                          </button>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Profile summary when complete */}
                  {p && selectedProfile?.completed && (
                    <div className="space-y-2 pt-1">
                      {p.summary && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{p.summary}</p>
                      )}
                      <div className="flex flex-wrap gap-3">
                        {p.experience && p.experience.length > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Briefcase className="h-3 w-3" />
                            {p.experience.length} role{p.experience.length !== 1 ? 's' : ''}
                          </div>
                        )}
                        {p.skills && p.skills.length > 0 && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Code className="h-3 w-3" />
                            {p.skills.reduce((sum, s) => sum + s.items.length, 0)} skills
                          </div>
                        )}
                        {p.careerGoals && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Target className="h-3 w-3" />
                            Goals set
                          </div>
                        )}
                      </div>
                      {p.personalityTraits && p.personalityTraits.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {p.personalityTraits.map((t, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* JD input */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Job Description</CardTitle>
              <CardDescription className="text-xs">
                Paste the full job description — Claude will tailor your profile to it
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here…"
                className="min-h-[240px] text-sm"
              />
              {loading && progress > 0 && (
                <div className="space-y-1.5">
                  <Progress value={progress} className="h-1.5" />
                  <p className="text-xs text-muted-foreground text-center">
                    {progress < 50 ? 'Preparing your profile…' : 'Claude is crafting your resume…'}
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
                      <p className="text-sm font-semibold text-amber-900">You've used all 3 free generations</p>
                      <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                        Upgrade to Pro for unlimited AI resume builds from your career profiles.
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
              <Button
                onClick={handleGenerate}
                disabled={loading || !selectedId || profiles.length === 0 || limitReached}
                className="w-full"
                size="lg"
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating…</>
                  : <><Wand2 className="h-4 w-4 mr-2" />Generate Resume</>}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Results */}
        {result && (
          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="shrink-0">
              <CardTitle className="text-base">AI-Generated Output</CardTitle>
              <CardDescription className="text-xs">
                Built from your {selectedProfile?.name} profile · Tailored to the role
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

export default function BuildPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    }>
      <BuildPageInner />
    </Suspense>
  )
}

