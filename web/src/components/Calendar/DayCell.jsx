import { useState } from 'react'
import { getColourForDaysOff } from '../../utils/colorScale'

export function DayCell({
  date,
  dayNumber,
  daysOff,
  isPublicHoliday,
  holidayName,
  isSchoolHoliday,
  schoolBreakLabel,
  isEmpty,
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
  const isRowStart = weekdayIndex === 0  // Monday — soft left cap at row wrap
  const isRowEnd = weekdayIndex === 6    // Sunday — soft right cap at row wrap

  // Shape: circle by default; when in range the band overrides with square caps
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
  // Uses CSS variables so light mode gets dark outlines, dark mode gets white ones.
  let rangeBoxShadow = null
  if (isInRange) {
    const parts = [
      '0 -1px 0 1px var(--range-border)',  // top band line
      '0 1px 0 1px var(--range-border)',   // bottom band line
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
        className={`w-full aspect-square ${shapeClass} flex flex-col items-center justify-center select-none relative
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
          // Range is cleared by empty-cell mouseEnter and grid-container mouseLeave — not here,
          // so moving between adjacent scored cells doesn't cause a flicker.
        }}
        onClick={() => isClickable && onDayClick(date)}
      >
        <span
          className={`text-xs leading-none ${
            isPublicHoliday
              ? 'text-white font-bold italic'
              : hasBackground
              ? 'text-slate-800 dark:text-slate-900 font-medium'
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
}
