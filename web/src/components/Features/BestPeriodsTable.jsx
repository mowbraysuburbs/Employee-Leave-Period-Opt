import { useMemo } from 'react'
import { getBestPeriods } from '../../utils/leaveCalculator'

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-ZA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Table of the top leave periods sorted by total days off.
 *
 * Props:
 *   scores     – array from computeLeaveScores
 *   leaveDays  – number (currently selected leave day count)
 */
export function BestPeriodsTable({ scores, leaveDays }) {
  const periods = useMemo(
    () => getBestPeriods(scores, leaveDays, null, 10),
    [scores, leaveDays]
  )

  if (periods.length === 0) {
    return (
      <p className="text-slate-500 dark:text-slate-400 text-sm">
        No periods found — try selecting more leave days.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Best periods using {leaveDays} leave day{leaveDays === 1 ? '' : 's'}
      </h2>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
              <th className="px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">#</th>
              <th className="px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">Start</th>
              <th className="px-4 py-3 text-slate-500 dark:text-slate-400 font-medium">End</th>
              <th className="px-4 py-3 text-slate-500 dark:text-slate-400 font-medium text-center">Leave used</th>
              <th className="px-4 py-3 text-slate-500 dark:text-slate-400 font-medium text-center">Days off</th>
            </tr>
          </thead>
          <tbody>
            {periods.map(({ startDate, endDate, daysOff, leaveDaysUsed }, i) => (
              <tr
                key={startDate}
                className={`border-b border-slate-100 dark:border-slate-800 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                  i === 0 ? 'bg-sky-50 dark:bg-sky-900/20' : 'bg-white dark:bg-transparent'
                }`}
              >
                <td className="px-4 py-3 text-slate-400 dark:text-slate-500">{i + 1}</td>
                <td className="px-4 py-3 text-slate-800 dark:text-slate-200 whitespace-nowrap">
                  {formatDate(startDate)}
                </td>
                <td className="px-4 py-3 text-slate-800 dark:text-slate-200 whitespace-nowrap">
                  {formatDate(endDate)}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 rounded-full px-2.5 py-0.5 text-xs font-medium">
                    {leaveDaysUsed}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full px-2.5 py-0.5 text-xs font-semibold">
                    {daysOff}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500">
        Periods are deduplicated — overlapping dates are excluded from lower-ranked results.
      </p>
    </div>
  )
}
