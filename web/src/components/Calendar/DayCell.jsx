import { useState, memo } from 'react'
import { getColourForDaysOff } from '../../utils/colorScale'

function inRange(hr, date) { return !!hr && date >= hr.start && date <= hr.end }

function dayCellEqual(prev, next) {
  if (
    prev.date            !== next.date            ||
    prev.daysOff         !== next.daysOff         ||
    prev.isPublicHoliday !== next.isPublicHoliday ||
    prev.isSchoolHoliday !== next.isSchoolHoliday ||
    prev.weekdayIndex    !== next.weekdayIndex    ||
    prev.compact         !== next.compact         ||
    prev.onDayClick      !== next.onDayClick      ||
    prev.onDayHover      !== next.onDayHover
  ) return false

  // Skip re-render if this cell's in-range / start / end status is unchanged
  const d = prev.date
  if (inRange(prev.hoveredRange, d) !== inRange(next.hoveredRange, d)) return false
  if ((prev.hoveredRange?.start === d) !== (next.hoveredRange?.start === d)) return false
  if ((prev.hoveredRange?.end   === d) !== (next.hoveredRange?.end   === d)) return false

  return true
}

export const DayCell = memo(function DayCell({
  date,
  dayNumber,
  daysOff,
  isPublicHoliday,
  holidayName,
  isSchoolHoliday,
  schoolBreakLabel,
  isEmpty,
  compact,
  onDayClick,
  onDayHover,
  hoveredRange,
  weekdayIndex,
}) {
  const [tooltipVisible, setTooltipVisible] = useState(false)

  if (isEmpty) return <div />

  const today = new Date().toISOString().split('T')[0]
  const isToday = date === today

  const colour = getColourForDaysOff(daysOff)
  const hasBackground = colour !== null

  // Range highlight flags
  const isInRange = !!(hoveredRange && date >= hoveredRange.start && date <= hoveredRange.end)
  const isRangeStart = isInRange && date === hoveredRange.start
  const isRangeEnd = isInRange && date === hoveredRange.end
  const isRowStart = weekdayIndex === 0
  const isRowEnd = weekdayIndex === 6

  // Shape: circle by default; band caps when in range
  let shapeClass = 'rounded-full'
  if (isInRange) {
    const leftCap = isRangeStart || isRowStart
    const rightCap = isRangeEnd || isRowEnd
    if (leftCap && rightCap) shapeClass = 'rounded-sm'
    else if (leftCap) shapeClass = 'rounded-l-sm rounded-r-none'
    else if (rightCap) shapeClass = 'rounded-r-sm rounded-l-none'
    else shapeClass = 'rounded-none'
  }

  // Box-shadow draws the band border + endpoint glows without affecting layout.
  let rangeBoxShadow = null
  if (isInRange) {
    const parts = [
      '0 -1px 0 1px var(--range-border)',
      '0 1px 0 1px var(--range-border)',
    ]
    if (isRangeStart) parts.push('-3px 0 8px 0 var(--range-glow)')
    else if (isRowStart) parts.push('-1px 0 0 1px var(--range-row-cap)')
    if (isRangeEnd) parts.push('3px 0 8px 0 var(--range-glow)')
    else if (isRowEnd) parts.push('1px 0 0 1px var(--range-row-cap)')
    rangeBoxShadow = parts.join(', ')
  }

  const tooltipLines = []
  if (daysOff > 0) tooltipLines.push(`${daysOff} day${daysOff === 1 ? '' : 's'} off`)
  if (isPublicHoliday && holidayName) tooltipLines.push(`🗓 ${holidayName}`)
  if (isSchoolHoliday && schoolBreakLabel) tooltipLines.push(`🏫 ${schoolBreakLabel}`)

  const isClickable = daysOff > 0 && !!onDayClick

  return (
    <div className="relative flex items-center justify-center">
      <div
        className={`w-[93%] aspect-square ${shapeClass} flex flex-col items-center justify-center select-none relative
          transition-all duration-100
          ${!isInRange ? 'hover:scale-110 hover:z-10' : ''}
          ${isClickable ? 'cursor-pointer' : 'cursor-default'}
          ${isToday ? 'ring-2 ring-black dark:ring-white ring-offset-1' : ''}`}
        style={{
          backgroundColor: hasBackground
            ? colour
            : isInRange
              ? 'var(--range-fill)'
              : 'transparent',
          ...(rangeBoxShadow ? { boxShadow: rangeBoxShadow } : {}),
        }}
        onMouseEnter={() => {
          setTooltipVisible(true)
          if (daysOff > 0 && onDayHover) onDayHover(date)
        }}
        onMouseLeave={() => {
          setTooltipVisible(false)
        }}
        onClick={() => isClickable && onDayClick(date)}
      >
        <span
          className={`${compact ? 'text-[9px]' : 'text-sm sm:text-xs'} leading-none ${
            isPublicHoliday
              ? 'text-white font-bold italic'
              : hasBackground
              ? 'text-black dark:text-slate-900 font-medium'
              : isInRange
              ? 'text-slate-300 dark:text-slate-300 font-medium'
              : 'text-slate-400 dark:text-slate-600 font-normal'
          }`}
        >
          {dayNumber}
        </span>

        {isSchoolHoliday && !isPublicHoliday && (
          <span className="w-1 h-1 rounded-full bg-sky-200 mt-0.5 opacity-80" />
        )}
      </div>

      {tooltipVisible && tooltipLines.length > 0 && (
        <div className="hidden md:block absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 pointer-events-none">
          <div className="bg-slate-900 dark:bg-slate-700 text-white text-xs rounded px-2 py-1.5 whitespace-nowrap shadow-lg border border-slate-700 dark:border-slate-600">
            <div className="font-semibold mb-0.5">{date}</div>
            {tooltipLines.map((line, i) => <div key={i}>{line}</div>)}
          </div>
          <div className="w-2 h-2 bg-slate-900 dark:bg-slate-700 border-b border-r border-slate-700 rotate-45 mx-auto -mt-1" />
        </div>
      )}
    </div>
  )
}, dayCellEqual)
