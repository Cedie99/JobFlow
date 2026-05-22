'use client'

import { useState, useEffect } from 'react'
import { X, Info, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Announcement, AnnouncementType } from '@/types'

const TYPE_CONFIG: Record<AnnouncementType, {
  icon: React.ElementType
  bg: string
  border: string
  iconColor: string
  titleColor: string
}> = {
  info: {
    icon: Info,
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-900 dark:text-blue-100',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-900 dark:text-amber-100',
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
    iconColor: 'text-green-500',
    titleColor: 'text-green-900 dark:text-green-100',
  },
  update: {
    icon: Sparkles,
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-800',
    iconColor: 'text-purple-500',
    titleColor: 'text-purple-900 dark:text-purple-100',
  },
}

export default function AnnouncementsBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    fetch('/api/announcements')
      .then(r => r.ok ? r.json() : [])
      .then(setAnnouncements)
      .catch(() => {})
  }, [])

  async function dismiss(id: string) {
    setAnnouncements(prev => prev.filter(a => a.id !== id))
    await fetch('/api/announcements/dismiss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ announcementId: id }),
    }).catch(() => {})
  }

  if (announcements.length === 0) return null

  return (
    <div className="px-6 pt-4 space-y-2">
      {announcements.map(a => {
        const cfg = TYPE_CONFIG[a.type]
        const Icon = cfg.icon
        return (
          <div
            key={a.id}
            className={cn(
              'flex items-start gap-3 rounded-lg border px-4 py-3',
              cfg.bg,
              cfg.border,
            )}
          >
            <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', cfg.iconColor)} />
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-semibold', cfg.titleColor)}>{a.title}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{a.body}</p>
            </div>
            <button
              onClick={() => dismiss(a.id)}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
