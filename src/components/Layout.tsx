import type { ReactNode } from 'react'
import { usePomodoroStore } from '../store/pomodoroStore'
import type { View } from '../types'

const tabs: { key: View; label: string }[] = [
  { key: 'timer', label: 'Timer' },
  { key: 'stats', label: 'Stats' },
  { key: 'settings', label: 'Settings' },
]

export function Layout({ children }: { children: ReactNode }) {
  const view = usePomodoroStore((s) => s.view)
  const setView = usePomodoroStore((s) => s.setView)

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Nav */}
      <nav className="flex justify-center gap-1 pt-6 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setView(tab.key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              view === tab.key
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        {children}
      </main>
    </div>
  )
}
