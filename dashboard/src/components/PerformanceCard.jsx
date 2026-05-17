const FITNESS_CONFIG = {
  improving:   { badge: 'bg-emerald-100 text-emerald-700', icon: '↑' },
  maintaining: { badge: 'bg-blue-100 text-blue-700',       icon: '→' },
  recovering:  { badge: 'bg-purple-100 text-purple-700',   icon: '~' },
  declining:   { badge: 'bg-slate-100 text-slate-600',     icon: '↓' },
}

const WEAK_SPOT_EXPLANATIONS = {
  cadence: 'Taking more steps per minute reduces the load on each stride, which lowers injury risk and improves efficiency.',
  easy: '80% of your runs should feel genuinely easy — this builds your aerobic base and lets your body absorb the hard sessions.',
  imbalance: 'Asymmetry in how your feet contact the ground can signal a muscle imbalance that, over time, leads to injury.',
}

function getSpotExplanation(spot) {
  if (spot.toLowerCase().includes('cadence')) return WEAK_SPOT_EXPLANATIONS.cadence
  if (spot.toLowerCase().includes('easy') || spot.toLowerCase().includes('hard')) return WEAK_SPOT_EXPLANATIONS.easy
  if (spot.toLowerCase().includes('imbalance')) return WEAK_SPOT_EXPLANATIONS.imbalance
  return null
}

export default function PerformanceCard({ data, load }) {
  if (!data) return null
  const badge = FITNESS_CONFIG[data.fitness_label] ?? FITNESS_CONFIG.maintaining

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">Your fitness right now</p>

      <div className="flex items-center gap-2 mb-3">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${badge.badge}`}>
          {badge.icon} {data.fitness_label.charAt(0).toUpperCase() + data.fitness_label.slice(1)}
        </span>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed mb-5">{data.fitness_message}</p>

      {load && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-1">This week</p>
            <p className="text-xl font-bold text-slate-800">{load.weekly_km} <span className="text-sm font-normal text-slate-400">km</span></p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-xs text-slate-400 mb-1">Runs in past 28 days</p>
            <p className="text-xl font-bold text-slate-800">{data.recent_runs}</p>
          </div>
        </div>
      )}

      {data.weak_spots?.length > 0 && (
        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">What to work on</p>
          <div className="space-y-4">
            {data.weak_spots.map((spot, i) => (
              <div key={i}>
                <div className="flex items-start gap-2 mb-1">
                  <span className="text-orange-400 mt-0.5 shrink-0">•</span>
                  <p className="text-sm font-medium text-slate-700">{spot}</p>
                </div>
                {getSpotExplanation(spot) && (
                  <p className="text-xs text-slate-500 leading-relaxed ml-4">{getSpotExplanation(spot)}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.weak_spots?.length === 0 && (
        <p className="text-sm text-emerald-600 border-t border-slate-100 pt-4">
          No issues detected in your recent training patterns.
        </p>
      )}
    </div>
  )
}
