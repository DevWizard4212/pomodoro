import { create } from 'zustand'
import type { PomodoroSettings, SessionType, TimerStatus, View } from '../types'
import { loadFromStorage, saveToStorage } from '../utils/storage'
import { minutesToSeconds } from '../utils/time'

const SETTINGS_KEY = 'pomodoro-settings'

const defaultSettings: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  autoStartNext: false,
  dailyGoal: 8,
}

interface PomodoroState {
  // Timer
  timerStatus: TimerStatus
  timeRemaining: number // seconds
  currentSessionType: SessionType
  focusCount: number // how many focus sessions completed in current cycle

  // Navigation
  view: View

  // Data
  settings: PomodoroSettings

  // Actions
  setView: (view: View) => void
  start: () => void
  pause: () => void
  reset: () => void
  skip: () => void
  tick: () => void
  completeSession: () => void
  updateSettings: (settings: Partial<PomodoroSettings>) => void
}

function getDurationForType(type: SessionType, settings: PomodoroSettings): number {
  switch (type) {
    case 'focus':
      return minutesToSeconds(settings.focusDuration)
    case 'shortBreak':
      return minutesToSeconds(settings.shortBreakDuration)
    case 'longBreak':
      return minutesToSeconds(settings.longBreakDuration)
  }
}

function getNextSessionType(
  current: SessionType,
  focusCount: number,
  sessionsUntilLongBreak: number
): SessionType {
  if (current === 'focus') {
    return focusCount >= sessionsUntilLongBreak ? 'longBreak' : 'shortBreak'
  }
  return 'focus'
}

export const usePomodoroStore = create<PomodoroState>((set, get) => {
  const savedSettings = loadFromStorage<PomodoroSettings>(SETTINGS_KEY, defaultSettings)

  return {
    timerStatus: 'idle',
    timeRemaining: getDurationForType('focus', savedSettings),
    currentSessionType: 'focus',
    focusCount: 0,
    view: 'timer',
    settings: savedSettings,

    setView: (view) => set({ view }),

    start: () => set({ timerStatus: 'running' }),

    pause: () => set({ timerStatus: 'paused' }),

    reset: () => {
      const { currentSessionType, settings } = get()
      set({
        timerStatus: 'idle',
        timeRemaining: getDurationForType(currentSessionType, settings),
      })
    },

    skip: () => {
      const { currentSessionType, focusCount, settings } = get()
      const nextType = getNextSessionType(
        currentSessionType,
        focusCount,
        settings.sessionsUntilLongBreak
      )
      const newFocusCount =
        currentSessionType === 'focus' ? focusCount : focusCount
      set({
        timerStatus: 'idle',
        currentSessionType: nextType,
        timeRemaining: getDurationForType(nextType, settings),
        focusCount: nextType === 'focus' && currentSessionType === 'longBreak' ? 0 : newFocusCount,
      })
    },

    tick: () => {
      const { timeRemaining } = get()
      if (timeRemaining <= 1) {
        get().completeSession()
      } else {
        set({ timeRemaining: timeRemaining - 1 })
      }
    },

    completeSession: () => {
      const { currentSessionType, focusCount, settings } = get()

      const newFocusCount = currentSessionType === 'focus' ? focusCount + 1 : focusCount
      const nextType = getNextSessionType(
        currentSessionType,
        newFocusCount,
        settings.sessionsUntilLongBreak
      )
      const resetFocusCount = nextType === 'focus' && currentSessionType === 'longBreak' ? 0 : newFocusCount

      set({
        currentSessionType: nextType,
        timeRemaining: getDurationForType(nextType, settings),
        focusCount: resetFocusCount,
        timerStatus: settings.autoStartNext ? 'running' : 'idle',
      })
    },

    updateSettings: (partial) => {
      const newSettings = { ...get().settings, ...partial }
      saveToStorage(SETTINGS_KEY, newSettings)
      const { timerStatus, currentSessionType } = get()
      const updates: Partial<PomodoroState> = { settings: newSettings }
      if (timerStatus === 'idle') {
        updates.timeRemaining = getDurationForType(currentSessionType, newSettings)
      }
      set(updates)
    },
  }
})
