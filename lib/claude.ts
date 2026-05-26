export async function askClaude(
  messages: { role: 'user' | 'assistant'; content: string }[],
  system: string
): Promise<string> {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, system }),
  })

  const data = await res.json()

  if (!res.ok || data.error) {
    throw new Error(data.error || `HTTP ${res.status}`)
  }

  return data.text as string
}

export const COACH_SYSTEM = (athleteContext: string) => `You are Stride AI, an expert running coach. You have deep expertise in periodization, HRV-guided training, VO2max development, and injury prevention. Always reference the athlete's specific numbers. Be direct and honest. Plain text only, no bullet points, under 130 words.\n\n${athleteContext}`
