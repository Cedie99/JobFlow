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
