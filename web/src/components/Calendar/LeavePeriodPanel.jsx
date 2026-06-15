import { useMemo } from 'react'
import { getLeaveRange } from '../../utils/leaveCalculator'

const SHORT_DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const SHORT_MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatNice(dateStr) {
  // Parse as local midnight — avoids UTC-shift issues on date-only strings
  const [y, mo, day] = dateStr.split('-').map(Number)
  const d = new Date(y, mo - 1, day)
  return `${SHORT_DAY[d.getDay()]} ${d.getDate()} ${SHORT_MONTH[d.getMonth()]} ${d.getFullYear()}`
}

const TYPE_STYLE = {
  leave:          { bg: '#38bdf8', label: 'L', ring: 'ring-sky-300' },
  public_holiday: { bg: '#fb923c', label: 'PH', ring: 'ring-orange-300' },
  weekend:        { bg: '#64748b', label: 'W', ring: 'ring-slate-500' },
}

/**
 * Props:
 *   date      – "YYYY-MM-DD" string the user clicked on
 *   leaveDays – number of leave credits
 *   onClose   – callback to dismiss
 */
export function LeavePeriodPanel({ date, leaveDays, onClose }) {
  const { startDate, endDate, daysOff, breakdown } = useMemo(
    () => getLeaveRange(date, leaveDays),
    [date, leaveDays]
  )

  const leaveCount = breakdown.filter((d) => d.type === 'leave').length
  const phCount = breakdown.filter((d) => d.type === 'public_holiday').length
  const weekendCount = breakdown.filter((d) => d.type === 'weekend').length

  return (
    // Backdrop — clicking outside closes the panel
    <div
      className="fixed inset-0 z-40 flex items-end md:items-center justify-center"
      onClick={onClose}
    >
      {/* Dim overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Panel card — stop propagation so clicks inside don't close */}
      <div
        className="relative z-50 w-full max-w-lg mx-4 mb-4 md:mb-0 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">
              Leave period
            </p>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {formatNice(startDate)}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              → {formatNice(endDate)} &nbsp;·&nbsp; <strong className="text-slate-800 dark:text-slate-200">{daysOff}</strong> days total
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Day-by-day timeline — horizontally scrollable */}
        <div className="px-5 pb-4 overflow-x-auto">
          <div className="flex gap-1.5 min-w-max">
            {breakdown.map(({ date: d, type }) => {
              const s = TYPE_STYLE[type]
              const [dy, dm, dd] = d.split('-').map(Number)
            const day = new Date(dy, dm - 1, dd)
              return (
                <div key={d} className="flex flex-col items-center gap-0.5 w-9">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase">
                    {SHORT_DAY[day.getDay()].slice(0, 2)}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold text-white ring-1 ${s.ring}`}
                    style={{ backgroundColor: s.bg }}
                  >
                    {s.label}
                  </div>
                  <span className="text-[9px] text-slate-500 dark:text-slate-400 tabular-nums">
                    {day.getDate()}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend pills */}
        <div className="flex flex-wrap gap-2 px-5 pb-5">
          {leaveCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              {leaveCount} leave day{leaveCount === 1 ? '' : 's'}
            </span>
          )}
          {phCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              {phCount} public holiday{phCount === 1 ? '' : 's'}
            </span>
          )}
          {weekendCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              {weekendCount} weekend day{weekendCount === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
