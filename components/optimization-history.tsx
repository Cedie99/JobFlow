'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  History,
  Trash2,
  Loader2,
  FileText,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { formatDistanceToNowStrict, format, isToday, isYesterday } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { OptimizeResponse, SavedOptimization } from '@/types'

interface OptimizationHistoryProps {
  onLoad: (result: OptimizeResponse, label: string) => void
  activeId?: string | null
  refreshTrigger?: number
}

function formatItemDate(iso: string) {
  const d = new Date(iso)
  if (isToday(d))     return `Today · ${format(d, 'h:mm a')}`
  if (isYesterday(d)) return `Yesterday · ${format(d, 'h:mm a')}`
  return format(d, 'MMM d, yyyy')
}

export default function OptimizationHistory({ onLoad, activeId, refreshTrigger }: OptimizationHistoryProps) {
  const [items, setItems]       = useState<SavedOptimization[]>([])
  const [fetching, setFetching] = useState(false)
  const [loadingId, setLoadingId]   = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [exitingId, setExitingId]   = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    setFetching(true)
    try {
      const res = await fetch('/api/optimizations')
      if (!res.ok) throw new Error()
      setItems(await res.json())
    } catch {
      toast.error('Could not load optimization history')
    } finally {
      setFetching(false)
    }
  }, [])

  useEffect(() => { fetchHistory() }, [fetchHistory, refreshTrigger])

  async function handleLoad(id: string) {
    if (loadingId) return
    setLoadingId(id)
    try {
      const res = await fetch(`/api/optimizations/${id}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      onLoad({ ...(data.result as OptimizeResponse), savedId: data.id, resumePdfHtml: data.resume_pdf_html ?? null }, data.label ?? '')
      toast.success('Optimization loaded')
    } catch {
      toast.error('Could not load this optimization')
    } finally {
      setLoadingId(null)
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (deletingId) return
    setDeletingId(id)
    setExitingId(id)
    try {
      await new Promise(r => setTimeout(r, 180))
      const res = await fetch(`/api/optimizations/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setItems(prev => prev.filter(i => i.id !== id))
      toast.success('Deleted')
    } catch {
      toast.error('Could not delete')
      setExitingId(null)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <aside className="w-72 shrink-0 border-l border-border bg-card h-full flex flex-col overflow-hidden">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-primary/10 p-1.5">
            <History className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">History</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">
              {fetching ? 'Loading…' : `${items.length} saved`}
            </p>
          </div>
        </div>
        <button
          onClick={fetchHistory}
          disabled={fetching}
          title="Refresh"
          className="flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', fetching && 'animate-spin')} />
        </button>
      </div>

      {/* ── Body ─────────────────────────────────────────────── */}
      {fetching ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-xs">Loading history…</p>
        </div>

      ) : items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="rounded-full bg-muted p-4">
            <History className="h-5 w-5 text-muted-foreground/40" />
          </div>
          <div>
            <p className="text-sm font-medium">No history yet</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Optimized resumes are saved automatically after generation.
            </p>
          </div>
        </div>

      ) : (
        <div className="flex-1 overflow-y-auto">
          <ul className="p-2.5 space-y-1.5">
            {items.map((item, i) => {
              const isActive   = item.id === activeId
              const isLoading  = loadingId  === item.id
              const isDeleting = deletingId === item.id
              const isExiting  = exitingId  === item.id

              return (
                <li
                  key={item.id}
                  onClick={() => !isLoading && !isDeleting && handleLoad(item.id)}
                  className={cn(
                    'group relative rounded-lg border cursor-pointer',
                    'transition-all duration-200 ease-out',
                    isActive
                      ? 'border-primary/50 bg-primary/10 shadow-md'
                      : 'border-border bg-card hover:border-primary/30 hover:bg-muted/50 hover:shadow-sm',
                    isExiting && 'opacity-0 scale-95 translate-x-2 pointer-events-none'
                  )}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="flex items-center gap-3 p-3">
                    {/* Icon */}
                    <div className={cn(
                      'rounded-lg p-2 shrink-0 transition-colors duration-200',
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                    )}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          'text-sm font-medium truncate',
                          isActive ? 'text-primary' : 'text-foreground group-hover:text-primary'
                        )}>
                          {item.label}
                        </p>
                        {isActive && (
                          <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary text-primary-foreground">
                            <Sparkles className="h-2.5 w-2.5" />
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatItemDate(item.created_at)}
                      </p>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      disabled={isDeleting || !!loadingId}
                      title="Delete"
                      className={cn(
                        'flex items-center justify-center h-8 w-8 rounded-lg shrink-0 transition-all duration-200',
                        'text-muted-foreground hover:text-destructive hover:bg-destructive/10',
                        'opacity-0 group-hover:opacity-100 focus:opacity-100',
                        'disabled:opacity-40 disabled:cursor-not-allowed'
                      )}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </aside>
  )
}
