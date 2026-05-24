'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function BillingButton() {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing-portal')
      if (!res.ok) throw new Error()
      const { url } = await res.json()
      window.open(url, '_blank')
    } catch {
      toast.error('Could not open billing portal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={loading}
      className="gap-2"
    >
      <ExternalLink className="h-3.5 w-3.5" />
      {loading ? 'Opening...' : 'Manage Billing'}
    </Button>
  )
}
