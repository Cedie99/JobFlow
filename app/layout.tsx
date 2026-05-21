import type { Metadata } from 'next'
import { DM_Sans, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'jobflow — Resume Optimizer & Application Tracker',
  description: 'AI-powered resume optimization and job application tracking',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
        <Toaster richColors position="top-right" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
