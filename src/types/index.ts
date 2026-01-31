export type SessionType = 'focus' | 'shortBreak' | 'longBreak'

export interface Session {
  id: string
  type: SessionType
  duration: number // in seconds
  completedAt: string // ISO date string
}

export interface PomodoroSettings {
  focusDuration: number // in minutes
  shortBreakDuration: number // in minutes
  longBreakDuration: number // in minutes
  sessionsUntilLongBreak: number
  autoStartNext: boolean
  dailyGoal: number // number of focus sessions
}

export interface DayStats {
  date: string // YYYY-MM-DD
  focusMinutes: number
  breakMinutes: number
  sessionsCompleted: number
}

export type TimerStatus = 'idle' | 'running' | 'paused'

export type View = 'timer' | 'stats' | 'settings'
