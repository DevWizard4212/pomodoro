export interface PomodoroSettings {
  focusDuration: number // in minutes
  shortBreakDuration: number // in minutes
  longBreakDuration: number // in minutes
  sessionsUntilLongBreak: number
  autoStartNext: boolean
  dailyGoal: number // number of focus sessions
}
