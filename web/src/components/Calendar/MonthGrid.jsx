import { DayCell } from './DayCell'
import { getHolidayName, isPublicHoliday } from '../../data/publicHolidays'
import { getSchoolBreakLabel, isSchoolHoliday } from '../../data/schoolHolidays'

const WEEKDAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function MonthGrid({
  year, month, scoreMap, showSchoolHolidays, provinceCode, filterSet, onDayClick,
  hoveredRange, onDayHover, onDayLeave,
}) {
  const monthName = MONTH_NAMES[month - 1]

  const firstDayRaw = new Date(year, month - 1, 1).getDay()
  const firstDayMon = (firstDayRaw + 6) % 7
  const daysInMonth = new Date(year, month, 0).getDate()

  const cells = []
  for (let i = 0; i < firstDayMon; i++) cells.push({ isEmpty: true, weekdayIndex: i })
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    const dateStr = `${year}-${mm}-${dd}`
    const weekdayIndex = (firstDayMon + d - 1) % 7
    cells.push({ isEmpty: false, day: d, dateStr, weekdayIndex })
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5 uppercase tracking-wide">
        {monthName}
      </h3>

      <div className="grid grid-cols-7 gap-0.5 mb-0.5">
        {WEEKDAY_HEADERS.map((label, i) => (
          <div
            key={i}
            className={`text-center text-[10px] font-semibold uppercase ${
              i >= 5 ? 'text-slate-600 dark:text-slate-300' : 'text-slate-700 dark:text-slate-200'
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* onMouseLeave clears the hover range when mouse exits the month entirely */}
      <div className="grid grid-cols-7 gap-0.5" onMouseLeave={onDayLeave}>
        {cells.map((cell, i) => {
          if (cell.isEmpty) {
            return (
              <div
                key={`empty-${i}`}
                className="aspect-square"
                onMouseEnter={onDayLeave}
              />
            )
          }

          const { day, dateStr, weekdayIndex } = cell
          const rawDaysOff = scoreMap.get(dateStr) ?? 0
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
              schoolBreakLabel={schoolHol ? getSchoolBreakLabel(dateStr, provinceCode, year) : null}
              onDayClick={onDayClick}
              hoveredRange={hoveredRange}
              weekdayIndex={weekdayIndex}
              onDayHover={onDayHover}
            />
          )
        })}
      </div>
    </div>
  )
}
