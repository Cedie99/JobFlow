# AngatCV

An AI-powered job search assistant that helps you build tailored resumes, track applications, and present your best self to every employer — for any career path you want to pursue.

---

## Features

### Career Profiles
Create multiple career profiles — one for each path you're targeting (e.g. Software Engineer, Call Center Agent, Social Media Manager, Marketing Manager). You're not limited to one career direction. **Cedie** (the built-in AI interviewer, he/him) conducts a **guided behavioral interview** for each profile: a real conversation that uncovers your background, transferable skills, goals, and personality — even from experiences you wouldn't think to put on a resume.

**How Cedie's interview works:**
- Asks about real experiences ("tell me about a time…"), not hypotheticals
- If your answer seems unrelated to the career, he bridges it — finding transferable skills within it before asking for a real-world example
- Moves on gracefully if no relevant experience exists; an honest profile is more valuable than a padded one
- After 12–18 exchanges, wraps up and the Save Profile button appears

### Build Resume from Profile
Paste any job description and Claude builds a complete, ATS-optimized resume from scratch using your career profile. Works for every career — IT or non-IT. Includes:
- Tailored professional summary
- STAR/CAR/XYZ-formatted bullet points with quantified achievements
- Skills section ranked by JD relevance
- Cover letter (3–4 paragraphs)
- Ready-to-send application email
- Match score (0–100) with a warning if the role is a poor fit

### Resume Optimizer
Upload an existing resume and a job description — Claude rewrites and optimizes it for the specific role, with the same cover letter and email output.

### Application Tracker
Track every job you apply to. Log status (Applied → Screening → Interview → Offer), follow-up dates, salary range, contact info, and notes. Dashboard shows pipeline and upcoming follow-ups at a glance.

### Dashboard
Overview of active applications, upcoming follow-ups, pipeline funnel, and quick access to the AI Resume Builder — all in one place.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Auth & Database | Supabase |
| AI | Anthropic Claude (claude-opus-4-7, claude-sonnet-4-6) |
| Date Utilities | date-fns |
| Runtime | Node.js ≥ 20 |

---

## Getting Started

### Prerequisites
- Node.js 20+
- A [Supabase](https://supabase.com) project
- An [Anthropic](https://console.anthropic.com) API key

### 1. Clone the repo

```bash
git clone https://github.com/Cedie99/JobFlow.git
cd JobFlow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 4. Set up the database

Run the SQL in `supabase/schema.sql` in your Supabase project's **SQL Editor**. This creates:
- `career_profiles` — stores Cedie interview transcripts and synthesized profiles
- `resume_optimizations` — history of generated resumes
- `job_applications` — application tracker entries
- `user_profiles` — legacy onboarding table (kept for compatibility)

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
  (auth)/           # Login and signup pages
  (dashboard)/      # All authenticated app pages
    dashboard/      # Overview page
    profiles/       # Career profiles list + [id] guided interview chat
    build/          # Build resume from a career profile
    resume/         # Resume optimizer (upload + rewrite)
    tracker/        # Job application tracker
  api/              # API routes (Supabase + Anthropic)
    applications/   # CRUD for job applications (ownership-checked)
    career-profiles/# CRUD for career profiles
    onboarding/     # chat + complete endpoints for Cedie interview
    build-resume/   # Resume generation from profile + JD
    optimize/       # Resume optimizer
    extract/        # File text extraction (PDF, DOCX, TXT — max 50 MB)
    optimizations/  # Saved resume history

components/
  sidebar.tsx                # Collapsible nav with "AI Resume Builder" section
  results-panel.tsx          # Resume/cover letter/email output tabs
  optimization-history.tsx   # Saved resume history panel

supabase/
  schema.sql        # Full database schema

types/
  index.ts          # Shared TypeScript types
```

---

## How Cedie Works

Cedie is the AI interviewer powered by Claude Sonnet. When you create a new career profile:

1. Cedie opens with a casual question about where you are in that specific career path
2. He uses **guided behavioral interview** technique — every question is anchored to the target career
3. When an answer is vague or unrelated, he validates it, names the transferable skill within it, and asks for a real-world example that connects to the career
4. After 12–18 exchanges, Cedie signals completion and the Save Profile button appears
5. Claude Opus synthesizes the transcript into a structured `ProfileData` object (experience, skills, projects, education, work style, personality traits, career goals)
6. That profile powers the **Build Resume** feature — paste any job description and get a tailored resume instantly

---

## Security

- All `/api/applications/[id]` endpoints verify `user_id` ownership — users can only access their own data
- All route handlers are wrapped in try-catch with structured error responses
- `request.json()` calls are individually guarded — malformed payloads return 400, not 500
- File uploads are capped at 50 MB before reading into memory
- Fetch calls in the frontend have explicit timeouts (10s for data, 30s for AI chat, 60s for profile synthesis)

---

## License

MIT
