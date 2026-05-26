'use client'
import { useState, useRef, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import { GlowCard, DotPulse, StrideBtn } from '@/components/ui'
import { useStrideStore, athleteContextString } from '@/lib/store'
import { askClaude, COACH_SYSTEM } from '@/lib/claude'

interface Msg { role: 'user' | 'assistant'; content: string }

const quickPrompts = [
  { label: 'Low HRV today', prompt: 'My HRV dropped to 52ms this morning — should I still do the hard interval session or swap it for an easy run?' },
  { label: 'Race readiness?', prompt: 'Based on my recent training data and physiology, what\'s my realistic 10K time if I raced this weekend?' },
  { label: 'VO2max meaning', prompt: 'What does my VO2max tell you about my aerobic ceiling and long-term potential as a runner?' },
  { label: 'Easy pace', prompt: 'Why do coaches insist on keeping easy runs so slow? My easy pace feels embarrassingly slow.' },
  { label: 'Knee tight', prompt: 'My left knee has been tight after long runs again. What should I do in the short term and long term?' },
  { label: 'Next race goal', prompt: 'Given my current fitness trajectory, what should my next race goal be after the 10K?' },
]

export default function Coach() {
  const { profile, runs } = useStrideStore()
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const histRef = useRef<Msg[]>([])

  useEffect(() => {
    const ctx = athleteContextString(profile, runs)
    const opening = `Hey ${profile.name.split(' ')[0]}. I've read your full profile — RHR ${profile.rhr}bpm, HRV ${profile.hrv}ms (${profile.hrv < profile.hrvBaseline - 5 ? `${profile.hrvBaseline - profile.hrv}ms below your ${profile.hrvBaseline}ms baseline — some fatigue present` : 'near your baseline, good recovery'}), VO2max ${profile.vo2max}. Your aerobic base is ${profile.vo2max > 50 ? 'solid' : 'developing well'}. What do you want to work through today?`
    setMsgs([{ role: 'assistant', content: opening }])
    histRef.current = [{ role: 'assistant', content: opening }]
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  async function send(text?: string) {
    const message = (text || input).trim()
    if (!message) return
    setInput('')

    const userMsg: Msg = { role: 'user', content: message }
    setMsgs(m => [...m, userMsg])
    histRef.current = [...histRef.current, userMsg]
    setLoading(true)

    const ctx = athleteContextString(profile, runs)
    const sys = COACH_SYSTEM(ctx)

    try {
      const reply = await askClaude(histRef.current, sys)
      const aiMsg: Msg = { role: 'assistant', content: reply }
      setMsgs(m => [...m, aiMsg])
      histRef.current = [...histRef.current, aiMsg]
    } catch {
      const err: Msg = { role: 'assistant', content: 'Could not reach Claude — check your API key.' }
      setMsgs(m => [...m, err])
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflow: 'hidden' }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 500, color: '#e6edf3' }}>AI coach</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Claude Sonnet · reads your full profile, history, and physiology before every answer</div>
        </div>

        {/* Context bar */}
        <div style={{ background: '#111827', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #1f2937' }}>
          <span style={{ color: '#2563a8' }}>◈</span>
          Claude knows: RHR {profile.rhr}bpm · HRV {profile.hrv}ms ({profile.hrv < profile.hrvBaseline ? 'below' : 'at'} baseline) · VO2max {profile.vo2max} · {runs.length} runs logged · {profile.injuries !== 'None' ? `Injuries: ${profile.injuries.slice(0, 40)}…` : 'No injuries flagged'}
        </div>

        <GlowCard style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', minHeight: 0 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12, overflowY: 'auto', minHeight: 200 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                {m.role === 'assistant' && (
                  <div style={{ fontSize: 10, color: '#4b5563', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: '#2563a8' }}>✦</span> Claude Sonnet
                  </div>
                )}
                <div className={m.role === 'user' ? 'chat-user' : 'chat-ai'}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                <div style={{ fontSize: 10, color: '#4b5563', marginBottom: 3 }}>✦ Claude Sonnet</div>
                <div className="chat-ai"><DotPulse /></div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
            {quickPrompts.map(q => (
              <button
                key={q.label}
                onClick={() => send(q.prompt)}
                disabled={loading}
                style={{
                  padding: '5px 10px', borderRadius: 20, fontSize: 11,
                  border: '1px solid #1f2937', background: 'transparent',
                  color: '#6b7280', cursor: 'pointer', transition: 'all .15s',
                }}
                onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = '#2563a8'; (e.target as HTMLButtonElement).style.color = '#93c5fd' }}
                onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = '#1f2937'; (e.target as HTMLButtonElement).style.color = '#6b7280' }}
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="stride-input"
              style={{ flex: 1 }}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && send()}
              placeholder="Ask Claude anything about your training..."
              disabled={loading}
            />
            <StrideBtn onClick={() => send()} disabled={loading || !input.trim()}>
              {loading ? <DotPulse /> : '→'}
            </StrideBtn>
          </div>
        </GlowCard>
      </div>
    </AppShell>
  )
}
