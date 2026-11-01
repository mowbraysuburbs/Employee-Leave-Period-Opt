import { fmtDay } from '../../../utils/dateFormat'
import { formatMultiplier } from '../../../utils/breaks'

// fmtDay gives "Wed 16 Dec"; the phone table drops the weekday to stay narrow.
const short = date => fmtDay(date).slice(4)

const NUM = 'w-[50px] shrink-0 flex items-center justify-center'

// Same order as the stat tiles above it: days off, leave used, value.
const COLUMNS = [
  { label: 'Days off', value: b => b.daysOff, className: 'text-[15px] font-extrabold text-indigo-800' },
  { label: 'Leave', value: b => b.leaveDays, className: 'text-[15px] font-semibold text-sky-800' },
  { label: 'Value', value: b => formatMultiplier(b.multiplier), className: 'text-[15px] font-extrabold text-amber-800' },
]

/**
 * The phone version of PlanBreaksTable: tick box and dates, then the three
 * numbers that match the stat tiles (days off, leave used, value). Holidays
 * and weekend counts are left out so everything fits without scrolling.
 *
 * Props: the same as PlanBreaksTable.
 */
export function PlanBreaksTablePhone({ breaks, ticked, onToggle, onToggleAll }) {
  const allTicked = breaks.every(b => ticked.has(b.startDate))

  return (
    <div role="table" aria-label="Breaks in this plan" className="bg-white rounded-2xl border border-slate-200 overflow-hidden text-[13px]">
      <div role="row" className="flex h-9 pr-1 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
        <span role="columnheader" className="flex-1 min-w-0 px-2.5 flex items-center gap-2">
          <input type="checkbox" aria-label="Tick all breaks" checked={allTicked} onChange={onToggleAll} className="w-4 h-4 accent-sky-700" />
          Dates
        </span>
        {COLUMNS.map(c => <span key={c.label} role="columnheader" className={`${NUM} text-[9px] whitespace-nowrap`}>{c.label}</span>)}
      </div>
      {breaks.map(b => {
        const isTicked = ticked.has(b.startDate)
        return (
          <div key={b.startDate} role="row" className={`flex h-12 pr-1 border-t border-slate-100 ${isTicked ? '' : 'opacity-45'}`}>
            <span role="cell" className="flex-1 min-w-0 pl-2.5 pr-1 flex items-center gap-2 whitespace-nowrap">
              <input
                type="checkbox"
                aria-label={`${isTicked ? 'Untick' : 'Tick'} ${fmtDay(b.startDate)} to ${fmtDay(b.endDate)}`}
                checked={isTicked}
                onChange={() => onToggle(b.startDate)}
                className="w-4 h-4 accent-sky-700 shrink-0"
              />
              <span className="truncate"><strong>{short(b.startDate)}</strong> <span className="text-slate-500">→ {short(b.endDate)}</span></span>
            </span>
            {COLUMNS.map(c => <span key={c.label} role="cell" className={`${NUM} ${c.className}`}>{c.value(b)}</span>)}
          </div>
        )
      })}
    </div>
  )
}
