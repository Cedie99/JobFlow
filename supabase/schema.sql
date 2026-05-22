-- Helper: auto-update updated_at on row changes
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Career Profiles Table (multiple profiles per user, one per career type)
create table if not exists career_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  interview_messages jsonb not null default '[]'::jsonb,
  profile jsonb,
  completed boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table career_profiles enable row level security;

create policy "Users can manage own career profiles"
  on career_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger update_career_profiles_updated_at
  before update on career_profiles
  for each row execute function update_updated_at_column();

-- User Profiles Table (legacy onboarding — kept for backwards compat)
create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  interview_messages jsonb not null default '[]'::jsonb,
  profile jsonb,
  completed boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_profiles enable row level security;

create policy "Users can manage own profile"
  on user_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger update_user_profiles_updated_at
  before update on user_profiles
  for each row execute function update_updated_at_column();

-- Resume Optimizations Table
create table if not exists resume_optimizations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  label text not null,
  job_description text not null,
  result jsonb not null,
  created_at timestamptz default now()
);

alter table resume_optimizations enable row level security;

create policy "Users can view own optimizations"
  on resume_optimizations for select
  using (auth.uid() = user_id);

create policy "Users can insert own optimizations"
  on resume_optimizations for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own optimizations"
  on resume_optimizations for delete
  using (auth.uid() = user_id);

-- Job Applications Table
create table if not exists job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  company_name text not null,
  job_title text,
  job_posting_url text,
  status text default 'applied' check (
    status in ('applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn')
  ),
  applied_date date default current_date,
  notes text,
  salary_range text,
  location text,
  contact_name text,
  contact_email text,
  next_follow_up date,
  resume_generated boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table job_applications enable row level security;

create policy "Users can view own applications"
  on job_applications for select
  using (auth.uid() = user_id);

create policy "Users can insert own applications"
  on job_applications for insert
  with check (auth.uid() = user_id);

create policy "Users can update own applications"
  on job_applications for update
  using (auth.uid() = user_id);

create policy "Users can delete own applications"
  on job_applications for delete
  using (auth.uid() = user_id);

create trigger update_job_applications_updated_at
  before update on job_applications
  for each row execute function update_updated_at_column();

-- ── Subscription tables ─────────────────────────────────────────────────────

-- Tracks how many free AI uses each user has consumed
create table if not exists user_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  ai_uses_count integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_usage enable row level security;

create policy "Users can view own usage"
  on user_usage for select
  using (auth.uid() = user_id);

create trigger update_user_usage_updated_at
  before update on user_usage
  for each row execute function update_updated_at_column();

-- LemonSqueezy subscription state (written by webhook via service role)
create table if not exists user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  ls_subscription_id text unique,
  ls_customer_id text,
  ls_order_id text,
  ls_product_id text,
  ls_variant_id text,
  status text check (status in ('active', 'paused', 'cancelled', 'expired', 'past_due', 'unpaid', 'on_trial')),
  renews_at timestamptz,
  ends_at timestamptz,
  trial_ends_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_subscriptions enable row level security;

create policy "Users can view own subscription"
  on user_subscriptions for select
  using (auth.uid() = user_id);

create trigger update_user_subscriptions_updated_at
  before update on user_subscriptions
  for each row execute function update_updated_at_column();

-- ── Admin: User Feedback ─────────────────────────────────────────────────────

create table if not exists user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  type text not null check (type in ('bug', 'feature', 'general')),
  message text not null,
  status text not null default 'open' check (status in ('open', 'reviewed', 'closed')),
  created_at timestamptz default now()
);

alter table user_feedback enable row level security;

create policy "Users can insert own feedback"
  on user_feedback for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can view own feedback"
  on user_feedback for select
  using (auth.uid() = user_id);

-- ── Admin: Announcements ─────────────────────────────────────────────────────

create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  type text not null default 'info' check (type in ('info', 'warning', 'success', 'update')),
  active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table announcements enable row level security;

create policy "Anyone can view active announcements"
  on announcements for select
  using (active = true);

create trigger update_announcements_updated_at
  before update on announcements
  for each row execute function update_updated_at_column();

-- Tracks which users have dismissed which announcements
create table if not exists dismissed_announcements (
  user_id uuid references auth.users(id) on delete cascade,
  announcement_id uuid references announcements(id) on delete cascade,
  dismissed_at timestamptz default now(),
  primary key (user_id, announcement_id)
);

alter table dismissed_announcements enable row level security;

create policy "Users can manage own dismissals"
  on dismissed_announcements for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
