const WELLNESS_SCALE = [
  null,
  { label: 'Feeling great',   desc: 'No pain or discomfort. Fully fresh and ready to train hard.' },
  { label: 'Very good',       desc: 'Barely noticeable fatigue. No movement issues.' },
  { label: 'Good',            desc: 'Normal post-run muscle soreness. Nothing limiting.' },
  { label: 'OK',              desc: 'Mild fatigue or stiffness. Not affecting how you move.' },
  { label: 'Slightly off',    desc: 'Noticeable tightness or tiredness. Could train but not at your best.' },
  { label: 'Uncomfortable',   desc: 'Discomfort that you notice throughout movement. Consider easing off.' },
  { label: 'Painful',         desc: 'Clear pain during movement. Affects your gait or mechanics.' },
  { label: 'Very painful',    desc: 'Significant pain. Limiting how and whether you run.' },
  { label: 'Severe pain',     desc: 'Severe pain. Running today risks making it worse.' },
  { label: 'Cannot run',      desc: 'Acute or sharp pain. Do not run — rest and seek assessment.' },
]

const UNSELECTED = [
  null,
  'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
  'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
  'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
  'bg-yellow-50  border-yellow-200  text-yellow-700  hover:bg-yellow-100',
  'bg-yellow-50  border-yellow-200  text-yellow-700  hover:bg-yellow-100',
  'bg-orange-50  border-orange-200  text-orange-700  hover:bg-orange-100',
  'bg-orange-50  border-orange-200  text-orange-700  hover:bg-orange-100',
  'bg-red-50     border-red-200     text-red-700     hover:bg-red-100',
  'bg-red-50     border-red-200     text-red-700     hover:bg-red-100',
  'bg-red-50     border-red-200     text-red-700     hover:bg-red-100',
]

const SELECTED = [
  null,
  'bg-emerald-500 border-emerald-500 text-white',
  'bg-emerald-500 border-emerald-500 text-white',
  'bg-emerald-500 border-emerald-500 text-white',
  'bg-yellow-500  border-yellow-500  text-white',
  'bg-yellow-500  border-yellow-500  text-white',
  'bg-orange-500  border-orange-500  text-white',
  'bg-orange-500  border-orange-500  text-white',
  'bg-red-500     border-red-500     text-white',
  'bg-red-500     border-red-500     text-white',
  'bg-red-600     border-red-600     text-white',
]

const DOT = [
  null,
  'bg-emerald-500', 'bg-emerald-500', 'bg-emerald-500',
  'bg-yellow-500',  'bg-yellow-500',
  'bg-orange-500',  'bg-orange-500',
  'bg-red-500',     'bg-red-500',     'bg-red-600',
]

function timeAgo(isoStr) {
  if (!isoStr) return null
  const h = Math.floor((Date.now() - new Date(isoStr).getTime()) / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return d === 1 ? 'yesterday' : `${d} days ago`
}

export default function WellnessInput({ score, updatedAt, onChange }) {
  const selected = score ? WELLNESS_SCALE[score] : null
  const ago = timeAgo(updatedAt)
  const isStale = updatedAt && (Date.now() - new Date(updatedAt).getTime()) > 86400000

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          How do you feel right now?
        </p>
        {ago && (
          <span className={`text-xs ${isStale ? 'text-amber-500' : 'text-slate-400'}`}>
            {isStale ? `⚠ Updated ${ago} — please refresh` : `Updated ${ago}`}
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500 mb-4">
        Rate any pain, soreness, or fatigue you notice when moving. Your score is combined
        with your Garmin data to adjust your injury risk — 60% objective, 40% self-reported.
      </p>

      <div className="flex gap-1 sm:gap-1.5 mb-4">
        {[1,2,3,4,5,6,7,8,9,10].map(n => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`flex-1 h-10 rounded-lg border text-sm font-bold transition-all ${
              score === n ? SELECTED[n] : UNSELECTED[n]
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      {selected ? (
        <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3 mb-3">
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 ${DOT[score]}`} />
          <div>
            <p className="text-sm font-semibold text-slate-700">{selected.label}</p>
            <p className="text-xs text-slate-500">{selected.desc}</p>
          </div>
        </div>
      ) : (
        <div className="text-center py-1 mb-3">
          <p className="text-xs text-slate-400">Tap a number above to log how you feel</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-emerald-50 rounded-lg p-2">
          <p className="font-semibold text-emerald-700 mb-0.5">1–3</p>
          <p className="text-emerald-600 leading-tight">Fine to train normally</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-2">
          <p className="font-semibold text-orange-700 mb-0.5">4–6</p>
          <p className="text-orange-600 leading-tight">Reduce intensity</p>
        </div>
        <div className="bg-red-50 rounded-lg p-2">
          <p className="font-semibold text-red-700 mb-0.5">7–10</p>
          <p className="text-red-600 leading-tight">Rest or seek advice</p>
        </div>
      </div>
    </div>
  )
}
