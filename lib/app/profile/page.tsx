'use client'
import { useState } from 'react'
import AppShell from '@/components/layout/AppShell'
import { GlowCard, SectionHd, AiBox, DotPulse, StrideInput, StrideSelect, StrideTextarea, StrideBtn, FormField } from '@/components/ui'
import { useStrideStore, athleteContextString, AthleteProfile } from '@/lib/store'
import { askClaude, COACH_SYSTEM } from '@/lib/claude'

export default function Profile() {
  const { profile, runs, setProfile } = useStrideStore()
  const [form, setForm] = useState<AthleteProfile>({ ...profile })
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  function set(field: keyof AthleteProfile, value: unknown) {
    setForm(f => ({ ...f, [field]: value }))
    setSaved(false)
  }

  const hrv_status = form.hrv < form.hrvBaseline - 10 ? { label: 'Significantly suppressed', color: '#f85149' }
    : form.hrv < form.hrvBaseline - 5 ? { label: 'Below baseline — fatigue', color: '#d29922' }
    : form.hrv > form.hrvBaseline + 5 ? { label: 'Above baseline — well recovered', color: '#3fb950' }
    : { label: 'Near baseline', color: '#58a6ff' }

  const vo2_status = form.vo2max > 60 ? 'Excellent (elite level)' : form.vo2max > 52 ? 'Good — competitive amateur' : form.vo2max > 44 ? 'Average recreational' : 'Developing'

  async function save() {
    setProfile(form)
    setSaved(true)
    setLoading(true)
    setAnalysis(null)
    const ctx = athleteContextString(form, runs)
    const sys = COACH_SYSTEM(ctx)
    const prompt = `Analyze this athlete's complete physiological profile and give them a clear, honest picture of: 1) what their RHR, HRV, and VO2max say about their current fitness and recovery state, 2) what their primary physiological limiter is right now, 3) realistic potential based on these markers, 4) one specific thing they should prioritize in training given this data. Be specific — reference their exact numbers. Under 130 words.`
    try {
      const text = await askClaude([{ role: 'user', content: prompt }], sys)
      setAnalysis(text)
    } catch {
      setAnalysis('Could not reach Claude — check your ANTHROPIC_API_KEY.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 500, color: '#e6edf3' }}>Athlete profile</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Claude reads every field before giving you advice</div>
          </div>
          {saved && <span style={{ fontSize: 11, color: '#3fb950' }}>✓ Saved</span>}
        </div>

        {/* Bio strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#1c2128', borderRadius: 12, border: '1px solid #1f2937' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1e3a5f', color: '#58a6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 500 }}>
            {form.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#e6edf3' }}>{form.name}</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{new Date().getFullYear() - new Date(form.dob).getFullYear()} y/o · {form.weightKg}kg · {form.gender}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#3fb950' }}>✓ Profile complete</div>
            <div style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>Claude uses this in every response</div>
          </div>
        </div>

        {/* Physiology */}
        <GlowCard>
          <SectionHd right="Claude derives your HR zones from these">Physiological markers</SectionHd>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
            <div className="m3-card">
              <div style={{ fontSize: 18, fontWeight: 500, color: '#e6edf3' }}>{form.rhr} bpm</div>
              <div style={{ fontSize: 10, color: '#4b5563', marginTop: 3 }}>Resting HR</div>
              <div style={{ fontSize: 10, marginTop: 3, color: form.rhr < 50 ? '#3fb950' : form.rhr < 60 ? '#58a6ff' : '#d29922' }}>
                {form.rhr < 50 ? 'Excellent' : form.rhr < 60 ? 'Good' : 'Average'}
              </div>
            </div>
            <div className="m3-card">
              <div style={{ fontSize: 18, fontWeight: 500, color: '#e6edf3' }}>{form.hrv} ms</div>
              <div style={{ fontSize: 10, color: '#4b5563', marginTop: 3 }}>HRV (RMSSD)</div>
              <div style={{ fontSize: 10, marginTop: 3, color: hrv_status.color }}>{hrv_status.label}</div>
            </div>
            <div className="m3-card">
              <div style={{ fontSize: 18, fontWeight: 500, color: '#e6edf3' }}>{form.vo2max}</div>
              <div style={{ fontSize: 10, color: '#4b5563', marginTop: 3 }}>VO2max (ml/kg/min)</div>
              <div style={{ fontSize: 10, marginTop: 3, color: '#58a6ff' }}>{vo2_status}</div>
            </div>
          </div>

          <div style={{ background: '#111827', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: 11, color: '#6b7280', lineHeight: 1.6 }}>
            Derived HR zones — Z1 easy: &lt;{Math.round(form.maxHR * 0.72)}bpm · Z2 aerobic: {Math.round(form.maxHR * 0.72)}–{Math.round(form.maxHR * 0.82)}bpm · Z3 tempo: {Math.round(form.maxHR * 0.82)}–{Math.round(form.maxHR * 0.87)}bpm · Z4 threshold: {Math.round(form.maxHR * 0.87)}–{Math.round(form.maxHR * 0.93)}bpm · Z5 VO2max: &gt;{Math.round(form.maxHR * 0.93)}bpm
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9 }}>
            <FormField label="Resting HR (bpm)"><StrideInput type="number" value={form.rhr} onChange={e => set('rhr', +e.target.value)} /></FormField>
            <FormField label="HRV — RMSSD (ms)"><StrideInput type="number" value={form.hrv} onChange={e => set('hrv', +e.target.value)} /></FormField>
            <FormField label="HRV baseline (ms)"><StrideInput type="number" value={form.hrvBaseline} onChange={e => set('hrvBaseline', +e.target.value)} /></FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9 }}>
            <FormField label="VO2max (ml/kg/min)"><StrideInput type="number" step="0.1" value={form.vo2max} onChange={e => set('vo2max', +e.target.value)} /></FormField>
            <FormField label="Max HR (bpm)"><StrideInput type="number" value={form.maxHR} onChange={e => set('maxHR', +e.target.value)} /></FormField>
            <FormField label="Lactate threshold HR"><StrideInput type="number" value={form.ltHR} onChange={e => set('ltHR', +e.target.value)} /></FormField>
          </div>
        </GlowCard>

        {/* Personal */}
        <GlowCard>
          <SectionHd>Personal details</SectionHd>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
            <FormField label="Full name"><StrideInput type="text" value={form.name} onChange={e => set('name', e.target.value)} /></FormField>
            <FormField label="Date of birth"><StrideInput type="date" value={form.dob} onChange={e => set('dob', e.target.value)} /></FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9 }}>
            <FormField label="Weight (kg)"><StrideInput type="number" value={form.weightKg} onChange={e => set('weightKg', +e.target.value)} /></FormField>
            <FormField label="Height (cm)"><StrideInput type="number" value={form.heightCm} onChange={e => set('heightCm', +e.target.value)} /></FormField>
            <FormField label="Gender">
              <StrideSelect value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option>Male</option><option>Female</option><option>Other</option>
              </StrideSelect>
            </FormField>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9 }}>
            <FormField label="Running background">
              <StrideSelect value={form.background} onChange={e => set('background', e.target.value)}>
                <option>Complete beginner</option>
                <option>Occasional runner</option>
                <option>Regular runner</option>
                <option>Competitive runner</option>
              </StrideSelect>
            </FormField>
            <FormField label="Other sport history">
              <StrideSelect value={form.otherSport} onChange={e => set('otherSport', e.target.value)}>
                <option>None</option>
                <option>Team sports</option>
                <option>Endurance sports</option>
                <option>Gym / strength</option>
              </StrideSelect>
            </FormField>
            <FormField label="Days/week available">
              <StrideSelect value={form.daysPerWeek} onChange={e => set('daysPerWeek', +e.target.value)}>
                <option value={3}>3 days</option>
                <option value={4}>4 days</option>
                <option value={5}>5 days</option>
              </StrideSelect>
            </FormField>
          </div>
          <FormField label="Shoe mileage (km — replace at ~600km)">
            <StrideInput type="number" value={form.shoeMileageKm} onChange={e => set('shoeMileageKm', +e.target.value)} />
          </FormField>
        </GlowCard>

        {/* Health & Goals */}
        <GlowCard>
          <SectionHd>Health notes & goals</SectionHd>
          <FormField label="Injuries / health notes — Claude reads this for every workout review">
            <StrideTextarea value={form.injuries} onChange={e => set('injuries', e.target.value)} style={{ height: 64 }} />
          </FormField>
          <FormField label="Goals & timeline">
            <StrideTextarea value={form.goals} onChange={e => set('goals', e.target.value)} style={{ height: 64 }} />
          </FormField>
          <StrideBtn fullWidth onClick={save} disabled={loading}>
            {loading ? <><DotPulse /> Saving & analyzing with Claude...</> : '✦ Save & get Claude\'s physiological analysis'}
          </StrideBtn>
        </GlowCard>

        {(loading || analysis) && (
          <AiBox label="Claude Sonnet · physiological analysis">
            {loading ? <><DotPulse /> <span style={{ marginLeft: 8, color: '#4b5563' }}>Reading your full profile...</span></> : analysis}
          </AiBox>
        )}
      </div>
    </AppShell>
  )
}
