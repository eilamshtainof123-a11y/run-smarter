'use client'
import AppShell from '@/components/layout/AppShell'
import { GlowCard, SectionHd } from '@/components/ui'

export default function Settings() {
  return (
    <AppShell>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflowY: 'auto' }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 500, color: '#e6edf3' }}>Settings</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>App configuration and preferences</div>
        </div>

        <GlowCard>
          <SectionHd>AI model</SectionHd>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
            <div>
              <div style={{ fontSize: 13, color: '#e6edf3', fontWeight: 500 }}>Claude Sonnet</div>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>claude-sonnet-4-20250514 · Best free option for coaching-grade reasoning</div>
            </div>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: '#14291d', color: '#3fb950' }}>Active</span>
          </div>
        </GlowCard>

        <GlowCard>
          <SectionHd>API configuration</SectionHd>
          <div style={{ background: '#111827', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#6b7280', lineHeight: 1.7, fontFamily: 'monospace' }}>
            <div style={{ color: '#4b5563', marginBottom: 6, fontFamily: 'inherit', fontSize: 11 }}>Add your API key to .env.local:</div>
            ANTHROPIC_API_KEY=sk-ant-...
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: '#4b5563', lineHeight: 1.6 }}>
            Get a free key at <span style={{ color: '#58a6ff' }}>console.anthropic.com</span>. The key stays on your server — never exposed to the browser.
          </div>
        </GlowCard>

        <GlowCard>
          <SectionHd>Deployment</SectionHd>
          <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.8 }}>
            <div><span style={{ color: '#e6edf3', fontWeight: 500 }}>Vercel (recommended):</span> Push to GitHub → import to Vercel → add ANTHROPIC_API_KEY env var → deploy</div>
            <div style={{ marginTop: 8 }}><span style={{ color: '#e6edf3', fontWeight: 500 }}>Local:</span> npm install → cp .env.local.example .env.local → add key → npm run dev</div>
          </div>
        </GlowCard>

        <GlowCard>
          <SectionHd>Data storage</SectionHd>
          <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
            All workout and profile data is stored locally in your browser via <span style={{ color: '#e6edf3' }}>localStorage</span> (Zustand persist). For production, replace the Zustand persist middleware with a database (Supabase, PlanetScale, or Neon all work great with Next.js). See the README for a full database migration guide.
          </div>
        </GlowCard>
      </div>
    </AppShell>
  )
}
