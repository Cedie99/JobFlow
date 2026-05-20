'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, ExternalLink, Pencil, Trash2, Search, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNowStrict, differenceInDays } from 'date-fns'
import type { JobApplication } from '@/types'

const STATUS_CLASS: Record<string, string> = {
  applied: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  screening: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  interview: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  offer: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  rejected: 'bg-red-50 text-red-600 ring-1 ring-red-200',
  withdrawn: 'bg-zinc-100 text-zinc-600 ring-1 ring-zinc-300',
}

const STATUS_OPTIONS = [
  'all', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn',
] as const

interface ApplicationTableProps {
  applications: JobApplication[]
  onEdit: (app: JobApplication) => void
  onDelete: (id: string) => void
}

export default function ApplicationTable({
  applications,
  onEdit,
  onDelete,
}: ApplicationTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const filtered = applications.filter((app) => {
    const matchesSearch =
      app.company_name.toLowerCase().includes(search.toLowerCase()) ||
      (app.job_title ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (app.location ?? '').toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, role, location…"
            className="pl-8 h-9 focus:ring-2 focus:ring-primary/20 transition-shadow"
          />
        </div>

        {/* Status chips */}
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 capitalize whitespace-nowrap',
                statusFilter === status
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Company</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Role</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Status</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Applied</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Location</TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Follow-up</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                  <div className="flex flex-col items-center gap-3">
                    <div className="rounded-full bg-muted p-4">
                      <Search className="h-6 w-6 opacity-40" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {applications.length === 0
                          ? 'No applications yet'
                          : 'No results match your filters'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {applications.length === 0
                          ? 'Add your first application to get started'
                          : 'Try clearing filters or a different search term'}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((app, i) => {
                const followUpDate = app.next_follow_up
                  ? new Date(app.next_follow_up + 'T00:00:00')
                  : null
                const isOverdue = followUpDate !== null && followUpDate < today
                const daysUntilFollowUp = followUpDate
                  ? differenceInDays(followUpDate, today)
                  : null
                const isDueSoon =
                  daysUntilFollowUp !== null && daysUntilFollowUp >= 0 && daysUntilFollowUp <= 2

                const appliedDate = app.applied_date
                  ? new Date(app.applied_date + 'T00:00:00')
                  : null
                const appliedAgo = appliedDate
                  ? formatDistanceToNowStrict(appliedDate, { addSuffix: true })
                  : null

                return (
                  <TableRow
                    key={app.id}
                    className="group cursor-pointer transition-colors duration-100 hover:bg-primary/[0.03] row-animate"
                    style={{ animationDelay: `${i * 30}ms` }}
                    onClick={() => onEdit(app)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm">{app.company_name}</span>
                        {app.resume_generated && (
                          <Sparkles
                            className="h-3 w-3 text-primary shrink-0"
                            aria-label="Resume optimized"
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {app.job_title ?? '—'}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                          STATUS_CLASS[app.status]
                        )}
                      >
                        {app.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {appliedDate ? (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {format(appliedDate, 'MMM d, yyyy')}
                          </p>
                          <p className="text-[11px] text-muted-foreground/60">{appliedAgo}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {app.location ?? '—'}
                    </TableCell>
                    <TableCell>
                      {followUpDate ? (
                        <div className="flex items-center gap-1.5">
                          {isOverdue && (
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 shrink-0 pulse-dot" />
                          )}
                          {isDueSoon && !isOverdue && (
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 pulse-dot" />
                          )}
                          <div>
                            <p
                              className={cn(
                                'text-sm',
                                isOverdue
                                  ? 'text-red-600 font-medium'
                                  : isDueSoon
                                  ? 'text-amber-600 font-medium'
                                  : 'text-muted-foreground'
                              )}
                            >
                              {format(followUpDate, 'MMM d')}
                            </p>
                            {isOverdue && (
                              <p className="text-[11px] text-red-400">Overdue</p>
                            )}
                            {isDueSoon && !isOverdue && (
                              <p className="text-[11px] text-amber-500">
                                {daysUntilFollowUp === 0 ? 'Today' : `In ${daysUntilFollowUp}d`}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
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
                              onClick={() =>
                                window.open(app.job_posting_url!, '_blank', 'noopener,noreferrer')
                              }
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View posting
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete(app.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          {filtered.length} of {applications.length} application{applications.length !== 1 ? 's' : ''}
        </span>
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-primary hover:underline"
          >
            Clear search
          </button>
        )}
      </div>
    </div>
  )
}
