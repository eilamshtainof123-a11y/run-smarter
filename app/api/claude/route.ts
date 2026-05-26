import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages, system } = await req.json()

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `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`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        messages: [
          { role: 'system', content: system || 'You are Stride AI, an expert running coach.' },
          ...messages,
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: JSON.stringify(data) }, { status: 500 })
    }

    const text = data.choices?.[0]?.message?.content
    if (!text) {
      return NextResponse.json({ error: JSON.stringify(data) }, { status: 500 })
    }

    return NextResponse.json({ text })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
