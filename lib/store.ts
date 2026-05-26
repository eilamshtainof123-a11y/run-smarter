// lib/store.ts
// Central Zustand store — all athlete data, workouts, and plan state

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type WorkoutType = 'easy' | 'tempo' | 'interval' | 'long' | 'race' | 'rest'

export interface Run {
  id: string
  date: string          // ISO string
  type: WorkoutType
  name: string
  distanceKm: number
  durationMin: number
  avgPace: string       // "5:12"
  avgHR: number
  maxHR: number
  cadence: number
  rpe: number
  sleepHrs: number
  todayHRV: number
  legFeel: 'Fresh' | 'Normal' | 'Heavy' | 'Very tired'
  notes: string
  aiReview?: string
}

export interface AthleteProfile {
  name: string
  dob: string
  weightKg: number
  heightCm: number
  gender: string
  rhr: number           // resting heart rate
  hrv: number           // current HRV (RMSSD ms)
  hrvBaseline: number   // 4-week rolling average
  vo2max: number
  maxHR: number
  ltHR: number          // lactate threshold HR
  background: string
  otherSport: string
  shoeMileageKm: number
  injuries: string
  goals: string
  daysPerWeek: number
}

export interface PlanWeek {
  week: number
  title: string
  sessions: PlanSession[]
}

export interface PlanSession {
  day: string
  type: WorkoutType
  name: string
  description: string
  targetPace?: string
  targetHR?: string
  distanceKm?: number
  done: boolean
}

interface StrideState {
  profile: AthleteProfile
  runs: Run[]
  plan: PlanWeek[]
  currentWeek: number
  totalWeeks: number
  goalName: string

  setProfile: (p: Partial<AthleteProfile>) => void
  addRun: (r: Run) => void
  updateRunReview: (id: string, review: string) => void
  setPlan: (weeks: PlanWeek[]) => void
  markSessionDone: (week: number, day: string) => void
  setGoal: (name: string, total: number) => void
}

const defaultProfile: AthleteProfile = {
  name: 'Athlete',
  dob: '1997-01-01',
  weightKg: 70,
  heightCm: 175,
  gender: 'Male',
  rhr: 52,
  hrv: 65,
  hrvBaseline: 70,
  vo2max: 45,
  maxHR: 190,
  ltHR: 165,
  background: 'Recreational runner',
  otherSport: 'None',
  shoeMileageKm: 0,
  injuries: 'None',
  goals: 'Run a 10K',
  daysPerWeek: 4,
}

const sampleRuns: Run[] = [
  { id: '1', date: new Date(Date.now() - 1 * 86400000).toISOString(), type: 'interval', name: 'Interval session', distanceKm: 10, durationMin: 65, avgPace: '4:22', avgHR: 172, maxHR: 185, cadence: 178, rpe: 9, sleepHrs: 7.5, todayHRV: 60, legFeel: 'Normal', notes: 'Solid. Reps 1–4 felt strong. Reps 5–6 tough but held form.' },
  { id: '2', date: new Date(Date.now() - 3 * 86400000).toISOString(), type: 'easy', name: 'Easy run', distanceKm: 5, durationMin: 29, avgPace: '5:52', avgHR: 138, maxHR: 151, cadence: 170, rpe: 5, sleepHrs: 8, todayHRV: 68, legFeel: 'Fresh', notes: 'Very comfortable throughout.' },
  { id: '3', date: new Date(Date.now() - 4 * 86400000).toISOString(), type: 'tempo', name: 'Tempo run', distanceKm: 6, durationMin: 29, avgPace: '4:48', avgHR: 165, maxHR: 174, cadence: 176, rpe: 8, sleepHrs: 7, todayHRV: 64, legFeel: 'Normal', notes: 'Best tempo in weeks. Even splits throughout.' },
  { id: '4', date: new Date(Date.now() - 6 * 86400000).toISOString(), type: 'easy', name: 'Easy run', distanceKm: 8, durationMin: 45, avgPace: '5:38', avgHR: 142, maxHR: 155, cadence: 171, rpe: 5, sleepHrs: 7.5, todayHRV: 72, legFeel: 'Fresh', notes: 'Easy aerobic. Legs fresh after rest day.' },
  { id: '5', date: new Date(Date.now() - 8 * 86400000).toISOString(), type: 'interval', name: 'Interval session', distanceKm: 9, durationMin: 58, avgPace: '4:28', avgHR: 175, maxHR: 187, cadence: 179, rpe: 9, sleepHrs: 6.5, todayHRV: 58, legFeel: 'Heavy', notes: 'Completed all 6 reps. Reps 4–5 very hard. Tired from work this week.' },
  { id: '6', date: new Date(Date.now() - 10 * 86400000).toISOString(), type: 'easy', name: 'Easy run', distanceKm: 5, durationMin: 30, avgPace: '5:58', avgHR: 135, maxHR: 148, cadence: 169, rpe: 4, sleepHrs: 8.5, todayHRV: 74, legFeel: 'Fresh', notes: 'Very easy recovery run.' },
  { id: '7', date: new Date(Date.now() - 11 * 86400000).toISOString(), type: 'tempo', name: 'Tempo run', distanceKm: 6, durationMin: 30, avgPace: '4:57', avgHR: 163, maxHR: 172, cadence: 174, rpe: 8, sleepHrs: 7, todayHRV: 66, legFeel: 'Normal', notes: 'Good effort. Slight fade in last km — 4:57 avg.' },
  { id: '8', date: new Date(Date.now() - 13 * 86400000).toISOString(), type: 'long', name: 'Long run', distanceKm: 13, durationMin: 79, avgPace: '6:04', avgHR: 145, maxHR: 158, cadence: 170, rpe: 7, sleepHrs: 8, todayHRV: 70, legFeel: 'Normal', notes: 'Comfortable throughout. Could have gone longer.' },
]

const defaultPlan: PlanWeek[] = [
  {
    week: 6, title: 'Week 6 — Building intensity',
    sessions: [
      { day: 'Monday', type: 'easy', name: 'Easy run 8km', description: 'Zone 2 aerobic base — HR 130–145bpm. Builds mitochondrial density.', targetPace: '5:30–5:50', targetHR: '130–145', distanceKm: 8, done: true },
      { day: 'Tuesday', type: 'rest', name: 'Rest + mobility', description: '10 min hip flexor work. Foam roll calves and quads.', done: true },
      { day: 'Wednesday', type: 'tempo', name: 'Tempo run 6km', description: 'Lactate threshold pace — HR ~165–170bpm. Trains the body to clear lactate faster.', targetPace: '4:45–4:55', targetHR: '165–170', distanceKm: 6, done: true },
      { day: 'Thursday', type: 'easy', name: 'Easy run 5km', description: 'Pure recovery. Promotes blood flow without adding training stress.', targetPace: '5:45–6:00', targetHR: '125–140', distanceKm: 5, done: true },
      { day: 'Friday', type: 'rest', name: 'Rest', description: 'Full rest before back-to-back hard weekend sessions.', done: true },
      { day: 'Saturday', type: 'interval', name: '6×800m intervals', description: 'VO2max stimulus. 90s standing rest between reps. Trains top-end aerobic capacity.', targetPace: '4:18–4:25', targetHR: '175–185', distanceKm: 10, done: true },
      { day: 'Sunday', type: 'long', name: 'Long run 15km', description: 'Builds aerobic endurance base. Conversational pace — HR must stay under 150.', targetPace: '5:45–6:05', targetHR: '135–150', distanceKm: 15, done: false },
    ],
  },
]

export const useStrideStore = create<StrideState>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      runs: sampleRuns,
      plan: defaultPlan,
      currentWeek: 6,
      totalWeeks: 12,
      goalName: 'Sub-50 min 10K',

      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      addRun: (r) => set((s) => ({ runs: [r, ...s.runs] })),
      updateRunReview: (id, review) =>
        set((s) => ({ runs: s.runs.map((r) => (r.id === id ? { ...r, aiReview: review } : r)) })),
      setPlan: (weeks) => set({ plan: weeks }),
      markSessionDone: (week, day) =>
        set((s) => ({
          plan: s.plan.map((w) =>
            w.week === week
              ? { ...w, sessions: w.sessions.map((sess) => sess.day === day ? { ...sess, done: true } : sess) }
              : w
          ),
        })),
      setGoal: (name, total) => set({ goalName: name, totalWeeks: total }),
    }),
    { name: 'stride-storage' }
  )
)

// Helpers
export function athleteContextString(profile: AthleteProfile, runs: Run[]): string {
  const recent = runs.slice(0, 5)
  return `ATHLETE PROFILE:
Name: ${profile.name}, Age: ${new Date().getFullYear() - new Date(profile.dob).getFullYear()}, Weight: ${profile.weightKg}kg, Height: ${profile.heightCm}cm, Gender: ${profile.gender}

PHYSIOLOGY:
- RHR: ${profile.rhr}bpm (${profile.rhr < 50 ? 'excellent — indicates high aerobic fitness' : profile.rhr < 60 ? 'good aerobic base' : 'average'})
- HRV (RMSSD): ${profile.hrv}ms (4-week baseline: ${profile.hrvBaseline}ms — currently ${profile.hrv < profile.hrvBaseline - 5 ? `${profile.hrvBaseline - profile.hrv}ms BELOW baseline, indicating accumulated fatigue, recommend reducing intensity` : profile.hrv > profile.hrvBaseline + 5 ? 'ABOVE baseline, well recovered, can handle hard training' : 'near baseline, moderate recovery'})
- VO2max: ${profile.vo2max} ml/kg/min (${profile.vo2max > 55 ? 'excellent' : profile.vo2max > 48 ? 'good — aerobically capable of competitive times' : profile.vo2max > 40 ? 'average' : 'developing'})
- Max HR: ${profile.maxHR}bpm
- Lactate Threshold HR: ${profile.ltHR}bpm (${Math.round(profile.ltHR / profile.maxHR * 100)}% of max HR)
- Derived HR zones: Z1 easy <${Math.round(profile.maxHR * 0.72)}bpm, Z2 aerobic ${Math.round(profile.maxHR * 0.72)}–${Math.round(profile.maxHR * 0.82)}bpm, Z3 tempo ${Math.round(profile.maxHR * 0.82)}–${Math.round(profile.maxHR * 0.87)}bpm, Z4 threshold ${Math.round(profile.maxHR * 0.87)}–${Math.round(profile.maxHR * 0.93)}bpm, Z5 VO2max >${Math.round(profile.maxHR * 0.93)}bpm

BACKGROUND: ${profile.background}, prior sport: ${profile.otherSport}
INJURY NOTES: ${profile.injuries}
GOALS: ${profile.goals}
SHOE MILEAGE: ${profile.shoeMileageKm}km (replace at ~600km — ${profile.shoeMileageKm > 500 ? 'OVERDUE' : profile.shoeMileageKm > 400 ? 'approaching replacement' : 'fine'})

RECENT RUNS (last ${recent.length}):
${recent.map((r) => `- ${r.date.slice(0, 10)} ${r.name}: ${r.distanceKm}km @ ${r.avgPace}/km, HR ${r.avgHR}bpm, RPE ${r.rpe}/10`).join('\n')}`
}

export const typeColors: Record<WorkoutType, string> = {
  easy: '#3fb950',
  tempo: '#d29922',
  interval: '#a78bfa',
  long: '#58a6ff',
  race: '#f87171',
  rest: '#4b5563',
}

export const typePillClass: Record<WorkoutType, string> = {
  easy: 'pill-easy',
  tempo: 'pill-tempo',
  interval: 'pill-interval',
  long: 'pill-long',
  race: 'pill-race',
  rest: 'pill-rest',
}
