export type ApplicationStatus =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn'

export interface JobApplication {
  id: string
  user_id: string
  company_name: string
  job_title: string | null
  job_posting_url: string | null
  status: ApplicationStatus
  applied_date: string
  notes: string | null
  salary_range: string | null
  location: string | null
  contact_name: string | null
  contact_email: string | null
  next_follow_up: string | null
  resume_generated: boolean
  created_at: string
  updated_at: string
}

export interface OptimizeRequest {
  resumeText: string
  jobDescription: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ProfileData {
  fullName: string
  email: string
  phone: string
  location: string
  linkedin: string
  github: string
  summary: string
  workStyle: string
  careerGoals: string
  personalityTraits: string[]
  experience: ExperienceEntry[]
  education: EducationEntry[]
  projects: ProjectEntry[]
  skills: SkillCategory[]
  awards: AwardEntry[]
  certifications: CertificationEntry[]
}

export interface CareerProfile {
  id: string
  user_id: string
  name: string
  interview_messages: ChatMessage[]
  profile: ProfileData | null
  completed: boolean
  created_at: string
  updated_at: string
}

export interface OptimizeResponse {
  savedId?: string | null
  matchScore?: number | null
  matchWarning?: string | null
  optimizedResume: {
    contactInfo: ContactInfo
    summary: string
    education: EducationEntry[]
    experience: ExperienceEntry[]
    projects: ProjectEntry[]
    skills: SkillCategory[]
    awards: AwardEntry[]
    certifications: CertificationEntry[]
  }
  coverLetter: string
  emailMessage: string
}

export interface ContactInfo {
  name: string
  email: string
  phone: string
  location: string
  linkedin: string
  linkedinLabel?: string
  github: string
  githubLabel?: string
}

export interface SkillCategory {
  category: string
  items: string[]
}

export interface ExperienceEntry {
  title: string
  company: string
  location: string
  duration: string
  bullets: string[]
}

export interface ProjectEntry {
  name: string
  techStack: string
  duration: string
  bullets: string[]
}

export interface EducationEntry {
  degree: string
  institution: string
  location: string
  year: string
  gpa: string
}

export interface CertificationEntry {
  name: string
  issuer: string
  year: string
}

export interface AwardEntry {
  name: string
  issuer: string
  year: string
}

export interface SavedOptimization {
  id: string
  label: string
  created_at: string
  result?: OptimizeResponse
}

export type SubscriptionStatus =
  | 'active'
  | 'on_trial'
  | 'paused'
  | 'cancelled'
  | 'expired'
  | 'past_due'
  | 'unpaid'

export interface UserSubscription {
  id: string
  user_id: string
  ls_subscription_id: string | null
  ls_customer_id: string | null
  status: SubscriptionStatus
  renews_at: string | null
  ends_at: string | null
  trial_ends_at: string | null
  created_at: string
  updated_at: string
}

export interface UsageStatus {
  allowed: boolean
  isSubscribed: boolean
  usesCount: number
  limit: number
}

export type FeedbackType = 'bug' | 'feature' | 'general'
export type FeedbackStatus = 'open' | 'reviewed' | 'closed'
export type AnnouncementType = 'info' | 'warning' | 'success' | 'update'

export interface UserFeedback {
  id: string
  user_id: string | null
  user_email: string | null
  type: FeedbackType
  message: string
  status: FeedbackStatus
  created_at: string
}

export interface Announcement {
  id: string
  title: string
  body: string
  type: AnnouncementType
  active: boolean
  created_at: string
  updated_at: string
}
