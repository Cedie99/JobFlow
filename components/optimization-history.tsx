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
      onLoad({ ...(data.result as OptimizeResponse), savedId: data.id }, data.label ?? '')
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
          <ul className="p-3 space-y-2">
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
                    'group relative rounded-xl border overflow-hidden cursor-pointer',
                    'row-animate transition-all duration-200',
                    isActive
                      ? 'border-primary/40 bg-primary/5 shadow-sm'
                      : 'border-border bg-background hover:border-primary/30 hover:bg-muted/30 hover:shadow-sm',
                    isExiting && 'opacity-0 scale-95 translate-x-3 pointer-events-none'
                  )}
                  style={{ animationDelay: `${i * 45}ms` }}
                >
                  {/* Active left accent bar */}
                  {isActive && (
                    <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-primary" />
                  )}

                  <div className="px-3 pt-3 pb-2.5">
                    {/* Top row: icon + text */}
                    <div className="flex items-start gap-2.5">
                      <div className={cn(
                        'rounded-lg p-1.5 shrink-0 mt-0.5 transition-colors duration-150',
                        isActive
                          ? 'bg-primary/15 text-primary'
                          : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                      )}>
                        <FileText className="h-3.5 w-3.5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-1">
                          <p className={cn(
                            'text-xs font-medium leading-snug line-clamp-2 flex-1',
                            isActive ? 'text-primary' : 'text-foreground'
                          )}>
                            {item.label}
                          </p>
                          {isActive && (
                            <span className="shrink-0 inline-flex items-center gap-0.5 px-1.5 py-[3px] rounded-full text-[9px] font-semibold bg-primary text-primary-foreground leading-none">
                              <Sparkles className="h-2 w-2" />
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1.5 leading-tight">
                          {formatItemDate(item.created_at)}
                        </p>
                        <p className="text-[10px] text-muted-foreground/50 leading-tight">
                          {formatDistanceToNowStrict(new Date(item.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-border/60">
                      <button
                        onClick={(e) => { e.stopPropagation(); !isActive && handleLoad(item.id) }}
                        disabled={!!loadingId || !!deletingId || isActive}
                        className={cn(
                          'flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-medium transition-all duration-150',
                          isActive
                            ? 'text-primary/50 cursor-default'
                            : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed'
                        )}
                      >
                        {isLoading
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : isActive ? 'Loaded' : 'Load'}
                      </button>

                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        disabled={isDeleting || !!loadingId}
                        title="Delete"
                        className="flex items-center justify-center h-[26px] w-[26px] rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40 shrink-0"
                      >
                        {isDeleting
                          ? <Loader2 className="h-3 w-3 animate-spin" />
                          : <Trash2 className="h-3 w-3" />}
                      </button>
                    </div>
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
