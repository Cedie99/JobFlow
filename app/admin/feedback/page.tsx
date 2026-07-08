'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { UserFeedback, FeedbackStatus, FeedbackType } from '@/types'

const TYPE_LABELS: Record<FeedbackType, string> = {
  bug: 'Bug',
  feature: 'Feature',
  general: 'General',
}

const TYPE_STYLES: Record<FeedbackType, string> = {
  bug: 'bg-red-500/10 text-red-600 border-red-500/20',
  feature: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  general: 'bg-muted text-muted-foreground',
}

const STATUS_STYLES: Record<FeedbackStatus, string> = {
  open: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  reviewed: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  closed: 'bg-muted text-muted-foreground',
}

const FILTERS: { label: string; value: FeedbackStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Reviewed', value: 'reviewed' },
  { label: 'Closed', value: 'closed' },
]

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<UserFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FeedbackStatus | 'all'>('all')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/feedback')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => setFeedback(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load feedback'))
      .finally(() => setLoading(false))
  }, [])

  async function updateStatus(id: string, status: FeedbackStatus) {
    setUpdating(id)
    try {
      const res = await fetch(`/api/admin/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      setFeedback(prev => prev.map(f => f.id === id ? { ...f, status } : f))
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  const filtered = filter === 'all' ? feedback : feedback.filter(f => f.status === filter)
  const counts = {
    all: feedback.length,
    open: feedback.filter(f => f.status === 'open').length,
    reviewed: feedback.filter(f => f.status === 'reviewed').length,
    closed: feedback.filter(f => f.status === 'closed').length,
  }

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Feedback</h1>
        <p className="text-sm text-muted-foreground mt-1">{feedback.length} total submissions</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-muted/50 p-1 rounded-lg w-fit">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
              filter === f.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {f.label}
            <span className={cn(
              'ml-1.5 text-xs',
              filter === f.value ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {counts[f.value]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-lg border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-12 text-center text-sm text-muted-foreground">
          No feedback in this category
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <Badge variant="outline" className={TYPE_STYLES[item.type]}>
                      {TYPE_LABELS[item.type]}
                    </Badge>
                    <Badge variant="outline" className={STATUS_STYLES[item.status]}>
                      {item.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {item.user_email ?? 'Anonymous'} · {fmt(item.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap">{item.message}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {item.status !== 'reviewed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updating === item.id}
                      onClick={() => updateStatus(item.id, 'reviewed')}
                      className="text-xs h-7"
                    >
                      Reviewed
                    </Button>
                  )}
                  {item.status !== 'closed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updating === item.id}
                      onClick={() => updateStatus(item.id, 'closed')}
                      className="text-xs h-7 text-muted-foreground"
                    >
                      Close
                    </Button>
                  )}
                  {item.status === 'closed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updating === item.id}
                      onClick={() => updateStatus(item.id, 'open')}
                      className="text-xs h-7"
                    >
                      Reopen
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
