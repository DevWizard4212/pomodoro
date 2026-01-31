import { usePomodoroStore } from './store/pomodoroStore'
import { useTimer } from './hooks/useTimer'
import { useNotification } from './hooks/useNotification'
import { Layout } from './components/Layout'
import { Timer } from './components/Timer'
import { Controls } from './components/Controls'
import { SessionInfo } from './components/SessionInfo'
import { Settings } from './components/Settings'

export default function App() {
  useTimer()
  useNotification()

  const view = usePomodoroStore((s) => s.view)
  
  return (
    <Layout>
      {view === 'timer' && (
        <div>
          <Timer />
          <SessionInfo />
          <Controls />
        </div>
      )}
      {view === 'settings' && <Settings />}
    </Layout>
  )
}
