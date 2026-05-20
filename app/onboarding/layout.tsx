import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'jobflow — Set up your profile',
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
