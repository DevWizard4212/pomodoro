import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { usePomodoroStore } from '../store/pomodoroStore'
import {
  getWeeklyStats,
  getTotalFocusMinutes,
  getTotalSessions,
  getStreak,
  getTodayStats,
} from '../utils/stats'

const PIE_COLORS = ['#ef4444', '#3b82f6']

export function Stats() {
  const sessions = usePomodoroStore((s) => s.sessions)
  const settings = usePomodoroStore((s) => s.settings)

  const weekly = getWeeklyStats(sessions)
  const totalMinutes = getTotalFocusMinutes(sessions)
  const totalSessions = getTotalSessions(sessions)
  const streak = getStreak(sessions)
  const today = getTodayStats(sessions)

  const barData = weekly.map((d) => ({
    date: d.date.slice(5), // MM-DD
    focus: d.focusMinutes,
  }))

  const pieData = [
    { name: 'Focus', value: today.focusMinutes || 0 },
    { name: 'Break', value: today.breakMinutes || 0 },
  ].filter((d) => d.value > 0)

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-white">Statistics</h2>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Today" value={`${today.sessionsCompleted} / ${settings.dailyGoal}`} />
        <StatCard label="Total sessions" value={String(totalSessions)} />
        <StatCard label="Total focus" value={`${totalMinutes}m`} />
        <StatCard label="Streak" value={`${streak}d`} />
      </div>

      {/* Bar chart — weekly focus */}
      <div>
        <h3 className="text-sm text-slate-400 mb-2">Focus minutes — last 7 days</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#ef4444' }}
              />
              <Bar dataKey="focus" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie chart — today's breakdown */}
      {pieData.length > 0 && (
        <div>
          <h3 className="text-sm text-slate-400 mb-2">Today — focus vs break</h3>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: 8 }}
                  itemStyle={{ color: '#94a3b8' }}
                  formatter={(value) => `${value}m`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Focus
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Break
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-800 rounded-lg p-3 text-center">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-lg font-bold text-white mt-0.5">{value}</p>
    </div>
  )
}
