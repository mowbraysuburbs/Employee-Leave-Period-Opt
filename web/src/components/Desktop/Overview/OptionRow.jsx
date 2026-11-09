import { formatMultiplier } from '../../../utils/breaks'
import { fmtDayShortYear, fmtShortYear } from '../../../utils/dateFormat'
import { StartCell } from './StartCell'

// The public holidays inside a break (their names show on hover).
const holidaysIn = brk => brk.days.filter(d => d.type === 'public_holiday')

// Each section's colour, as a stripe down the left edge of its rows.
const STRIPES = { long: 'shadow-[inset_3px_0_0_#38bdf8]', holiday: 'shadow-[inset_3px_0_0_#a78bfa]' }

/**
 * One row of a list period's options: tick box, Start (equal-start dropdown),
 * End, holidays used, days off, leave and multiplier. A row that clashes with
 * your ticks (overlaps one, or needs more leave than is left) is greyed and
 * can't be ticked; the reason is in its tooltip and label (and one note under the table).
 *
 * Props: planner – usePlanner() result; option; cols – the grid classes; onHover; phone;
 *   stripe – 'long' | 'holiday' | null: its section's colour down the left edge
 */
export function OptionRow({ planner, option: o, cols, onHover, phone = false, stripe = null }) {
  const picked = planner.isPicked(o)
  const blocker = planner.blockerFor(o)
  const hols = holidaysIn(o)
  const date = d => (phone ? fmtShortYear(d) : fmtDayShortYear(d))
  const name = `${fmtDayShortYear(o.startDate)} to ${fmtDayShortYear(o.endDate)}, ${o.daysOff} days off`
  const why = blocker?.overlap ? 'overlaps a break you ticked' : blocker ? 'not enough leave left' : ''
  return (
    <div
      role="row"
      onMouseEnter={() => onHover?.(o.startDate)}
      onMouseLeave={() => onHover?.(null)}
      title={why ? `Greyed: ${why}. Untick a break to pick this one.` : undefined}
      className={`${cols} px-1.5 py-2 border-t border-slate-100 ${STRIPES[stripe] ?? ''} ${picked ? 'bg-sky-50' : onHover ? 'hover:bg-slate-50' : ''} ${blocker ? 'opacity-50' : ''}`}
    >
      <input
        type="checkbox"
        aria-label={`Pick ${name}${why ? ` (${why})` : ''}`}
        checked={picked}
        disabled={!!blocker}
        onChange={() => planner.togglePick(o)}
        className="w-4 h-4 accent-sky-700"
      />
      <span role="cell" className="min-w-0">
        <StartCell brk={o} options={planner.startChoicesFor(o)} onSwap={d => planner.swapOptionStart(o, d)} phone={phone} />
      </span>
      <span role="cell" className={`whitespace-nowrap ${phone ? 'text-[12px]' : ''}`}>{date(o.endDate)}</span>
      <span role="cell" title={hols.map(h => h.holidayName).join(', ')} className="font-bold text-orange-800">{hols.length}</span>
      <b role="cell">{o.daysOff}</b>
      {!phone && <span role="cell">{o.leaveDays}</span>}
      <span role="cell" className="font-bold text-amber-800">{formatMultiplier(o.multiplier)}</span>
    </div>
  )
}
