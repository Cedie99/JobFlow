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
    <div className="p-6 space-y-6">
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

      {/* ── Career Builder Explainer ─────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent border border-primary/10 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold">How career profiles work</h2>
        </div>

        {/* 3-step flow - simplified */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <MessageSquare className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold">1. AI Interview</p>
              <p className="text-xs text-muted-foreground mt-1">Our AI asks targeted questions about your target career</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Layers className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold">2. Skills Mapped</p>
              <p className="text-xs text-muted-foreground mt-1">We surface relevant experience even from unrelated backgrounds</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Wand2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-700">3. Build Resumes</p>
              <p className="text-xs text-muted-foreground mt-1">Generate tailored resumes for any job in that new field</p>
            </div>
          </div>
        </div>

        {/* Career examples - simplified */}
        <div className="mt-6 pt-6 border-t border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-3">Pivot to any career path</p>
          <div className="flex flex-wrap gap-2">
            {['Software Engineer', 'Product Manager', 'UX Designer', 'Marketing', 'Sales', 'Customer Service'].map(career => (
              <span
                key={career}
                className="text-xs px-3 py-1.5 rounded-full bg-background border border-border text-muted-foreground hover:border-primary/50 transition-colors"
              >
                {career}
              </span>
            ))}
            <span className="text-xs px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium">
              + any role
            </span>
          </div>
        </div>
      </div>

      {/* Profile grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6">
            <Layers className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Ready to pivot careers?</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Our AI will interview you about your target career, surface relevant skills from your background, and help you build tailored resumes.
          </p>
          <Button onClick={() => setDialogOpen(true)} size="lg" className="shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" />
            Create Profile
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Your profiles ({profiles.length})
            </h3>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {profiles.map(profile => (
              <div
                key={profile.id}
                onClick={() => handleProfileClick(profile)}
                className="group flex flex-col items-center text-center cursor-pointer"
              >
                {/* Person illustration - faceless 3D */}
                <div className="relative mb-4">
                  <div className="h-28 w-28 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent group-hover:shadow-xl group-hover:shadow-primary/15 transition-all duration-300 overflow-hidden relative">
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 rounded-full blur-2xl" />
                      <div className="absolute bottom-0 left-0 w-12 h-12 bg-primary/10 rounded-full blur-xl" />
                    </div>
                    
                    {/* Person silhouette - 3D effect */}
                    <div className="relative flex flex-col items-center justify-center h-full pt-2">
                      {/* Head with 3D shadow */}
                      <div className="relative">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 shadow-2xl shadow-primary/30" />
                        {/* 3D highlight */}
                        <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-white/30 blur-sm" />
                        {/* 3D shadow */}
                        <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-black/10 blur-sm" />
                      </div>
                      {/* Body with 3D shadow */}
                      <div className="mt-1 h-8 w-16 rounded-t-3xl bg-gradient-to-b from-primary/90 to-primary/70 shadow-xl shadow-primary/20" />
                      {/* Body highlight */}
                      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-8 h-2 rounded-full bg-white/20 blur-sm" />
                    </div>
                  </div>
                  
                  {/* Status indicator */}
                  {profile.completed && (
                    <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-emerald-500 border-3 border-background flex items-center justify-center shadow-lg">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                  {!profile.completed && (
                    <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-amber-500 border-3 border-background flex items-center justify-center shadow-lg">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                {/* Career title */}
                <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{profile.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {profile.completed ? 'Ready to build' : 'In progress'}
                </p>
              </div>
            ))}

            {/* New profile card */}
            <button
              onClick={() => setDialogOpen(true)}
              className="rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/[0.03] p-6 flex flex-col items-center justify-center gap-4 text-muted-foreground hover:text-primary transition-all duration-200 min-h-[180px]"
            >
              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Plus className="h-6 w-6" />
              </div>
              <div className="text-center">
                <span className="text-sm font-semibold block">Add New Profile</span>
                <span className="text-xs text-muted-foreground/60 mt-1 block">Create another career path</span>
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
