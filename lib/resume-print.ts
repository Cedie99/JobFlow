import type { OptimizeResponse } from '@/types'

export function buildResumePrintHTML(d: OptimizeResponse): string {
  const r = d.optimizedResume
  const contactLine = [r.contactInfo.email, r.contactInfo.phone, r.contactInfo.location].filter(Boolean).join(' | ')
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const liParts: string[] = []
  if (r.contactInfo.linkedin) {
    const href = /^https?:\/\//i.test(r.contactInfo.linkedin) ? r.contactInfo.linkedin : `https://${r.contactInfo.linkedin}`
    liParts.push(`<a href="${esc(href)}" style="color:#1a56db;text-decoration:none">${esc(r.contactInfo.linkedinLabel || 'LinkedIn')}</a>`)
  }
  if (r.contactInfo.github) {
    const href = /^https?:\/\//i.test(r.contactInfo.github) ? r.contactInfo.github : `https://${r.contactInfo.github}`
    liParts.push(`<a href="${esc(href)}" style="color:#1a56db;text-decoration:none">${esc(r.contactInfo.githubLabel || 'GitHub')}</a>`)
  }
  const linksLine = liParts.join(' | ')
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${esc(r.contactInfo.name)} - Resume</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Times New Roman',serif;font-size:11pt;line-height:1.45;color:#111;padding:36px 48px;max-width:850px;margin:0 auto}
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
${linksLine ? `<p class="contact">${linksLine}</p>` : ''}
<h2>Professional Summary</h2><p>${esc(r.summary)}</p>
${r.education?.length ? `<h2>Education</h2>${r.education.map(e => `<div class="row"><div><div class="bold">${esc(e.degree)}</div><div class="sub">${esc(e.institution)}${e.location ? ', ' + esc(e.location) : ''}${e.gpa ? ' · GPA: ' + esc(e.gpa) : ''}</div></div><div>${esc(e.year)}</div></div>`).join('')}` : ''}
${r.experience?.length ? `<h2>Work Experience</h2>${r.experience.map(e => `<div class="row"><div><div class="bold">${esc(e.title)}</div><div class="sub">${esc(e.company)}${e.location ? ' · ' + esc(e.location) : ''}</div></div><div style="font-size:9.5pt">${esc(e.duration)}</div></div><ul>${e.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>`).join('')}` : ''}
${r.projects?.length ? `<h2>Projects</h2>${r.projects.map(p => `<div class="row"><div><div class="bold">${esc(p.name)}</div><div class="sub">${esc(p.techStack)}</div></div>${p.duration ? `<div style="font-size:9.5pt">${esc(p.duration)}</div>` : ''}</div><ul>${p.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>`).join('')}` : ''}
${r.skills?.length ? `<h2>Skills</h2>${r.skills.map(s => `<div class="skill"><span class="skill-cat">${esc(s.category)}:</span> ${s.items.map(esc).join(', ')}</div>`).join('')}` : ''}
${r.awards?.length ? `<h2>Awards &amp; Honors</h2>${r.awards.map(a => `<div class="row"><span>${esc(a.name)} — ${esc(a.issuer)}</span><span>${esc(a.year)}</span></div>`).join('')}` : ''}
${r.certifications?.length ? `<h2>Certifications</h2>${r.certifications.map(c => `<div class="row"><span>${esc(c.name)} — ${esc(c.issuer)}</span><span>${esc(c.year)}</span></div>`).join('')}` : ''}
</body></html>`
}

export function printResumeHTML(html: string): boolean {
  const win = window.open('', '_blank', 'width=850,height=1000')
  if (!win) return false
  win.document.write(html)
  win.document.close()
  setTimeout(() => win.print(), 400)
  return true
}

export function buildCoverLetterPrintHTML(coverLetter: string, name: string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const paragraphs = coverLetter.split('\n\n').map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('')
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${esc(name)} - Cover Letter</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Times New Roman',serif;font-size:11pt;line-height:1.6;color:#111;padding:48px 60px;max-width:700px;margin:0 auto}
p{margin-bottom:12px;text-align:justify}
@media print{body{padding:20px 30px}@page{margin:1cm;size:A4}}</style></head><body>
${paragraphs}
</body></html>`
}

export function printCoverLetterHTML(coverLetter: string, name: string): boolean {
  const html = buildCoverLetterPrintHTML(coverLetter, name)
  const win = window.open('', '_blank', 'width=700,height=1000')
  if (!win) return false
  win.document.write(html)
  win.document.close()
  setTimeout(() => win.print(), 400)
  return true
}

export function downloadCoverLetterAsWord(coverLetter: string, name: string): void {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const paragraphs = coverLetter.split('\n\n').map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('')
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${esc(name)} - Cover Letter</title>
<style>body{font-family:'Times New Roman',serif;font-size:11pt;line-height:1.6;color:#111;padding:48px 60px;max-width:700px;margin:0 auto}
p{margin-bottom:12px;text-align:justify}</style></head><body>
${paragraphs}
</body></html>`
  
  const blob = new Blob(['\ufeff', html], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${name.replace(/[^a-z0-9]/gi, '_')}_cover_letter.doc`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
