import type { Session, DayStats } from '../types'

export function getDateKey(isoString: string): string {
  return isoString.split('T')[0]
}

function emptyDayStats(date: string): DayStats {
  return { date, focusMinutes: 0, breakMinutes: 0, sessionsCompleted: 0 }
}

export function aggregateByDay(sessions: Session[]): Map<string, DayStats> {
  const map = new Map<string, DayStats>()
  for (const s of sessions) {
    const date = getDateKey(s.completedAt)
    const entry = map.get(date) ?? emptyDayStats(date)
    const minutes = Math.round(s.duration / 60)
    if (s.type === 'focus') {
      entry.focusMinutes += minutes
      entry.sessionsCompleted += 1
    } else {
      entry.breakMinutes += minutes
    }
    map.set(date, entry)
  }
  return map
}

export function getLast7Days(): string[] {
  const days: string[] = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export function getWeeklyStats(sessions: Session[]): DayStats[] {
  const byDay = aggregateByDay(sessions)
  const days = getLast7Days()
  return days.map((date) => byDay.get(date) ?? emptyDayStats(date))
}

export function getTotalFocusMinutes(sessions: Session[]): number {
  return sessions
    .filter((s) => s.type === 'focus')
    .reduce((sum, s) => sum + Math.round(s.duration / 60), 0)
}

export function getTotalSessions(sessions: Session[]): number {
  return sessions.filter((s) => s.type === 'focus').length
}

export function getStreak(sessions: Session[]): number {
  const byDay = aggregateByDay(sessions)
  let streak = 0
  const now = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const entry = byDay.get(key)
    if (entry && entry.sessionsCompleted > 0) {
      streak++
    } else if (i > 0) {
      break
    }
    // i === 0: today might not have sessions yet, skip
  }
  return streak
}

export function getTodayStats(sessions: Session[]): DayStats {
  const today = new Date().toISOString().split('T')[0]
  const byDay = aggregateByDay(sessions)
  return byDay.get(today) ?? emptyDayStats(today)
}
