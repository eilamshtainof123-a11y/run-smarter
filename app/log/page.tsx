'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import { GlowCard, SectionHd, AiBox, DotPulse, StrideInput, StrideSelect, StrideTextarea, StrideBtn, FormField } from '@/components/ui'
import { useStrideStore, athleteContextString, WorkoutType } from '@/lib/store'
import { askClaude, COACH_SYSTEM } from '@/lib/claude'

const today = new Date().toISOString().slice(0, 10)

export default function LogWorkout() {
  const { profile, runs, addRun } = useStrideStore()
  const router = useRouter()

  const [form, setForm] = useState({
    type: 'long' as WorkoutType,
    date: today,
    distanceKm: 14.8,
    durationMin: 89,
    avgPace: '6:01',
    avgHR: 148,
    maxHR: 163,
    cadence: 172,
    sleepHrs: 7.5,
    todayHRV: 62,
    legFeel: 'Normal' as const,
    rpe: 7,
    notes: '',
  })
  const [review, setReview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  function set(field: string, value: unknown) {
    setForm(f => ({ ...f, [field]: value }))
  }

  const typeNames: Record<WorkoutType, string> = {
    easy: 'Easy run', tempo: 'Tempo run', interval: 'Interval session',
    long: 'Long run', race: 'Race', rest: 'Rest day',
  }

  async function submit() {
    setLoading(true)
    setReview(null)

    const newRun = {
      id: Date.now().toString(),
      date: new Date(form.date).toISOString(),
      type: form.type,
      name: typeNames[form.type],
      ...form,
    }

    const ctx = athleteContextString(profile, runs)
    const sys = COACH_SYSTEM(ctx)

    const prompt = `JUST LOGGED WORKOUT:
Type: ${typeNames[form.type]}
Date: ${form.date}
Distance: ${form.distanceKm}km, Duration: ${form.durationMin}min, Avg pace: ${form.avgPace}/km
Avg HR: ${form.avgHR}bpm (${Math.round(form.avgHR / profile.maxHR * 100)}% of max), Max HR: ${form.maxHR}bpm
Cadence: ${form.cadence}spm
Today's HRV: ${form.todayHRV}ms vs baseline ${profile.hrvBaseline}ms — ${form.todayHRV < profile.hrvBaseline - 5 ? 'SUPPRESSED — fatigue present' : 'near baseline'}
Sleep: ${form.sleepHrs}hrs, Leg feel: ${form.legFeel}, RPE: ${form.rpe}/10
Notes: "${form.notes || 'None'}"

Give a precise, honest coaching review of this specific workout. Reference the HRV status and what it means for recovery. Cross-reference HR data with the intended purpose of this workout type. Note cadence — optimal is 170–185spm. End with one concrete recommendation for the next session.`

    try {
      const text = await askClaude([{ role: 'user', content: prompt }], sys)
      newRun.aiReview = text
      setReview(text)
      addRun(newRun)
      setSaved(true)
    } catch {
      setReview('Could not reach Claude. Workout saved without AI review.')
      addRun(newRun)
      setSaved(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 500, color: '#e6edf3' }}>Log workout</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Claude analyzes every number against your athlete profile</div>
          </div>
        </div>

        <GlowCard>
          <SectionHd>Workout details</SectionHd>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
            <FormField label="Type">
              <StrideSelect value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="easy">Easy run</option>
                <option value="tempo">Tempo run</option>
                <option value="interval">Interval session</option>
                <option value="long">Long run</option>
                <option value="race">Race</option>
              </StrideSelect>
            </FormField>
            <FormField label="Date">
              <StrideInput type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9 }}>
            <FormField label="Distance (km)">
              <StrideInput type="number" step="0.1" value={form.distanceKm} onChange={e => set('distanceKm', +e.target.value)} />
            </FormField>
            <FormField label="Duration (min)">
              <StrideInput type="number" value={form.durationMin} onChange={e => set('durationMin', +e.target.value)} />
            </FormField>
            <FormField label="Avg pace (min/km)">
              <StrideInput type="text" value={form.avgPace} onChange={e => set('avgPace', e.target.value)} placeholder="5:30" />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9 }}>
            <FormField label="Avg HR (bpm)">
              <StrideInput type="number" value={form.avgHR} onChange={e => set('avgHR', +e.target.value)} />
            </FormField>
            <FormField label="Max HR hit (bpm)">
              <StrideInput type="number" value={form.maxHR} onChange={e => set('maxHR', +e.target.value)} />
            </FormField>
            <FormField label="Cadence (spm)">
              <StrideInput type="number" value={form.cadence} onChange={e => set('cadence', +e.target.value)} />
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9 }}>
            <FormField label="Sleep last night (hrs)">
              <StrideInput type="number" step="0.5" value={form.sleepHrs} onChange={e => set('sleepHrs', +e.target.value)} />
            </FormField>
            <FormField label="Today's HRV (ms)">
              <StrideInput type="number" value={form.todayHRV} onChange={e => set('todayHRV', +e.target.value)} />
            </FormField>
            <FormField label="Leg feel">
              <StrideSelect value={form.legFeel} onChange={e => set('legFeel', e.target.value)}>
                <option>Fresh</option>
                <option>Normal</option>
                <option>Heavy</option>
                <option>Very tired</option>
              </StrideSelect>
            </FormField>
          </div>

          <FormField label="Effort level (RPE 1–10)">
            <div style={{ display: 'flex', gap: 4 }}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button
                  key={n}
                  className={`rpe-btn ${form.rpe === n ? 'active' : ''}`}
                  onClick={() => set('rpe', n)}
                >{n}</button>
              ))}
            </div>
          </FormField>

          <FormField label="Notes — what you felt, any issues">
            <StrideTextarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Felt strong, knee was a bit tight, cut short..."
            />
          </FormField>

          <StrideBtn fullWidth onClick={submit} disabled={loading}>
            {loading ? <><DotPulse /> Analyzing with Claude...</> : '✦ Submit & get Claude review'}
          </StrideBtn>
        </GlowCard>

        {(loading || review) && (
          <AiBox label="Claude Sonnet · workout review">
            {loading ? <><DotPulse /> <span style={{ marginLeft: 8, color: '#4b5563' }}>Analyzing with your full athlete profile...</span></> : review}
          </AiBox>
        )}

        {saved && !loading && (
          <div style={{ display: 'flex', gap: 10 }}>
            <StrideBtn onClick={() => router.push('/history')}>View in history →</StrideBtn>
            <StrideBtn onClick={() => { setReview(null); setSaved(false); setForm({ ...form, notes: '' }) }}>Log another</StrideBtn>
          </div>
        )}
      </div>
    </AppShell>
  )
}
