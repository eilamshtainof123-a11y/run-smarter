export async function askClaude(
  messages: { role: 'user' | 'assistant'; content: string }[],
  system: string
): Promise<string> {
  try {
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, system }),
    })

    const text = await res.text()
    
    let data
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(`Invalid response: ${text.slice(0, 200)}`)
    }

    if (!res.ok || data.error) {
      throw new Error(data.error || `HTTP ${res.status}`)
    }

    return data.text as string
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    throw new Error(message)
  }
}

export const COACH_SYSTEM = (athleteContext: string) => `You are Stride AI, an expert running coach. Be direct, specific, honest. Plain text only, no bullet points, under 130 words.\n\n${athleteContext}`
