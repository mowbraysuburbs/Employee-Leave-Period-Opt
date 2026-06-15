import { useMemo, useState } from 'react'
import { MonthGrid } from './MonthGrid'
import { LeavePeriodPanel } from './LeavePeriodPanel'
import { buildLegend, getColourForDaysOff } from '../../utils/colorScale'

/**
 * Props:
 *   scores            – array from computeLeaveScores
 *   months            – array of { year, month } to render (e.g. 12 or 24 entries)
 *   leaveDays         – number (passed to LeavePeriodPanel for breakdown)
 *   showSchoolHolidays – bool
 *   provinceCode      – string
 */
export function CalendarHeatmap({ scores, months, leaveDays, showSchoolHolidays, provinceCode }) {
  // Multi-select filter: Set of daysOff values to highlight (empty = show all)
  const [filterSet, setFilterSet] = useState(new Set())
  // The date string the user clicked — triggers the leave period panel
  const [selectedDate, setSelectedDate] = useState(null)

  const scoreMap = useMemo(() => {
    const map = new Map()
    for (const { date, daysOff } of scores) map.set(date, daysOff)
    return map
  }, [scores])

  const legend = useMemo(() => buildLegend(scores), [scores])

  function handleLegendClick(daysOff) {
    setFilterSet((prev) => {
      const next = new Set(prev)
      if (next.has(daysOff)) next.delete(daysOff)
      else next.add(daysOff)
      return next
    })
  }

  function removeFilter(daysOff) {
    setFilterSet((prev) => {
      const next = new Set(prev)
      next.delete(daysOff)
      return next
    })
  }

  function clearFilters() {
    setFilterSet(new Set())
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Legend — coloured circles, click to toggle filter */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        {legend.map(({ daysOff, colour }) => {
          const isSelected = filterSet.has(daysOff)
          return (
            <button
              key={daysOff}
              onClick={() => handleLegendClick(daysOff)}
              title={`${daysOff} days off — click to filter`}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-transform hover:scale-110 focus:outline-none
                ${isSelected
                  ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white ring-offset-slate-50 dark:ring-offset-slate-900 scale-110'
                  : 'opacity-80 hover:opacity-100'
                }`}
              style={{ backgroundColor: colour, color: '#1e293b' }}
            >
              {daysOff}
            </button>
          )
        })}
      </div>

      {/* Active filter chips */}
      {filterSet.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-1 -mt-2">
          {[...filterSet].sort((a, b) => a - b).map((n) => (
            <span
              key={n}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              {n} day{n === 1 ? '' : 's'} off
              <button
                onClick={() => removeFilter(n)}
                className="ml-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 leading-none"
                aria-label={`Remove ${n} days off filter`}
              >
                ×
              </button>
            </span>
          ))}
          <button
            onClick={clearFilters}
            className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Clear all ×
          </button>
        </div>
      )}

      {/* Dot legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 px-1 -mt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600 flex flex-col items-center justify-center">
            <div className="w-[3px] h-[3px] rounded-full bg-white" />
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Public holiday</span>
        </div>
        {showSchoolHolidays && (
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-slate-300 dark:bg-slate-600 flex flex-col items-center justify-center">
              <div className="w-[3px] h-[3px] rounded-full bg-sky-400" />
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">School holiday</span>
          </div>
        )}
        {leaveDays > 0 && (
          <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
            Tap a coloured day to see its leave period
          </span>
        )}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {months.map(({ year, month }) => (
          <MonthGrid
            key={`${year}-${month}`}
            year={year}
            month={month}
            scoreMap={scoreMap}
            showSchoolHolidays={showSchoolHolidays}
            provinceCode={provinceCode}
            filterSet={filterSet}
            onDayClick={setSelectedDate}
          />
        ))}
      </div>

      {/* Leave period panel — shown when user clicks a day */}
      {selectedDate && (
        <LeavePeriodPanel
          date={selectedDate}
          leaveDays={leaveDays}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  )
}
