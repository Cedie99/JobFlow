'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Copy, Check, FileText, Mail, Send, Pencil, Download, Save, X, Plus, Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import type { OptimizeResponse, ContactInfo, ExperienceEntry, ProjectEntry, EducationEntry, AwardEntry, CertificationEntry } from '@/types'

interface ResultsPanelProps {
  result: OptimizeResponse
  onResultChange: (r: OptimizeResponse) => void
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Button variant="outline" size="sm" onClick={copy} className="shrink-0">
      {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

function buildResumeText(d: OptimizeResponse): string {
  const r = d.optimizedResume
  const contactLine = [r.contactInfo.email, r.contactInfo.phone, r.contactInfo.location].filter(Boolean).join(' | ')
  const linksLine = [r.contactInfo.linkedin, r.contactInfo.github].filter(Boolean).join(' | ')
  return [
    r.contactInfo.name, contactLine, linksLine, '',
    '=== PROFESSIONAL SUMMARY ===', r.summary, '',
    '=== EDUCATION ===',
    ...r.education.map(e => `${e.degree} — ${e.institution}${e.location ? ', ' + e.location : ''}${e.gpa ? ' | GPA: ' + e.gpa : ''} (${e.year})`),
    '', '=== WORK EXPERIENCE ===',
    ...r.experience.flatMap(exp => [`${exp.title} | ${exp.company}${exp.location ? ' | ' + exp.location : ''} | ${exp.duration}`, ...exp.bullets.map(b => `• ${b}`), '']),
    ...(r.projects?.length > 0 ? ['=== PROJECTS ===', ...r.projects.flatMap(p => [`${p.name} | ${p.techStack}${p.duration ? ' | ' + p.duration : ''}`, ...p.bullets.map(b => `• ${b}`), ''])] : []),
    '=== SKILLS ===', ...r.skills.map(s => `${s.category}: ${s.items.join(', ')}`),
    ...(r.awards?.length > 0 ? ['', '=== AWARDS ===', ...r.awards.map(a => `${a.name} — ${a.issuer} (${a.year})`)] : []),
    ...(r.certifications?.length > 0 ? ['', '=== CERTIFICATIONS ===', ...r.certifications.map(c => `${c.name} — ${c.issuer} (${c.year})`)] : []),
  ].join('\n')
}

function buildPrintHTML(d: OptimizeResponse): string {
  const r = d.optimizedResume
  const contactLine = [r.contactInfo.email, r.contactInfo.phone, r.contactInfo.location].filter(Boolean).join(' | ')
  const linksLine = [r.contactInfo.linkedin, r.contactInfo.github].filter(Boolean).join(' | ')
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${esc(r.contactInfo.name)} - Resume</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:11pt;line-height:1.45;color:#111;padding:36px 48px;max-width:850px;margin:0 auto}
h1{font-size:17pt;text-align:center;margin-bottom:3px}
.contact{text-align:center;font-size:9.5pt;color:#444;margin-bottom:2px}
h2{font-size:10pt;font-weight:700;text-transform:uppercase;letter-spacing:.8px;border-bottom:1.5px solid #333;margin:14px 0 6px;padding-bottom:2px;color:#222}
.row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2px}
.bold{font-weight:700}.sub{font-size:9.5pt;color:#555;margin-bottom:1px}
ul{list-style:none;padding-left:14px;margin-bottom:8px}
ul li{margin-bottom:2px}ul li::before{content:"•";margin-right:6px;color:#333}
.skill{margin-bottom:3px}.skill-cat{font-weight:700}
p{margin-bottom:8px}
@media print{body{padding:20px 30px}@page{margin:.8cm;size:A4}}</style></head><body>
<h1>${esc(r.contactInfo.name)}</h1>
${contactLine ? `<p class="contact">${esc(contactLine)}</p>` : ''}
${linksLine ? `<p class="contact">${esc(linksLine)}</p>` : ''}
<h2>Professional Summary</h2><p>${esc(r.summary)}</p>
${r.education?.length ? `<h2>Education</h2>${r.education.map(e => `<div class="row"><div><div class="bold">${esc(e.degree)}</div><div class="sub">${esc(e.institution)}${e.location ? ', ' + esc(e.location) : ''}${e.gpa ? ' · GPA: ' + esc(e.gpa) : ''}</div></div><div>${esc(e.year)}</div></div>`).join('')}` : ''}
${r.experience?.length ? `<h2>Work Experience</h2>${r.experience.map(e => `<div class="row"><div><div class="bold">${esc(e.title)}</div><div class="sub">${esc(e.company)}${e.location ? ' · ' + esc(e.location) : ''}</div></div><div style="font-size:9.5pt">${esc(e.duration)}</div></div><ul>${e.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>`).join('')}` : ''}
${r.projects?.length ? `<h2>Projects</h2>${r.projects.map(p => `<div class="row"><div><div class="bold">${esc(p.name)}</div><div class="sub">${esc(p.techStack)}</div></div>${p.duration ? `<div style="font-size:9.5pt">${esc(p.duration)}</div>` : ''}</div><ul>${p.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>`).join('')}` : ''}
${r.skills?.length ? `<h2>Skills</h2>${r.skills.map(s => `<div class="skill"><span class="skill-cat">${esc(s.category)}:</span> ${s.items.map(esc).join(', ')}</div>`).join('')}` : ''}
${r.awards?.length ? `<h2>Awards &amp; Honors</h2>${r.awards.map(a => `<div class="row"><span>${esc(a.name)} — ${esc(a.issuer)}</span><span>${esc(a.year)}</span></div>`).join('')}` : ''}
${r.certifications?.length ? `<h2>Certifications</h2>${r.certifications.map(c => `<div class="row"><span>${esc(c.name)} — ${esc(c.issuer)}</span><span>${esc(c.year)}</span></div>`).join('')}` : ''}
</body></html>`
}

const LABEL_SUGGESTIONS = [
  'Resume for Software Engineer',
  'Resume for QA Engineer',
  'Resume for Backend Engineer',
  'Resume for Frontend Developer',
  'Resume for Full-Stack Developer',
  'Resume for IT Support',
  'Resume for Data Analyst',
  'Resume for DevOps Engineer',
]

export default function ResultsPanel({ result, onResultChange }: ResultsPanelProps) {
  const [draft, setDraft] = useState<OptimizeResponse>(result)
  const [editing, setEditing] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(result.savedId ?? null)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [labelInput, setLabelInput] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraft(result)
    setEditing(false)
    setSavedId(result.savedId ?? null)
  }, [result])

  const r = draft.optimizedResume
  const contactLine = [r.contactInfo.email, r.contactInfo.phone, r.contactInfo.location].filter(Boolean).join(' | ')
  const linksLine = [r.contactInfo.linkedin, r.contactInfo.github].filter(Boolean).join(' | ')

  // --- Updaters ---
  function upContact(field: keyof ContactInfo, val: string) {
    setDraft(d => ({ ...d, optimizedResume: { ...d.optimizedResume, contactInfo: { ...d.optimizedResume.contactInfo, [field]: val } } }))
  }
  function upSummary(val: string) {
    setDraft(d => ({ ...d, optimizedResume: { ...d.optimizedResume, summary: val } }))
  }
  function upEdu(i: number, field: keyof EducationEntry, val: string) {
    setDraft(d => ({ ...d, optimizedResume: { ...d.optimizedResume, education: d.optimizedResume.education.map((e, idx) => idx === i ? { ...e, [field]: val } : e) } }))
  }
  function upExpField(i: number, field: keyof Omit<ExperienceEntry, 'bullets'>, val: string) {
    setDraft(d => ({ ...d, optimizedResume: { ...d.optimizedResume, experience: d.optimizedResume.experience.map((e, idx) => idx === i ? { ...e, [field]: val } : e) } }))
  }
  function upExpBullet(i: number, j: number, val: string) {
    setDraft(d => ({ ...d, optimizedResume: { ...d.optimizedResume, experience: d.optimizedResume.experience.map((e, idx) => idx !== i ? e : { ...e, bullets: e.bullets.map((b, bi) => bi === j ? val : b) }) } }))
  }
  function addExpBullet(i: number) {
    setDraft(d => ({ ...d, optimizedResume: { ...d.optimizedResume, experience: d.optimizedResume.experience.map((e, idx) => idx === i ? { ...e, bullets: [...e.bullets, ''] } : e) } }))
  }
  function removeExpBullet(i: number, j: number) {
    setDraft(d => ({ ...d, optimizedResume: { ...d.optimizedResume, experience: d.optimizedResume.experience.map((e, idx) => idx === i ? { ...e, bullets: e.bullets.filter((_, bi) => bi !== j) } : e) } }))
  }
  function upProjField(i: number, field: keyof Omit<ProjectEntry, 'bullets'>, val: string) {
    setDraft(d => ({ ...d, optimizedResume: { ...d.optimizedResume, projects: d.optimizedResume.projects.map((p, idx) => idx === i ? { ...p, [field]: val } : p) } }))
  }
  function upProjBullet(i: number, j: number, val: string) {
    setDraft(d => ({ ...d, optimizedResume: { ...d.optimizedResume, projects: d.optimizedResume.projects.map((p, idx) => idx !== i ? p : { ...p, bullets: p.bullets.map((b, bi) => bi === j ? val : b) }) } }))
  }
  function addProjBullet(i: number) {
    setDraft(d => ({ ...d, optimizedResume: { ...d.optimizedResume, projects: d.optimizedResume.projects.map((p, idx) => idx === i ? { ...p, bullets: [...p.bullets, ''] } : p) } }))
  }
  function removeProjBullet(i: number, j: number) {
    setDraft(d => ({ ...d, optimizedResume: { ...d.optimizedResume, projects: d.optimizedResume.projects.map((p, idx) => idx === i ? { ...p, bullets: p.bullets.filter((_, bi) => bi !== j) } : p) } }))
  }
  function upSkillCategory(i: number, val: string) {
    setDraft(d => ({ ...d, optimizedResume: { ...d.optimizedResume, skills: d.optimizedResume.skills.map((s, idx) => idx === i ? { ...s, category: val } : s) } }))
  }
  function upSkillItems(i: number, val: string) {
    const items = val.split(',').map(s => s.trim()).filter(Boolean)
    setDraft(d => ({ ...d, optimizedResume: { ...d.optimizedResume, skills: d.optimizedResume.skills.map((s, idx) => idx === i ? { ...s, items } : s) } }))
  }
  function upAward(i: number, field: keyof AwardEntry, val: string) {
    setDraft(d => ({ ...d, optimizedResume: { ...d.optimizedResume, awards: (d.optimizedResume.awards ?? []).map((a, idx) => idx === i ? { ...a, [field]: val } : a) } }))
  }
  function upCert(i: number, field: keyof CertificationEntry, val: string) {
    setDraft(d => ({ ...d, optimizedResume: { ...d.optimizedResume, certifications: (d.optimizedResume.certifications ?? []).map((c, idx) => idx === i ? { ...c, [field]: val } : c) } }))
  }

  // --- Actions ---
  function handleDiscard() { setDraft(result); setEditing(false) }

  async function handleSaveEdits() {
    setEditing(false)
    onResultChange(draft)
    if (savedId) {
      try {
        const res = await fetch(`/api/optimizations/${savedId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ result: draft }),
        })
        if (res.ok) toast.success('Changes saved')
        else toast.error('Could not persist changes')
      } catch { toast.error('Could not persist changes') }
    } else {
      toast.success('Changes applied locally — use Save As to persist')
    }
  }

  async function handleSaveAs() {
    if (!labelInput.trim()) return
    setSaving(true)
    try {
      const res = await fetch('/api/optimizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: labelInput.trim(), result: draft }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSavedId(data.id)
      setSaveDialogOpen(false)
      toast.success(`Saved as "${labelInput.trim()}"`)
    } catch { toast.error('Could not save') }
    finally { setSaving(false) }
  }

  function handleDownloadPDF() {
    const win = window.open('', '_blank', 'width=850,height=1000')
    if (!win) { toast.error('Allow popups to download PDF'); return }
    win.document.write(buildPrintHTML(draft))
    win.document.close()
    setTimeout(() => win.print(), 400)
  }

  const resumeText = buildResumeText(draft)

  return (
    <div className="h-full flex flex-col min-h-0 gap-2">
      {/* Match warning */}
      {typeof result.matchScore === 'number' && result.matchScore < 60 && result.matchWarning && (
        <div className="shrink-0 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 flex gap-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-800">
              Low match — {result.matchScore}/100
            </p>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">{result.matchWarning}</p>
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-between shrink-0 gap-2 flex-wrap">
        <div className="flex gap-1.5">
          {editing ? (
            <>
              <Button size="sm" onClick={handleSaveEdits} className="gap-1">
                <Check className="h-3.5 w-3.5" />Save Changes
              </Button>
              <Button size="sm" variant="outline" onClick={handleDiscard} className="gap-1">
                <X className="h-3.5 w-3.5" />Discard
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="gap-1">
              <Pencil className="h-3.5 w-3.5" />Edit
            </Button>
          )}
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" variant="outline" onClick={() => { setLabelInput(''); setSaveDialogOpen(true) }} className="gap-1">
            <Save className="h-3.5 w-3.5" />Save As
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownloadPDF} className="gap-1">
            <Download className="h-3.5 w-3.5" />PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="resume" className="flex-1 min-h-0 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 shrink-0">
          <TabsTrigger value="resume" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" />Resume</TabsTrigger>
          <TabsTrigger value="cover" className="gap-1.5 text-xs"><Mail className="h-3.5 w-3.5" />Cover Letter</TabsTrigger>
          <TabsTrigger value="email" className="gap-1.5 text-xs"><Send className="h-3.5 w-3.5" />Email</TabsTrigger>
        </TabsList>

        {/* ── Resume Tab ── */}
        <TabsContent value="resume" className="flex-1 min-h-0 mt-3 flex flex-col gap-3">
          <div className="flex items-center justify-between shrink-0">
            <p className="text-sm font-medium text-muted-foreground">
              Optimized Resume{editing && <span className="text-primary ml-1.5 text-xs">(editing)</span>}
            </p>
            <CopyButton text={resumeText} />
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto rounded-lg border bg-card p-4">
            <div className="space-y-5 text-sm">

              {/* Contact */}
              <section className="text-center border-b pb-4">
                {editing ? (
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <Input placeholder="Full Name" value={r.contactInfo.name} onChange={e => upContact('name', e.target.value)} />
                    <Input placeholder="Email" value={r.contactInfo.email} onChange={e => upContact('email', e.target.value)} />
                    <Input placeholder="Phone" value={r.contactInfo.phone} onChange={e => upContact('phone', e.target.value)} />
                    <Input placeholder="Location" value={r.contactInfo.location} onChange={e => upContact('location', e.target.value)} />
                    <Input placeholder="LinkedIn URL" value={r.contactInfo.linkedin} onChange={e => upContact('linkedin', e.target.value)} />
                    <Input placeholder="GitHub URL" value={r.contactInfo.github} onChange={e => upContact('github', e.target.value)} />
                  </div>
                ) : (
                  <>
                    <h2 className="text-base font-bold">{r.contactInfo.name}</h2>
                    {contactLine && <p className="text-xs text-muted-foreground mt-1">{contactLine}</p>}
                    {linksLine && <p className="text-xs text-muted-foreground">{linksLine}</p>}
                  </>
                )}
              </section>

              {/* Summary */}
              <section>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Professional Summary</h3>
                {editing
                  ? <Textarea className="min-h-[100px]" value={r.summary} onChange={e => upSummary(e.target.value)} />
                  : <p className="leading-relaxed">{r.summary}</p>}
              </section>

              {/* Education */}
              {r.education?.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Education</h3>
                  <div className="space-y-3">
                    {r.education.map((edu, i) => editing ? (
                      <div key={i} className="grid grid-cols-2 gap-2 p-2 border rounded-lg">
                        <Input placeholder="Degree" value={edu.degree} onChange={e => upEdu(i, 'degree', e.target.value)} />
                        <Input placeholder="Institution" value={edu.institution} onChange={e => upEdu(i, 'institution', e.target.value)} />
                        <Input placeholder="Location" value={edu.location} onChange={e => upEdu(i, 'location', e.target.value)} />
                        <Input placeholder="Year" value={edu.year} onChange={e => upEdu(i, 'year', e.target.value)} />
                        <Input className="col-span-2" placeholder="GPA (optional)" value={edu.gpa} onChange={e => upEdu(i, 'gpa', e.target.value)} />
                      </div>
                    ) : (
                      <div key={i} className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{edu.degree}</p>
                          <p className="text-xs text-muted-foreground">{edu.institution}{edu.location ? ` · ${edu.location}` : ''}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs shrink-0">{edu.year}</Badge>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Experience */}
              {r.experience?.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Work Experience</h3>
                  <div className="space-y-4">
                    {r.experience.map((exp, i) => (
                      <div key={i} className={editing ? 'border rounded-lg p-3 space-y-2' : ''}>
                        {editing ? (
                          <>
                            <div className="grid grid-cols-2 gap-2">
                              <Input placeholder="Job Title" value={exp.title} onChange={e => upExpField(i, 'title', e.target.value)} />
                              <Input placeholder="Company" value={exp.company} onChange={e => upExpField(i, 'company', e.target.value)} />
                              <Input placeholder="Location" value={exp.location} onChange={e => upExpField(i, 'location', e.target.value)} />
                              <Input placeholder="Duration" value={exp.duration} onChange={e => upExpField(i, 'duration', e.target.value)} />
                            </div>
                            <p className="text-xs font-medium text-muted-foreground">Bullet Points</p>
                            <div className="space-y-1.5">
                              {exp.bullets.map((bullet, j) => (
                                <div key={j} className="flex gap-1.5">
                                  <Textarea className="text-xs min-h-[52px] flex-1" value={bullet} onChange={e => upExpBullet(i, j, e.target.value)} />
                                  <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 self-start" onClick={() => removeExpBullet(i, j)}>
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ))}
                              <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => addExpBullet(i)}>
                                <Plus className="h-3 w-3" />Add bullet
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div>
                                <p className="font-semibold">{exp.title}</p>
                                <p className="text-xs text-muted-foreground">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                              </div>
                              <Badge variant="secondary" className="text-xs shrink-0">{exp.duration}</Badge>
                            </div>
                            <ul className="space-y-1.5 mt-1.5">
                              {exp.bullets.map((bullet, j) => (
                                <li key={j} className="flex gap-2">
                                  <span className="text-primary mt-0.5 shrink-0">•</span>
                                  <span className="leading-relaxed">{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Projects */}
              {r.projects?.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Projects</h3>
                  <div className="space-y-4">
                    {r.projects.map((proj, i) => (
                      <div key={i} className={editing ? 'border rounded-lg p-3 space-y-2' : ''}>
                        {editing ? (
                          <>
                            <div className="grid grid-cols-2 gap-2">
                              <Input placeholder="Project Name" value={proj.name} onChange={e => upProjField(i, 'name', e.target.value)} />
                              <Input placeholder="Duration" value={proj.duration} onChange={e => upProjField(i, 'duration', e.target.value)} />
                              <Input className="col-span-2" placeholder="Tech Stack" value={proj.techStack} onChange={e => upProjField(i, 'techStack', e.target.value)} />
                            </div>
                            <p className="text-xs font-medium text-muted-foreground">Bullet Points</p>
                            <div className="space-y-1.5">
                              {proj.bullets.map((bullet, j) => (
                                <div key={j} className="flex gap-1.5">
                                  <Textarea className="text-xs min-h-[52px] flex-1" value={bullet} onChange={e => upProjBullet(i, j, e.target.value)} />
                                  <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 self-start" onClick={() => removeProjBullet(i, j)}>
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ))}
                              <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => addProjBullet(i)}>
                                <Plus className="h-3 w-3" />Add bullet
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div>
                                <p className="font-semibold">{proj.name}</p>
                                <p className="text-xs text-muted-foreground">{proj.techStack}</p>
                              </div>
                              {proj.duration && <Badge variant="secondary" className="text-xs shrink-0">{proj.duration}</Badge>}
                            </div>
                            <ul className="space-y-1.5 mt-1.5">
                              {proj.bullets.map((bullet, j) => (
                                <li key={j} className="flex gap-2">
                                  <span className="text-primary mt-0.5 shrink-0">•</span>
                                  <span className="leading-relaxed">{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Skills */}
              {r.skills?.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Skills</h3>
                  {editing ? (
                    <div className="space-y-2">
                      {r.skills.map((group, i) => (
                        <div key={i} className="flex gap-2 items-start">
                          <Input className="w-36 shrink-0 text-xs" placeholder="Category" value={group.category} onChange={e => upSkillCategory(i, e.target.value)} />
                          <Textarea className="text-xs min-h-[52px] flex-1" placeholder="Comma-separated skills" value={group.items.join(', ')} onChange={e => upSkillItems(i, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {r.skills.map((group, i) => (
                        <div key={i} className="flex gap-2 flex-wrap">
                          <span className="text-xs font-semibold shrink-0">{group.category}:</span>
                          <div className="flex flex-wrap gap-1">
                            {group.items.map((skill, j) => <Badge key={j} variant="outline" className="text-xs">{skill}</Badge>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Awards */}
              {r.awards?.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Awards & Honors</h3>
                  <div className="space-y-2">
                    {r.awards.map((award, i) => editing ? (
                      <div key={i} className="grid grid-cols-3 gap-2">
                        <Input className="col-span-1 text-xs" placeholder="Award Name" value={award.name} onChange={e => upAward(i, 'name', e.target.value)} />
                        <Input className="text-xs" placeholder="Issuer" value={award.issuer} onChange={e => upAward(i, 'issuer', e.target.value)} />
                        <Input className="text-xs" placeholder="Year" value={award.year} onChange={e => upAward(i, 'year', e.target.value)} />
                      </div>
                    ) : (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">{award.name}</p>
                          <p className="text-xs text-muted-foreground">{award.issuer}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs shrink-0">{award.year}</Badge>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Certifications */}
              {r.certifications?.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Certifications</h3>
                  <div className="space-y-2">
                    {r.certifications.map((cert, i) => editing ? (
                      <div key={i} className="grid grid-cols-3 gap-2">
                        <Input className="col-span-1 text-xs" placeholder="Certification" value={cert.name} onChange={e => upCert(i, 'name', e.target.value)} />
                        <Input className="text-xs" placeholder="Issuer" value={cert.issuer} onChange={e => upCert(i, 'issuer', e.target.value)} />
                        <Input className="text-xs" placeholder="Year" value={cert.year} onChange={e => upCert(i, 'year', e.target.value)} />
                      </div>
                    ) : (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">{cert.name}</p>
                          <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs shrink-0">{cert.year}</Badge>
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </div>
          </div>
        </TabsContent>

        {/* ── Cover Letter Tab ── */}
        <TabsContent value="cover" className="flex-1 min-h-0 mt-3 flex flex-col gap-3">
          <div className="flex items-center justify-between shrink-0">
            <p className="text-sm font-medium text-muted-foreground">Cover Letter</p>
            <CopyButton text={draft.coverLetter} />
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto rounded-lg border bg-card p-4">
            {editing
              ? <Textarea className="w-full min-h-[400px] text-sm leading-7 border-0 p-0 resize-none shadow-none focus-visible:ring-0" value={draft.coverLetter} onChange={e => setDraft(d => ({ ...d, coverLetter: e.target.value }))} />
              : <p className="text-sm leading-7 whitespace-pre-wrap">{draft.coverLetter}</p>}
          </div>
        </TabsContent>

        {/* ── Email Tab ── */}
        <TabsContent value="email" className="flex-1 min-h-0 mt-3 flex flex-col gap-3">
          <div className="flex items-center justify-between shrink-0">
            <p className="text-sm font-medium text-muted-foreground">Application Email</p>
            <CopyButton text={draft.emailMessage} />
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto rounded-lg border bg-card p-4">
            {editing
              ? <Textarea className="w-full min-h-[300px] text-sm leading-7 border-0 p-0 resize-none shadow-none focus-visible:ring-0" value={draft.emailMessage} onChange={e => setDraft(d => ({ ...d, emailMessage: e.target.value }))} />
              : <p className="text-sm leading-7 whitespace-pre-wrap">{draft.emailMessage}</p>}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Save As Dialog ── */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Resume As</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-muted-foreground">Give this resume a descriptive label so you can find it later.</p>
            <Input
              placeholder="e.g. Resume for QA Engineer Position"
              value={labelInput}
              onChange={e => setLabelInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !saving && handleSaveAs()}
              autoFocus
            />
            <div className="flex flex-wrap gap-1.5">
              {LABEL_SUGGESTIONS.map(s => (
                <button key={s} onClick={() => setLabelInput(s)} className="text-xs px-2.5 py-1 rounded-full border hover:bg-muted transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAs} disabled={!labelInput.trim() || saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
