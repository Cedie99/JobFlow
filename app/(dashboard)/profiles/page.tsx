'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  Plus, Layers, CheckCircle, Clock, Trash2, Wand2,
  ArrowRight, Loader2, MessageSquare, Sparkles, Eye,
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold">Career Profiles</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            One AI interview per career path — then generate tailored resumes for any job in that field, instantly.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm" className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          New Profile
        </Button>
      </div>

      {/* ── Career Builder Explainer ─────────────────────── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 pt-4 pb-3 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <p className="text-xs font-semibold text-primary">How the AI Resume Builder works</p>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
            You&apos;re not limited to one career path. Create a separate profile for every role type you want to target —
            software engineering, customer service, marketing, anything — and generate unlimited tailored resumes from each.
          </p>
        </div>

        <div className="px-5 py-4">
          {/* 3-step flow */}
          <div className="flex items-start gap-2 mb-5">
            {/* Step 1 */}
            <div className="flex-1 flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <MessageSquare className="h-[18px] w-[18px] text-primary" />
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <p className="text-[11px] font-semibold">1. Guided Interview</p>
                  <span className="text-[8px] px-1.5 py-px rounded-full bg-primary/10 text-primary font-semibold uppercase tracking-wide leading-none py-0.5">
                    Behavioral
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Cedie asks about real experiences and surfaces transferable skills — even ones you wouldn&apos;t think to mention
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center pt-4 shrink-0">
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/25" />
            </div>

            {/* Step 2 */}
            <div className="flex-1 flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Layers className="h-[18px] w-[18px] text-primary" />
              </div>
              <div>
                <p className="text-[11px] font-semibold">2. Profile Saved</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                  Your career profile is stored and reusable for any job in this field
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center pt-4 shrink-0">
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/25" />
            </div>

            {/* Step 3 */}
            <div className="flex-1 flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <Wand2 className="h-[18px] w-[18px] text-emerald-600" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-emerald-700">3. Build Any Resume</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                  Paste any job posting → Claude writes a tailored resume in seconds
                </p>
              </div>
            </div>
          </div>

          {/* Career diversity */}
          <div className="border-t border-border/60 pt-3">
            <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-wider mb-2">
              Works for any career you want to apply to:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CAREER_EXAMPLES.map(career => (
                <span
                  key={career}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground"
                >
                  {career}
                </span>
              ))}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium">
                + any role you&apos;re after
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-5 mb-4">
            <Layers className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-base font-semibold">No profiles yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-5 max-w-xs">
            Create your first career profile. Cedie will interview you in 5–10 minutes, then you can build resumes for any job in that field.
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create your first profile
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider">
              Your career paths ({profiles.length})
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map(profile => (
              <div
                key={profile.id}
                onClick={() => router.push(`/profiles/${profile.id}`)}
                className="group relative rounded-xl border border-border bg-card p-5 cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all duration-150"
              >
                {/* Status badge */}
                <div className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium mb-3',
                  profile.completed
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                    : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                )}>
                  {profile.completed
                    ? <CheckCircle className="h-3 w-3" />
                    : <Clock className="h-3 w-3" />}
                  {profile.completed ? 'Ready to build' : 'Interview in progress'}
                </div>

                <h3 className="font-semibold text-base leading-tight mb-1">{profile.name}</h3>
                <p className="text-[11px] text-muted-foreground">
                  Created {format(new Date(profile.created_at), 'MMM d, yyyy')}
                </p>

                {/* Unlock hint for incomplete profiles */}
                {!profile.completed && (
                  <p className="text-[10px] text-amber-600/80 mt-1.5 flex items-center gap-1">
                    <Wand2 className="h-2.5 w-2.5" />
                    Finish interview to unlock resume builder
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/60">
                  {!profile.completed && (
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/profiles/${profile.id}`) }}
                      className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground rounded-lg py-1.5 transition-all"
                    >
                      <MessageSquare className="h-3 w-3" />
                      Continue Interview
                    </button>
                  )}

                  {profile.completed && (
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/profiles/${profile.id}/details`) }}
                      className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white px-2.5 py-1.5 rounded-lg transition-all border border-blue-200 hover:border-blue-600"
                    >
                      <Eye className="h-3 w-3" />
                      View Details
                    </button>
                  )}

                  {profile.completed && (
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/build?profileId=${profile.id}`) }}
                      className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white px-2.5 py-1.5 rounded-lg transition-all border border-emerald-200 hover:border-emerald-600"
                    >
                      <Wand2 className="h-3 w-3" />
                      Build Resume
                    </button>
                  )}

                  <button
                    onClick={(e) => handleDelete(profile.id, e)}
                    disabled={deletingId === profile.id}
                    className="flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    {deletingId === profile.id
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <Trash2 className="h-3 w-3" />}
                  </button>
                </div>

                {/* Hover arrow */}
                <ArrowRight className="absolute top-5 right-5 h-4 w-4 text-muted-foreground/0 group-hover:text-primary/40 transition-all duration-150 group-hover:translate-x-0.5" />
              </div>
            ))}

            {/* New profile card */}
            <button
              onClick={() => setDialogOpen(true)}
              className="rounded-xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/[0.02] p-5 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary transition-all duration-150 min-h-[160px]"
            >
              <div className="rounded-full bg-muted p-2.5">
                <Plus className="h-4 w-4" />
              </div>
              <div className="text-center">
                <span className="text-sm font-medium block">New Profile</span>
                <span className="text-[10px] text-muted-foreground/60 mt-0.5 block">Add another career path</span>
              </div>
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
                  Tell Cedie which career you&apos;re targeting — he&apos;ll do the rest.
                </p>
                <div className="flex items-center gap-2 mt-2.5">
                  <span className="inline-flex items-center gap-1 text-[9px] px-2 py-1 rounded-full bg-primary/15 text-primary font-bold uppercase tracking-wider border border-primary/20">
                    <MessageSquare className="h-2.5 w-2.5" />
                    Guided Behavioral Interview
                  </span>
                  <span className="text-[10px] text-muted-foreground">· 5–10 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form body */}
          <div className="px-6 py-5 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold">What career path is this profile for?</label>
              <Input
                placeholder="e.g. Software Engineer, Call Center Agent…"
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !creating && handleCreate()}
                autoFocus
                className="h-11 text-sm"
              />
              <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                Cedie uses a <span className="font-semibold text-muted-foreground">guided behavioral interview</span> —
                he&apos;ll ask about real experiences and surface transferable skills, even from backgrounds that seem unrelated.
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
    </div>
  )
}
