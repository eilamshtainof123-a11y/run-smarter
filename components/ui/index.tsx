'use client'
// components/ui/index.tsx — reusable dark UI primitives

import React from 'react'
import { clsx } from 'clsx'

// ── GlowCard ──────────────────────────────────────────────
export function GlowCard({
  children, className = '', style,
}: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={clsx('glow-card', className)} style={{ background: '#161b22', padding: '14px 16px', ...style }}>
      {children}
    </div>
  )
}

// ── SectionHd ─────────────────────────────────────────────
export function SectionHd({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="section-hd" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span>{children}</span>
      {right && <span style={{ color: '#4b5563', fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 10 }}>{right}</span>}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────
export function Badge({ children, color = 'blue' }: { children: React.ReactNode; color?: 'blue' | 'green' | 'amber' | 'red' }) {
  const styles: Record<string, React.CSSProperties> = {
    blue: { background: '#1e3a5f', color: '#58a6ff' },
    green: { background: '#14291d', color: '#3fb950' },
    amber: { background: '#2a1f00', color: '#d29922' },
    red: { background: '#2a1010', color: '#f87171' },
  }
  return (
    <span style={{ ...styles[color], fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 500 }}>
      {children}
    </span>
  )
}

// ── Pill ──────────────────────────────────────────────────
export function Pill({ type }: { type: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    easy: { label: 'Easy', cls: 'pill-easy' },
    tempo: { label: 'Tempo', cls: 'pill-tempo' },
    interval: { label: 'Intervals', cls: 'pill-interval' },
    long: { label: 'Long', cls: 'pill-long' },
    race: { label: 'Race', cls: 'pill-race' },
    rest: { label: 'Rest', cls: 'pill-rest' },
  }
  const { label, cls } = map[type] || { label: type, cls: 'pill-rest' }
  return <span className={`pill ${cls}`}>{label}</span>
}

// ── AiBox ─────────────────────────────────────────────────
export function AiBox({ label = 'Claude Sonnet', children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="ai-box animate-slide-up">
      <div className="ai-hd" style={{ fontSize: 10, fontWeight: 500, color: '#58a6ff', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 5 }}>
        <span>✦</span> {label}
      </div>
      <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.65 }}>{children}</div>
    </div>
  )
}

// ── DotPulse ──────────────────────────────────────────────
export function DotPulse() {
  return (
    <span className="dot-pulse">
      <span /><span /><span />
    </span>
  )
}

// ── StrideInput ───────────────────────────────────────────
export function StrideInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx('stride-input', props.className)} />
}

export function StrideSelect(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return <select {...props} className={clsx('stride-input', props.className)} />
}

export function StrideTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx('stride-input', props.className)} style={{ resize: 'none', height: 56, ...props.style }} />
}

// ── StrideBtn ─────────────────────────────────────────────
export function StrideBtn({
  children, onClick, fullWidth = false, disabled = false, className = '',
}: {
  children: React.ReactNode
  onClick?: () => void
  fullWidth?: boolean
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      className={clsx('stride-btn', fullWidth && 'btn-full', className)}
      onClick={onClick}
      disabled={disabled}
      style={fullWidth ? { width: '100%', justifyContent: 'center' } : {}}
    >
      {children}
    </button>
  )
}

// ── StatCard ──────────────────────────────────────────────
export function StatCard({
  value, label, delta, deltaColor = 'up',
}: {
  value: string; label: string; delta?: string; deltaColor?: 'up' | 'dn' | 'note' | 'warn'
}) {
  return (
    <div className="stat-card" style={{ padding: '11px 13px' }}>
      <div style={{ fontSize: 20, fontWeight: 500, color: '#e6edf3' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{label}</div>
      {delta && <div style={{ fontSize: 11, marginTop: 2 }} className={deltaColor}>{delta}</div>}
    </div>
  )
}

// ── FormField ─────────────────────────────────────────────
export function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 11 }}>
      <label style={{ fontSize: 11, color: '#6b7280', marginBottom: 4, fontWeight: 500, display: 'block' }}>{label}</label>
      {children}
    </div>
  )
}

// ── WeekDay ───────────────────────────────────────────────
export function WeekDay({ label, sublabel, status }: { label: string; sublabel: string; status: 'done' | 'today' | 'rest' | 'upcoming' }) {
  return (
    <div className={`week-day ${status}`} style={{ flex: 1 }}>
      <div style={{ fontSize: 10, color: '#4b5563', marginBottom: 4 }}>{label}</div>
      <div className="day-dot" style={{
        width: 20, height: 20, borderRadius: '50%', margin: '0 auto 3px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, color: '#4b5563', background: '#111827',
      }}>
        {status === 'done' ? '✓' : status === 'today' ? '▶' : '—'}
      </div>
      <div style={{ fontSize: 9, color: '#6b7280' }}>{sublabel}</div>
    </div>
  )
}

// ── PaceBar chart ─────────────────────────────────────────
export function PaceBars({ weeks = 8 }: { weeks?: number }) {
  const heights = [36, 47, 56, 63, 70, 75, 81, 78].slice(0, weeks)
  const blues = ['#1e3a5f', '#1e4570', '#1d5280', '#2563a8', '#3b82f6', '#58a6ff', '#60b4ff', '#58a6ff']
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 64 }}>
      {heights.map((h, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ borderRadius: '3px 3px 0 0', width: '100%', height: `${h}%`, background: blues[i] }} />
          <div style={{ fontSize: 9, color: '#4b5563', marginTop: 3 }}>W{i + 1}</div>
        </div>
      ))}
    </div>
  )
}
