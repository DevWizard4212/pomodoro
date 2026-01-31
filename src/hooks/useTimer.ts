import { useEffect, useRef } from 'react'
import { usePomodoroStore } from '../store/pomodoroStore'

export function useTimer() {
  const timerStatus = usePomodoroStore((s) => s.timerStatus)
  const tick = usePomodoroStore((s) => s.tick)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (timerStatus === 'running') {
      intervalRef.current = window.setInterval(() => {
        tick()
      }, 1000)
    }
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [timerStatus, tick])
}
