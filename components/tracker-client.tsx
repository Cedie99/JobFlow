'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import ApplicationTable from '@/components/application-table'
import ApplicationDialog from '@/components/application-dialog'
import ConfirmDialog from '@/components/confirm-dialog'
import StatsCards, { buildStatsFromApplications } from '@/components/stats-cards'
import { Plus, ClipboardList } from 'lucide-react'
import { toast } from 'sonner'
import type { JobApplication } from '@/types'

export default function TrackerClient({
  initialApplications,
}: {
  initialApplications: JobApplication[]
}) {
  const [applications, setApplications] = useState<JobApplication[]>(initialApplications)
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/applications')
      if (!res.ok) throw new Error('Failed to fetch applications')
      const data = await res.json()
      setApplications(data)
    } catch {
      toast.error('Could not load applications')
    } finally {
      setLoading(false)
    }
  }, [])

  function openAdd() {
    setEditingApp(null)
    setDialogOpen(true)
  }

  function openEdit(app: JobApplication) {
    setEditingApp(app)
    setDialogOpen(true)
  }

  async function handleSave(data: Partial<JobApplication>) {
    try {
      if (editingApp) {
        const res = await fetch(`/api/applications/${editingApp.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Failed to update')
        toast.success('Application updated')
      } else {
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Failed to create')
        toast.success('Application added')
      }
      await fetchApplications()
    } catch {
      toast.error('Failed to save application')
      throw new Error('save failed')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/applications/${deleteTarget}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setApplications((prev) => prev.filter((a) => a.id !== deleteTarget))
      toast.success('Application deleted')
    } catch {
      toast.error('Failed to delete application')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Application Tracker</h1>
          <p className="text-muted-foreground text-sm">Track every job application in one place</p>
        </div>
        <Button onClick={openAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Application
        </Button>
      </div>

      <StatsCards stats={buildStatsFromApplications(applications)} />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <ApplicationTable
          applications={applications}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
        />
      )}

      <ApplicationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        application={editingApp}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete application?"
        description="This will permanently remove this job application. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
