'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const navItems = [
  { href: '/', icon: '⊞', label: 'Dashboard' },
  { href: '/plan', icon: '◫', label: 'My Plan' },
  { href: '/log', icon: '+', label: 'Log Workout' },
  { href: '/history', icon: '↺', label: 'Run History' },
  { href: '/generate', icon: '✦', label: 'Generate Plan' },
  { href: '/coach', icon: '◈', label: 'AI Coach' },
  { href: '/profile', icon: '◉', label: 'Athlete Profile' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: 56, background: '#111827',
      borderRight: '1px solid #1f2937',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '14px 0',
      gap: 2, flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: '#1e3a5f', color: '#58a6ff',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 17,
        marginBottom: 14, fontWeight: 700,
        letterSpacing: '-1px',
      }}>
        S
      </div>

      {navItems.map(({ href, icon, label }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div className={`sb-icon ${active ? 'active' : ''}`} title={label} style={{ fontSize: 16 }}>
              {icon}
              <span style={{
                position: 'absolute', left: 44,
                background: '#1c2128', border: '1px solid #30363d',
                borderRadius: 6, padding: '4px 8px',
                fontSize: 11, color: '#e6edf3',
                whiteSpace: 'nowrap', pointerEvents: 'none',
                opacity: 0, transition: 'opacity .15s', zIndex: 10,
              }} className="sb-tooltip">
                {label}
              </span>
            </div>
          </Link>
        )
      })}

      <Link href="/settings" style={{ textDecoration: 'none', marginTop: 'auto' }}>
        <div className={`sb-icon ${pathname === '/settings' ? 'active' : ''}`} title="Settings">
          ⚙
        </div>
      </Link>

      <style>{`
        .sb-icon:hover .sb-tooltip { opacity: 1 !important; }
      `}</style>
    </aside>
  )
}
