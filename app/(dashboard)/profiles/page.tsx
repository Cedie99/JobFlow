'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  Plus, Layers, CheckCircle, Clock, Trash2, Wand2,
  ArrowRight, Loader2, MessageSquare, Sparkles, Eye, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { format } from 'date-fns'
import type { Gender } from '@/types'
import guySrc from '@/assets/3d-guy.jpg'
import girlSrc from '@/assets/3d-girl.jpg'

interface ProfileSummary {
  id: string
  name: string
  completed: boolean
  created_at: string
  updated_at: string
}

const SUGGESTIONS = [
  'Software Engineer', 'Frontend Developer', 'Full Stack Developer',
  'Backend Engineer', 'DevOps Engineer', 'Data Scientist',
  'Product Manager', 'UX Designer', 'Call Center Agent',
  'Customer Service', 'Social Media Manager', 'Marketing Manager',
  'Sales Representative', 'Business Analyst', 'QA Engineer',
]

const CAREER_EXAMPLES = [
  'Software Engineer', 'Frontend Developer', 'QA Engineer',
  'DevOps Engineer', 'Data Scientist', 'Product Manager',
  'UX Designer', 'Business Analyst', 'Marketing Manager',
  'Content Writer', 'Social Media Manager', 'Customer Service',
  'Sales Representative', 'HR Specialist', 'Financial Analyst',
  'Project Manager', 'Operations Manager',
]

export default function ProfilesPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<ProfileSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [profileName, setProfileName] = useState('')
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<ProfileSummary | null>(null)
  const [profileDetails, setProfileDetails] = useState<any>(null)
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [gender, setGender] = useState<Gender>('male')
  const [genderSaving, setGenderSaving] = useState(false)

  useEffect(() => { fetchProfiles() }, [])

  useEffect(() => {
    fetch('/api/user/gender')
      .then(r => r.json())
      .then(d => { if (d.gender) setGender(d.gender) })
      .catch(() => {})
  }, [])

  async function toggleGender() {
    const next: Gender = gender === 'male' ? 'female' : 'male'
    setGender(next)
    setGenderSaving(true)
    try {
      await fetch('/api/user/gender', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gender: next }),
      })
    } catch {
      setGender(gender === 'male' ? 'female' : 'male')
      toast.error('Could not save gender')
    } finally {
      setGenderSaving(false)
    }
  }

  async function fetchProfiles() {
    try {
      const res = await fetch('/api/career-profiles', { signal: AbortSignal.timeout(10_000) })
      if (!res.ok) throw new Error()
      setProfiles(await res.json())
    } catch {
      toast.error('Could not load profiles')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!profileName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/career-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create profile')
      setDialogOpen(false)
      setProfileName('')
      router.push(`/profiles/${data.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create profile')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setDeletingId(id)
    try {
      await fetch(`/api/career-profiles/${id}`, { method: 'DELETE' })
      setProfiles(prev => prev.filter(p => p.id !== id))
      toast.success('Profile deleted')
    } catch {
      toast.error('Could not delete profile')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleProfileClick(profile: ProfileSummary) {
    setSelectedProfile(profile)
    setDetailsModalOpen(true)
    try {
      const res = await fetch(`/api/career-profiles/${profile.id}`)
      if (res.ok) {
        setProfileDetails(await res.json())
      }
    } catch {
      toast.error('Could not load profile details')
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Career Profiles</h1>
          <p className="text-muted-foreground text-sm">
            Pivoting to a new career? Build a profile for each target role — our AI interviews you to surface relevant skills and experiences, then generates tailored resumes.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm" className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          New Profile
        </Button>
      </div>

      {/* ── Interactive Career Journey ─────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent border border-primary/10 p-6 bg-[length:32px_32px] bg-[image:linear-gradient(to_right,oklch(0_0_0/0.02)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0_0_0/0.02)_1px,transparent_1px)]">
        {/* Animated background orbs */}
        <div className="pointer-events-none absolute -inset-40 select-none">
          <div className="absolute top-0 right-0 h-60 w-60 rounded-full bg-primary/5 blur-3xl" style={{ animation: 'pulse 4s ease-in-out infinite' }} />
          <div className="absolute bottom-0 left-0 h-60 w-60 rounded-full bg-emerald-500/5 blur-3xl" style={{ animation: 'pulse 4s ease-in-out infinite 2s' }} />
        </div>

        {/* Header */}
        <div className="relative z-10 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary border-2 border-white ring-1 ring-black/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">How career profiles work</h2>
                <p className="text-xs text-muted-foreground">Click any stage to explore</p>
              </div>
            </div>
            {/* Step dots */}
            <div className="flex items-center gap-2">
              {[0, 1, 2].map(i => (
                <button
                  key={i}
                  onClick={() => setActiveStep(activeStep === i ? null : i)}
                  className={cn(
                    'h-2.5 rounded-full transition-all duration-500',
                    activeStep === i ? 'w-8 bg-primary shadow-sm shadow-primary/40' : 'w-2.5 bg-border hover:bg-primary/50'
                  )}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>
          </div>
          {/* Progress bar */}
          {activeStep !== null && (
            <div className="mt-3 h-1 rounded-full bg-border/50 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-700"
                style={{ width: `${((activeStep + 1) / 3) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Journey stages */}
        {(() => {
          const stepsData = [
            { icon: MessageSquare, title: 'AI Interview', tag: 'Step 1', desc: 'Our AI asks targeted questions about your target career', benefits: ['Cedie conducts a guided behavioral interview tailored to your background', 'Questions adapt in real-time based on your responses', 'Typically takes just 5-10 minutes to complete'], color: '#3b82f6' },
            { icon: Layers, title: 'Skills Mapped', tag: 'Step 2', desc: 'We surface relevant experience even from unrelated backgrounds', benefits: ['Identifies transferable skills you might have overlooked', 'Maps your unique experience to your target role\'s requirements', 'Builds a complete structured career profile ready for applications'], color: '#8b5cf6' },
            { icon: Wand2, title: 'Build Resumes', tag: 'Step 3', desc: 'Generate tailored resumes for any job in that new field', benefits: ['One-click generation of ATS-optimized resumes', 'Custom cover letters tailored to each application', 'Unlimited resumes — one profile powers every job you apply for'], color: '#10b981' },
          ]
          return (
            <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-start gap-0 md:gap-0">
              {stepsData.flatMap((step, i) => {
                const isActive = activeStep === i
                const isCompleted = activeStep !== null && i < activeStep
                const isPending = activeStep !== null && i > activeStep
                const stateClass = isActive
                  ? 'border-primary/30 bg-primary/[0.03] shadow-lg shadow-primary/10'
                  : isCompleted
                  ? 'border-primary/10 bg-primary/[0.02]'
                  : isPending
                  ? 'border-border/40 bg-muted/20 opacity-60'
                  : 'border-border/50 hover:border-primary/20 hover:bg-primary/[0.02] hover:-translate-y-0.5'

                const items: React.ReactNode[] = []

                /* Desktop connector between cards */
                if (i > 0) {
                  items.push(
                    <div key={`conn-${i}`} className="hidden md:flex items-center justify-center h-14 w-6 shrink-0 pt-5">
                      <div className="relative w-full h-0.5 bg-border/50">
                        <div
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/60 transition-all duration-700"
                          style={{ width: activeStep !== null && activeStep >= i ? '100%' : '0%' }}
                        />
                        <div
                          className="absolute right-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary shadow-sm shadow-primary/50 transition-all duration-500"
                          style={{ opacity: activeStep !== null && activeStep >= i ? 1 : 0 }}
                        />
                      </div>
                    </div>
                  )
                }

                /* Card */
                items.push(
                  <button key={`card-${i}`}
                    onClick={() => setActiveStep(isActive ? null : i)}
                    className={`flex-1 flex flex-col items-center text-center p-4 md:p-5 rounded-xl border bg-card transition-all duration-300 cursor-pointer relative ${stateClass}`}
                  >
                    <span className="md:hidden text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-2">{step.tag}</span>
                    <div className={cn(
                      'h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 border-2 border-white ring-1 ring-black/10',
                      isActive ? 'scale-110' : 'bg-muted/70'
                    )}
                      style={isActive ? { backgroundColor: step.color } : undefined}>
                      <step.icon className={cn('h-7 w-7 transition-all duration-300', isActive ? 'text-white' : 'text-foreground/70')} />
                    </div>
                    {isCompleted && (
                      <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <div className="mt-3">
                      <p className={cn('text-sm font-bold transition-colors', isActive && 'text-primary')}>{step.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.desc}</p>
                    </div>
                    <div className={cn(
                      'mt-2 h-5 w-5 rounded-full border transition-all duration-300 flex items-center justify-center',
                      isActive ? 'border-primary bg-primary text-white rotate-180' : 'border-border text-muted-foreground'
                    )}>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </button>
                )

                /* Mobile down-arrow between cards */
                if (i < stepsData.length - 1) {
                  items.push(
                    <div key={`mob-${i}`} className="md:hidden flex items-center justify-center py-1.5 w-full">
                      <ArrowRight className="h-4 w-4 text-muted-foreground/30 rotate-90" />
                    </div>
                  )
                }

                return items
              })}
            </div>
          )
        })()}

        {/* Expanded detail panel */}
        {activeStep !== null && (() => {
          const step = [
            { icon: MessageSquare, title: 'AI Interview', benefits: ['Cedie conducts a guided behavioral interview tailored to your background', 'Questions adapt in real-time based on your responses', 'Typically takes just 5-10 minutes to complete'] },
            { icon: Layers, title: 'Skills Mapped', benefits: ['Identifies transferable skills you might have overlooked', 'Maps your unique experience to your target role\'s requirements', 'Builds a complete structured career profile ready for applications'] },
            { icon: Wand2, title: 'Build Resumes', benefits: ['One-click generation of ATS-optimized resumes', 'Custom cover letters tailored to each application', 'Unlimited resumes — one profile powers every job you apply for'] },
          ][activeStep]
          return (
            <div className="relative z-10 mt-4 p-4 rounded-xl bg-background/60 border border-primary/10 backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-xl bg-muted/80 border-2 border-white ring-1 ring-black/10 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle className="h-4 w-4 text-foreground/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold mb-2">{step.title} — Key Benefits</p>
                  <ul className="space-y-1.5">
                    {step.benefits.map((benefit, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <ArrowRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Career path tags */}
        <div className="relative z-10 mt-6 pt-6 border-t border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-5 w-5 rounded-md bg-muted/80 border border-white ring-1 ring-black/10 flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-foreground/70" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Pivot to any career path</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {CAREER_EXAMPLES.slice(0, 8).map(career => (
              <button
                key={career}
                onClick={() => { setProfileName(career); setDialogOpen(true) }}
                className="group text-xs px-3 py-1.5 rounded-full bg-background border border-border text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
              >
                {career}
              </button>
            ))}
            <button
              onClick={() => setDialogOpen(true)}
              className="text-xs px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium hover:bg-primary/20 transition-all duration-200 hover:-translate-y-0.5 active:scale-95 inline-flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              any role
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground/50 mt-2">Click a path to get started</p>
        </div>
      </div>

      {/* Profile grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground animate-pulse">Loading your profiles…</p>
          </div>
        </div>
      ) : profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center relative overflow-hidden rounded-2xl border border-dashed border-border bg-gradient-to-b from-background to-muted/20">
          <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-primary/[0.04] blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-emerald-500/[0.04] blur-3xl" />
          <div className="relative">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 mx-auto shadow-lg shadow-primary/5">
              <Layers className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Ready to pivot careers?</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto leading-relaxed">
              Our AI will interview you about your target career, surface relevant skills from your background, and help you build tailored resumes.
            </p>
            <Button onClick={() => setDialogOpen(true)} size="lg" className="shadow-lg shadow-primary/20 gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Profile
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold">Your Profiles</h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {profiles.length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {profiles.length === 1 ? '1 career path ready to power your job search' : `${profiles.length} career paths ready to power your job search`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleGender}
                disabled={genderSaving}
                className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted"
                title="Toggle avatar gender"
              >
                {genderSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : gender === 'male' ? (
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M5 20v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M5 20v-2a7 7 0 0 1 14 0v2"/><path d="M12 20v-6"/></svg>
                )}
                <span className="capitalize">{gender}</span>
              </button>
            </div>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {profiles.map((profile, i) => (
              <div
                key={profile.id}
                onClick={() => handleProfileClick(profile)}
                className="group relative rounded-xl border bg-card p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 row-animate mx-auto w-full max-w-[260px] lg:max-w-none"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Avatar section */}
                <div className="relative mb-4 flex justify-center">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-2xl overflow-hidden ring-2 ring-border/50 group-hover:ring-primary/30 transition-all duration-300">
                      <img
                        src={gender === 'male' ? guySrc.src : girlSrc.src}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    {/* Status badge */}
                    <div className={cn(
                      'absolute -bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-bold px-2.5 py-0.5 rounded-full border-2 border-background shadow-sm whitespace-nowrap',
                      profile.completed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-500 text-white'
                    )}>
                      {profile.completed ? 'Ready' : 'In Progress'}
                    </div>
                  </div>
                </div>

                {/* Info section */}
                <div className="text-center">
                  <h3 className="font-bold text-sm mb-0.5 group-hover:text-primary transition-colors truncate">{profile.name}</h3>
                  <p className="text-[10px] text-muted-foreground/60">
                    Created {format(new Date(profile.created_at), 'MMM d, yyyy')}
                  </p>
                </div>

                {/* Progress indicator for incomplete profiles */}
                {!profile.completed && (
                  <div className="mt-3">
                    <div className="h-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full w-1/3 rounded-full bg-amber-400 animate-pulse" />
                    </div>
                    <p className="text-[9px] text-muted-foreground/50 mt-1 text-center">Interview in progress</p>
                  </div>
                )}

                {/* Hover overlay with quick actions */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-background/95 via-background/98 to-background backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                  <div className="flex flex-col gap-2 w-4/5" onClick={e => e.stopPropagation()}>
                    {profile.completed ? (
                      <button
                        onClick={() => { setDetailsModalOpen(false); router.push(`/build?profileId=${profile.id}`) }}
                        className="w-full text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg py-2.5 transition-all shadow-sm shadow-primary/20 active:scale-[0.98]"
                      >
                        <Wand2 className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                        Build Resume
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push(`/profiles/${profile.id}`)}
                        className="w-full text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg py-2.5 transition-all shadow-sm shadow-primary/20 active:scale-[0.98]"
                      >
                        <MessageSquare className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                        Continue Interview
                      </button>
                    )}
                    <button
                      onClick={() => { setDetailsModalOpen(false); router.push(`/profiles/${profile.id}/details`) }}
                      className="w-full text-xs font-semibold text-foreground/70 bg-muted hover:bg-muted/80 rounded-lg py-2 transition-all active:scale-[0.98]"
                    >
                      <Eye className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" />
                      View Profile
                    </button>
                    <button
                      onClick={(e) => handleDelete(profile.id, e)}
                      disabled={deletingId === profile.id}
                      className="w-full text-xs font-semibold text-red-500/70 hover:text-red-500 hover:bg-red-500/5 rounded-lg py-2 transition-all active:scale-[0.98] flex items-center justify-center gap-1"
                    >
                      {deletingId === profile.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* New profile card */}
            <button
              onClick={() => setDialogOpen(true)}
              className="group relative rounded-xl border-2 border-dashed border-border/60 hover:border-primary/40 bg-gradient-to-b from-transparent to-primary/[0.01] hover:to-primary/[0.03] p-5 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary transition-all duration-200 min-h-[200px] hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="h-14 w-14 rounded-2xl bg-muted/80 group-hover:bg-primary/10 flex items-center justify-center transition-all duration-200 group-hover:scale-110">
                <Plus className="h-7 w-7" />
              </div>
              <div className="text-center">
                <span className="text-sm font-bold block group-hover:text-primary transition-colors">New Career Profile</span>
                <span className="text-[11px] text-muted-foreground/50 mt-1 block">Start an AI interview for a new path</span>
              </div>
              <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-primary/5 text-primary/50 group-hover:bg-primary/10 group-hover:text-primary/80 transition-all border border-primary/10">
                Takes 5-10 min
              </span>
            </button>
          </div>
        </>
      )}

      {/* Create profile dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-md p-0 overflow-hidden gap-0">

          {/* Visual header */}
          <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-primary/10 via-primary/[0.05] to-transparent border-b border-border overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-primary/[0.07]" />
            <div className="absolute top-4 right-10 h-10 w-10 rounded-full bg-primary/[0.05]" />

            <div className="relative flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/25">
                <Layers className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <DialogTitle className="text-base font-bold leading-snug">
                  Create Career Profile
                </DialogTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Pivoting to a new career? Our AI will interview you to surface relevant skills from your background.
                </p>
                <div className="flex items-center gap-2 mt-2.5">
                  <span className="inline-flex items-center gap-1 text-[9px] px-2 py-1 rounded-full bg-primary/15 text-primary font-bold uppercase tracking-wider border border-primary/20">
                    <MessageSquare className="h-2.5 w-2.5" />
                    AI Career Interview
                  </span>
                  <span className="text-[10px] text-muted-foreground">· 5–10 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form body */}
          <div className="px-6 py-5 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold">What career do you want to pivot to?</label>
              <Input
                placeholder="e.g. Software Engineer, Product Manager…"
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !creating && handleCreate()}
                autoFocus
                className="h-11 text-sm"
              />
              <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                Our AI asks targeted questions about your target career and surfaces transferable skills — even from backgrounds that seem unrelated.
              </p>
            </div>

            {/* Quick picks */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <p className="text-xs font-semibold text-muted-foreground shrink-0">Quick picks</p>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => setProfileName(s)}
                    className={cn(
                      'text-xs px-3 py-1.5 rounded-full border font-medium transition-all duration-150',
                      profileName === s
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-105'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-2.5">
            <Button
              variant="outline"
              onClick={() => { setDialogOpen(false); setProfileName('') }}
              className="w-24 shrink-0"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!profileName.trim() || creating}
              className="flex-1 gap-2 font-semibold shadow-md shadow-primary/20"
              size="lg"
            >
              {creating
                ? <><Loader2 className="h-4 w-4 animate-spin" />Creating…</>
                : <><Wand2 className="h-4 w-4" />Start Interview <ArrowRight className="h-4 w-4 ml-0.5" /></>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Profile Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          {selectedProfile && profileDetails && (
            <>
              <DialogTitle className="text-lg font-bold">{selectedProfile.name}</DialogTitle>
              
              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Status</span>
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    selectedProfile.completed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {selectedProfile.completed ? "Completed" : "In Progress"}
                  </span>
                </div>

                {/* Summary */}
                {profileDetails.profile?.summary && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Summary</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{profileDetails.profile.summary}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="pt-4 border-t border-border flex gap-2">
                  {selectedProfile.completed && (
                    <button
                      onClick={() => { setDetailsModalOpen(false); router.push(`/build?profileId=${selectedProfile.id}`) }}
                      className="flex-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground rounded-lg py-2.5 transition-all"
                    >
                      Build Resume
                    </button>
                  )}
                  {!selectedProfile.completed && (
                    <button
                      onClick={() => { setDetailsModalOpen(false); router.push(`/profiles/${selectedProfile.id}`) }}
                      className="flex-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground rounded-lg py-2.5 transition-all"
                    >
                      Continue Interview
                    </button>
                  )}
                  <button
                    onClick={() => { setDetailsModalOpen(false); router.push(`/profiles/${selectedProfile.id}/details`) }}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-lg hover:bg-muted transition-all"
                  >
                    View Full
                  </button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
