'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import ResultsPanel from '@/components/results-panel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Wand2, Loader2, Briefcase, Code, Target, Layers,
  ChevronDown, CheckCircle, Clock, Plus,
} from 'lucide-react'
import { toast } from 'sonner'
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
  const [profiles, setProfiles] = useState<ProfileSummary[]>([])
  const [profilesLoading, setProfilesLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string>(preselectedId ?? '')
  const [selectorOpen, setSelectorOpen] = useState(false)

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
        throw new Error(err.error ?? 'Generation failed')
      }
      const data: OptimizeResponse = await res.json()
      setProgress(100)
      setResult(data)
      toast.success('Resume generated!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  const p = selectedProfile?.profile

  return (
    <div className="p-6 flex flex-col min-h-full">
      <div className="mb-6 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <Wand2 className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Build Resume from Profile</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Pick a career profile and paste a job description — Claude builds a tailored resume from scratch.
        </p>
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
                <div className="text-center py-3 space-y-3">
                  <p className="text-sm text-muted-foreground">No career profiles yet.</p>
                  <Button size="sm" variant="outline" onClick={() => router.push('/profiles')}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Create a Profile
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
              <Button
                onClick={handleGenerate}
                disabled={loading || !selectedId || profiles.length === 0}
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

