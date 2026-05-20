'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Plus, Layers, CheckCircle, Clock, Trash2, Wand2,
  ArrowRight, Loader2, MessageSquare,
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
      const res = await fetch('/api/career-profiles')
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
            Create a profile for each career path you're targeting. Cedie will interview you and build a persona for each one.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm" className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          New Profile
        </Button>
      </div>

      {/* Profile grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-full bg-muted p-5 mb-4">
            <Layers className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-base font-semibold">No profiles yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-5 max-w-xs">
            Create your first career profile and Cedie will interview you to understand your background for that path.
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create your first profile
          </Button>
        </div>
      ) : (
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
                {profile.completed ? 'Complete' : 'In progress'}
              </div>

              <h3 className="font-semibold text-base leading-tight mb-1">{profile.name}</h3>
              <p className="text-[11px] text-muted-foreground">
                Created {format(new Date(profile.created_at), 'MMM d, yyyy')}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/60">
                <button
                  onClick={(e) => { e.stopPropagation(); router.push(`/profiles/${profile.id}`) }}
                  className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium text-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground rounded-lg py-1.5 transition-all"
                >
                  <MessageSquare className="h-3 w-3" />
                  {profile.completed ? 'View / Update' : 'Continue Interview'}
                </button>

                {profile.completed && (
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`/build?profileId=${profile.id}`) }}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground hover:text-primary px-2.5 py-1.5 rounded-lg hover:bg-muted transition-all"
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
            <span className="text-sm font-medium">New Profile</span>
          </button>
        </div>
      )}

      {/* Create profile dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              Create Career Profile
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">What career path is this profile for?</p>
              <Input
                placeholder="e.g. Software Engineer"
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !creating && handleCreate()}
                autoFocus
              />
            </div>

            {/* Suggestions */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Quick picks</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => setProfileName(s)}
                    className={cn(
                      'text-xs px-2.5 py-1 rounded-full border transition-all',
                      profileName === s
                        ? 'border-primary bg-primary/10 text-primary font-medium'
                        : 'border-border hover:border-primary/30 hover:bg-muted text-muted-foreground'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" onClick={() => { setDialogOpen(false); setProfileName('') }} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!profileName.trim() || creating} className="flex-1 gap-2">
              {creating
                ? <><Loader2 className="h-4 w-4 animate-spin" />Creating…</>
                : <>Start Interview <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
