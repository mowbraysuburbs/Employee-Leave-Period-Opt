import { fmtShortRange } from '../../../utils/dateFormat'
import { summariseBreaks } from '../../../utils/breaks'

/**
 * Small side card: what's already saved for the selected year.
 *
 * Props:
 *   year, allowance
 *   breaks          – saved breaks starting in that year
 *   onOpenCalendar
 */
export function OverviewSummary({ year, allowance, breaks, onOpenCalendar }) {
  const totals = summariseBreaks(breaks)
  const pct = Math.min(100, Math.round((totals.leaveUsed / allowance) * 100))

  return (
    <aside className="flex-[1_1_300px] min-w-0 bg-white rounded-[20px] p-[22px] shadow-sm flex flex-col gap-3.5">
      <h2 className="m-0 text-lg font-extrabold">My breaks · {year}</h2>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-100 rounded-xl px-3 py-2.5">
          <div className="text-[22px] font-extrabold">
            {totals.leaveUsed}<span className="text-[13px] font-semibold text-slate-600">/{allowance}</span>
          </div>
          <div className="text-xs text-slate-600">leave used</div>
        </div>
        <div className="bg-slate-100 rounded-xl px-3 py-2.5">
          <div className="text-[22px] font-extrabold">{totals.daysOff}</div>
          <div className="text-xs text-slate-600">days off</div>
        </div>
      </div>
      <div className="h-2 rounded bg-slate-200 overflow-hidden">
        <div className="h-2 bg-sky-700" style={{ width: `${pct}%` }} />
      </div>
      {breaks.length === 0 ? (
        <div className="p-4 border-[1.5px] border-dashed border-slate-300 rounded-2xl text-sm text-slate-600 text-center">
          Nothing added yet. Add a quick pick, or browse the calendar.
        </div>
      ) : (
        <ul className="list-none m-0 p-0">
          {breaks.map(b => (
            <li key={`${b.startDate}-${b.leaveDays}`} className="flex justify-between gap-2 text-sm py-2 border-t border-slate-100">
              <span className="font-bold">{fmtShortRange(b.startDate, b.endDate)}</span>
              <span className="text-slate-600">{b.daysOff} off</span>
            </li>
          ))}
        </ul>
      )}
      <button type="button" onClick={onOpenCalendar} className="h-11 rounded-xl bg-slate-900 text-white text-sm font-bold">
        Open the calendar
      </button>
    </aside>
  )
}
