// Leave days used against the yearly allowance, with −/+ to change the
// allowance. Goes red once the plan uses more leave than the allowance.
export function PlanLeaveMeter({ used, allowance, isDefaultAllowance, onAllowanceChange }) {
  const left = allowance - used
  const over = left < 0
  const pct = Math.min(100, (used / Math.max(1, allowance)) * 100)
  const stepBtn =
    'w-5 h-5 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 ' +
    'text-slate-600 dark:text-slate-300 leading-none hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30'

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Leave days</span>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums leading-none">
          {used}
          <span className="ml-1 text-xs font-semibold text-slate-500 dark:text-slate-400">of {allowance} used</span>
        </span>
        <span className={`text-xs font-bold tabular-nums whitespace-nowrap ${over ? 'text-red-600 dark:text-red-400' : 'text-sky-600 dark:text-sky-400'}`}>
          {over ? `${-left} over allowance` : `${left} left`}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${over ? 'bg-red-500' : 'bg-sky-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
        Yearly allowance
        <button type="button" onClick={() => onAllowanceChange(allowance - 1)} disabled={allowance <= 1} aria-label="Decrease allowance" className={stepBtn}>−</button>
        <span className="min-w-4 text-center font-bold text-slate-900 dark:text-slate-100 tabular-nums">{allowance}</span>
        <button type="button" onClick={() => onAllowanceChange(allowance + 1)} aria-label="Increase allowance" className={stepBtn}>+</button>
        {isDefaultAllowance && <span className="text-slate-400 dark:text-slate-500">(SA minimum)</span>}
      </div>
    </div>
  )
}
