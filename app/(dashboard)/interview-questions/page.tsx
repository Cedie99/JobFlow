'use client'

import { useState, useEffect, useCallback } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Progress } from '@/components/ui/progress'
import {
  Sparkles, Loader2, Brain,
  CheckCircle2, Circle,
  Eye, EyeOff, History, Trash2, RefreshCw,
  Lightbulb, Target,
  GraduationCap, RotateCcw, ChevronLeft, ChevronRight,
  BookOpen, Pencil, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { format, isToday, isYesterday } from 'date-fns'
import type { InterviewQuestionsResponse } from '@/types'

interface SavedItem {
  id: string
  label: string
  created_at: string
}

type ViewMode = 'browse' | 'practice'

const CATEGORY_ORDER = ['Technical', 'Behavioral', 'Situational', 'Role-Specific']

const CATEGORY_META: Record<string, { border: string; badge: string; dot: string }> = {
  Technical:     { border: 'border-l-teal-600',    badge: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300',    dot: 'bg-teal-600' },
  Behavioral:    { border: 'border-l-amber-500',   badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300', dot: 'bg-amber-500' },
  Situational:   { border: 'border-l-purple-500',  badge: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300', dot: 'bg-purple-500' },
  'Role-Specific': { border: 'border-l-emerald-500', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', dot: 'bg-emerald-500' },
}

function formatItemDate(iso: string) {
  const d = new Date(iso)
  if (isToday(d)) return `Today · ${format(d, 'h:mm a')}`
  if (isYesterday(d)) return `Yesterday · ${format(d, 'h:mm a')}`
  return format(d, 'MMM d, yyyy')
}

export default function InterviewQuestionsPage() {
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState<InterviewQuestionsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [viewMode, setViewMode] = useState<ViewMode>('browse')
  const [practiceIndex, setPracticeIndex] = useState(0)
  const [showSample, setShowSample] = useState(false)
  const [prepared, setPrepared] = useState<Record<number, boolean>>({})
  const [inputExpanded, setInputExpanded] = useState(true)

  const preparedCount = Object.values(prepared).filter(Boolean).length
  const totalQuestions = result?.questions.length ?? 0
  const progressPct = totalQuestions > 0 ? Math.round((preparedCount / totalQuestions) * 100) : 0

  const [historyItems, setHistoryItems] = useState<SavedItem[]>([])
  const [fetchingHistory, setFetchingHistory] = useState(false)
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null)
  const [loadingHistoryId, setLoadingHistoryId] = useState<string | null>(null)
  const [deletingHistoryId, setDeletingHistoryId] = useState<string | null>(null)
  const [exitingHistoryId, setExitingHistoryId] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)

  const fetchHistory = useCallback(async () => {
    setFetchingHistory(true)
    try {
      const res = await fetch('/api/interview-questions')
      if (res.ok) setHistoryItems(await res.json())
    } catch {
      // silent
    } finally {
      setFetchingHistory(false)
    }
  }, [])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  async function handleGenerate() {
    if (!jobDescription.trim()) {
      toast.error('Please paste a job description first')
      return
    }
    setLoading(true)
    setResult(null)
    setActiveCategory(null)
    setExpanded({})
    setViewMode('browse')
    setPrepared({})
    try {
      const res = await fetch('/api/interview-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription }),
      })
      if (res.status === 402) {
        const data = await res.json()
        toast.error(`You've used all ${data.limit} free AI uses. Upgrade to Pro for unlimited access.`)
        return
      }
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to generate questions')
        return
      }
      const data = await res.json()
      setResult(data)
      setActiveHistoryId(data.savedId ?? null)
      setInputExpanded(false)
      toast.success('Interview questions generated!')
      fetchHistory()
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLoadHistory(id: string) {
    if (loadingHistoryId) return
    setLoadingHistoryId(id)
    try {
      const res = await fetch(`/api/interview-questions/${id}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setResult(data.result)
      setActiveHistoryId(id)
      setActiveCategory(null)
      setExpanded({})
      setViewMode('browse')
      setPrepared({})
      setJobDescription(data.job_description ?? '')
      setInputExpanded(false)
      setHistoryOpen(false)
      toast.success('Loaded saved questions')
    } catch {
      toast.error('Could not load')
    } finally {
      setLoadingHistoryId(null)
    }
  }

  async function handleDeleteHistory(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (deletingHistoryId) return
    setDeletingHistoryId(id)
    setExitingHistoryId(id)
    try {
      await new Promise(r => setTimeout(r, 180))
      const res = await fetch(`/api/interview-questions/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setHistoryItems(prev => prev.filter(i => i.id !== id))
      if (activeHistoryId === id) {
        setResult(null)
        setActiveHistoryId(null)
        setInputExpanded(true)
      }
      toast.success('Deleted')
    } catch {
      toast.error('Could not delete')
      setExitingHistoryId(null)
    } finally {
      setDeletingHistoryId(null)
    }
  }

  const categories = result
    ? [...new Set(result.questions.map(q => q.category))].sort(
        (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
      )
    : []

  const filteredQuestions = result
    ? activeCategory
      ? result.questions.filter(q => q.category === activeCategory)
      : result.questions
    : []

  const currentQuestion = result?.questions[practiceIndex]

  function enterPractice() {
    setViewMode('practice')
    setPracticeIndex(0)
    setShowSample(false)
  }

  function exitPractice() {
    setViewMode('browse')
  }

  // ── Practice mode (full-page takeover) ──────────────────────────
  if (result && viewMode === 'practice' && currentQuestion) {
    const meta = CATEGORY_META[currentQuestion.category]
    const progress = ((practiceIndex + 1) / result.questions.length) * 100

    return (
      <div className="min-h-full bg-muted/20 flex flex-col">
        {/* Practice top bar */}
        <div className="sticky top-0 z-10 bg-background/85 backdrop-blur border-b border-border px-3 sm:px-6 py-2.5 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={exitPractice}
            title="Exit practice"
            className="h-8 w-8 p-0 text-muted-foreground shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <p className="flex items-center justify-center sm:justify-start gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-primary leading-none">
              <GraduationCap className="h-3 w-3" />
              Practice Mode
            </p>
            <p className="text-sm font-medium truncate mt-1">{result.jobTitle}</p>
          </div>

          <span className="shrink-0 inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-semibold tabular-nums whitespace-nowrap">
            {practiceIndex + 1} / {result.questions.length}
          </span>
        </div>

        {/* Progress */}
        <Progress value={progress} className="h-0.5 rounded-none" />

        {/* Card */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 py-8 sm:py-12">
          <div className="w-full max-w-2xl space-y-6">
            {/* Category + number */}
            <div className="flex items-center justify-between">
              <Badge className={cn('text-xs font-medium border-0', meta?.badge)}>
                {currentQuestion.category}
              </Badge>
              <span className="text-xs text-muted-foreground tabular-nums font-medium">
                Q{practiceIndex + 1}
              </span>
            </div>

            {/* Question */}
            <div className={cn(
              'rounded-2xl border-l-4 bg-card p-5 sm:p-8 shadow-sm',
              meta?.border ?? 'border-l-border'
            )}>
              <p className="text-lg sm:text-xl font-medium leading-relaxed text-foreground">
                {currentQuestion.question}
              </p>
            </div>

            {/* Answer guide toggle */}
            <Button
              variant={showSample ? 'secondary' : 'outline'}
              onClick={() => setShowSample(!showSample)}
              className="w-full gap-2 h-10"
            >
              {showSample ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showSample ? 'Hide answer guide' : 'Reveal answer guide'}
            </Button>

            {/* Answer guide content */}
            {showSample && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="rounded-xl bg-muted/60 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground/70">
                    <Eye className="h-3.5 w-3.5" />
                    What they look for
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {currentQuestion.whatTheyLookFor}
                  </p>
                </div>
                {currentQuestion.sampleAnswer && (
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-foreground/70">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                      Sample answer
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {currentQuestion.sampleAnswer}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Mark prepared + navigation */}
            <div className="flex items-center justify-between gap-2 pt-2 flex-wrap">
              <button
                onClick={() => setPrepared(prev => ({ ...prev, [practiceIndex]: !prev[practiceIndex] }))}
                className={cn(
                  'flex items-center gap-2 text-sm font-medium rounded-lg px-2.5 sm:px-3 py-2 transition-colors whitespace-nowrap',
                  prepared[practiceIndex]
                    ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                {prepared[practiceIndex]
                  ? <CheckCircle2 className="h-4 w-4" />
                  : <Circle className="h-4 w-4" />
                }
                {prepared[practiceIndex] ? 'Prepared' : 'Mark as prepared'}
              </button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setPracticeIndex(i => Math.max(0, i - 1)); setShowSample(false) }}
                  disabled={practiceIndex === 0}
                  className="gap-1.5"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { setPracticeIndex(i => Math.min(result.questions.length - 1, i + 1)); setShowSample(false) }}
                  disabled={practiceIndex === result.questions.length - 1}
                  className="gap-1.5"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Dot nav */}
            <div className="flex justify-center flex-wrap gap-1.5 pt-2">
              {result.questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setPracticeIndex(i); setShowSample(false) }}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    i === practiceIndex
                      ? 'w-6 bg-primary'
                      : prepared[i]
                        ? 'w-1.5 bg-emerald-400'
                        : 'w-1.5 bg-muted-foreground/20 hover:bg-muted-foreground/40'
                  )}
                />
              ))}
            </div>

            {/* Reset progress */}
            <div className="flex justify-center pt-1">
              <button
                onClick={() => { setPrepared({}); setShowSample(false) }}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground rounded-lg px-2.5 py-1.5 hover:bg-muted transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Reset progress
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Browse mode ─────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interview Prep</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Generate AI-powered interview questions tailored to any role.
          </p>
        </div>

        {/* History button */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2 shrink-0"
          onClick={() => setHistoryOpen(true)}
        >
          <History className="h-4 w-4" />
          History
          {historyItems.length > 0 && (
            <span className="ml-0.5 text-[10px] font-semibold bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 leading-none">
              {historyItems.length}
            </span>
          )}
        </Button>

        <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
          <SheetContent className="p-0 flex flex-col">
            <SheetHeader className="px-5 pt-5 pb-4 border-b">
              <div className="flex items-center justify-between pr-9">
                <SheetTitle className="text-base">History</SheetTitle>
                <button
                  onClick={fetchHistory}
                  disabled={fetchingHistory}
                  className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                >
                  <RefreshCw className={cn('h-3.5 w-3.5', fetchingHistory && 'animate-spin')} />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {fetchingHistory ? 'Loading...' : `${historyItems.length} saved session${historyItems.length !== 1 ? 's' : ''}`}
              </p>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto">
              {fetchingHistory ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : historyItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="rounded-full bg-muted p-4 mb-3">
                    <BookOpen className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium">No history yet</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Generated questions are saved automatically.
                  </p>
                </div>
              ) : (
                <ul className="p-3 space-y-1">
                  {historyItems.map((item) => {
                    const isActive = item.id === activeHistoryId
                    const isLoading = loadingHistoryId === item.id
                    const isDeleting = deletingHistoryId === item.id
                    const isExiting = exitingHistoryId === item.id
                    return (
                      <li
                        key={item.id}
                        onClick={() => !isLoading && !isDeleting && handleLoadHistory(item.id)}
                        className={cn(
                          'group relative rounded-xl border cursor-pointer transition-all duration-200',
                          isActive
                            ? 'border-primary/40 bg-primary/8'
                            : 'border-transparent hover:border-border hover:bg-muted/50',
                          isExiting && 'opacity-0 scale-95 pointer-events-none'
                        )}
                      >
                        <div className="flex items-start gap-3 p-3">
                          <div className={cn(
                            'rounded-lg p-2 shrink-0 mt-0.5 transition-colors',
                            isActive ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                          )}>
                            {isLoading
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <BookOpen className="h-3.5 w-3.5" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className={cn(
                                'text-xs font-medium truncate',
                                isActive ? 'text-primary' : 'text-foreground'
                              )}>
                                {item.label}
                              </p>
                              {isActive && (
                                <span className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-primary text-primary-foreground">
                                  <Sparkles className="h-2 w-2" />
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {formatItemDate(item.created_at)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleDeleteHistory(item.id, e)}
                            disabled={isDeleting || !!loadingHistoryId}
                            className={cn(
                              'flex items-center justify-center h-6 w-6 rounded-lg transition-all shrink-0',
                              'text-muted-foreground hover:text-destructive hover:bg-destructive/10',
                              'opacity-0 group-hover:opacity-100',
                              'disabled:opacity-40 disabled:cursor-not-allowed'
                            )}
                          >
                            {isDeleting
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <Trash2 className="h-3 w-3" />
                            }
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Input area */}
      {inputExpanded ? (
        <div className="rounded-2xl border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Job Description</p>
              <p className="text-xs text-muted-foreground mt-0.5">Paste the full job posting to generate tailored questions</p>
            </div>
            {result && (
              <button
                onClick={() => setInputExpanded(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Textarea
            placeholder="Paste job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[180px] resize-y"
          />
          <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2 h-10">
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Brain className="h-4 w-4" />
            }
            {loading ? 'Generating questions...' : 'Generate Interview Questions'}
          </Button>
        </div>
      ) : result && (
        <div className="rounded-xl border bg-muted/30 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="rounded-lg bg-primary/10 p-1.5 shrink-0">
              <Brain className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{result.jobTitle}</p>
              <p className="text-xs text-muted-foreground">{result.questions.length} questions generated</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setInputExpanded(true)}
            className="gap-1.5 text-xs text-muted-foreground shrink-0"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Focus areas + actions */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex flex-wrap gap-1.5">
              {result.focusAreas.map((area) => (
                <Badge key={area} variant="secondary" className="text-xs gap-1">
                  <Target className="h-2.5 w-2.5" />
                  {area}
                </Badge>
              ))}
            </div>
            <Button
              size="sm"
              onClick={enterPractice}
              className="gap-2 shrink-0"
            >
              <GraduationCap className="h-4 w-4" />
              Practice Mode
            </Button>
          </div>

          {/* Progress strip */}
          <div className="rounded-xl border bg-card px-4 py-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Preparation progress</span>
              <span className="tabular-nums font-semibold">
                {preparedCount} / {totalQuestions}
                <span className="text-muted-foreground font-normal ml-1">ready</span>
              </span>
            </div>
            <Progress value={progressPct} className="h-2" />
          </div>

          {/* Category filters */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory(null)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                !activeCategory
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground'
              )}
            >
              All <span className="opacity-60 ml-1">{totalQuestions}</span>
            </button>
            {categories.map(cat => {
              const meta = CATEGORY_META[cat]
              const count = result.questions.filter(q => q.category === cat).length
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                    activeCategory === cat
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-transparent text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground'
                  )}
                >
                  <span className={cn('inline-block h-1.5 w-1.5 rounded-full mr-1.5 align-middle', meta?.dot)} />
                  {cat} <span className="opacity-60 ml-1">{count}</span>
                </button>
              )
            })}
          </div>

          {/* Question list */}
          <div className="space-y-2">
            {filteredQuestions.map((q) => {
              const realIdx = result.questions.indexOf(q)
              const isExpanded = expanded[realIdx]
              const isPrepared = prepared[realIdx]
              const meta = CATEGORY_META[q.category]

              return (
                <div
                  key={realIdx}
                  className={cn(
                    'rounded-xl border-l-4 bg-card border border-border transition-all duration-200',
                    meta?.border ?? 'border-l-border',
                    isPrepared && 'opacity-70'
                  )}
                >
                  {/* Question row */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setExpanded(prev => ({ ...prev, [realIdx]: !prev[realIdx] }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setExpanded(prev => ({ ...prev, [realIdx]: !prev[realIdx] }))
                      }
                    }}
                    className="flex items-start gap-4 px-4 py-4 cursor-pointer select-none"
                  >
                    <span className="text-xs font-mono text-muted-foreground/50 pt-0.5 tabular-nums shrink-0 w-5 text-right">
                      {realIdx + 1}
                    </span>
                    <p className="flex-1 text-sm leading-relaxed font-medium">{q.question}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setPrepared(prev => ({ ...prev, [realIdx]: !prev[realIdx] }))
                        }}
                        title={isPrepared ? 'Mark not prepared' : 'Mark as prepared'}
                        className={cn(
                          'p-1 rounded-md transition-colors',
                          isPrepared
                            ? 'text-emerald-600 hover:text-emerald-700'
                            : 'text-muted-foreground/30 hover:text-muted-foreground'
                        )}
                      >
                        {isPrepared
                          ? <CheckCircle2 className="h-4 w-4" />
                          : <Circle className="h-4 w-4" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Expandable details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3 ml-9 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground/70 uppercase tracking-wider">
                          <Eye className="h-3 w-3" />
                          What they look for
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {q.whatTheyLookFor}
                        </p>
                      </div>
                      {q.sampleAnswer && (
                        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 p-3 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground/70 uppercase tracking-wider">
                            <Lightbulb className="h-3 w-3 text-amber-500" />
                            Sample answer
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {q.sampleAnswer}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div className="rounded-2xl border border-dashed bg-muted/20 flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-5 mb-4">
            <BookOpen className="h-6 w-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">No questions yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">
            Paste a job description above and hit generate to get realistic, tailored interview questions.
          </p>
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border bg-card flex flex-col items-center justify-center py-20 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mb-4" />
          <p className="text-sm font-medium">Generating questions...</p>
          <p className="text-xs text-muted-foreground mt-1">Analyzing the job description</p>
        </div>
      )}
    </div>
  )
}
