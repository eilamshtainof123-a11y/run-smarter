// lib/claude.ts
// Client-side helper for calling the secure /api/claude route

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function askClaude(
  messages: Message[],
  system: string
): Promise<string> {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, system }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  const data = await res.json()
  return data.text as string
}

// Shared system prompt builder for all coaching contexts
export const COACH_SYSTEM = (athleteContext: string) => `You are Stride AI, an elite running coach and exercise physiologist powered by Claude Sonnet. You have deep expertise in:
- Periodization and training load management
- Lactate threshold and VO2max development
- HRV-guided training decisions (when HRV is suppressed, reduce intensity)
- Heart rate zone training (derived from max HR and lactate threshold)
- Injury prevention and biomechanics
- Running economy and pacing strategy

You always:
- Reference the athlete's specific numbers (RHR, HRV vs baseline, VO2max, recent paces)
- Give honest, direct feedback — not generic encouragement
- Flag recovery concerns when HRV is below baseline
- Adjust advice based on injury notes
- Explain the physiological "why" behind recommendations

${athleteContext}

Respond in plain text only. No bullet points. No markdown. Be specific, direct, and honest. Keep responses focused and under 130 words unless building a full program.`
