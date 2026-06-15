import { DayCell } from './DayCell'
import { getHolidayName, isPublicHoliday } from '../../data/publicHolidays'
import { getSchoolBreakLabel, isSchoolHoliday } from '../../data/schoolHolidays'

const WEEKDAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/**
 * Renders a single month as a 7-column calendar grid.
 *
 * Props:
 *   year         – number
 *   month        – 1–12
 *   scoreMap     – Map<"YYYY-MM-DD", number> of daysOff scores
 *   showSchoolHolidays – bool
 *   provinceCode – string (e.g. "GP")
 */
export function MonthGrid({ year, month, scoreMap, showSchoolHolidays, provinceCode, filterSet, onDayClick }) {
  const monthName = MONTH_NAMES[month - 1]

  // Find what weekday the 1st of this month falls on (0=Sun…6=Sat)
  // We want Mon-first grid, so convert: Mon=0, Tue=1 … Sun=6
  const firstDayRaw = new Date(year, month - 1, 1).getDay() // 0=Sun
  const firstDayMon = (firstDayRaw + 6) % 7 // shift so Mon=0

  const daysInMonth = new Date(year, month, 0).getDate()

  // Build the cell list: leading empty pads + actual days
  const cells = []
  for (let i = 0; i < firstDayMon; i++) cells.push({ isEmpty: true, day: null })
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    const dateStr = `${year}-${mm}-${dd}`
    cells.push({ isEmpty: false, day: d, dateStr })
  }

  return (
    <div className="flex flex-col gap-1 w-full max-w-[220px]">
      {/* Month label */}
      <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5 uppercase tracking-wide">
        {monthName}
      </h3>

      {/* Weekday header row */}
      <div className="grid grid-cols-7 gap-0.5 mb-0.5">
        {WEEKDAY_HEADERS.map((label, i) => (
          <div
            key={i}
            className="text-center text-[8px] font-medium text-slate-400 dark:text-slate-600 uppercase"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Day cells grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((cell, i) => {
          if (cell.isEmpty) {
            return <DayCell key={`empty-${i}`} isEmpty />
          }

          const { day, dateStr } = cell
          const rawDaysOff = scoreMap.get(dateStr) ?? 0
          // Multi-select filter: blank out cells not in the active set
          const daysOff = filterSet && filterSet.size > 0 && !filterSet.has(rawDaysOff) ? 0 : rawDaysOff
          const pubHoliday = isPublicHoliday(dateStr, year)
          const schoolHol = showSchoolHolidays && isSchoolHoliday(dateStr, provinceCode, year)

          return (
            <DayCell
              key={dateStr}
              date={dateStr}
              dayNumber={day}
              daysOff={daysOff}
              isPublicHoliday={pubHoliday}
              holidayName={getHolidayName(dateStr, year)}
              isSchoolHoliday={schoolHol}
              schoolBreakLabel={
                schoolHol ? getSchoolBreakLabel(dateStr, provinceCode, year) : null
              }
              onDayClick={onDayClick}
            />
          )
        })}
      </div>
    </div>
  )
}
