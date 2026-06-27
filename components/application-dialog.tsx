'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
import type { JobApplication } from '@/types'

const schema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  job_title: z.string().optional(),
  job_posting_url: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  status: z.enum(['applied', 'screening', 'interview', 'offer', 'accepted', 'rejected', 'withdrawn', 'ghosted', 'on_hold', 'expired']),
  applied_date: z.string().optional(),
  location: z.string().optional(),
  salary_range: z.string().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email('Invalid email').optional().or(z.literal('')),
  next_follow_up: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface ApplicationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  application?: JobApplication | null
  onSave: (data: Partial<JobApplication>) => Promise<void>
}

const STATUS_OPTIONS: { value: JobApplication['status']; label: string }[] = [
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'ghosted', label: 'Ghosted' },
  { value: 'withdrawn', label: 'Withdrawn' },
  { value: 'expired', label: 'Posting Expired' },
]

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="col-span-2 pt-2 flex items-center gap-3">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

export default function ApplicationDialog({
  open,
  onOpenChange,
  application,
  onSave,
}: ApplicationDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'applied' },
  })

  useEffect(() => {
    if (application) {
      reset({
        company_name: application.company_name,
        job_title: application.job_title ?? '',
        job_posting_url: application.job_posting_url ?? '',
        status: application.status,
        applied_date: application.applied_date ?? '',
        location: application.location ?? '',
        salary_range: application.salary_range ?? '',
        contact_name: application.contact_name ?? '',
        contact_email: application.contact_email ?? '',
        next_follow_up: application.next_follow_up ?? '',
        notes: application.notes ?? '',
      })
    } else {
      const d = new Date()
      const localDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      reset({ status: 'applied', applied_date: localDate })
    }
  }, [application, reset, open])

  async function onSubmit(data: FormData) {
    const cleaned = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v === '' ? null : v])
    )
    await onSave(cleaned as Partial<JobApplication>)
    onOpenChange(false)
  }

  const statusValue = watch('status')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{application ? 'Edit Application' : 'Add Application'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-0 py-2">
          <div className="grid grid-cols-2 gap-x-3 gap-y-3">

            {/* ── Core ─────────────────────────────────────── */}
            <div className="col-span-2 space-y-1.5">
              <Label>Company Name *</Label>
              <Input {...register('company_name')} placeholder="Acme Corp" />
              {errors.company_name && (
                <p className="text-xs text-destructive">{errors.company_name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Job Title</Label>
              <Input {...register('job_title')} placeholder="Software Engineer" />
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={statusValue}
                onValueChange={(v) => v && setValue('status', v as FormData['status'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>Job Posting URL</Label>
              <Input {...register('job_posting_url')} placeholder="https://…" type="url" />
              {errors.job_posting_url && (
                <p className="text-xs text-destructive">{errors.job_posting_url.message}</p>
              )}
            </div>

            {/* ── Dates & Location ─────────────────────────── */}
            <SectionDivider label="Details" />

            <div className="space-y-1.5">
              <Label>Applied Date</Label>
              <Input {...register('applied_date')} type="date" />
            </div>

            <div className="space-y-1.5">
              <Label>Follow-up Date</Label>
              <Input {...register('next_follow_up')} type="date" />
            </div>

            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input {...register('location')} placeholder="Remote / New York, NY" />
            </div>

            <div className="space-y-1.5">
              <Label>Salary Range</Label>
              <Input {...register('salary_range')} placeholder="$80k – $100k" />
            </div>

            {/* ── Contact ──────────────────────────────────── */}
            <SectionDivider label="Contact" />

            <div className="space-y-1.5">
              <Label>Contact Name</Label>
              <Input {...register('contact_name')} placeholder="Hiring Manager" />
            </div>

            <div className="space-y-1.5">
              <Label>Contact Email</Label>
              <Input {...register('contact_email')} placeholder="hr@company.com" type="email" />
              {errors.contact_email && (
                <p className="text-xs text-destructive">{errors.contact_email.message}</p>
              )}
            </div>

            {/* ── Notes ────────────────────────────────────── */}
            <SectionDivider label="Notes" />

            <div className="col-span-2 space-y-1.5">
              <Textarea
                {...register('notes')}
                placeholder="Interview notes, follow-up reminders…"
                className="min-h-[80px] text-sm"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : application ? 'Save Changes' : 'Add Application'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
