export type SessionType = 'focus' | 'shortBreak' | 'longBreak'

export interface Session {
  id: string
  type: SessionType
  duration: number // in seconds
  completedAt: string // ISO date string
}
