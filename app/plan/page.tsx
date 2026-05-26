'use client'
import AppShell from '@/components/layout/AppShell'
import { GlowCard, SectionHd, Badge, Pill } from '@/components/ui'
import { useStrideStore } from '@/lib/store'

export default function Plan() {
  const { plan, currentWeek, totalWeeks, goalName, markSessionDone } = useStrideStore()
  const currentPlan = plan.find(w => w.week === currentWeek)
  const done = currentPlan?.sessions.filter(s => s.done).length || 0
  const total = currentPlan?.sessions.filter(s => s.type !== 'rest').length || 0
  const pct = total > 0 ? Math.round(done / total * 100) : 0

  const startEst = '55:20'
  const currentEst = '51:40'
  const goalEst = 'sub-50:00'

  return (
    <AppShell>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 500, color: '#e6edf3' }}>Training plan</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Week {currentWeek} of {totalWeeks} · {goalName}</div>
          </div>
          <Badge color="green">{pct}% complete</Badge>
        </div>

        {currentPlan && (
          <GlowCard>
            <SectionHd right={`${done}/${total} sessions done`}>{currentPlan.title}</SectionHd>
            {currentPlan.sessions.map((s, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: i < currentPlan.sessions.length - 1 ? '1px solid #1f2937' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 3 }}>
                  <div style={{ fontSize: 11, color: '#4b5563', width: 34, flexShrink: 0 }}>{s.day.slice(0, 3)}</div>
                  <div style={{ fontSize: 13, color: '#e6edf3', flex: 1, fontWeight: 500 }}>{s.name}</div>
                  <Pill type={s.type} />
                  {s.done ? (
                    <span style={{ color: '#3fb950', fontSize: 11, marginLeft: 4 }}>✓ Done</span>
                  ) : s.type !== 'rest' ? (
                    <button
                      onClick={() => markSessionDone(currentWeek, s.day)}
                      style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, border: '1px solid #1f2937', background: 'transparent', color: '#6b7280', cursor: 'pointer' }}
                    >Mark done</button>
                  ) : null}
                </div>
                <div style={{ fontSize: 11, color: '#6b7280', paddingLeft: 43 }}>{s.description}</div>
                {(s.targetPace || s.targetHR) && (
                  <div style={{ fontSize: 10, color: '#4b5563', paddingLeft: 43, marginTop: 3 }}>
                    {s.targetPace && <span>Target: {s.targetPace}/km</span>}
                    {s.targetPace && s.targetHR && <span> · </span>}
                    {s.targetHR && <span>HR: {s.targetHR}bpm</span>}
                  </div>
                )}
              </div>
            ))}
          </GlowCard>
        )}

        <GlowCard>
          <SectionHd>Goal tracker</SectionHd>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#e6edf3', marginBottom: 5 }}>
            <span>{goalName}</span>
            <span style={{ color: '#6b7280' }}>Est. now: {currentEst}</span>
          </div>
          <div className="prog-bar"><div className="prog-fill" style={{ width: '62%' }} /></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#4b5563', marginTop: 4 }}>
            <span>Start: {startEst}</span>
            <span>Now: {currentEst}</span>
            <span>Goal: {goalEst}</span>
          </div>
        </GlowCard>

        {!currentPlan && (
          <div style={{ textAlign: 'center', color: '#4b5563', fontSize: 13, padding: '40px 0' }}>
            No plan loaded yet — go to <strong style={{ color: '#58a6ff' }}>Generate Plan</strong> to build one with Claude.
          </div>
        )}
      </div>
    </AppShell>
  )
}
