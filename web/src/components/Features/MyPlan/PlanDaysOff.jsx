import { DAY_TYPE_COLOUR } from '../../../utils/dayTypes'

// Total days off, split into leave days / public holidays / weekend days,
// plus how many days off each leave day buys.
export function PlanDaysOff({ totalDaysOff, leaveDays, holidayCount, weekendDays }) {
  const parts = [
    { type: 'leave',          count: leaveDays,    label: 'leave' },
    { type: 'public_holiday', count: holidayCount, label: holidayCount === 1 ? 'holiday' : 'holidays' },
    { type: 'weekend',        count: weekendDays,  label: 'weekend days' },
  ]

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Days off</span>
      <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums leading-none">
        {totalDaysOff}
        <span className="ml-1 text-xs font-semibold text-slate-500 dark:text-slate-400">days off</span>
      </span>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex">
        {parts.map(({ type, count }) => (
          <div key={type} className="h-full" style={{ flexGrow: count, backgroundColor: DAY_TYPE_COLOUR[type] }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
        {parts.map(({ type, count, label }) => (
          <span key={type} className="inline-flex items-center gap-1 whitespace-nowrap tabular-nums">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DAY_TYPE_COLOUR[type] }} />
            <b className="text-slate-900 dark:text-slate-100">{count}</b> {label}
          </span>
        ))}
      </div>
      {leaveDays > 0 && (
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          <b className="text-slate-900 dark:text-slate-100">{(totalDaysOff / leaveDays).toFixed(1)}×</b> days off per leave day
        </span>
      )}
    </div>
  )
}
