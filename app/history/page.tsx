'use client'
import { useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import { GlowCard, SectionHd, AiBox, DotPulse, StrideBtn, Pill } from '@/components/ui'
import { useStrideStore, athleteContextString, typeColors, Run } from '@/lib/store'
import { askClaude, COACH_SYSTEM } from '@/lib/claude'

export default function History() {
  const { runs, profile, updateRunReview } = useStrideStore()
  const [selected, setSelected] = useState<Run | null>(runs[0] || null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all' ? runs : runs.filter(r => r.type === filter)

  async function reviewRun(run: Run) {
    if (run.aiReview) return
    setLoading(true)
    const ctx = athleteContextString(profile, runs)
    const sys = COACH_SYSTEM(ctx)
    const prompt = `WORKOUT TO REVIEW:
Type: ${run.name}, Date: ${run.date.slice(0, 10)}
Distance: ${run.distanceKm}km, Duration: ${run.durationMin}min, Avg pace: ${run.avgPace}/km
Avg HR: ${run.avgHR}bpm (${Math.round(run.avgHR / profile.maxHR * 100)}% of max HR)
Cadence: ${run.cadence}spm, RPE: ${run.rpe}/10
Athlete notes: "${run.notes}"

Give an honest, precise coaching review. Reference the specific numbers — HR%, cadence vs optimal (170–185spm), RPE appropriateness for this workout type. One specific actionable point for improvement. Under 100 words.`
    try {
      const text = await askClaude([{ role: 'user', content: prompt }], sys)
      updateRunReview(run.id, text)
      setSelected({ ...run, aiReview: text })
    } catch {
      updateRunReview(run.id, 'Could not reach Claude — check your API key.')
    } finally {
      setLoading(false)
    }
  }

  const fmt = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const speed = (km: number, min: number) => (km / min * 60).toFixed(1)

  return (
    <AppShell>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 500, color: '#e6edf3' }}>Run history</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Click any run · request Claude&apos;s review on any workout</div>
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {['all','easy','tempo','interval','long','race'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '4px 10px', borderRadius: 20, fontSize: 11,
                border: '1px solid', cursor: 'pointer',
                background: filter === f ? '#1e3a5f' : 'transparent',
                color: filter === f ? '#58a6ff' : '#6b7280',
                borderColor: filter === f ? '#2563a8' : '#1f2937',
              }}>{f}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, flex: 1, overflow: 'hidden' }}>
          {/* List */}
          <GlowCard style={{ overflowY: 'auto' }}>
            <SectionHd right={`${filtered.length} runs`}>All runs</SectionHd>
            {filtered.length === 0 && (
              <div style={{ color: '#4b5563', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No runs logged yet</div>
            )}
            {filtered.map(r => (
              <div
                key={r.id}
                className={`run-row ${selected?.id === r.id ? 'active' : ''}`}
                onClick={() => setSelected(r)}
                style={{ marginBottom: 3 }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: typeColors[r.type], flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#e6edf3' }}>{fmt(r.date)} — {r.name}</div>
                  {r.aiReview && <div style={{ fontSize: 10, color: '#3fb950', marginTop: 1 }}>✓ Claude reviewed</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{r.avgPace}/km</div>
                  <div style={{ fontSize: 10, color: '#4b5563' }}>{r.distanceKm} km</div>
                </div>
              </div>
            ))}
          </GlowCard>

          {/* Detail */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
            {!selected ? (
              <div style={{ background: '#1c2128', borderRadius: 12, border: '1px solid #1f2937', padding: 14, textAlign: 'center', color: '#4b5563', fontSize: 12 }}>
                <div style={{ fontSize: 26, marginBottom: 8, color: '#2563a8' }}>☞</div>
                Select a run to see full stats
              </div>
            ) : (
              <>
                <div style={{ background: '#1c2128', borderRadius: 12, border: '1px solid #1f2937', padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#e6edf3' }}>{fmt(selected.date)}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{selected.name}</div>
                    </div>
                    <Pill type={selected.type} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7, marginBottom: 10 }}>
                    {[
                      { v: `${selected.distanceKm} km`, l: 'Distance' },
                      { v: `${selected.avgPace}/km`, l: 'Avg pace' },
                      { v: `${selected.durationMin} min`, l: 'Duration' },
                      { v: `${selected.avgHR} bpm`, l: 'Avg HR' },
                      { v: `${selected.rpe}/10`, l: 'RPE' },
                      { v: `${speed(selected.distanceKm, selected.durationMin)} km/h`, l: 'Speed' },
                      { v: `${selected.cadence} spm`, l: 'Cadence' },
                      { v: `${selected.sleepHrs}h`, l: 'Sleep' },
                      { v: `${selected.todayHRV} ms`, l: 'HRV that day' },
                    ].map(({ v, l }) => (
                      <div key={l} style={{ background: '#111827', borderRadius: 7, padding: '9px 11px' }}>
                        <div style={{ fontSize: 15, fontWeight: 500, color: '#e6edf3' }}>{v}</div>
                        <div style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                  {selected.notes && (
                    <div style={{ fontSize: 11, color: '#6b7280', background: '#111827', borderRadius: 7, padding: '8px 10px', marginBottom: 10, fontStyle: 'italic', lineHeight: 1.5 }}>
                      &ldquo;{selected.notes}&rdquo;
                    </div>
                  )}
                  {!selected.aiReview && (
                    <StrideBtn fullWidth onClick={() => reviewRun(selected)} disabled={loading}>
                      {loading ? <><DotPulse /> Analyzing...</> : '✦ Get Claude\'s review'}
                    </StrideBtn>
                  )}
                </div>

                {(loading && !selected.aiReview) && (
                  <AiBox>
                    <DotPulse /> <span style={{ marginLeft: 8, color: '#4b5563' }}>Reviewing with your athlete profile...</span>
                  </AiBox>
                )}
                {selected.aiReview && (
                  <AiBox label="Claude Sonnet · run review">
                    {selected.aiReview}
                  </AiBox>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
