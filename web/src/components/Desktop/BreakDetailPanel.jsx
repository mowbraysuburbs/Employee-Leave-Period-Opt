import { DAY_TYPE_COLOUR } from '../../utils/dayTypes'
import { fmtDay, fmtDayRange } from '../../utils/dateFormat'
import { formatMultiplier } from '../../utils/breaks'

function Stat({ value, label, highlight }) {
  return (
    <div className={`rounded-xl px-3 py-2.5 ${highlight ? 'bg-amber-100 text-amber-900' : 'bg-slate-100'}`}>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className={`text-xs ${highlight ? '' : 'text-slate-600'}`}>{label}</div>
    </div>
  )
}

function dayLabel(day) {
  if (day.type === 'public_holiday') return day.holidayName ?? 'Public holiday'
  return day.type === 'leave' ? 'Leave' : 'Weekend'
}

/**
 * Props:
 *   brk        – the clicked break
 *   nextBreak  – the same start date with one more leave day (the "+1" line)
 *   isSaved    – already in My breaks
 *   onAdd, onRemove, onBack
 */
export function BreakDetailPanel({ brk, nextBreak, isSaved, onAdd, onRemove, onBack }) {
  return (
    <div className="flex flex-col gap-4">
      <button type="button" onClick={onBack} className="self-start h-9 pr-2.5 inline-flex items-center gap-1 text-sky-700 text-sm font-bold">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 6 9 12 15 18" /></svg>
        My breaks
      </button>

      <h2 className="m-0 text-[22px] font-extrabold tracking-tight">{fmtDayRange(brk.startDate, brk.endDate)}</h2>

      <div className="grid grid-cols-3 gap-2">
        <Stat value={brk.daysOff} label="days off" />
        <Stat value={brk.leaveDays} label="leave" />
        <Stat value={formatMultiplier(brk.multiplier)} label="multiplier" highlight />
      </div>

      <ul aria-label="Days in this break" className="list-none m-0 p-0 flex flex-col gap-1">
        {brk.days.map(day => (
          <li
            key={day.date}
            className={`flex items-center gap-3 h-[34px] px-2.5 rounded-lg ${day.type === 'public_holiday' ? 'bg-orange-50' : ''}`}
          >
            <span className="w-[54px] text-[13px] font-semibold text-slate-600">{fmtDay(day.date).slice(0, -4)}</span>
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: DAY_TYPE_COLOUR[day.type] }} />
            <span className={`text-sm ${day.type === 'public_holiday' ? 'font-bold' : 'font-medium'}`}>{dayLabel(day)}</span>
          </li>
        ))}
      </ul>

      {nextBreak && (
        <p className="m-0 text-[13px] text-slate-600">
          +1 leave day → {nextBreak.daysOff} days off ({formatMultiplier(nextBreak.multiplier)})
        </p>
      )}

      {isSaved ? (
        <button type="button" onClick={onRemove} className="h-[52px] rounded-2xl bg-white text-red-700 border border-red-300 text-base font-bold">
          Remove from my breaks
        </button>
      ) : (
        <button type="button" onClick={onAdd} className="h-[52px] rounded-2xl bg-sky-700 text-white text-base font-bold">
          Add to my breaks
        </button>
      )}
    </div>
  )
}
