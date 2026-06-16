import { useMemo, useState } from 'react'
import { MonthGrid } from './MonthGrid'
import { LeavePeriodPanel } from './LeavePeriodPanel'
import { buildLegend } from '../../utils/colorScale'

/**
 * Props:
 *   scores            – array from computeLeaveScores
 *   months            – array of { year, month } to render
 *   leaveDays         – number (passed to LeavePeriodPanel)
 *   showSchoolHolidays – bool
 *   provinceCode      – string
 *   filterSet         – Set<number> (controlled from App)
 *   onFilterChange    – (newSet: Set<number>) => void
 */
export function CalendarHeatmap({
  scores,
  months,
  leaveDays,
  showSchoolHolidays,
  provinceCode,
  filterSet,
  onFilterChange,
}) {
  const [selectedDate, setSelectedDate] = useState(null)

  const scoreMap = useMemo(() => {
    const map = new Map()
    for (const { date, daysOff } of scores) map.set(date, daysOff)
    return map
  }, [scores])

  const legend = useMemo(() => buildLegend(scores), [scores])

  function handleLegendClick(daysOff) {
    onFilterChange((prev) => {
      const next = new Set(prev)
      if (next.has(daysOff)) next.delete(daysOff)
      else next.add(daysOff)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Legend — coloured circles, click to toggle filter; Clear all appears inline when active */}
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

        {filterSet.size > 0 && (
          <button
            onClick={() => onFilterChange(new Set())}
            className="ml-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Clear all ×
          </button>
        )}
      </div>


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
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
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
