'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const FREE_FEATURES = [
  '3 AI uses total (profile interviews, resume builds, optimizer)',
  'Unlimited job application tracking',
  'Follow-up reminders & pipeline view',
  'Multiple career profiles (interview-based)',
]

const PRO_FEATURES = [
  'Unlimited AI resume generations',
  'Unlimited career profile interviews',
  'Unlimited resume optimizer uses',
  'Unlimited job application tracking',
  'Follow-up reminders & pipeline view',
  'Priority AI processing',
]

export default function PricingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [statusLoading, setStatusLoading] = useState(true)

  useEffect(() => {
    fetch('/api/usage')
      .then(r => r.json())
      .then(data => setIsSubscribed(data.isSubscribed ?? false))
      .catch(() => {})
      .finally(() => setStatusLoading(false))
  }, [])

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to create checkout')
      const { url } = await res.json()
      window.location.href = url
    } catch {
      toast.error('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-full px-6 py-10 max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Simple pricing</h1>
        <p className="mt-2 text-muted-foreground">
          Start free. Upgrade when you&apos;re ready to apply at full speed.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Free */}
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col">
          <div className="mb-4">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Free</p>
            <p className="mt-1 text-4xl font-bold">₱0</p>
            <p className="mt-1 text-sm text-muted-foreground">Forever free, no card required</p>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            {FREE_FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <Check className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{f}</span>
              </li>
            ))}
          </ul>

          <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard')}>
            {!isSubscribed && !statusLoading ? 'Current Plan' : 'Continue with Free'}
          </Button>
        </div>

        {/* Pro */}
        <div className={cn(
          'rounded-xl border-2 bg-card p-6 flex flex-col relative overflow-hidden',
          isSubscribed ? 'border-green-500' : 'border-primary',
        )}>
          <div className={cn(
            'absolute top-0 right-0 text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wide uppercase',
            isSubscribed
              ? 'bg-green-500 text-white'
              : 'bg-primary text-primary-foreground',
          )}>
            {isSubscribed ? 'Current Plan' : 'Most Popular'}
          </div>

          <div className="mb-4">
            <p className={cn(
              'text-sm font-medium uppercase tracking-wide',
              isSubscribed ? 'text-green-600 dark:text-green-400' : 'text-primary',
            )}>Pro</p>
            <p className="mt-1 text-4xl font-bold">
              ₱119
              <span className="text-base font-normal text-muted-foreground ml-1">/month</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">≈ $2.09 USD · Cancel anytime</p>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            {PRO_FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2.5 text-sm">
                <Check className={cn(
                  'h-4 w-4 mt-0.5 shrink-0',
                  isSubscribed ? 'text-green-500' : 'text-primary',
                )} />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          {isSubscribed ? (
            <Button
              className="w-full gap-2 bg-green-500 hover:bg-green-600 text-white"
              disabled
            >
              <Check className="h-4 w-4" />
              You&apos;re on Pro
            </Button>
          ) : (
            <Button
              className="w-full gap-2"
              onClick={handleUpgrade}
              disabled={loading || statusLoading}
            >
              <Zap className="h-4 w-4" />
              {loading ? 'Redirecting...' : 'Upgrade to Pro'}
            </Button>
          )}
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Payments are processed securely by LemonSqueezy. Cancel anytime from your billing portal.
      </p>
    </div>
  )
}
