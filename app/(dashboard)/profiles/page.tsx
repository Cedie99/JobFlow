'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  Plus, Layers, CheckCircle, Clock, Trash2, Wand2,
  ArrowRight, Loader2, MessageSquare, Sparkles, Compass, Rocket,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { format } from 'date-fns'

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

const STEPS = [
  {
    icon: MessageSquare,
    title: 'AI Interview',
    desc: 'Cedie asks targeted questions about your target career.',
    tint: 'from-blue-500 to-indigo-500',
  },
  {
    icon: Layers,
    title: 'Skills Mapped',
    desc: 'We surface relevant experience — even from unrelated backgrounds.',
    tint: 'from-violet-500 to-fuchsia-500',
  },
  {
    icon: Rocket,
    title: 'Build Resumes',
    desc: 'Generate tailored resumes for any job in that new field.',
    tint: 'from-emerald-500 to-teal-500',
  },
]

// Per-profile accent palette — picked deterministically from the profile name.
const ACCENTS = [
  { grad: 'from-blue-500 to-indigo-500', glow: 'shadow-blue-500/30', ring: 'group-hover:ring-blue-500/40' },
  { grad: 'from-violet-500 to-purple-500', glow: 'shadow-violet-500/30', ring: 'group-hover:ring-violet-500/40' },
  { grad: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/30', ring: 'group-hover:ring-emerald-500/40' },
  { grad: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/30', ring: 'group-hover:ring-amber-500/40' },
  { grad: 'from-rose-500 to-pink-500', glow: 'shadow-rose-500/30', ring: 'group-hover:ring-rose-500/40' },
  { grad: 'from-cyan-500 to-sky-500', glow: 'shadow-cyan-500/30', ring: 'group-hover:ring-cyan-500/40' },
  { grad: 'from-fuchsia-500 to-purple-500', glow: 'shadow-fuchsia-500/30', ring: 'group-hover:ring-fuchsia-500/40' },
  { grad: 'from-lime-500 to-emerald-500', glow: 'shadow-lime-500/30', ring: 'group-hover:ring-lime-500/40' },
]

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

function accentFor(name: string) {
  return ACCENTS[hashString(name) % ACCENTS.length]
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

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

  useEffect(() => { fetchProfiles() }, [])

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
    setProfileDetails(null)
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

  const readyCount = profiles.filter(p => p.completed).length
  const inProgressCount = profiles.length - readyCount

  return (
    <div className="p-5 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">

      {/* ── Aurora hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-primary/[0.12] via-violet-500/[0.06] to-emerald-500/[0.08] px-6 py-8 sm:px-9 sm:py-10">
        {/* animated aurora orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-primary/25 blur-3xl aurora-float" />
          <div className="absolute -bottom-28 right-0 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl aurora-float [animation-delay:-3s]" />
          <div className="absolute top-10 right-1/3 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl aurora-float [animation-delay:-6s]" />
        </div>
        {/* grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(to right, color-mix(in oklch, var(--primary) 22%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--primary) 22%, transparent) 1px, transparent 1px)',
            backgroundSize: '38px 38px',
            maskImage: 'radial-gradient(ellipse at top left, black, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse at top left, black, transparent 75%)',
          }}
        />

        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-background/70 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              AI Career Builder
            </span>
            <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
              <span className="bg-gradient-to-r from-primary via-violet-500 to-emerald-500 bg-clip-text text-transparent">
                Career Profiles
              </span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Pivoting to a new career? Build a profile for each target role — Cedie
              interviews you to surface relevant skills and experiences, then generates
              tailored resumes.
            </p>

            <Button
              onClick={() => setDialogOpen(true)}
              size="lg"
              className="mt-6 gap-2 rounded-xl font-semibold shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              New Profile
            </Button>
          </div>

          {/* live stat chips */}
          <div className="grid w-full max-w-sm grid-cols-3 gap-3 lg:w-auto">
            <StatChip label="Profiles" value={profiles.length} icon={Layers} tint="text-primary" />
            <StatChip label="Ready" value={readyCount} icon={CheckCircle} tint="text-emerald-500" />
            <StatChip label="In progress" value={inProgressCount} icon={Clock} tint="text-amber-500" />
          </div>
        </div>
      </section>

      {/* ── Journey rail ────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="mb-7 flex items-center gap-2">
          <Compass className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">How career profiles work</h2>
        </div>

        <div className="relative grid gap-8 md:grid-cols-3">
          {/* connector line (desktop) */}
          <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-blue-500/40 via-violet-500/40 to-emerald-500/40 md:block" />

          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={step.title} className="relative flex flex-col items-center text-center md:items-start md:text-left">
                <div className="relative z-10 mb-4 flex items-center gap-3">
                  <div className={cn(
                    'flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ring-4 ring-card',
                    step.tint,
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-3xl font-black text-muted-foreground/20">{`0${i + 1}`}</span>
                </div>
                <p className="text-sm font-bold">{step.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-8 border-t border-border/60 pt-6">
          <p className="mb-3 text-xs font-semibold text-muted-foreground">Pivot to any career path</p>
          <div className="flex flex-wrap gap-2">
            {['Software Engineer', 'Product Manager', 'UX Designer', 'Marketing', 'Sales', 'Customer Service'].map(career => (
              <span
                key={career}
                className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                {career}
              </span>
            ))}
            <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              + any role
            </span>
          </div>
        </div>
      </section>

      {/* ── Profiles ────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-primary/25 bg-gradient-to-b from-primary/[0.04] to-transparent py-20 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-2xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-violet-500 shadow-xl shadow-primary/30">
              <Layers className="h-10 w-10 text-white" />
            </div>
          </div>
          <h3 className="mb-2 text-xl font-bold">Ready to pivot careers?</h3>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            Cedie will interview you about your target career, surface relevant skills
            from your background, and help you build tailored resumes.
          </p>
          <Button onClick={() => setDialogOpen(true)} size="lg" className="gap-2 rounded-xl shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            Create your first profile
          </Button>
        </div>
      ) : (
        <section>
          <div className="mb-5 flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Your profiles</h3>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">{profiles.length}</span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {profiles.map((profile, i) => {
              const accent = accentFor(profile.name)
              const isDeleting = deletingId === profile.id
              return (
                <div
                  key={profile.id}
                  onClick={() => handleProfileClick(profile)}
                  style={{ animationDelay: `${i * 50}ms` }}
                  className={cn(
                    'profile-card group relative cursor-pointer overflow-hidden rounded-3xl border border-border bg-card p-5',
                    'ring-1 ring-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl',
                    accent.ring,
                  )}
                >
                  {/* top accent bar */}
                  <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', accent.grad)} />
                  {/* hover glow */}
                  <div className={cn(
                    'pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-30',
                    accent.grad,
                  )} />

                  <div className="relative flex items-start justify-between">
                    {/* gradient initials avatar */}
                    <div className={cn(
                      'flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br text-xl font-black text-white shadow-lg transition-transform duration-300 group-hover:scale-105',
                      accent.grad, accent.glow,
                    )}>
                      {initials(profile.name)}
                    </div>

                    {/* delete button (reveals on hover) */}
                    <button
                      onClick={(e) => handleDelete(profile.id, e)}
                      disabled={isDeleting}
                      aria-label="Delete profile"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground/60 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      {isDeleting
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="relative mt-4">
                    <h3 className="truncate text-base font-bold transition-colors group-hover:text-primary">
                      {profile.name}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Created {format(new Date(profile.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>

                  {/* status pill */}
                  <div className="relative mt-4 flex items-center justify-between">
                    {profile.completed ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/12 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Ready to build
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/12 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        <Clock className="h-3.5 w-3.5 pulse-dot" />
                        In progress
                      </span>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </div>
              )
            })}

            {/* New profile tile */}
            <button
              onClick={() => setDialogOpen(true)}
              className="group relative flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-border p-6 text-muted-foreground transition-all duration-200 hover:border-primary/50 hover:bg-primary/[0.03] hover:text-primary"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/30">
                <Plus className="h-7 w-7" />
              </div>
              <div className="text-center">
                <span className="block text-sm font-bold">Add new profile</span>
                <span className="mt-1 block text-xs text-muted-foreground/60">Create another career path</span>
              </div>
            </button>
          </div>
        </section>
      )}

      {/* ── Create profile dialog ───────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent showCloseButton={false} className="gap-0 overflow-hidden p-0 sm:max-w-md">

          {/* Visual header */}
          <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/15 via-violet-500/10 to-emerald-500/10 px-6 pb-5 pt-6">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10" />
            <div className="absolute right-10 top-4 h-10 w-10 rounded-full bg-primary/[0.07]" />

            <div className="relative flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-500 shadow-lg shadow-primary/25">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <DialogTitle className="text-base font-bold leading-snug">
                  Create Career Profile
                </DialogTitle>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Pivoting to a new career? Cedie will interview you to surface relevant
                  skills from your background.
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/15 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-primary">
                    <MessageSquare className="h-2.5 w-2.5" />
                    AI Career Interview
                  </span>
                  <span className="text-[10px] text-muted-foreground">· 5–10 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form body */}
          <div className="space-y-5 px-6 py-5">
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
              <p className="text-[11px] leading-relaxed text-muted-foreground/70">
                Cedie asks targeted questions about your target career and surfaces
                transferable skills — even from backgrounds that seem unrelated.
              </p>
            </div>

            {/* Quick picks */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <p className="shrink-0 text-xs font-semibold text-muted-foreground">Quick picks</p>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => setProfileName(s)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150',
                      profileName === s
                        ? 'scale-105 border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2.5 px-6 pb-6">
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
                : <><Wand2 className="h-4 w-4" />Start Interview <ArrowRight className="ml-0.5 h-4 w-4" /></>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Profile details modal ───────────────────────────────── */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
          {selectedProfile && (
            <>
              {/* header */}
              <div className={cn(
                'relative overflow-hidden border-b border-border px-6 py-5',
                'bg-gradient-to-br', accentFor(selectedProfile.name).grad, 'text-white',
              )}>
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/15 blur-xl" />
                <div className="relative flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-lg font-black backdrop-blur-sm">
                    {initials(selectedProfile.name)}
                  </div>
                  <div className="min-w-0">
                    <DialogTitle className="truncate text-lg font-bold text-white">{selectedProfile.name}</DialogTitle>
                    <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-sm">
                      {selectedProfile.completed
                        ? <><CheckCircle className="h-3 w-3" />Completed</>
                        : <><Clock className="h-3 w-3" />In Progress</>}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 px-6 py-5">
                {profileDetails === null ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  profileDetails.profile?.summary && (
                    <div>
                      <p className="mb-1 text-xs font-semibold text-muted-foreground">Summary</p>
                      <p className="text-sm leading-relaxed text-muted-foreground">{profileDetails.profile.summary}</p>
                    </div>
                  )
                )}

                {/* Action buttons */}
                <div className="flex gap-2 border-t border-border pt-4">
                  {selectedProfile.completed ? (
                    <button
                      onClick={() => { setDetailsModalOpen(false); router.push(`/build?profileId=${selectedProfile.id}`) }}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90"
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      Build Resume
                    </button>
                  ) : (
                    <button
                      onClick={() => { setDetailsModalOpen(false); router.push(`/profiles/${selectedProfile.id}`) }}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Continue Interview
                    </button>
                  )}
                  <button
                    onClick={() => { setDetailsModalOpen(false); router.push(`/profiles/${selectedProfile.id}/details`) }}
                    className="rounded-lg px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
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

function StatChip({
  label, value, icon: Icon, tint,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  tint: string
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-3 backdrop-blur-sm">
      <Icon className={cn('h-4 w-4', tint)} />
      <p className="mt-2 text-2xl font-black leading-none">{value}</p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  )
}
