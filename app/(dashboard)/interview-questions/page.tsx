'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sparkles, Loader2, BookOpen, Brain,
  ChevronDown, ChevronUp, CheckCircle2, Circle,
  Eye, EyeOff, History, Trash2, RefreshCw,
  Lightbulb, Target, ListChecks,
  GraduationCap, RotateCcw, ChevronLeft, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { formatDistanceToNowStrict, format, isToday, isYesterday } from 'date-fns'
import type { InterviewQuestionsResponse } from '@/types'

interface SavedItem {
  id: string
  label: string
  created_at: string
}

type ViewMode = 'browse' | 'practice'

const CATEGORY_ORDER = ['Technical', 'Behavioral', 'Situational', 'Role-Specific']
const CATEGORY_COLORS: Record<string, string> = {
  Technical: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  Behavioral: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  Situational: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  'Role-Specific': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
}

function formatItemDate(iso: string) {
  const d = new Date(iso)
  if (isToday(d)) return `Today · ${format(d, 'h:mm a')}`
  if (isYesterday(d)) return `Yesterday · ${format(d, 'h:mm a')}`
  return format(d, 'MMM d, yyyy')
}

function usePreparedState(count: number) {
  const [prepared, setPrepared] = useState<Record<number, boolean>>({})
  const preparedCount = Object.values(prepared).filter(Boolean).length
  const progressPct = count > 0 ? Math.round((preparedCount / count) * 100) : 0
  return { prepared, setPrepared, preparedCount, progressPct }
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

  const { prepared, setPrepared, preparedCount, progressPct } = usePreparedState(result?.questions.length ?? 0)

  const [historyItems, setHistoryItems] = useState<SavedItem[]>([])
  const [fetchingHistory, setFetchingHistory] = useState(false)
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null)
  const [loadingHistoryId, setLoadingHistoryId] = useState<string | null>(null)
  const [deletingHistoryId, setDeletingHistoryId] = useState<string | null>(null)
  const [exitingHistoryId, setExitingHistoryId] = useState<string | null>(null)

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
      setViewMode('practice')
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
      setViewMode('practice')
      setPrepared({})
      setJobDescription(data.job_description ?? '')
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
      }
      toast.success('Deleted')
    } catch {
      toast.error('Could not delete')
      setExitingHistoryId(null)
    } finally {
      setDeletingHistoryId(null)
    }
  }

  const toggleExpand = (i: number) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }))

  const togglePrepared = (i: number) => setPrepared(prev => ({ ...prev, [i]: !prev[i] }))

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

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 flex flex-col min-h-full">
          {/* Header */}
          <div className="mb-6 shrink-0">
            <h1 className="text-2xl font-bold">Interview Question Generator</h1>
            <p className="text-muted-foreground text-sm">
              Paste a job description and get AI-powered interview questions to help you prepare.
            </p>
          </div>

          <div className="grid gap-8 flex-1 min-h-0 grid-cols-1 lg:grid-cols-[1fr_1.2fr]">
            {/* Input */}
            <Card className="flex flex-col overflow-hidden">
              <CardHeader className="shrink-0">
                <CardTitle className="text-base">Job Description</CardTitle>
                <CardDescription className="text-xs">
                  Paste the full job description to generate relevant questions
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-4">
                <Textarea
                  placeholder="Paste job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="flex-1 min-h-[300px] resize-none"
                />
                <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Brain className="h-4 w-4" />
                  )}
                  {loading ? 'Generating...' : 'Generate Interview Questions'}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            {result ? (
              <Card className="flex flex-col overflow-hidden">
                {viewMode === 'browse' ? (
                  <>
                    {/* Browse header */}
                    <CardHeader className="shrink-0 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <CardTitle className="text-base truncate">{result.jobTitle}</CardTitle>
                          <CardDescription className="text-xs mt-0.5">
                            {result.questions.length} questions generated
                          </CardDescription>
                        </div>
                        <Button size="sm" variant="outline" onClick={enterPractice} className="gap-1.5 shrink-0 text-xs h-8">
                          <GraduationCap className="h-3.5 w-3.5" />
                          Practice Mode
                        </Button>
                      </div>

                      {/* Focus area badges */}
                      <div className="flex gap-1 flex-wrap mt-2">
                        {result.focusAreas.map((area) => (
                          <Badge key={area} variant="secondary" className="text-[10px]">
                            <Target className="h-2.5 w-2.5 mr-1" />
                            {area}
                          </Badge>
                        ))}
                      </div>

                      {/* Progress bar */}
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>Preparation progress</span>
                          <span>{preparedCount}/{result.questions.length} ready ({progressPct}%)</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-500 transition-all duration-500 ease-out"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Category tabs */}
                      <div className="flex gap-1.5 mt-3 overflow-x-auto pb-0.5">
                        <button
                          onClick={() => setActiveCategory(null)}
                          className={cn(
                            'shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border',
                            !activeCategory
                              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                              : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                          )}
                        >
                          All
                        </button>
                        {categories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                              'shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all border',
                              activeCategory === cat
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                            )}
                          >
                            {cat}
                            <span className="ml-1 opacity-70">
                              ({result.questions.filter(q => q.category === cat).length})
                            </span>
                          </button>
                        ))}
                      </div>
                    </CardHeader>

                    {/* Browse questions */}
                    <CardContent className="flex-1 min-h-0 overflow-hidden pb-4">
                      <ScrollArea className="h-full pr-2">
                        <div className="space-y-3">
                          {filteredQuestions.map((q, i) => {
                            const realIdx = result.questions.indexOf(q)
                            const isExpanded = expanded[realIdx]
                            const isPrepared = prepared[realIdx]
                            return (
                              <Card
                                key={realIdx}
                                className={cn(
                                  'transition-all duration-200',
                                  isPrepared
                                    ? 'bg-emerald-50/30 dark:bg-emerald-950/10'
                                    : ''
                                )}
                              >
                                <CardContent className="p-0">
                                  {/* Question header - always visible */}
                                  <div
                                    onClick={() => toggleExpand(realIdx)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpand(realIdx) } }}
                                    className="w-full flex items-start gap-3 p-3.5 text-left cursor-pointer"
                                  >
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                      <div className="flex items-center gap-2">
                                        <Badge
                                          variant="outline"
                                          className={cn(
                                            'text-[10px] font-medium px-1.5 py-0 h-4',
                                            CATEGORY_COLORS[q.category] ?? ''
                                          )}
                                        >
                                          {q.category}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground font-semibold tabular-nums">
                                          #{realIdx + 1}
                                        </span>
                                      </div>
                                      <p className="text-sm leading-relaxed pr-6">{q.question}</p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0 mt-1">
                                      <button
                                        onClick={(e) => { e.stopPropagation(); togglePrepared(realIdx) }}
                                        title={isPrepared ? 'Mark not prepared' : 'Mark as prepared'}
                                        className={cn(
                                          'p-1 rounded-md transition-colors',
                                          isPrepared
                                            ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                                            : 'text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted'
                                        )}
                                      >
                                        {isPrepared ? (
                                          <CheckCircle2 className="h-4 w-4" />
                                        ) : (
                                          <Circle className="h-4 w-4" />
                                        )}
                                      </button>
                                      {isExpanded ? (
                                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </div>
                                  </div>

                                  {/* Expandable details */}
                                  <div className={cn(
                                    'overflow-hidden transition-all duration-300 ease-in-out',
                                    isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                                  )}>
                                    <div className="px-3.5 pb-3.5 space-y-2.5 border-t border-border/50 pt-2.5">
                                      <div className="rounded-lg bg-muted/60 p-3 space-y-1.5">
                                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground/80">
                                          <Eye className="h-3 w-3" />
                                          What they look for
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                          {q.whatTheyLookFor}
                                        </p>
                                      </div>
                                      {q.sampleAnswer && (
                                        <div className="rounded-lg bg-gradient-to-r from-primary/5 to-blue-50 dark:from-primary/10 dark:to-blue-950/20 border border-primary/10 p-3 space-y-1.5">
                                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground/80">
                                            <Lightbulb className="h-3 w-3 text-amber-500" />
                                            Sample answer
                                          </div>
                                          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                            {q.sampleAnswer}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </>
                ) : (
                  <>
                    {/* Practice mode header */}
                    <CardHeader className="shrink-0 pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{result.jobTitle}</CardTitle>
                          <CardDescription className="text-xs">
                            Practice Mode — {practiceIndex + 1} of {result.questions.length}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setViewMode('browse')}
                            className="gap-1.5 text-xs h-8"
                          >
                            <ListChecks className="h-3.5 w-3.5" />
                            Browse
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setShowSample(false); setPrepared({}) }}
                            className="gap-1.5 text-xs h-8 text-muted-foreground"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Reset
                          </Button>
                        </div>
                      </div>
                      {/* Practice progress */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{practiceIndex + 1}/{result.questions.length}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 transition-all duration-500 ease-out"
                            style={{ width: `${((practiceIndex + 1) / result.questions.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 min-h-0 overflow-hidden pb-4">
                      {currentQuestion && (
                        <div className="h-full flex flex-col items-center justify-center gap-6 px-4">
                          {/* Question card */}
                          <Card className="w-full max-w-2xl border-2 border-primary/20 shadow-lg">
                            <CardContent className="p-6 space-y-4">
                              <div className="flex items-center justify-between">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'text-xs font-medium',
                                    CATEGORY_COLORS[currentQuestion.category] ?? ''
                                  )}
                                >
                                  {currentQuestion.category}
                                </Badge>
                                <span className="text-xs text-muted-foreground tabular-nums">
                                  Q{practiceIndex + 1}
                                </span>
                              </div>

                              <p className="text-base font-medium leading-relaxed">
                                {currentQuestion.question}
                              </p>

                              {/* Reveal section */}
                              <div className="space-y-3">
                                <Button
                                  variant="outline"
                                  onClick={() => setShowSample(!showSample)}
                                  className="w-full gap-2"
                                >
                                  {showSample ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                  {showSample ? 'Hide answer guide' : 'Reveal answer guide'}
                                </Button>

                                <div className={cn(
                                  'overflow-hidden transition-all duration-400 ease-in-out',
                                  showSample
                                    ? 'max-h-[600px] opacity-100'
                                    : 'max-h-0 opacity-0'
                                )}>
                                  <div className="space-y-2.5 pt-1">
                                    <div className="rounded-lg bg-muted/60 p-3 space-y-1.5">
                                      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
                                        <Eye className="h-3 w-3" />
                                        What they look for
                                      </div>
                                      <p className="text-sm text-muted-foreground leading-relaxed">
                                        {currentQuestion.whatTheyLookFor}
                                      </p>
                                    </div>
                                    {currentQuestion.sampleAnswer && (
                                      <div className="rounded-lg bg-gradient-to-r from-primary/5 to-blue-50 dark:from-primary/10 dark:to-blue-950/20 border border-primary/10 p-3 space-y-1.5">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/80">
                                          <Lightbulb className="h-3 w-3 text-amber-500" />
                                          Sample answer
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                          {currentQuestion.sampleAnswer}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Navigation */}
                          <div className="flex items-center gap-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setPracticeIndex(i => Math.max(0, i - 1)); setShowSample(false) }}
                              disabled={practiceIndex === 0}
                              className="gap-1.5"
                            >
                              <ChevronLeft className="h-4 w-4" />
                              Previous
                            </Button>

                            <div className="flex gap-1">
                              {result.questions.map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => { setPracticeIndex(i); setShowSample(false) }}
                                  className={cn(
                                    'h-2 rounded-full transition-all duration-300',
                                    i === practiceIndex
                                      ? 'w-6 bg-primary'
                                      : 'w-2 bg-muted-foreground/20 hover:bg-muted-foreground/40'
                                  )}
                                />
                              ))}
                            </div>

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
                      )}
                    </CardContent>
                  </>
                )}
              </Card>
            ) : (
              <Card className="flex flex-col overflow-hidden">
                <CardHeader className="shrink-0">
                  <CardTitle className="text-base">Interview Questions</CardTitle>
                  <CardDescription className="text-xs">
                    Generated questions will appear here
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 flex items-center justify-center pb-4">
                  <div className="text-center space-y-4">
                    <div className="rounded-full bg-muted p-6 mx-auto w-fit">
                      <BookOpen className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">No questions generated yet</p>
                      <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs mx-auto">
                        Paste a job description and click generate to get realistic interview questions tailored to the role.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* History sidebar */}
      <aside className="w-72 shrink-0 border-l border-border bg-card h-full flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <History className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">History</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">
                {fetchingHistory ? 'Loading...' : `${historyItems.length} saved`}
              </p>
            </div>
          </div>
          <button
            onClick={fetchHistory}
            disabled={fetchingHistory}
            title="Refresh"
            className="flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', fetchingHistory && 'animate-spin')} />
          </button>
        </div>

        {fetchingHistory ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p className="text-xs">Loading history...</p>
          </div>
        ) : historyItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="rounded-full bg-muted p-4">
              <History className="h-5 w-5 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-sm font-medium">No history yet</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Generated questions are saved automatically.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <ul className="p-2.5 space-y-1.5">
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
                      'group relative rounded-lg border cursor-pointer',
                      'transition-all duration-200 ease-out',
                      isActive
                        ? 'border-primary/50 bg-primary/10 shadow-md'
                        : 'border-border bg-card hover:border-primary/30 hover:bg-muted/50 hover:shadow-sm',
                      isExiting && 'opacity-0 scale-95 translate-x-2 pointer-events-none'
                    )}
                  >
                    <div className="flex items-center gap-3 p-3">
                      <div className={cn(
                        'rounded-lg p-2 shrink-0 transition-colors duration-200',
                        isActive
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                      )}>
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <BookOpen className="h-4 w-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn(
                            'text-sm font-medium truncate',
                            isActive ? 'text-primary' : 'text-foreground group-hover:text-primary'
                          )}>
                            {item.label}
                          </p>
                          {isActive && (
                            <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary text-primary-foreground">
                              <Sparkles className="h-2.5 w-2.5" />
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatItemDate(item.created_at)}
                        </p>
                      </div>

                      <button
                        onClick={(e) => handleDeleteHistory(item.id, e)}
                        disabled={isDeleting || !!loadingHistoryId}
                        title="Delete"
                        className={cn(
                          'flex items-center justify-center h-8 w-8 rounded-lg shrink-0 transition-all duration-200',
                          'text-muted-foreground hover:text-destructive hover:bg-destructive/10',
                          'opacity-0 group-hover:opacity-100 focus:opacity-100',
                          'disabled:opacity-40 disabled:cursor-not-allowed'
                        )}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </aside>
    </div>
  )
}
