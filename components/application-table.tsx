'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontal, ExternalLink, Pencil, Trash2,
  Search, Sparkles, ChevronLeft, ChevronRight,
  MapPin, Bell, Inbox,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNowStrict, differenceInDays } from 'date-fns'
import type { JobApplication } from '@/types'

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS: Record<string, { label: string; badge: string; filterActive: string; filterInactive: string }> = {
  all:       { label: 'All',       badge: '',                                                      filterActive: 'bg-primary text-primary-foreground shadow-sm',                           filterInactive: 'bg-muted text-muted-foreground hover:text-foreground hover:bg-secondary' },
  applied:   { label: 'Applied',   badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',         filterActive: 'bg-blue-100 text-blue-700 ring-1 ring-blue-300 shadow-sm',              filterInactive: 'text-muted-foreground hover:text-blue-600 hover:bg-blue-50/50' },
  screening: { label: 'Screening', badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',      filterActive: 'bg-amber-100 text-amber-700 ring-1 ring-amber-300 shadow-sm',           filterInactive: 'text-muted-foreground hover:text-amber-600 hover:bg-amber-50/50' },
  interview: { label: 'Interview', badge: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',   filterActive: 'bg-violet-100 text-violet-700 ring-1 ring-violet-300 shadow-sm',         filterInactive: 'text-muted-foreground hover:text-violet-600 hover:bg-violet-50/50' },
  offer:     { label: 'Offer',     badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',filterActive: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 shadow-sm',      filterInactive: 'text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50/50' },
  accepted:  { label: 'Accepted',  badge: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200',         filterActive: 'bg-teal-100 text-teal-700 ring-1 ring-teal-300 shadow-sm',              filterInactive: 'text-muted-foreground hover:text-teal-600 hover:bg-teal-50/50' },
  on_hold:   { label: 'On Hold',   badge: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',   filterActive: 'bg-orange-100 text-orange-700 ring-1 ring-orange-300 shadow-sm',        filterInactive: 'text-muted-foreground hover:text-orange-600 hover:bg-orange-50/50' },
  rejected:  { label: 'Rejected',  badge: 'bg-red-50 text-red-600 ring-1 ring-red-200',            filterActive: 'bg-red-100 text-red-700 ring-1 ring-red-300 shadow-sm',                 filterInactive: 'text-muted-foreground hover:text-red-600 hover:bg-red-50/50' },
  ghosted:   { label: 'Ghosted',   badge: 'bg-slate-50 text-slate-500 ring-1 ring-slate-200',      filterActive: 'bg-slate-100 text-slate-600 ring-1 ring-slate-300 shadow-sm',           filterInactive: 'text-muted-foreground hover:text-slate-600 hover:bg-slate-50/50' },
  withdrawn: { label: 'Withdrawn', badge: 'bg-zinc-100 text-zinc-600 ring-1 ring-zinc-300',        filterActive: 'bg-zinc-100 text-zinc-600 ring-1 ring-zinc-300 shadow-sm',              filterInactive: 'text-muted-foreground hover:text-zinc-600 hover:bg-zinc-100/50' },
  expired:   { label: 'Expired',   badge: 'bg-zinc-50 text-zinc-400 ring-1 ring-zinc-200',         filterActive: 'bg-zinc-100 text-zinc-500 ring-1 ring-zinc-300 shadow-sm',              filterInactive: 'text-muted-foreground hover:text-zinc-500 hover:bg-zinc-50/50' },
}

const STATUS_ORDER = [
  'all', 'applied', 'screening', 'interview', 'offer', 'accepted',
  'on_hold', 'rejected', 'ghosted', 'withdrawn', 'expired',
]

// ── Date group header ─────────────────────────────────────────────────────────
function DateGroupHeader({ dateKey, count }: { dateKey: string; count: number }) {
  const date = dateKey !== '__none' ? new Date(dateKey + 'T00:00:00') : null

  let label = 'No date set'
  let sub: string | null = null

  if (date) {
    const now = new Date(); now.setHours(0, 0, 0, 0)
    const diff = differenceInDays(now, date)
    if (diff === 0) label = 'Today'
    else if (diff === 1) label = 'Yesterday'
    else {
      label = format(date, 'MMMM d, yyyy')
      sub = formatDistanceToNowStrict(date, { addSuffix: true })
    }
  }

  return (
    <div className="flex items-center gap-2.5 px-0.5 pt-4 pb-1.5 first:pt-0">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 whitespace-nowrap">
        {label}
      </span>
      {sub && (
        <span className="text-[11px] text-muted-foreground/40 whitespace-nowrap">{sub}</span>
      )}
      <div className="flex-1 h-px bg-border/60" />
      <span className="text-[11px] text-muted-foreground/40 whitespace-nowrap tabular-nums">
        {count}
      </span>
    </div>
  )
}

// ── Application card ──────────────────────────────────────────────────────────
function AppCard({
  app,
  onEdit,
  onDelete,
}: {
  app: JobApplication
  onEdit: (a: JobApplication) => void
  onDelete: (id: string) => void
}) {
  const cfg = STATUS[app.status] ?? STATUS.applied
  const today = new Date(); today.setHours(0, 0, 0, 0)

  const followUpDate = app.next_follow_up ? new Date(app.next_follow_up + 'T00:00:00') : null
  const daysUntil = followUpDate ? differenceInDays(followUpDate, today) : null
  const isOverdue = followUpDate !== null && followUpDate < today
  const isDueSoon = daysUntil !== null && daysUntil >= 0 && daysUntil <= 2

  const followUpText = (() => {
    if (!followUpDate) return null
    if (isOverdue) return { text: `Overdue · ${format(followUpDate, 'MMM d')}`, cls: 'text-red-500' }
    if (daysUntil === 0) return { text: 'Follow-up today', cls: 'text-amber-500' }
    if (daysUntil === 1) return { text: 'Follow-up tomorrow', cls: 'text-amber-500' }
    return { text: `Follow-up ${format(followUpDate, 'MMM d')}`, cls: 'text-muted-foreground/70' }
  })()

  const hasMetaRow = !!(app.location || followUpText)
  const initial = (app.company_name.trim()[0] ?? '?').toUpperCase()

  return (
    <div
      className="group flex items-center gap-3 px-4 py-3.5 rounded-xl border bg-card cursor-pointer hover:shadow-sm hover:bg-accent/25 hover:border-primary/20 transition-all duration-150"
      onClick={() => onEdit(app)}
    >
      {/* Avatar */}
      <div className="shrink-0 w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground select-none">
        {initial}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-0.5">
        {/* Row 1: company name + status badge */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-semibold text-sm truncate leading-snug">{app.company_name}</span>
            {app.resume_generated && (
              <Sparkles className="h-3 w-3 text-primary shrink-0" aria-label="Resume optimized" />
            )}
          </div>
          <span className={cn('shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium', cfg.badge)}>
            {cfg.label}
          </span>
        </div>

        {/* Row 2: role */}
        <p className="text-xs text-muted-foreground truncate">
          {app.job_title ?? <span className="italic opacity-40">No role specified</span>}
        </p>

        {/* Row 3: meta — location + follow-up */}
        {hasMetaRow && (
          <div className="flex items-center gap-3 pt-0.5">
            {app.location && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground/70">
                <MapPin className="h-3 w-3 shrink-0" />
                {app.location}
              </span>
            )}
            {followUpText && (
              <span className={cn('flex items-center gap-1.5 text-[11px] font-medium', followUpText.cls)}>
                {(isOverdue || isDueSoon) && (
                  <span className={cn('h-1.5 w-1.5 rounded-full animate-pulse shrink-0', isOverdue ? 'bg-red-500' : 'bg-amber-500')} />
                )}
                <Bell className="h-3 w-3 shrink-0" />
                {followUpText.text}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions menu */}
      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            }
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(app)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            {app.job_posting_url && (
              <DropdownMenuItem
                onClick={() => window.open(app.job_posting_url!, '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View posting
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => onDelete(app.id)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
interface ApplicationTableProps {
  applications: JobApplication[]
  onEdit: (app: JobApplication) => void
  onDelete: (id: string) => void
}

export default function ApplicationTable({ applications, onEdit, onDelete }: ApplicationTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 15

  const filtered = applications.filter((app) => {
    const q = search.toLowerCase()
    const matchesSearch =
      app.company_name.toLowerCase().includes(q) ||
      (app.job_title ?? '').toLowerCase().includes(q) ||
      (app.location ?? '').toLowerCase().includes(q)
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Sort by applied_date desc, then created_at desc so date groups are contiguous
  const sorted = [...filtered].sort((a, b) => {
    if (!a.applied_date && !b.applied_date) return b.created_at.localeCompare(a.created_at)
    if (!a.applied_date) return 1
    if (!b.applied_date) return -1
    const d = b.applied_date.localeCompare(a.applied_date)
    return d !== 0 ? d : b.created_at.localeCompare(a.created_at)
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => { setPage(1) }, [search, statusFilter])

  const countByStatus = applications.reduce<Record<string, number>>((acc, app) => {
    acc[app.status] = (acc[app.status] ?? 0) + 1
    return acc
  }, {})

  // Build date groups from the visible slice (already sorted by date)
  const groups: { dateKey: string; apps: JobApplication[] }[] = []
  for (const app of paginated) {
    const key = app.applied_date ?? '__none'
    const last = groups[groups.length - 1]
    if (last?.dateKey === key) last.apps.push(app)
    else groups.push({ dateKey: key, apps: [app] })
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search company, role, location…"
          className="pl-9 h-10 focus:ring-2 focus:ring-primary/20 transition-shadow"
        />
      </div>

      {/* Status filter chips with live counts */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUS_ORDER.map((s) => {
          const cfg = STATUS[s]
          const count = s === 'all' ? applications.length : (countByStatus[s] ?? 0)
          if (s !== 'all' && count === 0) return null
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 whitespace-nowrap',
                statusFilter === s ? cfg.filterActive : cfg.filterInactive,
              )}
            >
              {cfg.label}
              <span
                className={cn(
                  'inline-flex items-center justify-center rounded-full text-[10px] font-semibold min-w-[16px] h-4 px-0.5',
                  statusFilter === s ? 'bg-black/10 text-current' : 'bg-muted-foreground/15 text-muted-foreground',
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Grouped card list */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed">
          <div className="rounded-full bg-muted p-4 mb-3">
            <Inbox className="h-6 w-6 opacity-40" />
          </div>
          <p className="text-sm font-medium">
            {applications.length === 0 ? 'No applications yet' : 'No results match your filters'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {applications.length === 0
              ? 'Add your first application to get started'
              : 'Try a different search term or clear the filter'}
          </p>
          {(search || statusFilter !== 'all') && (
            <button
              onClick={() => { setSearch(''); setStatusFilter('all') }}
              className="mt-3 text-xs text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div>
          {groups.map((group) => (
            <div key={group.dateKey}>
              <DateGroupHeader dateKey={group.dateKey} count={group.apps.length} />
              <div className="space-y-1.5">
                {group.apps.map((app) => (
                  <AppCard key={app.id} app={app} onEdit={onEdit} onDelete={onDelete} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5 pt-1">
        <span>
          {filtered.length} of {applications.length} application{applications.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-3">
          {(search || statusFilter !== 'all') && (
            <button
              onClick={() => { setSearch(''); setStatusFilter('all') }}
              className="text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-border bg-background text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="tabular-nums font-medium">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-border bg-background text-muted-foreground hover:bg-muted disabled:pointer-events-none transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
