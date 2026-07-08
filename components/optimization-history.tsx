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
import { format, isToday, isYesterday } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
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
  const [open, setOpen]         = useState(false)
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
      setOpen(false)
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
    <>
      {/* Trigger */}
      <Button
        variant="outline"
        size="sm"
        className="gap-2 shrink-0"
        onClick={() => setOpen(true)}
      >
        <History className="h-4 w-4" />
        History
        {items.length > 0 && (
          <span className="ml-0.5 text-[10px] font-semibold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 leading-none">
            {items.length}
          </span>
        )}
      </Button>

      {/* Side drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="p-0 flex flex-col">
          <SheetHeader className="px-5 pt-5 pb-4 border-b">
            <div className="flex items-center justify-between pr-9">
              <SheetTitle className="text-base">History</SheetTitle>
              <button
                onClick={fetchHistory}
                disabled={fetching}
                title="Refresh"
                className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', fetching && 'animate-spin')} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {fetching ? 'Loading...' : `${items.length} saved optimization${items.length !== 1 ? 's' : ''}`}
            </p>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto">
            {fetching ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="rounded-full bg-muted p-4 mb-3">
                  <History className="h-5 w-5 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium">No history yet</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Optimized resumes are saved automatically after generation.
                </p>
              </div>
            ) : (
              <ul className="p-3 space-y-1">
                {items.map((item) => {
                  const isActive   = item.id === activeId
                  const isLoading  = loadingId  === item.id
                  const isDeleting = deletingId === item.id
                  const isExiting  = exitingId  === item.id

                  return (
                    <li
                      key={item.id}
                      onClick={() => !isLoading && !isDeleting && handleLoad(item.id)}
                      className={cn(
                        'group relative rounded-xl border cursor-pointer transition-all duration-200',
                        isActive
                          ? 'border-primary/40 bg-primary/8'
                          : 'border-transparent hover:border-border hover:bg-muted/50',
                        isExiting && 'opacity-0 scale-95 pointer-events-none'
                      )}
                    >
                      <div className="flex items-start gap-3 p-3">
                        <div className={cn(
                          'rounded-lg p-2 shrink-0 mt-0.5 transition-colors',
                          isActive ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                        )}>
                          {isLoading
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <FileText className="h-3.5 w-3.5" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className={cn(
                              'text-xs font-medium truncate',
                              isActive ? 'text-primary' : 'text-foreground'
                            )}>
                              {item.label}
                            </p>
                            {isActive && (
                              <span className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-primary text-primary-foreground">
                                <Sparkles className="h-2 w-2" />
                                Active
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {formatItemDate(item.created_at)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDelete(item.id, e)}
                          disabled={isDeleting || !!loadingId}
                          title="Delete"
                          className={cn(
                            'flex items-center justify-center h-6 w-6 rounded-lg transition-all shrink-0',
                            'text-muted-foreground hover:text-destructive hover:bg-destructive/10',
                            'opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100',
                            'disabled:opacity-40 disabled:cursor-not-allowed'
                          )}
                        >
                          {isDeleting
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <Trash2 className="h-3 w-3" />
                          }
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
