function BarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="10" width="18" height="4" rx="2" />
    </svg>
  )
}
function ScatteredIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="10" width="5" height="4" rx="1.5" />
      <rect x="10" y="10" width="5" height="4" rx="1.5" />
      <rect x="18" y="10" width="4" height="4" rx="1.5" />
    </svg>
  )
}

export function StepDistribution({ onChoose, onBack, onSkip }) {
  return (
    <div className="flex flex-col gap-6 px-6 pb-6">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-sky-500">Step 3 of 4</p>
        <button onClick={onSkip} className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">Skip</button>
      </div>

      <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">One long break, or a few shorter ones?</h2>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => onChoose('continuous')}
          className="text-left px-5 py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-sky-500 ring-4 ring-sky-100 dark:ring-sky-900/30"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/40 text-sky-500 flex items-center justify-center flex-shrink-0">
              <BarIcon />
            </div>
            <div>
              <p className="text-[15px] font-bold text-slate-900 dark:text-slate-100">Continuous</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">One single stretch of time off</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onChoose('scattered')}
          className="text-left px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300 flex items-center justify-center flex-shrink-0">
              <ScatteredIcon />
            </div>
            <div>
              <p className="text-[15px] font-bold text-slate-900 dark:text-slate-100">Scattered</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">I don't mind a few shorter breaks spread out</p>
            </div>
          </div>
        </button>

        <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed px-1">
          Scattered already optimizes for the most days off per day spent, so we'll skip straight to your table &mdash; no holiday step needed.
        </p>
      </div>

      <div className="flex justify-start">
        <button onClick={onBack} className="px-5 py-2 rounded-full text-slate-500 dark:text-slate-400 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          Back
        </button>
      </div>
    </div>
  )
}
