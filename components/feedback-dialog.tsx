'use client'

import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface FeedbackDialogProps {
  collapsed?: boolean
}

export default function FeedbackDialog({ collapsed }: FeedbackDialogProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!type || !message.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      toast.success('Thanks for your feedback!')
      setOpen(false)
      setType(null)
      setMessage('')
    } catch {
      toast.error('Could not send feedback. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {collapsed ? (
        <button
          title="Send Feedback"
          onClick={() => setOpen(true)}
          className="flex items-center justify-center h-9 w-9 rounded-md text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md shrink-0">
            <MessageSquare className="h-4 w-4" />
          </span>
          Send Feedback
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="What kind of feedback?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug report</SelectItem>
                  <SelectItem value="feature">Feature request</SelectItem>
                  <SelectItem value="general">General feedback</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Message</Label>
              <Textarea
                placeholder="Tell us what's on your mind..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !type || !message.trim()}
              >
                {loading ? 'Sending...' : 'Send Feedback'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
