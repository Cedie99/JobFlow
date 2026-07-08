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
  Mail, Lock, Eye, EyeOff, Loader2, Check, ArrowRight,
} from 'lucide-react'

const FEATURES = [
  {
    title: 'Get your CV job-ready',
    desc: 'AI tailors your resume to every job posting in seconds.',
  },
  {
    title: 'Ace the interview',
    desc: 'Generate the questions you’ll actually be asked, then practice your answers.',
  },
  {
    title: 'Stay on top of every application',
    desc: 'Track your pipeline and never miss a follow-up.',
  },
]

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/70 via-background to-secondary/40 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl grid lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-foreground/5 bg-card">

        {/* ── Left brand panel ─────────────────────────────── */}
        <div className="relative hidden lg:flex flex-col p-10 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 text-white overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative">
            <JobLogo size="md" light />
          </div>

          <div className="relative mt-14">
            <h2 className="text-3xl font-bold leading-tight tracking-tight">
              Where job seekers prepare,<br />apply, and get hired.
            </h2>
          </div>

          <div className="relative mt-10 space-y-7">
            {FEATURES.map(({ title, desc }) => (
              <div key={title} className="flex gap-3.5 items-start">
                <span className="shrink-0 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center mt-0.5">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </span>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="relative mt-auto pt-10 text-white/30 text-xs">
            &copy; {new Date().getFullYear()} AngatCV
          </p>
        </div>

        {/* ── Right form panel ─────────────────────────────── */}
        <div className="bg-card p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <JobLogo size="md" />
          </div>

          <div className="w-full max-w-sm mx-auto space-y-7">
            {/* Heading */}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
              <p className="text-muted-foreground text-sm mt-1.5">
                Sign in to continue your job search
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-9 pr-10"
                    required
                    autoComplete="current-password"
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
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full gap-2" disabled={loading} size="lg">
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Signing in…</>
                  : <>Sign in <ArrowRight className="h-4 w-4" /></>}
              </Button>
            </form>

            {/* Sign up hint */}
            <p className="text-sm text-muted-foreground">
              New here?{' '}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                Create a free account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
