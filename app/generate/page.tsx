'use client'
import { useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import { GlowCard, SectionHd, AiBox, DotPulse, StrideInput, StrideSelect, StrideTextarea, StrideBtn, FormField } from '@/components/ui'
import { useStrideStore } from '@/lib/store'
import { askClaude } from '@/lib/claude'

export default function Generate() {
  const { profile } = useStrideStore()
  const [form, setForm] = useState({
    age: new Date().getFullYear() - new Date(profile.dob).getFullYear(),
    weight: profile.weightKg,
    background: profile.background,
    otherSport: profile.otherSport,
    rhr: profile.rhr,
    hrv: profile.hrv,
    vo2max: profile.vo2max,
    maxHR: profile.maxHR,
    ltHR: profile.ltHR,
    currentKm: 25,
    daysPerWeek: profile.daysPerWeek,
    goal: 'Sub-50 min 10K',
    weeks: 12,
    injuries: profile.injuries,
    notes: '',
  })
  const [plan, setPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function set(field: string, value: unknown) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function generate() {
    setLoading(true)
    setPlan(null)
    const sys = `You are an elite running coach and exercise physiologist with expertise in periodization, HRV-guided training, VO2max development, and lactate threshold training. Build a structured, science-based training program. Use the 80/20 polarized or pyramidal intensity distribution principle. Derive all pace zones from the athlete's max HR and lactate threshold. Be very specific with paces, distances, HR targets, and physiological rationale. Plain text only — no markdown, no bullet points. Under 300 words. Structure: 1) 2-sentence athlete assessment based on their physiology, 2) program philosophy and periodization overview, 3) full Week 1 detailed day-by-day with exact paces and HR targets, 4) brief outline of progression through remaining weeks.`

    const prompt = `Build a complete training program for this athlete:

PHYSIOLOGY:
- Age: ${form.age}, Weight: ${form.weight}kg
- RHR: ${form.rhr}bpm (${form.rhr < 50 ? 'excellent aerobic fitness' : form.rhr < 60 ? 'good fitness' : 'developing'})
- HRV (RMSSD): ${form.hrv}ms
- VO2max: ${form.vo2max} ml/kg/min
- Max HR: ${form.maxHR}bpm — derive all zones from this
- Lactate Threshold HR: ${form.ltHR}bpm (${Math.round(form.ltHR/form.maxHR*100)}% of max)
- Derived zones: Z1 <${Math.round(form.maxHR*0.72)}bpm, Z2 ${Math.round(form.maxHR*0.72)}–${Math.round(form.maxHR*0.82)}bpm, Z3 ${Math.round(form.maxHR*0.82)}–${Math.round(form.maxHR*0.87)}bpm, Z4 ${Math.round(form.maxHR*0.87)}–${Math.round(form.maxHR*0.93)}bpm, Z5 >${Math.round(form.maxHR*0.93)}bpm

BACKGROUND: ${form.background}, prior sport: ${form.otherSport}
CURRENT VOLUME: ${form.currentKm}km/week
AVAILABILITY: ${form.daysPerWeek} days/week
GOAL: ${form.goal} in ${form.weeks} weeks
INJURY NOTES: ${form.injuries}
ADDITIONAL: ${form.notes || 'None'}

Build the optimal program. Justify pace targets using their physiology. Flag any risks based on injury notes.`

    try {
      const text = await askClaude([{ role: 'user', content: prompt }], sys)
      setPlan(text)
    } catch {
      setPlan('Could not reach Claude — check your ANTHROPIC_API_KEY in .env.local')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 500, color: '#e6edf3' }}>Generate training plan</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Claude builds a periodized, physiology-based program from your exact data</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <GlowCard>
              <SectionHd>Physiology</SectionHd>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                <FormField label="Age"><StrideInput type="number" value={form.age} onChange={e => set('age', +e.target.value)} /></FormField>
                <FormField label="Weight (kg)"><StrideInput type="number" value={form.weight} onChange={e => set('weight', +e.target.value)} /></FormField>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9 }}>
                <FormField label="RHR (bpm)"><StrideInput type="number" value={form.rhr} onChange={e => set('rhr', +e.target.value)} /></FormField>
                <FormField label="HRV (ms)"><StrideInput type="number" value={form.hrv} onChange={e => set('hrv', +e.target.value)} /></FormField>
                <FormField label="VO2max"><StrideInput type="number" step="0.1" value={form.vo2max} onChange={e => set('vo2max', +e.target.value)} /></FormField>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                <FormField label="Max HR (bpm)"><StrideInput type="number" value={form.maxHR} onChange={e => set('maxHR', +e.target.value)} /></FormField>
                <FormField label="Lactate threshold HR"><StrideInput type="number" value={form.ltHR} onChange={e => set('ltHR', +e.target.value)} /></FormField>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                <FormField label="Running background">
                  <StrideSelect value={form.background} onChange={e => set('background', e.target.value)}>
                    <option>Complete beginner</option>
                    <option>Occasional runner (1–2x/week)</option>
                    <option>Regular runner (3–4x/week)</option>
                    <option>Competitive / club runner</option>
                  </StrideSelect>
                </FormField>
                <FormField label="Other sport history">
                  <StrideSelect value={form.otherSport} onChange={e => set('otherSport', e.target.value)}>
                    <option>None</option>
                    <option>Team sports</option>
                    <option>Endurance (cycling/swimming)</option>
                    <option>Gym / strength training</option>
                  </StrideSelect>
                </FormField>
              </div>
            </GlowCard>

            <GlowCard>
              <SectionHd>Goal</SectionHd>
              <FormField label="Goal">
                <StrideSelect value={form.goal} onChange={e => set('goal', e.target.value)}>
                  <option>Run first 5K</option>
                  <option>Sub-30 min 5K</option>
                  <option>Sub-50 min 10K</option>
                  <option>Sub-45 min 10K</option>
                  <option>First half marathon</option>
                  <option>Sub-2h half marathon</option>
                  <option>First marathon</option>
                  <option>Sub-4h marathon</option>
                  <option>Improve speed / new PB</option>
                  <option>Weight loss through running</option>
                </StrideSelect>
              </FormField>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9 }}>
                <FormField label="Timeline (weeks)"><StrideInput type="number" value={form.weeks} onChange={e => set('weeks', +e.target.value)} /></FormField>
                <FormField label="Current km/week"><StrideInput type="number" value={form.currentKm} onChange={e => set('currentKm', +e.target.value)} /></FormField>
                <FormField label="Days/week">
                  <StrideSelect value={form.daysPerWeek} onChange={e => set('daysPerWeek', +e.target.value)}>
                    <option value={3}>3 days</option>
                    <option value={4}>4 days</option>
                    <option value={5}>5 days</option>
                  </StrideSelect>
                </FormField>
              </div>
              <FormField label="Injuries / notes for Claude">
                <StrideTextarea value={form.injuries} onChange={e => set('injuries', e.target.value)} />
              </FormField>
              <StrideBtn fullWidth onClick={generate} disabled={loading}>
                {loading ? <><DotPulse /> Building your program...</> : '✦ Build my program with Claude'}
              </StrideBtn>
            </GlowCard>
          </div>

          <div>
            {!plan && !loading && (
              <div style={{ background: '#1c2128', borderRadius: 12, border: '1px solid #1f2937', padding: 14, textAlign: 'center', color: '#4b5563', fontSize: 12 }}>
                <div style={{ fontSize: 26, marginBottom: 8, color: '#2563a8' }}>✦</div>
                Fill in your details and Claude will build a fully periodized, science-based program derived from your exact physiology — not a generic template.
              </div>
            )}
            {loading && (
              <AiBox label="Claude Sonnet · building your program">
                <DotPulse /> <span style={{ marginLeft: 8, color: '#4b5563' }}>Analyzing your physiology and building a personalized program...</span>
              </AiBox>
            )}
            {plan && (
              <AiBox label="Claude Sonnet · your training program">
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{plan}</div>
              </AiBox>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
