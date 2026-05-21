'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import JobLogo from '@/components/job-logo'
import { toast } from 'sonner'
import {
  Mail, Lock, Eye, EyeOff, Loader2,
  FileText, ClipboardList, Wand2, ArrowRight, Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const FEATURES = [
  {
    icon: FileText,
    title: 'AI Resume Optimizer',
    desc: 'Tailor your resume to any job in seconds with Claude AI',
  },
  {
    icon: ClipboardList,
    title: 'Application Tracker',
    desc: 'Track every application and never miss a follow-up',
  },
  {
    icon: Wand2,
    title: 'Build from Profile',
    desc: 'AI builds a full resume from your professional background',
  },
]

function getPasswordStrength(pwd: string): { label: string; color: string; width: string; segments: number } {
  if (!pwd) return { label: '', color: '', width: '0%', segments: 0 }
  const hasUpper = /[A-Z]/.test(pwd)
  const hasNumber = /[0-9]/.test(pwd)
  const hasSymbol = /[^A-Za-z0-9]/.test(pwd)
  const score = (pwd.length >= 8 ? 1 : 0) + (pwd.length >= 12 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSymbol ? 1 : 0)
  if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '33%', segments: 1 }
  if (score <= 3) return { label: 'Fair', color: 'bg-amber-400', width: '66%', segments: 2 }
  return { label: 'Strong', color: 'bg-emerald-500', width: '100%', segments: 3 }
}

const RULES = [
  { label: 'At least 6 characters', test: (p: string) => p.length >= 6 },
  { label: 'Contains a number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Contains a special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  const strength = getPasswordStrength(password)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${siteUrl}/auth/callback` },
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success('Account created! Check your email to confirm.')
      router.push('/login')
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left brand panel ─────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[46%] flex-col justify-between p-12 bg-primary relative overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      >
        <div className="absolute top-[-80px] right-[-80px] h-72 w-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] h-56 w-56 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <JobLogo size="lg" light />

        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Land your next job<br />faster with AI
            </h2>
            <p className="text-white/60 mt-3 text-sm leading-relaxed">
              Create your free account and let jobflow handle the tedious parts of your job search.
            </p>
          </div>

          <div className="space-y-5">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3.5 items-start">
                <div className="shrink-0 h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center mt-0.5">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-white/55 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs">
          &copy; {new Date().getFullYear()} jobflow
        </p>
      </div>

      {/* ── Right form panel ─────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background p-6 lg:p-12">
        <div className="lg:hidden mb-8">
          <JobLogo size="md" />
        </div>

        <div className="w-full max-w-sm space-y-8">
          {/* Heading */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Free forever — no credit card required
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-9"
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  className="pl-9 pr-10"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" />
                    : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength bar */}
              {password.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3].map(seg => (
                      <div
                        key={seg}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-all duration-300',
                          strength.segments >= seg ? strength.color : 'bg-muted'
                        )}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <p className={cn('text-[11px] font-medium', {
                      'text-red-500': strength.label === 'Weak',
                      'text-amber-500': strength.label === 'Fair',
                      'text-emerald-600': strength.label === 'Strong',
                    })}>
                      {strength.label} password
                    </p>
                  )}
                </div>
              )}

              {/* Rules checklist */}
              {(passwordFocused || password.length > 0) && (
                <div className="space-y-1 pt-0.5">
                  {RULES.map(rule => {
                    const passes = rule.test(password)
                    return (
                      <div key={rule.label} className="flex items-center gap-1.5">
                        <div className={cn(
                          'h-3.5 w-3.5 rounded-full flex items-center justify-center transition-colors',
                          passes ? 'bg-emerald-500' : 'bg-muted'
                        )}>
                          {passes && <Check className="h-2 w-2 text-white" strokeWidth={3} />}
                        </div>
                        <span className={cn('text-[11px] transition-colors', passes ? 'text-emerald-600' : 'text-muted-foreground')}>
                          {rule.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full gap-2" disabled={loading} size="lg">
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" />Creating account…</>
                : <>Create account <ArrowRight className="h-4 w-4" /></>}
            </Button>

            <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
              By creating an account you agree to our terms of service and privacy policy.
            </p>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">Already have an account?</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Link href="/login">
            <Button variant="outline" className="w-full" size="lg">
              Sign in instead
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
