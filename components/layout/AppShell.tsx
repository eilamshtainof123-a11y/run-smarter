'use client'
import Sidebar from '@/components/layout/Sidebar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: '#0d1117', minHeight: '100vh',
      display: 'flex', fontFamily: 'system-ui, sans-serif',
    }}>
      <Sidebar />
      <main style={{
        flex: 1, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        minWidth: 0,
      }}>
        {children}
      </main>
    </div>
  )
}
