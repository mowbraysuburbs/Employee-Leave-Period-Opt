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
}) {
  const [tooltipVisible, setTooltipVisible] = useState(false)

  if (isEmpty) return <div />

  const colour = getColourForDaysOff(daysOff)
  const hasBackground = colour !== null

  const tooltipLines = []
  if (daysOff > 0) tooltipLines.push(`${daysOff} day${daysOff === 1 ? '' : 's'} off`)
  if (isPublicHoliday && holidayName) tooltipLines.push(`🗓 ${holidayName}`)
  if (isSchoolHoliday && schoolBreakLabel) tooltipLines.push(`🏫 ${schoolBreakLabel}`)

  return (
    <div className="relative flex items-center justify-center">
      <div
        className={`w-full aspect-square rounded-full flex flex-col items-center justify-center select-none transition-transform hover:scale-125 hover:z-10 relative ${daysOff > 0 && onDayClick ? 'cursor-pointer' : 'cursor-default'}`}
        style={{ backgroundColor: hasBackground ? colour : 'transparent' }}
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
        onClick={() => daysOff > 0 && onDayClick && onDayClick(date)}
      >
        {/* Date number — same colour for all cells; public holidays get white + bold */}
        <span
          className={`text-[9px] leading-none md:text-[10px] ${
            isPublicHoliday
              ? 'text-white font-bold'
              : hasBackground
              ? 'text-slate-800 dark:text-slate-900 font-medium'
              : 'text-slate-400 dark:text-slate-600 font-normal'
          }`}
        >
          {dayNumber}
        </span>

        {/* Public holiday dot — small white dot below the number */}
        {isPublicHoliday && (
          <span className="w-1 h-1 rounded-full bg-white mt-0.5 opacity-90" />
        )}

        {/* School holiday dot — sky blue, only when not also a public holiday */}
        {isSchoolHoliday && !isPublicHoliday && (
          <span className="w-1 h-1 rounded-full bg-sky-200 mt-0.5 opacity-80" />
        )}
      </div>

      {/* Tooltip — desktop only */}
      {tooltipVisible && tooltipLines.length > 0 && (
        <div className="hidden md:block absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 pointer-events-none">
          <div className="bg-slate-900 dark:bg-slate-700 text-white text-xs rounded px-2 py-1.5 whitespace-nowrap shadow-lg border border-slate-700 dark:border-slate-600">
            <div className="font-semibold mb-0.5">{date}</div>
            {tooltipLines.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
          <div className="w-2 h-2 bg-slate-900 dark:bg-slate-700 border-b border-r border-slate-700 rotate-45 mx-auto -mt-1" />
        </div>
      )}
    </div>
  )
}
