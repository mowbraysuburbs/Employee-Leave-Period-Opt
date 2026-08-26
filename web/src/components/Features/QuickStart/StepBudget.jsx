const MAX_BUDGET = 20

export function StepBudget({ value, onChange, onNext, onSkip }) {
  return (
    <div className="flex flex-col gap-6 px-6 pb-6">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wider text-sky-500">Step 1 of 4</p>
        <button onClick={onSkip} className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">Skip</button>
      </div>

      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">How many leave days can you spend?</h2>
      </div>

      <div className="flex items-center justify-center gap-5 py-2">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value === 0}
          className="w-10 h-10 flex-shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-lg font-bold flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Decrease leave days"
        >−</button>
        <div className="flex flex-col items-center gap-1 w-20">
          <span className="text-4xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">{value}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">leave days</span>
        </div>
        <button
          onClick={() => onChange(Math.min(MAX_BUDGET, value + 1))}
          disabled={value === MAX_BUDGET}
          className="w-10 h-10 flex-shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-lg font-bold flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Increase leave days"
        >+</button>
      </div>

      <input
        type="range"
        min={0}
        max={MAX_BUDGET}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full accent-sky-500 cursor-pointer"
      />

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="px-7 py-2.5 rounded-full bg-sky-500 hover:bg-sky-400 text-white text-sm font-bold transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  )
}
