import { fmtDay } from '../../../utils/dateFormat'
import { formatMultiplier } from '../../../utils/breaks'

const countDays = (brk, type) => brk.days.filter(d => d.type === type).length
// fmtDay gives "Wed 16 Dec"; the phone table drops the weekday to stay narrow.
const short = date => fmtDay(date).slice(4)

const DATES = 'sticky left-0 z-10 w-[150px] shrink-0 bg-white border-r border-slate-200 shadow-[4px_0_8px_-6px_rgba(15,23,42,0.25)] px-2.5 flex items-center gap-2'
const NUM = 'w-[74px] shrink-0 flex items-center justify-center'

const COLUMNS = [
  { label: 'Days off', value: b => b.daysOff, className: 'text-[15px] font-extrabold' },
  { label: 'Leave', value: b => b.leaveDays, className: 'text-[15px] font-semibold' },
  { label: 'Holidays', value: b => countDays(b, 'public_holiday'), className: 'text-[15px] font-semibold text-orange-800' },
  { label: 'Weekend', value: b => countDays(b, 'weekend'), className: 'text-[15px] font-semibold text-slate-600' },
  { label: 'Value ×', value: b => formatMultiplier(b.multiplier), className: 'text-[15px] font-extrabold text-amber-800' },
]

/**
 * The phone version of PlanBreaksTable: the tick box and dates stay fixed on
 * the left while the numbers scroll freely sideways (about 2½ columns show
 * at once, the right edge fades to hint there's more).
 *
 * Props: the same as PlanBreaksTable.
 */
export function PlanBreaksTablePhone({ breaks, ticked, onToggle, onToggleAll }) {
  const allTicked = breaks.every(b => ticked.has(b.startDate))

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div
        role="table"
        aria-label="Breaks in this plan"
        className="overflow-x-auto text-[13px] [scrollbar-width:none] [mask-image:linear-gradient(to_right,#000_85%,transparent)]"
      >
        <div role="row" className="flex w-max h-9 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
          <span role="columnheader" className={DATES}>
            <input type="checkbox" aria-label="Tick all breaks" checked={allTicked} onChange={onToggleAll} className="w-4 h-4 accent-sky-700" />
            Dates
          </span>
          {COLUMNS.map(c => <span key={c.label} role="columnheader" className={NUM}>{c.label}</span>)}
        </div>
        {breaks.map(b => {
          const isTicked = ticked.has(b.startDate)
          return (
            <div key={b.startDate} role="row" className={`flex w-max h-12 border-t border-slate-100 ${isTicked ? '' : 'opacity-45'}`}>
              <span role="cell" className={`${DATES} whitespace-nowrap`}>
                <input
                  type="checkbox"
                  aria-label={`${isTicked ? 'Untick' : 'Tick'} ${fmtDay(b.startDate)} to ${fmtDay(b.endDate)}`}
                  checked={isTicked}
                  onChange={() => onToggle(b.startDate)}
                  className="w-4 h-4 accent-sky-700 shrink-0"
                />
                <span><strong>{short(b.startDate)}</strong> <span className="text-slate-500">→ {short(b.endDate)}</span></span>
              </span>
              {COLUMNS.map(c => <span key={c.label} role="cell" className={`${NUM} ${c.className}`}>{c.value(b)}</span>)}
            </div>
          )
        })}
      </div>
    </div>
  )
}
