import Link from 'next/link'
import Image from 'next/image'
import { getUser } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import JobLogo from '@/components/job-logo'
import {
  FileText,
  Wand2,
  Layers,
  BriefcaseBusiness,
  HelpCircle,
  Sparkles,
  Check,
  CheckCircle2,
  ArrowRight,
  MessageSquareText,
  Target,
  Repeat,
} from 'lucide-react'

const FEATURES = [
  {
    icon: FileText,
    title: 'AI Resume Optimizer',
    desc: 'Paste a job post and let AI tailor your CV to it — keywords, phrasing, and structure matched to what recruiters scan for.',
  },
  {
    icon: Wand2,
    title: 'Resume Builder',
    desc: 'No CV yet? AI builds a complete, polished resume straight from your professional background and career profile.',
  },
  {
    icon: Layers,
    title: 'Career Profiles',
    desc: 'Shifting careers? Keep separate profiles per target role so every application speaks the right language.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Application Tracker',
    desc: 'Every application, stage, and follow-up date in one pipeline — so nothing falls through the cracks.',
  },
]

const STEPS = [
  {
    icon: FileText,
    title: 'Get your CV job-ready',
    desc: 'Build a resume from your profile or optimize the one you have against a real job posting.',
  },
  {
    icon: HelpCircle,
    title: 'Prepare for the interview',
    desc: 'Generate the questions you are most likely to face for that exact role, and practice your answers.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Apply and stay on top',
    desc: 'Track every application through screening, interview, and offer — with follow-up reminders built in.',
  },
]

const QUESTION_CATEGORIES = [
  { label: 'Technical', cls: 'bg-teal-100 text-teal-700' },
  { label: 'Behavioral', cls: 'bg-amber-100 text-amber-700' },
  { label: 'Situational', cls: 'bg-purple-100 text-purple-700' },
  { label: 'Role-Specific', cls: 'bg-emerald-100 text-emerald-700' },
]

export default async function LandingPage() {
  const user = await getUser()
  const displayName = user?.email?.split('@')[0]
  const initials = displayName?.slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <JobLogo size="md" />
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
            <a href="#interview-prep" className="hover:text-foreground transition-colors">Interview Prep</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="flex items-center gap-2.5 group"
                title="Your profile"
              >
                <span className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-flame text-primary-foreground text-xs font-semibold flex items-center justify-center">
                  {initials}
                </span>
                <span className="hidden sm:block text-sm font-medium group-hover:text-primary transition-colors">
                  {displayName}
                </span>
              </Link>
              <Link href="/dashboard">
                <Button size="sm" className="gap-1.5">
                  Dashboard
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="gap-1.5">
                  Get started free
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid-dark" />
        <div className="pointer-events-none absolute -top-32 right-[-10%] h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              Your complete job-hunt preparation toolkit
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold leading-[1.08] tracking-tight">
              Walk into your job hunt{' '}
              <span className="text-primary">fully prepared</span> — CV, answers, and all.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-xl">
              AngatCV prepares both you and your CV for the search: AI optimizes your resume
              for each role, generates the interview questions you&apos;ll actually be asked,
              and tracks every application until the offer lands.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="gap-2">
                    Go to your dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <Button size="lg" className="gap-2">
                      Start preparing free
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline">Sign in</Button>
                  </Link>
                </>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              {['Free to start', 'No credit card required'].map(t => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Mock interview-practice card */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/15 via-transparent to-flame/20 blur-2xl pointer-events-none" />
            <div className="relative rounded-2xl border bg-card shadow-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <HelpCircle className="h-3.5 w-3.5" />
                  Interview Question Generator
                </span>
                <span className="text-[10px] font-medium text-muted-foreground rounded-full bg-muted px-2 py-0.5">
                  Frontend Developer
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {QUESTION_CATEGORIES.map(c => (
                  <span key={c.label} className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${c.cls}`}>
                    {c.label}
                  </span>
                ))}
              </div>

              <div className="rounded-xl border bg-card shadow-sm p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="rounded-full bg-amber-100 text-amber-700 px-2.5 py-0.5 text-[10px] font-semibold">
                    Behavioral
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    Question 3 of 12
                  </span>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  Tell me about a time you had to ship a feature under a tight deadline.
                  How did you decide what to cut?
                </p>
                <div className="mt-3 flex items-center gap-1.5">
                  {[...Array(12)].map((_, i) => (
                    <span
                      key={i}
                      className={`h-1 flex-1 rounded-full ${i < 3 ? 'bg-primary' : 'bg-muted'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-primary/5 border border-primary/15 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1.5">
                  Practice mode — suggested answer outline
                </p>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex gap-2"><span className="text-primary font-bold">S</span> A real project with a fixed launch date…</li>
                  <li className="flex gap-2"><span className="text-primary font-bold">T</span> Your responsibility in that crunch…</li>
                  <li className="flex gap-2"><span className="text-primary font-bold">A</span> How you prioritized and communicated…</li>
                  <li className="flex gap-2"><span className="text-primary font-bold">R</span> What shipped, and what you learned.</li>
                </ul>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-muted-foreground">Generated for your exact job description</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-semibold">
                  <Sparkles className="h-3 w-3" />
                  AI
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Interview prep spotlight ───────────────────────── */}
      <section id="interview-prep" className="relative overflow-hidden bg-sidebar text-sidebar-foreground">
        <div className="pointer-events-none absolute inset-0 bg-grid-light" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-sidebar-primary/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="inline-flex items-center gap-1.5 rounded-full border border-sidebar-primary/40 bg-sidebar-primary/10 px-3 py-1 text-xs font-semibold text-sidebar-primary mb-5">
                <MessageSquareText className="h-3.5 w-3.5" />
                The part everyone skips — until the interview call comes
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
                Don&apos;t just send the CV.<br />
                Be ready for the conversation it starts.
              </h2>
              <p className="mt-4 text-sidebar-foreground/70 leading-relaxed">
                Paste the job description and AngatCV&apos;s AI generates the technical, behavioral,
                situational, and role-specific questions you&apos;re most likely to face — then
                switches to practice mode so you can rehearse your answers before it counts.
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-lg">
              <div className="absolute -inset-3 rounded-3xl bg-sidebar-primary/15 -rotate-2 pointer-events-none" />
              <Image
                src="/images/interview.jpg"
                alt="A candidate sitting across from two interviewers reviewing a resume"
                width={1600}
                height={1067}
                className="relative rounded-2xl border border-sidebar-border shadow-2xl object-cover"
              />
              <div className="absolute -bottom-5 right-5 rounded-xl border bg-card text-card-foreground shadow-lg px-4 py-3 max-w-[240px]">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">
                  You&apos;ve seen this one coming
                </p>
                <p className="text-xs font-medium leading-snug">
                  &ldquo;Walk me through your resume.&rdquo;
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 grid sm:grid-cols-3 gap-5">
            {[
              {
                icon: Target,
                title: 'Questions for your exact role',
                desc: 'Not generic lists — questions generated from the actual job posting you’re applying to.',
              },
              {
                icon: Repeat,
                title: 'Practice mode',
                desc: 'Work through questions one at a time and build confident, structured answers.',
              },
              {
                icon: Layers,
                title: 'Four question types',
                desc: 'Technical, behavioral, situational, and role-specific — the full spread of a real interview loop.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-6">
                <div className="h-10 w-10 rounded-xl bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-semibold">{title}</p>
                <p className="mt-1.5 text-sm text-sidebar-foreground/65 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link href="/signup">
              <Button size="lg" className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 gap-2">
                Generate my interview questions
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Everything between &ldquo;I need a job&rdquo; and &ldquo;I got the offer&rdquo;
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              One place to build the CV, sharpen it per application, prep the interview,
              and manage the whole pipeline.
            </p>
            <ul className="mt-6 space-y-2.5">
              {[
                'Your CV rewritten for each job you apply to',
                'A complete resume built from a guided AI interview',
                'One dashboard for every application you send',
              ].map(t => (
                <li key={t} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-3 rounded-3xl bg-primary/10 rotate-2 pointer-events-none" />
            <Image
              src="/images/cv-writing.jpg"
              alt="Job seeker polishing their CV on a laptop"
              width={1600}
              height={1067}
              className="relative rounded-2xl border shadow-lg object-cover"
            />
            <div className="absolute -bottom-5 left-5 rounded-xl border bg-card shadow-lg px-4 py-3 flex items-center gap-2.5">
              <span className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold leading-tight">CV tailored to the job</p>
                <p className="text-[10px] text-muted-foreground">in seconds, not evenings</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group rounded-2xl border bg-card p-6 hover-lift">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <p className="font-semibold">{title}</p>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────── */}
      <section id="how-it-works" className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
          <h2 className="text-3xl font-bold tracking-tight text-center">
            Three steps to hired-ready
          </h2>
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} className="relative rounded-2xl border bg-card p-6 pt-8">
                <span className="absolute -top-4 left-6 h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-sm">
                  {i + 1}
                </span>
                <div className="flex items-center gap-2.5 mb-2">
                  <Icon className="h-4.5 w-4.5 text-primary" />
                  <p className="font-semibold">{title}</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────── */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Simple pricing</h2>
          <p className="mt-3 text-muted-foreground">
            Start free. Upgrade to Pro when you&apos;re ready to apply at full speed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free */}
          <div className="rounded-2xl border bg-card p-7 flex flex-col">
            <div className="mb-5">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Free</p>
              <p className="mt-2 text-4xl font-bold">₱0</p>
              <p className="mt-1 text-sm text-muted-foreground">Forever free, no card required</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                '3 AI uses total (profile interviews, resume builds, optimizer)',
                'Unlimited job application tracking',
                'Follow-up reminders & pipeline view',
                'Multiple career profiles (interview-based)',
              ].map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block">
              <Button variant="outline" className="w-full" size="lg">Start for free</Button>
            </Link>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl border-2 border-primary bg-card p-7 flex flex-col overflow-hidden">
            <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wide uppercase">
              Most popular
            </span>
            <div className="mb-5">
              <p className="text-sm font-semibold text-primary uppercase tracking-wide">Pro</p>
              <p className="mt-2 text-4xl font-bold">
                ₱299
                <span className="text-base font-normal text-muted-foreground ml-1">/month</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">≈ $5.25 USD · Cancel anytime</p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {[
                'Unlimited AI resume generations',
                'Unlimited career profile interviews',
                'Unlimited resume optimizer uses',
                'Unlimited interview question generation',
                'Unlimited job application tracking',
                'Priority AI processing',
              ].map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/pricing" className="block">
              <Button className="w-full gap-2" size="lg">
                Upgrade to Pro
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid-dark opacity-70" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 lg:py-24 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">
            Your next interview is coming.<br />Be the most prepared person in it.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join AngatCV free — optimize your CV, generate your interview questions,
            and track your search from one dashboard.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href={user ? '/dashboard' : '/signup'}>
              <Button size="lg" className="gap-2">
                {user ? 'Go to your dashboard' : 'Create a free account'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <JobLogo size="sm" />
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AngatCV — AI resume optimization, interview prep &amp; application tracking
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {user ? (
              <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
                <Link href="/signup" className="hover:text-foreground transition-colors">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  )
}
