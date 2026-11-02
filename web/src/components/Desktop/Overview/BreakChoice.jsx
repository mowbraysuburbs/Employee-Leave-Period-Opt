const LABELS = { 1: '1 · one long', 2: '2', 3: '3', null: 'As many as possible' }
const SHORT = { 1: '1', 2: '2', 3: '3', null: 'As many' }

/**
 * Step 3: how many breaks. A choice that gives the same plan as a smaller one
 * is switched off, with a note saying the period is too short to split.
 *
 * Props:
 *   choices  – planAllChoices() result ({ choice, same })
 *   value    – the choice in use (1, 2, 3 or null)
 *   onChange – (choice) => void
 *   phone
 */
export function BreakChoice({ choices, value, onChange, phone = false }) {
  const cantSplit = choices.slice(1).every(c => c.same)
  return (
    <div className="flex flex-col gap-1.5">
      {!phone && <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">3 · How many breaks?</span>}
      <div role="radiogroup" aria-label="How many breaks" className="flex p-[3px] gap-[3px] rounded-xl bg-slate-100">
        {choices.map(c => {
          const on = c.choice === value
          return (
            <button
              key={String(c.choice)}
              type="button"
              role="radio"
              aria-checked={on}
              disabled={c.same}
              title={c.same ? 'Same as fewer breaks for this period' : undefined}
              onClick={() => onChange(c.choice)}
              className={[
                'h-[34px] px-3 rounded-[9px] text-[13px] font-bold whitespace-nowrap',
                phone ? (c.choice === null ? 'flex-[2]' : 'flex-1') : '',
                on ? 'bg-white text-slate-900 shadow' : c.same ? 'text-slate-300 line-through' : 'text-slate-600',
              ].join(' ')}
            >
              {phone ? SHORT[c.choice] : LABELS[c.choice]}
            </button>
          )
        })}
      </div>
      {cantSplit
        ? <span className="text-[11.5px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1">This period is too short to split into more breaks. Breaks need to be at least one working week apart.</span>
        : <span className="text-[11.5px] text-slate-600">↔ Breaks are at least <b>one working week</b> apart.</span>}
    </div>
  )
}
