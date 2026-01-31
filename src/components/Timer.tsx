import { usePomodoro } from '../hooks/usePomodoro'
import { formatTime } from '../utils/time'

const RADIUS = 120
const STROKE = 8
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const SIZE = (RADIUS + STROKE) * 2

const typeColors = {
  focus: '#ef4444',
  shortBreak: '#22c55e',
  longBreak: '#3b82f6',
}

export function Timer() {
  const { timeRemaining, progress, currentSessionType } = usePomodoro()
  const offset = CIRCUMFERENCE * (1 - progress)
  const color = typeColors[currentSessionType]

  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle
            cx={RADIUS + STROKE}
            cy={RADIUS + STROKE}
            r={RADIUS}
            fill="none"
            stroke="#1e293b"
            strokeWidth={STROKE}
          />
          <circle
            cx={RADIUS + STROKE}
            cy={RADIUS + STROKE}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-mono font-bold text-white tracking-wider">
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>
    </div>
  )
}
