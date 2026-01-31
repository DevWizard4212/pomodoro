import { usePomodoro } from '../hooks/usePomodoro'

export function Controls() {
  const { timerStatus, start, pause, reset, skip } = usePomodoro()

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      {timerStatus === 'running' ? (
        <button
          onClick={pause}
          className="px-8 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold text-lg transition-colors cursor-pointer"
        >
          Pause
        </button>
      ) : (
        <button
          onClick={start}
          className="px-8 py-3 rounded-lg bg-red-500 hover:bg-red-400 text-white font-semibold text-lg transition-colors cursor-pointer"
        >
          {timerStatus === 'paused' ? 'Resume' : 'Start'}
        </button>
      )}
      <button
        onClick={reset}
        className="px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium transition-colors cursor-pointer"
      >
        Reset
      </button>
      <button
        onClick={skip}
        className="px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium transition-colors cursor-pointer"
      >
        Skip
      </button>
    </div>
  )
}
