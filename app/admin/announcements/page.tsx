'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Info, AlertTriangle, CheckCircle, Sparkles, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Announcement, AnnouncementType } from '@/types'

const TYPE_CONFIG: Record<AnnouncementType, { icon: React.ElementType; label: string; style: string }> = {
  info:    { icon: Info,          label: 'Info',    style: 'bg-teal-500/10 text-teal-600 border-teal-500/20' },
  warning: { icon: AlertTriangle, label: 'Warning', style: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  success: { icon: CheckCircle,   label: 'Success', style: 'bg-green-500/10 text-green-600 border-green-500/20' },
  update:  { icon: Sparkles,      label: 'Update',  style: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [type, setType] = useState<AnnouncementType>('info')

  useEffect(() => {
    fetch('/api/admin/announcements')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => setAnnouncements(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load announcements'))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, type }),
      })
      if (!res.ok) throw new Error()
      const created = await res.json()
      setAnnouncements(prev => [created, ...prev])
      setDialogOpen(false)
      setTitle('')
      setBody('')
      setType('info')
      toast.success('Announcement created')
    } catch {
      toast.error('Failed to create announcement')
    } finally {
      setCreating(false)
    }
  }

  async function toggleActive(id: string, current: boolean) {
    setToggling(id)
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !current }),
      })
      if (!res.ok) throw new Error()
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, active: !current } : a))
    } catch {
      toast.error('Failed to update announcement')
    } finally {
      setToggling(null)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setAnnouncements(prev => prev.filter(a => a.id !== id))
      toast.success('Announcement deleted')
    } catch {
      toast.error('Failed to delete announcement')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {announcements.filter(a => a.active).length} active · {announcements.length} total
          </p>
        </div>

        <Button size="sm" className="gap-1.5" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New Announcement
        </Button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>New Announcement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={type} onValueChange={v => { if (v) setType(v as AnnouncementType) }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input
                  placeholder="Short, descriptive title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Message</Label>
                <Textarea
                  placeholder="Details of the announcement..."
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating || !title.trim() || !body.trim()}>
                  {creating ? 'Publishing...' : 'Publish'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-24 rounded-lg border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <Card className="py-12 text-center text-sm text-muted-foreground">
          No announcements yet. Create one to notify all users.
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map(a => {
            const cfg = TYPE_CONFIG[a.type]
            const Icon = cfg.icon
            return (
              <Card key={a.id} className={cn('p-4', !a.active && 'opacity-60')}>
                <div className="flex items-start gap-3">
                  <div className={cn('flex items-center justify-center w-8 h-8 rounded-lg shrink-0', cfg.style.split(' ').slice(0, 1).join(' '))}>
                    <Icon className={cn('h-4 w-4', cfg.style.split(' ').slice(1, 2).join(' '))} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-semibold">{a.title}</span>
                      <Badge variant="outline" className={cfg.style}>{cfg.label}</Badge>
                      <Badge variant="outline" className={a.active
                        ? 'bg-green-500/10 text-green-600 border-green-500/20'
                        : 'bg-muted text-muted-foreground'
                      }>
                        {a.active ? 'Active' : 'Inactive'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{fmt(a.created_at)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{a.body}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={toggling === a.id}
                      onClick={() => toggleActive(a.id, a.active)}
                      title={a.active ? 'Deactivate' : 'Activate'}
                      className="h-8 w-8 p-0"
                    >
                      {a.active
                        ? <ToggleRight className="h-4 w-4 text-green-500" />
                        : <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                      }
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={deleting === a.id}
                      onClick={() => handleDelete(a.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
