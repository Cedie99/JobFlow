'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Loader2, CheckCircle, Sparkles, User, ArrowLeft, Wand2, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import Link from 'next/link'
import type { ChatMessage } from '@/types'

export default function ProfileInterviewPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [profileName, setProfileName] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [synthesizing, setSynthesizing] = useState(false)
  const [profileLoading, setProfileLoading] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const startedRef = useRef(false)
  const completingRef = useRef(false)

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`/api/career-profiles/${id}`, {
          signal: AbortSignal.timeout(10_000),
        })
        if (!res.ok) throw new Error()
        const data = await res.json()
        setProfileName(data.name)
        setCompleted(data.completed)

        const existingMessages: ChatMessage[] = data.interview_messages ?? []
        if (existingMessages.length > 0) {
          setMessages(existingMessages)
          if (data.completed) setIsComplete(true)
        } else {
          // Fresh profile — start the interview
          if (!startedRef.current) {
            startedRef.current = true
            setProfileLoading(false)
            startInterview(data.name)
            return
          }
        }
      } catch {
        toast.error('Could not load profile')
        router.push('/profiles')
      }
      setProfileLoading(false)
    }
    loadProfile()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function startInterview(name: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/onboarding/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [], profileId: id, profileName: name }),
        signal: AbortSignal.timeout(30_000),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setMessages([{ role: 'assistant', content: data.message }])
    } catch {
      toast.error('Could not start interview. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function sendMessage(history: ChatMessage[]) {
    setLoading(true)
    try {
      const res = await fetch('/api/onboarding/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, profileId: id, profileName }),
        signal: AbortSignal.timeout(30_000),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
      if (data.isComplete) setIsComplete(true)
    } catch {
      toast.error('Could not connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg: ChatMessage = { role: 'user', content: text }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    await sendMessage(updatedMessages)
    textareaRef.current?.focus()
  }

  async function handleComplete() {
    if (completingRef.current) return
    completingRef.current = true
    setSynthesizing(true)
    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, profileId: id }),
        signal: AbortSignal.timeout(60_000),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (err.error === 'limit_reached') {
          setLimitReached(true)
          return
        }
        throw new Error()
      }
      setCompleted(true)
      toast.success('Profile saved!')
    } catch {
      toast.error('Could not save your profile. Please try again.')
    } finally {
      completingRef.current = false
      setSynthesizing(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (synthesizing) {
    return (
      <div className="min-h-full bg-background flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Building your {profileName} profile…</p>
          <p className="text-sm text-muted-foreground mt-1">
            Cedie is analyzing your responses and creating your professional profile.
          </p>
        </div>
      </div>
    )
  }

  if (completed && !synthesizing) {
    return (
      <div className="min-h-full bg-background flex flex-col items-center justify-center gap-6 p-6">
        <div className="rounded-full bg-emerald-50 p-5">
          <CheckCircle className="h-10 w-10 text-emerald-600" />
        </div>
        <div className="text-center max-w-sm">
          <p className="text-xl font-bold mb-2">Profile Complete</p>
          <p className="text-sm text-muted-foreground">
            Your <span className="font-medium text-foreground">{profileName}</span> profile is ready. You can now build tailored resumes for this career path.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push('/profiles')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            All Profiles
          </Button>
          <Button onClick={() => router.push(`/build?profileId=${id}`)}>
            <Wand2 className="h-4 w-4 mr-2" />
            Build Resume
          </Button>
        </div>
      </div>
    )
  }

  if (profileLoading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/profiles')}
              className="flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <p className="text-sm font-semibold leading-none">{profileName}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Guided Skills Interview</p>
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
            C
          </div>
        </div>
      </header>

      {/* Intro banner */}
      {messages.length <= 1 && !loading && (
        <div className="max-w-2xl mx-auto px-4 pt-5 w-full space-y-2">
          <div className="rounded-xl bg-primary/[0.06] border border-primary/15 px-4 py-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-xs font-semibold text-primary">Guided Behavioral Interview</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-semibold uppercase tracking-wide">
                5–10 min
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Cedie will ask about real experiences from your life — work, school, hobbies, anything.
              Even if your background seems unrelated to <span className="text-foreground font-medium">{profileName}</span>,
              he&apos;ll help you uncover transferable skills you might not realize you have.
              Answer honestly — the more genuine your answers, the stronger your profile will be.
            </p>
            <div className="border-t border-primary/10 pt-2.5 space-y-1.5">
              {[
                'Cedie asks about real situations, not hypotheticals — "tell me about a time…"',
                'If your answer seems off-topic, he\'ll find what\'s transferable and dig deeper',
                'Don\'t filter yourself — there are no wrong answers, only unexplored ones',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="shrink-0 h-3.5 w-3.5 rounded-full bg-primary/20 text-primary text-[8px] font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <div className={cn(
                'shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold mt-0.5',
                msg.role === 'assistant'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}>
                {msg.role === 'assistant' ? 'C' : <User className="h-4 w-4" />}
              </div>
              <div className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                msg.role === 'assistant'
                  ? 'bg-card border border-border text-foreground rounded-tl-sm'
                  : 'bg-primary text-primary-foreground rounded-tr-sm'
              )}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-3 animate-in fade-in duration-200">
              <div className="shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                C
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}

          {isComplete && !loading && (
            <div className="flex justify-center animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2.5 max-w-sm">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <p className="text-xs text-emerald-700">
                  Great — Cedie has everything needed to build your {profileName} profile.
                </p>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-border bg-card">
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
          {limitReached && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
              <div className="flex gap-3">
                <div className="rounded-lg bg-amber-100 p-2 shrink-0">
                  <Lock className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-900">You've used all 3 free uses</p>
                  <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                    Upgrade to Pro to save this profile and generate unlimited tailored resumes.
                  </p>
                </div>
              </div>
              <Link href="/pricing" className="block">
                <Button size="sm" className="w-full gap-1.5 bg-amber-600 hover:bg-amber-700 text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                  Upgrade to Pro — Unlimited Access
                </Button>
              </Link>
            </div>
          )}
          {isComplete && !limitReached && (
            <Button
              onClick={handleComplete}
              disabled={synthesizing || loading}
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-all"
              variant="ghost"
            >
              <CheckCircle className="h-4 w-4" />
              Save Profile
            </Button>
          )}

          <div className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer… (Enter to send, Shift+Enter for new line)"
              className="flex-1 min-h-[52px] max-h-[140px] resize-none text-sm"
              disabled={loading || synthesizing}
              rows={2}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || loading || synthesizing}
              size="icon"
              className="h-[52px] w-12 shrink-0"
            >
              {loading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Send className="h-4 w-4" />}
            </Button>
          </div>

          <p className="text-[10px] text-center text-muted-foreground/60">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
