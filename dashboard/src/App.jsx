import { useState, useEffect } from 'react'
import InjuryRiskCard from './components/InjuryRiskCard'
import MaxDistanceCard from './components/MaxDistanceCard'
import SpeedPotentialCard from './components/SpeedPotentialCard'
import RecoveryCard from './components/RecoveryCard'
import WeeklyVolumeChart from './components/WeeklyVolumeChart'
import PerformanceCard from './components/PerformanceCard'
import RecentActivities from './components/RecentActivities'

function formatSyncDate(isoStr) {
  if (!isoStr) return 'Never'
  const d = new Date(isoStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function App() {
  const [metrics, setMetrics] = useState(null)
  const [history, setHistory] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('./data/metrics.json')
      .then(r => r.json())
      .then(setMetrics)
      .catch(() => setError('Could not load data. Run the pipeline first.'))

    fetch('./data/history.json')
      .then(r => r.json())
      .then(setHistory)
      .catch(() => {})
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 max-w-md text-center">
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">No data yet</p>
          <p className="text-slate-700">{error}</p>
          <p className="text-slate-400 text-sm mt-3">
            Add your Garmin credentials to GitHub Secrets and trigger the sync workflow.
          </p>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏃</span>
            <span className="font-bold text-slate-900 text-lg">Sport Coach</span>
          </div>
          <span className="text-xs text-slate-400">
            Updated {formatSyncDate(metrics.generated_at)}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Top row: injury risk + recovery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <InjuryRiskCard data={metrics.injury_risk} load={metrics.training_load} />
          </div>
          <RecoveryCard data={metrics.recovery} />
        </div>

        {/* Max safe distance */}
        <MaxDistanceCard data={metrics.max_safe_distance} />

        {/* Speed potential */}
        <SpeedPotentialCard data={metrics.speed_potential} />

        {/* Weekly volume chart */}
        <WeeklyVolumeChart
          volumes={history?.weekly_volumes ?? []}
          avgKm={metrics.training_load?.avg_4week_km}
        />

        {/* Performance + recent runs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PerformanceCard data={metrics.performance} load={metrics.training_load} />
          <RecentActivities activities={history?.activities ?? []} />
        </div>
      </main>
    </div>
  )
}
