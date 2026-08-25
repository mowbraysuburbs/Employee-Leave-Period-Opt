import { DayCell } from './DayCell'
import { getHolidayName, isPublicHoliday } from '../../data/publicHolidays'
import { getSchoolBreakLabel, isSchoolHoliday } from '../../data/schoolHolidays'

const WEEKDAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function MonthGrid({
  year, month, scoreMap, colourRange, showSchoolHolidays, provinceCode, filterSet, compact, onDayClick,
  hoveredRange, onDayHover, onDayLeave, cellPx,
}) {
  const monthName = MONTH_NAMES[month - 1]

  const firstDayOffset = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()

  const cells = []
  for (let i = 0; i < firstDayOffset; i++) cells.push({ isEmpty: true, weekdayIndex: i })
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    const dateStr = `${year}-${mm}-${dd}`
    const weekdayIndex = (firstDayOffset + d - 1) % 7
    cells.push({ isEmpty: false, day: d, dateStr, weekdayIndex })
  }

  // cellPx (desktop, from CalendarHeatmap's 3-tier auto-size) is a runtime
  // value, so the column width has to be inline style — Tailwind's JIT can
  // only pick up class names that are literal strings in the source. The
  // card's overall width is also set explicitly (not left to `w-fit`) so its
  // flex-wrap sibling packs tightly against it instead of leaving a gap sized
  // by whatever the browser guesses the content's intrinsic width to be.
  const usingCellPx = cellPx != null
  const colStyle = usingCellPx ? { gridTemplateColumns: `repeat(7, ${cellPx}px)` } : undefined
  const colClass = usingCellPx ? '' : compact ? 'grid-cols-[repeat(7,26px)]' : 'grid-cols-7'
  const effectiveCompact = usingCellPx ? cellPx < 32 : compact
  const cardWidthPx = usingCellPx ? cellPx * 7 + 2 * 6 : undefined

  return (
    <div
      className={`flex flex-col gap-1 flex-shrink-0 ${usingCellPx || compact ? 'w-fit' : 'w-full'}`}
      style={cardWidthPx ? { width: cardWidthPx } : undefined}
    >
      <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5 uppercase tracking-wide">
        {monthName} {year}
      </h3>

      <div className={`grid ${colClass} gap-0.5 mb-0.5`} style={colStyle}>
        {WEEKDAY_HEADERS.map((label, i) => (
          <div
            key={i}
            className={`text-center text-[10px] font-semibold uppercase ${
              i === 0 || i === 6 ? 'text-slate-600 dark:text-slate-300' : 'text-slate-700 dark:text-slate-200'
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* onMouseLeave clears the hover range when mouse exits the month entirely */}
      <div className={`grid ${colClass} gap-0.5`} style={colStyle} onMouseLeave={onDayLeave}>
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
              colourRange={colourRange}
              isPublicHoliday={pubHoliday}
              holidayName={getHolidayName(dateStr, year)}
              isSchoolHoliday={schoolHol}
              schoolBreakLabel={schoolHol ? getSchoolBreakLabel(dateStr, provinceCode, year) : null}
              compact={effectiveCompact}
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
