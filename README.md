# Stride — AI Running Tracker

Dark athletic running tracker powered by **Claude Sonnet**. Log workouts, get precise AI coaching, and build science-based training programs.

## Features

- **Dashboard** — weekly stats, pace trend chart, AI weekly review
- **Training plan** — structured week-by-week program with session details
- **Log workout** — detailed form with HR, HRV, cadence, RPE; instant Claude review
- **Run history** — all logged runs with expandable stats and per-run AI review
- **Generate plan** — Claude builds a periodized program from your physiology
- **AI coach** — full chat with context awareness of your entire profile
- **Athlete profile** — RHR, HRV, VO2max, injuries, goals; Claude physiological analysis

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add your API key

```bash
cp .env.local.example .env.local
```

Open `.env.local` and add your Anthropic API key:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get a free key at [console.anthropic.com](https://console.anthropic.com).

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel (recommended — free)

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add environment variable: `ANTHROPIC_API_KEY` = your key
4. Click Deploy

Your app will be live at `https://your-project.vercel.app`.

---

## Add a Database (optional — for multi-user / persistence)

By default, workout data is stored in **localStorage** via Zustand persist. This works great for a personal app.

For production with multiple users, replace the Zustand persist middleware with **Supabase**:

### Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run these SQL migrations:

```sql
-- Athlete profiles
create table profiles (
  id uuid references auth.users primary key,
  data jsonb not null default '{}',
  updated_at timestamp with time zone default now()
);

-- Workout runs
create table runs (
  id text primary key,
  user_id uuid references auth.users not null,
  data jsonb not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table profiles enable row level security;
alter table runs enable row level security;

create policy "Users own their profile" on profiles for all using (auth.uid() = id);
create policy "Users own their runs" on runs for all using (auth.uid() = user_id);
```

3. Install: `npm install @supabase/supabase-js`
4. Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```
5. Replace the Zustand `persist` middleware with Supabase reads/writes in `lib/store.ts`

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| AI | Anthropic Claude Sonnet via `@anthropic-ai/sdk` |
| State | Zustand with localStorage persistence |
| Styling | Tailwind CSS + custom CSS variables |
| Charts | Recharts |
| Deployment | Vercel |

---

## Project structure

```
stride/
├── app/
│   ├── page.tsx          # Dashboard
│   ├── plan/page.tsx     # Training plan
│   ├── log/page.tsx      # Log workout
│   ├── history/page.tsx  # Run history
│   ├── generate/page.tsx # Generate plan with AI
│   ├── coach/page.tsx    # AI coach chat
│   ├── profile/page.tsx  # Athlete profile
│   ├── settings/page.tsx # Settings
│   └── api/claude/route.ts  # Secure Claude API route
├── components/
│   ├── ui/index.tsx      # Reusable dark UI components
│   └── layout/           # Sidebar, AppShell
├── lib/
│   ├── store.ts          # Zustand store + athlete context builder
│   └── claude.ts         # Claude client + system prompt builder
└── .env.local.example    # API key template
```

---

## AI system design

Every Claude call passes a structured **athlete context block** built from the profile:
- RHR, HRV vs baseline deviation, VO2max, max HR, lactate threshold
- Derived HR zones (Z1–Z5) calculated from physiology
- Recent 5 runs with pace, HR, and RPE
- Injury notes and goals

This means Claude's answers are always specific to your data — not generic advice.

---

## License

MIT
