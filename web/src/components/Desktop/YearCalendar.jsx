import { useMemo, useRef, useState, useEffect } from 'react'
import { MonthCard } from './MonthCard'
import { HoverCard } from './HoverCard'
import { buildMonthDays, keepMatchingRows, withBand } from '../../utils/calendarDays'

/**
 * Props:
 *   months         – [{ year, month }] every month the date period touches
 *   breaks         – { [date]: break } for each start day inside the period
 *   colourBy       – 'daysOff' | 'multiplier'
 *   holidayFilter  – string[]; non-matching start days fade out
 *   picksOnly      – show saved breaks by day type instead of the heatmap
 *   savedDayTypes  – Map(date -> type) across every saved break
 *   savedStarts    – Set of saved break start dates
 *   previewDayTypes, previewStarts – a quick pick being previewed from
 *                    Overview (Map date -> type, Set of start dates), or null
 *   schoolDates    – Set of school-holiday dates to underline, or null when the filter is off
 *   daysOffFilter  – Set of days-off values to keep coloured, or null; months without a
 *                    match are hidden, but any row with a match is kept whole
 *   hoveredDate    – day under the mouse (owned by the parent so Details can follow it)
 *   selectedBreak  – the clicked break, drawn as a solid band of squares, or null
 *   onDayHover, onDayClick
 */
export function YearCalendar({
  months,
  breaks,
  colourBy,
  holidayFilter,
  picksOnly,
  savedDayTypes,
  savedStarts,
  previewDayTypes,
  previewStarts,
  schoolDates,
  daysOffFilter,
  hoveredDate,
  selectedBreak,
  onDayHover,
  onDayClick,
}) {
  // Colours depend on everything except the hover, so hovering stays cheap.
  const monthDays = useMemo(
    () => buildMonthDays({ months, breaks, colourBy, holidayFilter, picksOnly, savedDayTypes, savedStarts, previewDayTypes, previewStarts, schoolDates, daysOffFilter }),
    [months, breaks, colourBy, holidayFilter, picksOnly, savedDayTypes, savedStarts, previewDayTypes, previewStarts, schoolDates, daysOffFilter]
  )

  // How many month cards fit per row, matching the grid's minmax(260px, 1fr) and 16px gap.
  const gridRef = useRef(null)
  const [columns, setColumns] = useState(3)
  useEffect(() => {
    const el = gridRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setColumns(Math.max(1, Math.floor((entry.contentRect.width + 16) / (260 + 16))))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const visibleMonths = useMemo(
    () => keepMatchingRows(monthDays, breaks, daysOffFilter, columns),
    [monthDays, daysOffFilter, columns, breaks]
  )

  const hoverBreak = hoveredDate ? breaks[hoveredDate] : null

  function popoverFor(date) {
    return date === hoveredDate && hoverBreak ? <HoverCard brk={hoverBreak} colourBy={colourBy} /> : null
  }

  return (
    <section ref={gridRef} aria-label="Calendar" tabIndex={0} className="flex-1 min-h-0 overflow-y-auto pr-1.5 pb-4 content-start grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
      {visibleMonths.length === 0 && (
        <div className="col-span-full p-5 border-[1.5px] border-dashed border-slate-300 rounded-2xl text-sm text-slate-600 text-center">
          No start days give that many days off in this period. Pick other numbers or clear the filter.
        </div>
      )}
      {visibleMonths.map(m => (
        <MonthCard
          key={`${m.year}-${m.month}`}
          year={m.year}
          month={m.month}
          days={m.days.map(d => {
            const selected = selectedBreak ? withBand(d, selectedBreak, true) : d
            return hoverBreak ? withBand(selected, hoverBreak) : selected
          })}
          popoverFor={popoverFor}
          onDayClick={onDayClick}
          onDayHover={onDayHover}
        />
      ))}
    </section>
  )
}
