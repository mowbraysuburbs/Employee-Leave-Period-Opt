import { MAX_LEAVE } from '../../../utils/planner'

/**
 * The Overview's leave days as blocks 1–10, like the Calendar's leave card:
 * blue up to your number, a green "N left" line where your leave left ends.
 * Past what's left you can still pick (like the Calendar): those blocks turn
 * amber. Unlike the Calendar, not every number can be picked:
 *   - list periods (Custom, Easter, Christmas, next year): numbers that add
 *     nothing new (marks 'pad') are struck through and can't be picked; the
 *     first proper break gets MIN, joins get JOINS (see "Leave number rules")
 *   - Up next / School holidays: the recommended number gets REC
 *
 * Props: value, onChange – this plan's leave days; maxPick – the most you can
 *   pick (10, or the period's workdays); left – leave left (amber past it, and
 *   the green line; null for neither); rec, reason – REC; marks – 10 entries from
 *   customLeaveMap or null; joins – [{ leave, names }]; phone – taller blocks
 */
export function LimitPicker({ value, onChange, maxPick = MAX_LEAVE, left = null, rec = null, reason = '', marks = null, joins = [], phone = false }) {
  const showLeft = left !== null && left >= 0 && left < Math.min(maxPick, MAX_LEAVE)
  return (
    <div className={`relative pt-3 ${showLeft ? 'pb-3.5' : ''}`}>
      <div role="radiogroup" aria-label="Leave days to plan" className="flex gap-1">
        {Array.from({ length: MAX_LEAVE }, (_, i) => i + 1).map(n => {
          const on = n === value
          const locked = n > maxPick
          const over = left !== null && n > left
          const isRec = n === rec
          const join = joins.find(j => j.leave === n)
          const pad = marks?.[n - 1] === 'pad'
          const min = marks?.[n - 1] === 'min'
          const tag = isRec ? 'REC' : join ? 'JOINS' : min ? 'MIN' : null
          const skipped = pad && !on
          // Blue up to your number, except numbers that add nothing (they stay struck through).
          const filled = !locked && !pad && n <= value
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={`${n}${isRec ? ' (recommended)' : join ? ` (joins ${join.names.join(' + ')})` : min ? ' (first proper break)' : ''}${locked ? ' (more than the workdays here)' : skipped ? ' (adds nothing here)' : over ? ' (more than you have left)' : ''}`}
              disabled={locked || skipped}
              title={locked ? `${n} leave days: more than the workdays in these dates`
                : over && !skipped ? `${n} leave days: more than the ${left} you have left (fine for exploring)`
                : isRec ? `Recommended: ${n} leave days${reason ? ` (${reason})` : ''}`
                  : join ? `${n} leave days: ${join.names.join(' + ')} join into one break`
                    : min ? `${n} leave days: the first proper break here`
                      : pad ? `${n} leave days: nothing new here, it only makes a break a day longer` : `Use ${n} leave days`}
              onClick={() => onChange(n)}
              className={[
                'relative flex-1 min-w-0 rounded-md font-extrabold transition-transform',
                phone ? 'h-9 text-sm' : 'h-8 text-[13px]',
                locked ? 'bg-slate-50 text-slate-300 border-[1.5px] border-dashed border-slate-300 cursor-not-allowed'
                  : filled ? (over ? 'bg-amber-500 text-white' : 'bg-sky-700 text-white')
                    : skipped ? 'bg-slate-50 text-slate-300 line-through cursor-not-allowed'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300 hover:-translate-y-px cursor-pointer',
                on ? 'ring-2 ring-offset-1 ring-slate-900' : '',
              ].join(' ')}
            >
              {n}
              {tag && (
                <span aria-hidden="true" className={`absolute -top-3 left-1/2 -translate-x-1/2 px-1 rounded text-white text-[8.5px] leading-[13px] font-extrabold tracking-wide ${locked ? 'bg-slate-300' : min ? 'bg-green-600' : 'bg-amber-500'}`}>
                  {tag}
                </span>
              )}
            </button>
          )
        })}
      </div>
      {/* Where your leave left ends, as on the Calendar (the label sits under it, clear of the tags). */}
      {showLeft && (
        <span aria-hidden="true" className="absolute bottom-0 -translate-x-1/2 flex flex-col items-center pointer-events-none" style={{ left: `calc(${(left / MAX_LEAVE) * 100}% - ${left === 0 ? 0 : 2}px)` }}>
          <span className={`w-0.5 rounded bg-green-600 ${phone ? 'h-10' : 'h-9'}`} />
          <span className="text-[9px] font-extrabold text-green-800 leading-none whitespace-nowrap">{left} left</span>
        </span>
      )}
    </div>
  )
}
