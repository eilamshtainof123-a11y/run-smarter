'use client'
import { useEffect, useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import { GlowCard, SectionHd, Badge, AiBox, DotPulse, StatCard, WeekDay, PaceBars } from '@/components/ui'
import { useStrideStore, athleteContextString, typeColors } from '@/lib/store'
import { askClaude, COACH_SYSTEM } from '@/lib/claude'

export default function Dashboard() {
  const { profile, runs, plan, currentWeek, totalWeeks, goalName } = useStrideStore()
  const [weeklyReview, setWeeklyReview] = useState<string | null>(null)
  const [loadingReview, setLoadingReview] = useState(false)

  const weekKm = runs.filter(r => {
    const d = new Date(r.date)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 86400000)
    return d > weekAgo
  }).reduce((s, r) => s + r.distanceKm, 0)

  const avgPace = runs.length > 0 ? runs[0].avgPace : '—'
  const streak = 12
  const currentPlan = plan.find(w => w.week === currentWeek)
  const todaySession = currentPlan?.sessions.find(s => s.day === 'Sunday' && !s.done)

  async function loadWeeklyReview() {
    setLoadingReview(true)
    try {
      const ctx = athleteContextString(profile, runs)
      const sys = COACH_SYSTEM(ctx)
      const text = await askClaude([{
        role: 'user',
        content: `Give me a concise weekly training review. This week: ${weekKm.toFixed(1)}km total, avg pace ${avgPace}/km, ${runs.slice(0, 4).map(r => `${r.name} ${r.distanceKm}km @ ${r.avgPace}/km HR${r.avgHR}`).join(', ')}. Reference my HRV (${profile.hrv}ms vs ${profile.hrvBaseline}ms baseline) and what it means for today's long run. Be specific and honest. Under 100 words.`
      }], sys)
      setWeeklyReview(text)
    } catch {
      setWeeklyReview('Could not reach Claude — check your API key in .env.local')
    } finally {
      setLoadingReview(false)
    }
  }

  useEffect(() => { loadWeeklyReview() }, [])

  return (
    <AppShell>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }}>
       const newRun = {
  id: Date.now().toString(),
  date: new Date(form.date).toISOString(),
  type: form.type,
  name: typeNames[form.type],
  distanceKm: form.distanceKm,
  durationMin: form.durationMin,
  avgPace: form.avgPace,
  avgHR: form.avgHR,
  maxHR: form.maxHR,
  cadence: form.cadence,
  sleepHrs: form.sleepHrs,
  todayHRV: form.todayHRV,
  legFeel: form.legFeel,
  rpe: form.rpe,
  notes: form.notes,
} </div>
          {todaySession && <Badge color="blue">Long run today · {todaySession.distanceKm}km</Badge>}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          <StatCard value={`${weekKm.toFixed(0)} km`} label="This week" delta="↑ 6 km" deltaColor="up" />
          <StatCard value={avgPace} label="Avg pace" delta="↓ 8s faster" deltaColor="up" />
          <StatCard value="4/5" label="Workouts" delta="80% done" deltaColor="note" />
          <StatCard value={`${streak}d`} label="Streak" delta="Personal best" deltaColor="up" />
        </div>

        {/* Week strip */}
        <GlowCard>
          <SectionHd>This week</SectionHd>
          <div style={{ display: 'flex', gap: 5 }}>
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => {
              const session = currentPlan?.sessions[i]
              const status = !session ? 'rest' : session.done && i < 6 ? 'done' : i === 6 ? 'today' : session.type === 'rest' ? 'rest' : 'upcoming'
              return <WeekDay key={d} label={d.slice(0, 3)} sublabel={session?.distanceKm ? `${session.distanceKm}k` : session?.type === 'rest' ? 'Rest' : '—'} status={status as never} />
            })}
          </div>
        </GlowCard>

        {/* Two col */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <GlowCard>
            <SectionHd>Recent runs</SectionHd>
            {runs.slice(0, 4).map(r => (
              <div key={r.id} className="run-row" style={{ marginBottom: 3 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: typeColors[r.type], flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#e6edf3' }}>{new Date(r.date).toLocaleDateString('en',{weekday:'short'})} — {r.name}</div>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{r.avgPace}/km · {r.distanceKm}k</div>
              </div>
            ))}
          </GlowCard>
          <GlowCard>
            <SectionHd>8-week pace trend</SectionHd>
            <PaceBars weeks={8} />
          </GlowCard>
        </div>

        {/* AI Review */}
        <AiBox label="Claude Sonnet · weekly review">
          {loadingReview ? <><DotPulse /> <span style={{ marginLeft: 8, color: '#4b5563' }}>Analyzing your week...</span></> : (weeklyReview || 'Click to load weekly review')}
        </AiBox>
      </div>
    </AppShell>
  )
}
