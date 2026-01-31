import { usePomodoro } from '../hooks/usePomodoro'
import type { SessionType } from '../types'

const sessionLabels: Record<SessionType, string> = {
  focus: 'Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
}

const sessionColors: Record<SessionType, string> = {
  focus: 'text-red-400',
  shortBreak: 'text-green-400',
  longBreak: 'text-blue-400',
}

export function SessionInfo() {
  const { currentSessionType, focusCount, settings } = usePomodoro()

  return (
    <div className="text-center mt-6 space-y-1">
      <p className={`text-xl font-semibold ${sessionColors[currentSessionType]}`}>
        {sessionLabels[currentSessionType]}
      </p>
      <p className="text-sm text-slate-400">
        Session {focusCount} / {settings.sessionsUntilLongBreak}
      </p>
    </div>
  )
}
