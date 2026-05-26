

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages, system } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyB-TNt_UteZX11nitB4lX0YcdMwOkmPw0k'

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system || 'You are a helpful assistant.' }] },
        contents,
        generationConfig: { maxOutputTokens: 1000 },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: `Gemini error: ${JSON.stringify(data)}` }, { status: 500 })
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      return NextResponse.json({ error: `Empty: ${JSON.stringify(data)}` }, { status: 500 })
    }

    return NextResponse.json({ text })

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
