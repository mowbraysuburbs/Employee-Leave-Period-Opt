import { useState } from 'react'
import { PlanLeaveMeter } from './PlanLeaveMeter'
import { PlanDaysOff } from './PlanDaysOff'
import { PlanHolidays } from './PlanHolidays'

// Collapsible "My plan" card shown above the calendar in the "My leave"
// view. Collapsed, it's one line of totals; open, it shows the leave meter,
// the days-off breakdown and the public holidays the plan covers.
export function MyPlanPanel({ stats, allowance, isDefaultAllowance, onAllowanceChange }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-3 py-2 text-left"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">My plan</span>
        <span className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
          <span>
            <b className="text-slate-900 dark:text-slate-100">{stats.leaveDays}</b> of {allowance} leave ·{' '}
            <b className="text-slate-900 dark:text-slate-100">{stats.totalDaysOff}</b> days off
          </span>
          <span className={`text-[9px] transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true">▼</span>
        </span>
      </button>

      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 px-3 pb-3 pt-1">
          <PlanLeaveMeter
            used={stats.leaveDays}
            allowance={allowance}
            isDefaultAllowance={isDefaultAllowance}
            onAllowanceChange={onAllowanceChange}
          />
          <PlanDaysOff
            totalDaysOff={stats.totalDaysOff}
            leaveDays={stats.leaveDays}
            holidayCount={stats.holidays.length}
            weekendDays={stats.weekendDays}
          />
          <div className="sm:col-span-2">
            <PlanHolidays holidays={stats.holidays} />
          </div>
        </div>
      )}
    </div>
  )
}
