import { usePomodoroStore } from '../store/pomodoroStore'
import { minutesToSeconds } from '../utils/time'
import type { SessionType } from '../types'

export function usePomodoro() {
  const {
    timerStatus,
    timeRemaining,
    currentSessionType,
    focusCount,
    settings,
    start,
    pause,
    reset,
    skip,
  } = usePomodoroStore()

  const totalDuration = getDurationForType(currentSessionType, settings)
  const progress = totalDuration > 0 ? (totalDuration - timeRemaining) / totalDuration : 0

  return {
    timerStatus,
    timeRemaining,
    currentSessionType,
    focusCount,
    settings,
    progress,
    totalDuration,
    start,
    pause,
    reset,
    skip,
  }
}

function getDurationForType(
  type: SessionType,
  settings: { focusDuration: number; shortBreakDuration: number; longBreakDuration: number }
): number {
  switch (type) {
    case 'focus':
      return minutesToSeconds(settings.focusDuration)
    case 'shortBreak':
      return minutesToSeconds(settings.shortBreakDuration)
    case 'longBreak':
      return minutesToSeconds(settings.longBreakDuration)
  }
}
