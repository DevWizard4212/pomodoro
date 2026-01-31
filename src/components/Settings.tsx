import { usePomodoroStore } from '../store/pomodoroStore'

export function Settings() {
  const settings = usePomodoroStore((s) => s.settings)
  const updateSettings = usePomodoroStore((s) => s.updateSettings)

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-white">Settings</h2>

      <NumberField
        label="Focus duration (min)"
        value={settings.focusDuration}
        onChange={(v) => updateSettings({ focusDuration: v })}
        min={1}
        max={120}
      />
      <NumberField
        label="Short break (min)"
        value={settings.shortBreakDuration}
        onChange={(v) => updateSettings({ shortBreakDuration: v })}
        min={1}
        max={60}
      />
      <NumberField
        label="Long break (min)"
        value={settings.longBreakDuration}
        onChange={(v) => updateSettings({ longBreakDuration: v })}
        min={1}
        max={60}
      />
      <NumberField
        label="Sessions until long break"
        value={settings.sessionsUntilLongBreak}
        onChange={(v) => updateSettings({ sessionsUntilLongBreak: v })}
        min={2}
        max={10}
      />
      <NumberField
        label="Daily goal (focus sessions)"
        value={settings.dailyGoal}
        onChange={(v) => updateSettings({ dailyGoal: v })}
        min={1}
        max={20}
      />

      <div className="flex items-center justify-between py-2">
        <span className="text-slate-300">Auto-start next session</span>
        <button
          onClick={() => updateSettings({ autoStartNext: !settings.autoStartNext })}
          className={`w-12 h-6 rounded-full transition-colors cursor-pointer relative ${
            settings.autoStartNext ? 'bg-red-500' : 'bg-slate-600'
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
              settings.autoStartNext ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-300">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10)
          if (!isNaN(n) && n >= min && n <= max) onChange(n)
        }}
        className="w-20 px-3 py-1.5 rounded bg-slate-700 text-white text-center border border-slate-600 focus:border-red-500 focus:outline-none"
      />
    </div>
  )
}
