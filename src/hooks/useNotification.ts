import { useEffect, useRef } from 'react'
import { usePomodoroStore } from '../store/pomodoroStore'
import type { SessionType } from '../types'

const sessionLabels: Record<SessionType, string> = {
  focus: 'Focus session',
  shortBreak: 'Short break',
  longBreak: 'Long break',
}

function playBeep() {
  try {
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.frequency.value = 660
    oscillator.type = 'sine'
    gain.gain.value = 0.3
    oscillator.start()
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    oscillator.stop(ctx.currentTime + 0.8)
  } catch {
    // AudioContext not available
  }
}

export function useNotification() {
  const currentSessionType = usePomodoroStore((s) => s.currentSessionType)
  const timerStatus = usePomodoroStore((s) => s.timerStatus)
  const prevSessionRef = useRef(currentSessionType)
  const wasRunningRef = useRef(false)

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Detect session transition (type changes while timer was running -> session completed)
  useEffect(() => {
    if (prevSessionRef.current !== currentSessionType && wasRunningRef.current) {
      const completedType = prevSessionRef.current
      const nextType = currentSessionType

      playBeep()

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Pomodoro Timer', {
          body: `${sessionLabels[completedType]} complete! Next: ${sessionLabels[nextType]}`,
          icon: '/vite.svg',
        })
      }
    }
    prevSessionRef.current = currentSessionType
  }, [currentSessionType])

  useEffect(() => {
    wasRunningRef.current = timerStatus === 'running'
  }, [timerStatus])
}
