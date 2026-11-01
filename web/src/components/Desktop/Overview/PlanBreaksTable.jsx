import { fmtDay, fmtDayYear, fmtShortYear } from '../../../utils/dateFormat'
import { formatMultiplier } from '../../../utils/breaks'

const COLUMNS = 'grid grid-cols-[30px_minmax(0,1.3fr)_minmax(0,1.3fr)_repeat(5,minmax(0,1fr))] gap-3 items-center'

const countDays = (brk, type) => brk.days.filter(d => d.type === type).length

// Long date on wide screens, short one when the window is narrow (e.g. half a screen).
function DateCell({ date, className }) {
  return (
    <span role="cell" className={`truncate ${className}`}>
      <span className="hidden min-[900px]:inline">{fmtDayYear(date)}</span>
      <span className="min-[900px]:hidden">{fmtShortYear(date)}</span>
    </span>
  )
}

/**
 * A multi-break plan as a table with a tick box per break, so people can
 * keep only the breaks they want. Every cell stays on one line.
 *
 * Props:
 *   breaks       – all the plan's breaks
 *   ticked       – Set of ticked break start dates
 *   onToggle     – (startDate) => void
 *   onToggleAll  – () => void
 */
export function PlanBreaksTable({ breaks, ticked, onToggle, onToggleAll }) {
  const allTicked = breaks.every(b => ticked.has(b.startDate))

  return (
    <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200">
      <div role="table" aria-label="Breaks in this plan" className="min-w-[560px] text-sm">
        <div role="row" className={`${COLUMNS} px-3 py-2.5 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wide`}>
          <span role="columnheader">
            <input type="checkbox" aria-label="Tick all breaks" checked={allTicked} onChange={onToggleAll} className="w-4 h-4 accent-sky-700" />
          </span>
          <span role="columnheader" className="truncate">Start</span>
          <span role="columnheader" className="truncate">End</span>
          <span role="columnheader" className="truncate">Days off</span>
          <span role="columnheader" className="truncate">Leave</span>
          <span role="columnheader" className="truncate">Holidays</span>
          <span role="columnheader" className="truncate">Weekend</span>
          <span role="columnheader" className="truncate">×</span>
        </div>
        {breaks.map(b => {
          const isTicked = ticked.has(b.startDate)
          return (
            <div key={b.startDate} role="row" className={`${COLUMNS} px-3 py-2 border-t border-slate-100 ${isTicked ? '' : 'opacity-45'}`}>
              <span role="cell">
                <input
                  type="checkbox"
                  aria-label={`${isTicked ? 'Untick' : 'Tick'} ${fmtDay(b.startDate)} to ${fmtDay(b.endDate)}`}
                  checked={isTicked}
                  onChange={() => onToggle(b.startDate)}
                  className="w-4 h-4 accent-sky-700"
                />
              </span>
              <DateCell date={b.startDate} className="font-semibold" />
              <DateCell date={b.endDate} className="text-slate-600" />
              <span role="cell" className="truncate font-bold">{b.daysOff}</span>
              <span role="cell" className="truncate">{b.leaveDays}</span>
              <span role="cell" className="truncate text-orange-800">{countDays(b, 'public_holiday')}</span>
              <span role="cell" className="truncate text-slate-600">{countDays(b, 'weekend')}</span>
              <span role="cell" className="truncate font-bold text-amber-800">{formatMultiplier(b.multiplier)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
