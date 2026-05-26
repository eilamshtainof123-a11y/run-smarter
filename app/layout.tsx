import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Stride — AI Running Coach',
  description: 'Dark athletic running tracker powered by Claude Sonnet. Log workouts, get AI coaching, build personalized plans.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
