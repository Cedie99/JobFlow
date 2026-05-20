# JobFlow

An AI-powered job search assistant that helps you build tailored resumes, track applications, and present your best self to every employer.

---

## Features

### Career Profiles
Create multiple career profiles — one for each path you're targeting (e.g. Software Engineer, Call Center Agent, Social Media Manager). For each profile, **Cedie** (the built-in AI interviewer) has a real conversation with you to understand your background, skills, goals, and personality — not just your resume bullet points.

### Build Resume from Profile
Paste a job description and Claude builds a complete, ATS-optimized resume from scratch using your career profile. No uploading required. Includes:
- Tailored professional summary
- STAR/CAR/XYZ-formatted bullet points with quantified achievements
- Skills section ranked by JD relevance
- Cover letter (3–4 paragraphs)
- Ready-to-send application email
- Match score (0–100) with a warning if the role is a poor fit

### Resume Optimizer
Upload an existing resume and a job description — Claude rewrites and optimizes it for the specific role, with the same cover letter and email output.

### Application Tracker
Track every job you apply to. Log status (Applied → Screening → Interview → Offer), follow-up dates, salary range, contact info, and notes. At-a-glance dashboard shows where everything stands.

### Dashboard
Overview of your active applications, upcoming follow-ups, and quick actions — all in one place.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Auth & Database | Supabase |
| AI | Anthropic Claude (claude-opus-4-7, claude-sonnet-4-6) |
| Date Utilities | date-fns |

---

## Getting Started

### Prerequisites
- Node.js 18+
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

Create a `.env.local` file in the root:

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
    profiles/       # Career profiles list + [id] interview chat
    build/          # Build resume from a career profile
    resume/         # Resume optimizer (upload + rewrite)
    tracker/        # Job application tracker
  api/              # API routes (Supabase + Anthropic)
  onboarding/       # Redirects to /profiles

components/         # Shared UI components
  sidebar.tsx       # Collapsible nav sidebar
  results-panel.tsx # Resume/cover letter/email output tabs
  optimization-history.tsx  # Saved resume history panel

supabase/
  schema.sql        # Full database schema

types/
  index.ts          # Shared TypeScript types
```

---

## How Cedie Works

Cedie is the AI interviewer powered by Claude. When you create a new career profile:

1. Cedie opens with a casual, open-ended question about where you are in that career path
2. The conversation flows naturally — Cedie reacts to what you share and follows interesting threads before moving on
3. After 12–18 exchanges, Cedie wraps up and you save the profile
4. Claude synthesizes everything into a structured `ProfileData` object (experience, skills, projects, education, work style, personality traits, career goals)
5. That profile is used by the **Build Resume** feature to generate resumes for any job description — no manual input needed

---

## License

MIT
