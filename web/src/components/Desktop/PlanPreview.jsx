import { DayStrip } from './DayStrip'
import { fmtDayRange } from '../../utils/dateFormat'
import { summariseBreaks, formatMultiplier, breakKey } from '../../utils/breaks'

function Stat({ value, label, highlight }) {
  return (
    <div className={`rounded-xl px-3 py-2.5 ${highlight ? 'bg-amber-100 text-amber-900' : 'bg-slate-100'}`}>
      <div className="text-[22px] font-extrabold">{value}</div>
      <div className={`text-xs ${highlight ? '' : 'text-slate-600'}`}>{label}</div>
    </div>
  )
}

/**
 * Calendar Details tab while a multi-break plan from Overview is previewed.
 *
 * Props:
 *   title, breaks
 *   allSaved, onAddAll
 */
export function PlanPreview({ title, breaks, allSaved, onAddAll }) {
  const totals = summariseBreaks(breaks)

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-2">
        <span className="self-start px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold">Overview plan · {title}</span>
        <h2 className="m-0 text-xl font-extrabold tracking-tight">
          {breaks.length} breaks · {totals.leaveUsed} leave days
        </h2>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat value={totals.daysOff} label="days off" />
        <Stat value={totals.leaveUsed} label="leave" />
        <Stat value={breaks.length ? formatMultiplier(totals.multiplier) : '–'} label="overall" highlight />
      </div>
      <div role="table" aria-label="Breaks in this plan" className="text-sm">
        {breaks.map(b => (
          <div key={breakKey(b)} role="row" className="flex flex-col gap-1.5 px-1 py-2.5 border-t border-slate-100">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2.5 items-center">
              <span role="cell" className="font-bold truncate">{fmtDayRange(b.startDate, b.endDate)}</span>
              <span role="cell" className="text-xs text-slate-600 whitespace-nowrap">
                {b.leaveDays} leave → {b.daysOff} off · <strong className="text-amber-800">{formatMultiplier(b.multiplier)}</strong>
              </span>
            </div>
            <DayStrip days={b.days} />
          </div>
        ))}
      </div>
      <button
        type="button"
        disabled={allSaved || breaks.length === 0}
        onClick={onAddAll}
        className={`h-[52px] rounded-2xl text-base font-bold ${allSaved ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-sky-700 text-white disabled:opacity-40'}`}
      >
        {allSaved ? 'All added ✓' : `Add all ${breaks.length} to my breaks`}
      </button>
    </div>
  )
}
