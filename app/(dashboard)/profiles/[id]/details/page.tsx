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
  Layers,
  Plus,
  Trash2,
  Wand2,
} from 'lucide-react'
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

export default function ProfileDetailsPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<CareerProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<ProfileData | null>(null)

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
      <div className="min-h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!profile || !profile.profile) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-4 p-6">
        <div className="rounded-full bg-muted p-5">
          <Layers className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <p className="text-base font-semibold">No profile data yet</p>
        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Complete the AI interview first to generate your career profile.
        </p>
        <Button variant="outline" onClick={() => router.push(`/profiles/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go to Interview
        </Button>
      </div>
    )
  }

  const data = editing ? draft! : profile.profile

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/profiles')}
            className="flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                Complete
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">Career profile details</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button variant="outline" size="sm" onClick={cancelEditing} disabled={saving}>
                <X className="h-3.5 w-3.5 mr-1.5" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Saving…</>
                ) : (
                  <><Save className="h-3.5 w-3.5 mr-1.5" />Save Changes</>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={startEditing}>
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit Profile
              </Button>
              <Button size="sm" onClick={() => router.push(`/build?profileId=${id}`)}>
                <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                Build Resume
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Personal Info ─────────────────────────────────── */}
      <Section icon={User} title="Personal Information">
        {editing ? (
          <div className="grid sm:grid-cols-2 gap-4">
            <FieldEdit label="Full Name" value={draft?.fullName ?? ''} onChange={v => updateField('fullName', v)} />
            <FieldEdit label="Email" value={draft?.email ?? ''} onChange={v => updateField('email', v)} />
            <FieldEdit label="Phone" value={draft?.phone ?? ''} onChange={v => updateField('phone', v)} />
            <FieldEdit label="Location" value={draft?.location ?? ''} onChange={v => updateField('location', v)} />
            <FieldEdit label="LinkedIn" value={draft?.linkedin ?? ''} onChange={v => updateField('linkedin', v)} />
            <FieldEdit label="GitHub" value={draft?.github ?? ''} onChange={v => updateField('github', v)} />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
            <FieldView icon={User} label="Full Name" value={data.fullName} />
            <FieldView icon={Mail} label="Email" value={data.email} />
            <FieldView icon={Phone} label="Phone" value={data.phone} />
            <FieldView icon={MapPin} label="Location" value={data.location} />
            <FieldView icon={Link2} label="LinkedIn" value={data.linkedin} />
            <FieldView icon={Code2} label="GitHub" value={data.github} />
          </div>
        )}
      </Section>

      {/* ── Summary ───────────────────────────────────────── */}
      <Section icon={Sparkles} title="Professional Summary">
        {editing ? (
          <Textarea
            value={draft?.summary ?? ''}
            onChange={e => updateField('summary', e.target.value)}
            rows={4}
            className="text-sm"
          />
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed">{data.summary || '—'}</p>
        )}
      </Section>

      {/* ── Career Goals & Work Style ─────────────────────── */}
      <Section icon={Target} title="Career Goals & Work Style">
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Career Goals</label>
              <Textarea
                value={draft?.careerGoals ?? ''}
                onChange={e => updateField('careerGoals', e.target.value)}
                rows={3}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Work Style</label>
              <Textarea
                value={draft?.workStyle ?? ''}
                onChange={e => updateField('workStyle', e.target.value)}
                rows={2}
                className="text-sm"
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
        ) : (
          <div className="space-y-4">
            {data.careerGoals && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Career Goals</p>
                <p className="text-sm leading-relaxed">{data.careerGoals}</p>
              </div>
            )}
            {data.workStyle && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Work Style</p>
                <p className="text-sm leading-relaxed">{data.workStyle}</p>
              </div>
            )}
            {data.personalityTraits?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Personality Traits</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.personalityTraits.map((trait, i) => (
                    <Badge key={i} variant="secondary" className="text-xs font-normal">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* ── Experience ────────────────────────────────────── */}
      <Section icon={Briefcase} title="Experience" count={data.experience?.length}>
        {editing ? (
          <div className="space-y-5">
            {draft?.experience?.map((exp, i) => (
              <div key={i} className="relative rounded-lg border border-border p-4 space-y-3">
                <button
                  onClick={() => removeExperience(i)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
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
                    className="text-sm"
                  />
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addExperience}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Experience
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {data.experience?.map((exp, i) => (
              <div key={i} className="border-l-2 border-primary/20 pl-4">
                <p className="text-sm font-semibold">{exp.title}</p>
                <p className="text-xs text-muted-foreground">
                  {exp.company}{exp.location ? ` · ${exp.location}` : ''}{exp.duration ? ` · ${exp.duration}` : ''}
                </p>
                {exp.bullets?.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {exp.bullets.filter(Boolean).map((b, j) => (
                      <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="shrink-0 mt-1.5 h-1 w-1 rounded-full bg-muted-foreground/40" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {(!data.experience || data.experience.length === 0) && (
              <p className="text-sm text-muted-foreground">No experience entries</p>
            )}
          </div>
        )}
      </Section>

      {/* ── Education ─────────────────────────────────────── */}
      <Section icon={GraduationCap} title="Education" count={data.education?.length}>
        {editing ? (
          <div className="space-y-5">
            {draft?.education?.map((edu, i) => (
              <div key={i} className="relative rounded-lg border border-border p-4 space-y-3">
                <button
                  onClick={() => removeEducation(i)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
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
            <Button variant="outline" size="sm" onClick={addEducation}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Education
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {data.education?.map((edu, i) => (
              <div key={i} className="border-l-2 border-primary/20 pl-4">
                <p className="text-sm font-semibold">{edu.degree}</p>
                <p className="text-xs text-muted-foreground">
                  {edu.institution}{edu.location ? ` · ${edu.location}` : ''}{edu.year ? ` · ${edu.year}` : ''}
                </p>
                {edu.gpa && <p className="text-xs text-muted-foreground mt-0.5">GPA: {edu.gpa}</p>}
              </div>
            ))}
            {(!data.education || data.education.length === 0) && (
              <p className="text-sm text-muted-foreground">No education entries</p>
            )}
          </div>
        )}
      </Section>

      {/* ── Projects ──────────────────────────────────────── */}
      <Section icon={FolderOpen} title="Projects" count={data.projects?.length}>
        {editing ? (
          <div className="space-y-5">
            {draft?.projects?.map((proj, i) => (
              <div key={i} className="relative rounded-lg border border-border p-4 space-y-3">
                <button
                  onClick={() => removeProject(i)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
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
                    className="text-sm"
                  />
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addProject}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Project
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {data.projects?.map((proj, i) => (
              <div key={i} className="border-l-2 border-primary/20 pl-4">
                <p className="text-sm font-semibold">{proj.name}</p>
                <p className="text-xs text-muted-foreground">
                  {proj.techStack}{proj.duration ? ` · ${proj.duration}` : ''}
                </p>
                {proj.bullets?.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {proj.bullets.filter(Boolean).map((b, j) => (
                      <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="shrink-0 mt-1.5 h-1 w-1 rounded-full bg-muted-foreground/40" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {(!data.projects || data.projects.length === 0) && (
              <p className="text-sm text-muted-foreground">No project entries</p>
            )}
          </div>
        )}
      </Section>

      {/* ── Skills ────────────────────────────────────────── */}
      <Section icon={Brain} title="Skills" count={data.skills?.length}>
        {editing ? (
          <div className="space-y-5">
            {draft?.skills?.map((cat, i) => (
              <div key={i} className="relative rounded-lg border border-border p-4 space-y-3">
                <button
                  onClick={() => removeSkillCategory(i)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
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
            <Button variant="outline" size="sm" onClick={addSkillCategory}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Skill Category
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {data.skills?.map((cat, i) => (
              <div key={i}>
                <p className="text-xs font-semibold text-muted-foreground mb-1.5">{cat.category}</p>
                <div className="flex flex-wrap gap-1.5">
                  {cat.items?.map((skill, j) => (
                    <Badge key={j} variant="secondary" className="text-xs font-normal">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            {(!data.skills || data.skills.length === 0) && (
              <p className="text-sm text-muted-foreground">No skills listed</p>
            )}
          </div>
        )}
      </Section>

      {/* ── Awards ────────────────────────────────────────── */}
      <Section icon={Award} title="Awards" count={data.awards?.length}>
        {editing ? (
          <div className="space-y-5">
            {draft?.awards?.map((award, i) => (
              <div key={i} className="relative rounded-lg border border-border p-4">
                <button
                  onClick={() => removeAward(i)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <div className="grid sm:grid-cols-3 gap-3">
                  <FieldEdit label="Award Name" value={award.name} onChange={v => updateAward(i, 'name', v)} />
                  <FieldEdit label="Issuer" value={award.issuer} onChange={v => updateAward(i, 'issuer', v)} />
                  <FieldEdit label="Year" value={award.year} onChange={v => updateAward(i, 'year', v)} />
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addAward}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Award
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {data.awards?.map((award, i) => (
              <div key={i} className="flex items-center gap-3">
                <Award className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{award.name}</p>
                  <p className="text-xs text-muted-foreground">{award.issuer}{award.year ? ` · ${award.year}` : ''}</p>
                </div>
              </div>
            ))}
            {(!data.awards || data.awards.length === 0) && (
              <p className="text-sm text-muted-foreground">No awards listed</p>
            )}
          </div>
        )}
      </Section>

      {/* ── Certifications ────────────────────────────────── */}
      <Section icon={ShieldCheck} title="Certifications" count={data.certifications?.length}>
        {editing ? (
          <div className="space-y-5">
            {draft?.certifications?.map((cert, i) => (
              <div key={i} className="relative rounded-lg border border-border p-4">
                <button
                  onClick={() => removeCertification(i)}
                  className="absolute top-3 right-3 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <div className="grid sm:grid-cols-3 gap-3">
                  <FieldEdit label="Certification" value={cert.name} onChange={v => updateCertification(i, 'name', v)} />
                  <FieldEdit label="Issuer" value={cert.issuer} onChange={v => updateCertification(i, 'issuer', v)} />
                  <FieldEdit label="Year" value={cert.year} onChange={v => updateCertification(i, 'year', v)} />
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addCertification}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Certification
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {data.certifications?.map((cert, i) => (
              <div key={i} className="flex items-center gap-3">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{cert.name}</p>
                  <p className="text-xs text-muted-foreground">{cert.issuer}{cert.year ? ` · ${cert.year}` : ''}</p>
                </div>
              </div>
            ))}
            {(!data.certifications || data.certifications.length === 0) && (
              <p className="text-sm text-muted-foreground">No certifications listed</p>
            )}
          </div>
        )}
      </Section>

      {/* ── Sticky save bar when editing ─────────────────── */}
      {editing && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border py-3 px-6 flex items-center justify-end gap-3 z-50">
          <p className="text-xs text-muted-foreground mr-auto">You have unsaved changes</p>
          <Button variant="outline" size="sm" onClick={cancelEditing} disabled={saving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
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

function Section({
  icon: Icon,
  title,
  count,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  count?: number
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <h2 className="text-sm font-semibold">{title}</h2>
        {count !== undefined && count > 0 && (
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-medium">
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function FieldView({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-sm mt-0.5 break-all">{value || '—'}</p>
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
