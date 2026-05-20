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
  FileText, ClipboardList, Wand2, ArrowRight,
} from 'lucide-react'

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
    <div className="min-h-screen flex">

      {/* ── Left brand panel ─────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[46%] flex-col justify-between p-12 bg-primary relative overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      >
        {/* Glow blobs */}
        <div className="absolute top-[-80px] right-[-80px] h-72 w-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] h-56 w-56 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <JobLogo size="lg" light />

        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Your AI-powered<br />job search companion
            </h2>
            <p className="text-white/60 mt-3 text-sm leading-relaxed">
              Stop guessing. Start tracking. Let AI do the heavy lifting so you can focus on landing the job.
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
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <JobLogo size="md" />
        </div>

        <div className="w-full max-w-sm space-y-8">
          {/* Heading */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground text-sm mt-1">
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

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">New to jobflow?</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Sign up link */}
          <Link href="/signup">
            <Button variant="outline" className="w-full" size="lg">
              Create a free account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
