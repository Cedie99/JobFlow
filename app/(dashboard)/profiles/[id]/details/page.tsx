'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Loader2,
  Pencil,
  X,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Link2,
  Code2,
  Briefcase,
  GraduationCap,
  FolderOpen,
  Award,
  ShieldCheck,
  Sparkles,
  Target,
  Brain,
  Plus,
  Trash2,
  Wand2,
  ChevronRight,
  Clock,
  Building2,
  Calendar,
  Globe,
  Quote,
  Star,
  BookOpen,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import guySrc from '@/assets/3d-guy.jpg'
import girlSrc from '@/assets/3d-girl.jpg'
import type {
  ProfileData,
  ExperienceEntry,
  EducationEntry,
  ProjectEntry,
  SkillCategory,
  AwardEntry,
  CertificationEntry,
} from '@/types'

interface CareerProfileResponse {
  id: string
  name: string
  profile: ProfileData | null
  completed: boolean
  created_at: string
  updated_at: string
}

// ── Color palette for personality traits ──
const TRAIT_COLORS = [
  'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800',
  'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
  'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800',
  'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function ProfileDetailsPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<CareerProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<ProfileData | null>(null)
  const [gender, setGender] = useState<'male' | 'female'>('male')

  useEffect(() => {
    fetch('/api/user/gender')
      .then(r => r.json())
      .then(d => { if (d.gender) setGender(d.gender) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/career-profiles/${id}`)
        if (!res.ok) throw new Error()
        const data: CareerProfileResponse = await res.json()
        setProfile(data)
        setDraft(data.profile ? structuredClone(data.profile) : null)
      } catch {
        toast.error('Could not load profile')
        router.push('/profiles')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, router])

  function startEditing() {
    setDraft(profile?.profile ? structuredClone(profile.profile) : null)
    setEditing(true)
  }

  function cancelEditing() {
    setDraft(profile?.profile ? structuredClone(profile.profile) : null)
    setEditing(false)
  }

  async function handleSave() {
    if (!draft) return
    setSaving(true)
    try {
      const res = await fetch(`/api/career-profiles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: draft }),
      })
      if (!res.ok) throw new Error()
      const updated: CareerProfileResponse = await res.json()
      setProfile(updated)
      setDraft(updated.profile ? structuredClone(updated.profile) : null)
      setEditing(false)
      toast.success('Profile updated')
    } catch {
      toast.error('Could not save changes')
    } finally {
      setSaving(false)
    }
  }

  // Helpers to update nested draft fields
  function updateField<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setDraft(prev => prev ? { ...prev, [key]: value } : prev)
  }

  function updateExperience(index: number, field: keyof ExperienceEntry, value: string | string[]) {
    setDraft(prev => {
      if (!prev) return prev
      const items = [...prev.experience]
      items[index] = { ...items[index], [field]: value }
      return { ...prev, experience: items }
    })
  }

  function updateEducation(index: number, field: keyof EducationEntry, value: string) {
    setDraft(prev => {
      if (!prev) return prev
      const items = [...prev.education]
      items[index] = { ...items[index], [field]: value }
      return { ...prev, education: items }
    })
  }

  function updateProject(index: number, field: keyof ProjectEntry, value: string | string[]) {
    setDraft(prev => {
      if (!prev) return prev
      const items = [...prev.projects]
      items[index] = { ...items[index], [field]: value }
      return { ...prev, projects: items }
    })
  }

  function updateSkill(index: number, field: keyof SkillCategory, value: string | string[]) {
    setDraft(prev => {
      if (!prev) return prev
      const items = [...prev.skills]
      items[index] = { ...items[index], [field]: value } as SkillCategory
      return { ...prev, skills: items }
    })
  }

  function updateAward(index: number, field: keyof AwardEntry, value: string) {
    setDraft(prev => {
      if (!prev) return prev
      const items = [...prev.awards]
      items[index] = { ...items[index], [field]: value }
      return { ...prev, awards: items }
    })
  }

  function updateCertification(index: number, field: keyof CertificationEntry, value: string) {
    setDraft(prev => {
      if (!prev) return prev
      const items = [...prev.certifications]
      items[index] = { ...items[index], [field]: value }
      return { ...prev, certifications: items }
    })
  }

  // Add/remove helpers
  function addExperience() {
    setDraft(prev => prev ? {
      ...prev,
      experience: [...prev.experience, { title: '', company: '', location: '', duration: '', bullets: [''] }],
    } : prev)
  }

  function removeExperience(index: number) {
    setDraft(prev => prev ? { ...prev, experience: prev.experience.filter((_, i) => i !== index) } : prev)
  }

  function addEducation() {
    setDraft(prev => prev ? {
      ...prev,
      education: [...prev.education, { degree: '', institution: '', location: '', year: '', gpa: '' }],
    } : prev)
  }

  function removeEducation(index: number) {
    setDraft(prev => prev ? { ...prev, education: prev.education.filter((_, i) => i !== index) } : prev)
  }

  function addProject() {
    setDraft(prev => prev ? {
      ...prev,
      projects: [...prev.projects, { name: '', techStack: '', duration: '', bullets: [''] }],
    } : prev)
  }

  function removeProject(index: number) {
    setDraft(prev => prev ? { ...prev, projects: prev.projects.filter((_, i) => i !== index) } : prev)
  }

  function addSkillCategory() {
    setDraft(prev => prev ? {
      ...prev,
      skills: [...prev.skills, { category: '', items: [''] }],
    } : prev)
  }

  function removeSkillCategory(index: number) {
    setDraft(prev => prev ? { ...prev, skills: prev.skills.filter((_, i) => i !== index) } : prev)
  }

  function addAward() {
    setDraft(prev => prev ? {
      ...prev,
      awards: [...prev.awards, { name: '', issuer: '', year: '' }],
    } : prev)
  }

  function removeAward(index: number) {
    setDraft(prev => prev ? { ...prev, awards: prev.awards.filter((_, i) => i !== index) } : prev)
  }

  function addCertification() {
    setDraft(prev => prev ? {
      ...prev,
      certifications: [...prev.certifications, { name: '', issuer: '', year: '' }],
    } : prev)
  }

  function removeCertification(index: number) {
    setDraft(prev => prev ? { ...prev, certifications: prev.certifications.filter((_, i) => i !== index) } : prev)
  }

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center bg-gradient-to-br from-background to-primary/5">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="absolute -inset-4 bg-primary/10 rounded-full blur-xl" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading profile…</p>
        </div>
      </div>
    )
  }

  if (!profile || !profile.profile) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-6 p-6 bg-gradient-to-br from-background to-primary/5">
        <div className="relative">
          <div className="rounded-full bg-muted p-6 ring-1 ring-border">
            <User className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <div className="absolute -inset-2 bg-primary/5 rounded-full blur-2xl" />
        </div>
        <div className="text-center max-w-sm">
          <p className="text-lg font-semibold">No profile data yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Complete the AI interview first to generate your career profile.
          </p>
        </div>
        <Button variant="default" className="shadow-lg shadow-primary/20" onClick={() => router.push(`/profiles/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go to Interview
        </Button>
      </div>
    )
  }

  const data = editing ? draft! : profile.profile

  return (
    <div className="min-h-full bg-gradient-to-br from-background via-background to-primary/5 pb-32">
      {/* ── Background decoration ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      {/* ── Hero Header ── */}
      <div className="relative border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/profiles')}
                className="flex items-center justify-center h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all active:scale-95"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{profile.name}</h1>
                  <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 font-medium px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <Button variant="ghost" size="sm" onClick={cancelEditing} disabled={saving}>
                    <X className="h-3.5 w-3.5 mr-1.5" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="shadow-lg shadow-primary/25"
                  >
                    {saving ? (
                      <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving…</>
                    ) : (
                      <><Save className="h-3.5 w-3.5 mr-1.5" />Save Changes</>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={startEditing} className="hidden sm:inline-flex">
                    <Pencil className="h-3.5 w-3.5 mr-1.5" />
                    Edit Profile
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/build?profileId=${id}`)}
                    className="shadow-lg shadow-primary/25"
                  >
                    <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                    Build Resume
                  </Button>
                </>
              )}
            </div>
          </div>
          {/* Mobile edit button */}
          {!editing && (
            <div className="flex sm:hidden mt-3 gap-2">
              <Button variant="outline" size="sm" onClick={startEditing} className="flex-1">
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit Profile
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="px-4 sm:px-6 lg:px-8 mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left Sidebar ── */}
        <aside className="lg:col-span-3 lg:sticky lg:top-8 lg:self-start space-y-6">
          {/* Profile Identity Card */}
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/10" />
            <div className="relative p-6 text-center">
              <div className="mx-auto mb-4 h-20 w-20 rounded-2xl overflow-hidden ring-2 ring-border/50 shadow-lg shadow-primary/20">
                <img
                  src={gender === 'male' ? guySrc.src : girlSrc.src}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold">{data.fullName}</h3>
              {editing ? (
                <div className="mt-3 space-y-2">
                  <Input
                    value={draft?.fullName ?? ''}
                    onChange={e => updateField('fullName', e.target.value)}
                    className="text-sm text-center"
                    placeholder="Full Name"
                  />
                </div>
              ) : (
                data.location && (
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5 mt-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {data.location}
                  </p>
                )
              )}
            </div>
            {!editing && (
              <div className="border-t border-border/50 px-6 py-4 space-y-3">
                {data.email && (
                  <a href={`mailto:${data.email}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Mail className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="truncate">{data.email}</span>
                  </a>
                )}
                {data.phone && (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span>{data.phone}</span>
                  </div>
                )}
                {data.linkedin && (
                  <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Link2 className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="truncate">LinkedIn</span>
                    <ExternalLink className="h-3 w-3 ml-auto shrink-0 opacity-40" />
                  </a>
                )}
                {data.github && (
                  <a href={data.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Code2 className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="truncate">GitHub</span>
                    <ExternalLink className="h-3 w-3 ml-auto shrink-0 opacity-40" />
                  </a>
                )}
                {data.personalityTraits?.length > 0 && (
                  <div className="pt-2 border-t border-border/30">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Personality</p>
                    <div className="flex flex-wrap gap-1.5">
                      {data.personalityTraits.map((trait, i) => (
                        <span
                          key={i}
                          className={cn(
                            'text-[11px] px-2 py-0.5 rounded-full border font-medium',
                            TRAIT_COLORS[i % TRAIT_COLORS.length]
                          )}
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Stats Card */}
          {!editing && (
            <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-5">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Profile Stats</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <p className="text-2xl font-bold text-primary">{data.experience?.length || 0}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Experience</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <p className="text-2xl font-bold text-primary">{data.skills?.reduce((a, c) => a + c.items.length, 0) || 0}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Skills</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <p className="text-2xl font-bold text-primary">{data.education?.length || 0}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Education</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/50">
                  <p className="text-2xl font-bold text-primary">{(data.certifications?.length || 0) + (data.awards?.length || 0)}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Certs & Awards</p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* ── Main Content ── */}
        <main className="lg:col-span-9 space-y-8">
          {/* ── Professional Summary ── */}
          <SectionCard
            icon={Quote}
            title="Professional Summary"
            accent="border-l-primary"
          >
            {editing ? (
              <Textarea
                value={draft?.summary ?? ''}
                onChange={e => updateField('summary', e.target.value)}
                rows={4}
                className="text-sm resize-none"
                placeholder="Write a professional summary…"
              />
            ) : (
              <div className="relative">
                <p className="text-sm leading-relaxed text-foreground/80 italic">
                  {data.summary || 'No summary provided.'}
                </p>
              </div>
            )}
          </SectionCard>

          {/* ── Career Goals & Work Style ── */}
          {!editing && (data.careerGoals || data.workStyle) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {data.careerGoals && (
                <SectionCard icon={Target} title="Career Goals" accent="border-l-amber-500">
                  <p className="text-sm leading-relaxed text-foreground/80">{data.careerGoals}</p>
                </SectionCard>
              )}
              {data.workStyle && (
                <SectionCard icon={Star} title="Work Style" accent="border-l-violet-500">
                  <p className="text-sm leading-relaxed text-foreground/80">{data.workStyle}</p>
                </SectionCard>
              )}
            </div>
          )}

          {/* Career Goals & Work Style — edit mode */}
          {editing && (
            <SectionCard icon={Target} title="Career Goals & Work Style" accent="border-l-amber-500">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Career Goals</label>
                  <Textarea
                    value={draft?.careerGoals ?? ''}
                    onChange={e => updateField('careerGoals', e.target.value)}
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Work Style</label>
                  <Textarea
                    value={draft?.workStyle ?? ''}
                    onChange={e => updateField('workStyle', e.target.value)}
                    rows={2}
                    className="text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Personality Traits (comma-separated)
                  </label>
                  <Input
                    value={draft?.personalityTraits?.join(', ') ?? ''}
                    onChange={e => updateField('personalityTraits', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                    className="text-sm"
                  />
                </div>
              </div>
            </SectionCard>
          )}

          {/* ── Experience ── */}
          <SectionCard
            icon={Briefcase}
            title="Experience"
            count={data.experience?.length}
            accent="border-l-blue-500"
          >
            {editing ? (
              <div className="space-y-4">
                {draft?.experience?.map((exp, i) => (
                  <div key={i} className="relative rounded-xl border border-border bg-muted/30 p-5 space-y-4">
                    <button
                      onClick={() => removeExperience(i)}
                      className="absolute top-4 right-4 h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <FieldEdit label="Job Title" value={exp.title} onChange={v => updateExperience(i, 'title', v)} />
                      <FieldEdit label="Company" value={exp.company} onChange={v => updateExperience(i, 'company', v)} />
                      <FieldEdit label="Location" value={exp.location} onChange={v => updateExperience(i, 'location', v)} />
                      <FieldEdit label="Duration" value={exp.duration} onChange={v => updateExperience(i, 'duration', v)} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Key Achievements (one per line)
                      </label>
                      <Textarea
                        value={exp.bullets?.join('\n') ?? ''}
                        onChange={e => updateExperience(i, 'bullets', e.target.value.split('\n'))}
                        rows={3}
                        className="text-sm resize-none"
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addExperience} className="w-full">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Experience
                </Button>
              </div>
            ) : (
              <div className="relative">
                {data.experience?.map((exp, i) => (
                  <div key={i} className={cn("relative pl-8 pb-8", i === data.experience.length - 1 && "pb-0")}>
                    {/* Timeline line */}
                    {i < data.experience.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 to-transparent" />
                    )}
                    {/* Timeline dot */}
                    <div className="absolute left-0 top-1.5 h-6 w-6 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    {/* Content */}
                    <div className="rounded-xl border border-border/60 bg-card p-5 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <h4 className="text-sm font-semibold">{exp.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {exp.company}
                            </span>
                            {exp.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {exp.location}
                              </span>
                            )}
                            {exp.duration && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {exp.duration}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {exp.bullets?.filter(Boolean).length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                          {exp.bullets.filter(Boolean).map((b, j) => (
                            <li key={j} className="text-sm text-muted-foreground flex items-start gap-2.5">
                              <ChevronRight className="h-3.5 w-3.5 text-primary/40 shrink-0 mt-0.5" />
                              {b}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
                {(!data.experience || data.experience.length === 0) && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No experience entries
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* ── Education ── */}
          <SectionCard
            icon={GraduationCap}
            title="Education"
            count={data.education?.length}
            accent="border-l-emerald-500"
          >
            {editing ? (
              <div className="space-y-4">
                {draft?.education?.map((edu, i) => (
                  <div key={i} className="relative rounded-xl border border-border bg-muted/30 p-5 space-y-4">
                    <button
                      onClick={() => removeEducation(i)}
                      className="absolute top-4 right-4 h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <FieldEdit label="Degree" value={edu.degree} onChange={v => updateEducation(i, 'degree', v)} />
                      <FieldEdit label="Institution" value={edu.institution} onChange={v => updateEducation(i, 'institution', v)} />
                      <FieldEdit label="Location" value={edu.location} onChange={v => updateEducation(i, 'location', v)} />
                      <FieldEdit label="Year" value={edu.year} onChange={v => updateEducation(i, 'year', v)} />
                      <FieldEdit label="GPA" value={edu.gpa} onChange={v => updateEducation(i, 'gpa', v)} />
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addEducation} className="w-full">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Education
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.education?.map((edu, i) => (
                  <div key={i} className="rounded-xl border border-border/60 bg-card p-4 hover:shadow-sm transition-shadow">
                    <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                      <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h4 className="text-sm font-semibold">{edu.degree}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{edu.institution}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                      {edu.location && <span>{edu.location}</span>}
                      {edu.year && <span>{edu.year}</span>}
                      {edu.gpa && <span className="font-medium text-primary">GPA: {edu.gpa}</span>}
                    </div>
                  </div>
                ))}
                {(!data.education || data.education.length === 0) && (
                  <div className="col-span-full text-center py-8 text-sm text-muted-foreground">
                    <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No education entries
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* ── Projects ── */}
          <SectionCard
            icon={FolderOpen}
            title="Projects"
            count={data.projects?.length}
            accent="border-l-cyan-500"
          >
            {editing ? (
              <div className="space-y-4">
                {draft?.projects?.map((proj, i) => (
                  <div key={i} className="relative rounded-xl border border-border bg-muted/30 p-5 space-y-4">
                    <button
                      onClick={() => removeProject(i)}
                      className="absolute top-4 right-4 h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <FieldEdit label="Project Name" value={proj.name} onChange={v => updateProject(i, 'name', v)} />
                      <FieldEdit label="Tech Stack" value={proj.techStack} onChange={v => updateProject(i, 'techStack', v)} />
                      <FieldEdit label="Duration" value={proj.duration} onChange={v => updateProject(i, 'duration', v)} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Details (one per line)
                      </label>
                      <Textarea
                        value={proj.bullets?.join('\n') ?? ''}
                        onChange={e => updateProject(i, 'bullets', e.target.value.split('\n'))}
                        rows={3}
                        className="text-sm resize-none"
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addProject} className="w-full">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Project
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.projects?.map((proj, i) => (
                  <div key={i} className="rounded-xl border border-border/60 bg-card p-5 hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-8 w-8 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center shrink-0">
                        <FolderOpen className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold truncate">{proj.name}</h4>
                        {proj.techStack && (
                          <p className="text-[11px] text-muted-foreground truncate">{proj.techStack}</p>
                        )}
                        {proj.duration && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">{proj.duration}</p>
                        )}
                      </div>
                    </div>
                    {proj.bullets?.filter(Boolean).length > 0 && (
                      <ul className="space-y-1">
                        {proj.bullets.filter(Boolean).map((b, j) => (
                          <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                            <ChevronRight className="h-3 w-3 text-cyan-400 shrink-0 mt-0.5" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                {(!data.projects || data.projects.length === 0) && (
                  <div className="col-span-full text-center py-8 text-sm text-muted-foreground">
                    <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No project entries
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* ── Skills ── */}
          <SectionCard
            icon={Brain}
            title="Skills"
            count={data.skills?.length}
            accent="border-l-violet-500"
          >
            {editing ? (
              <div className="space-y-4">
                {draft?.skills?.map((cat, i) => (
                  <div key={i} className="relative rounded-xl border border-border bg-muted/30 p-5 space-y-4">
                    <button
                      onClick={() => removeSkillCategory(i)}
                      className="absolute top-4 right-4 h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <FieldEdit label="Category" value={cat.category} onChange={v => updateSkill(i, 'category', v)} />
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                        Skills (comma-separated)
                      </label>
                      <Input
                        value={cat.items?.join(', ') ?? ''}
                        onChange={e => updateSkill(i, 'items', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        className="text-sm"
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addSkillCategory} className="w-full">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Skill Category
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                {data.skills?.map((cat, i) => (
                  <div key={i} className="py-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-2.5 uppercase tracking-wider">{cat.category}</p>
                    <div className="flex flex-wrap gap-2">
                      {cat.items?.map((skill, j) => (
                        <span
                          key={j}
                          className="text-xs px-3 py-1 rounded-full bg-card border border-border/60 font-medium text-foreground/80 hover:border-primary/30 hover:text-foreground transition-colors"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {(!data.skills || data.skills.length === 0) && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    <Brain className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No skills listed
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* ── Awards & Certifications ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Awards */}
            <SectionCard icon={Award} title="Awards" count={data.awards?.length} accent="border-l-amber-500">
              {editing ? (
                <div className="space-y-3">
                  {draft?.awards?.map((award, i) => (
                    <div key={i} className="relative rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                      <button
                        onClick={() => removeAward(i)}
                        className="absolute top-3 right-3 h-6 w-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                      <div className="grid gap-3">
                        <FieldEdit label="Award Name" value={award.name} onChange={v => updateAward(i, 'name', v)} />
                        <FieldEdit label="Issuer" value={award.issuer} onChange={v => updateAward(i, 'issuer', v)} />
                        <FieldEdit label="Year" value={award.year} onChange={v => updateAward(i, 'year', v)} />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addAward} className="w-full">
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add Award
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.awards?.map((award, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors">
                      <div className="h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                        <Award className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{award.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {award.issuer}{award.year ? ` · ${award.year}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!data.awards || data.awards.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">No awards listed</p>
                  )}
                </div>
              )}
            </SectionCard>

            {/* Certifications */}
            <SectionCard icon={ShieldCheck} title="Certifications" count={data.certifications?.length} accent="border-l-blue-500">
              {editing ? (
                <div className="space-y-3">
                  {draft?.certifications?.map((cert, i) => (
                    <div key={i} className="relative rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                      <button
                        onClick={() => removeCertification(i)}
                        className="absolute top-3 right-3 h-6 w-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                      <div className="grid gap-3">
                        <FieldEdit label="Certification" value={cert.name} onChange={v => updateCertification(i, 'name', v)} />
                        <FieldEdit label="Issuer" value={cert.issuer} onChange={v => updateCertification(i, 'issuer', v)} />
                        <FieldEdit label="Year" value={cert.year} onChange={v => updateCertification(i, 'year', v)} />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addCertification} className="w-full">
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Add Certification
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.certifications?.map((cert, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors">
                      <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                        <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{cert.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {cert.issuer}{cert.year ? ` · ${cert.year}` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!data.certifications || data.certifications.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">No certifications listed</p>
                  )}
                </div>
              )}
            </SectionCard>
          </div>

          {/* ── Edit mode: inline personal info ── */}
          {editing && (
            <SectionCard icon={User} title="Personal Information" accent="border-l-primary">
              <div className="grid sm:grid-cols-2 gap-4">
                <FieldEdit label="Full Name" value={draft?.fullName ?? ''} onChange={v => updateField('fullName', v)} />
                <FieldEdit label="Email" value={draft?.email ?? ''} onChange={v => updateField('email', v)} />
                <FieldEdit label="Phone" value={draft?.phone ?? ''} onChange={v => updateField('phone', v)} />
                <FieldEdit label="Location" value={draft?.location ?? ''} onChange={v => updateField('location', v)} />
                <FieldEdit label="LinkedIn" value={draft?.linkedin ?? ''} onChange={v => updateField('linkedin', v)} />
                <FieldEdit label="GitHub" value={draft?.github ?? ''} onChange={v => updateField('github', v)} />
              </div>
            </SectionCard>
          )}
        </main>
      </div>

      {/* ── Sticky save bar when editing ── */}
      {editing && (
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border py-4 px-6 flex items-center justify-end gap-3 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <p className="text-xs text-muted-foreground mr-auto flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            You have unsaved changes
          </p>
          <Button variant="outline" size="sm" onClick={cancelEditing} disabled={saving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="shadow-lg shadow-primary/25">
            {saving ? (
              <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving…</>
            ) : (
              <><Save className="h-3.5 w-3.5 mr-1.5" />Save Changes</>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  count,
  accent,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  count?: number
  accent?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn(
      "rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md",
    )}>
      <div className="flex items-center gap-3 px-6 pt-5 pb-3 border-b border-border/30">
        <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-sm font-semibold">{title}</h2>
        {count !== undefined && count > 0 && (
          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full ml-auto">
            {count}
          </span>
        )}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

function FieldEdit({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      <Input value={value} onChange={e => onChange(e.target.value)} className="text-sm" />
    </div>
  )
}
