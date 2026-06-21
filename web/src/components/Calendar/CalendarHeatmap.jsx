import { useMemo, useState, useCallback } from 'react'
import { MonthGrid } from './MonthGrid'
import { ContinuousCalendar } from './ContinuousCalendar'
import { LeavePeriodPanel } from './LeavePeriodPanel'
import { getLeaveRange } from '../../utils/leaveCalculator'

// Detect touch/coarse-pointer devices (phones, tablets) — evaluated once at module load
const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

export function CalendarHeatmap({
  scores,
  months,
  leaveDays,
  showSchoolHolidays,
  provinceCode,
  filterSet,
  smartFilter,
  viewMode = '1x',
}) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [hoveredRange, setHoveredRange] = useState(null)

  const scoreMap = useMemo(() => {
    const map = new Map()
    for (const { date, daysOff } of scores) {
      map.set(date, smartFilter && daysOff <= leaveDays ? 0 : daysOff)
    }
    return map
  }, [scores, smartFilter, leaveDays])

  const colourRange = useMemo(() => {
    let min = Infinity, max = 0
    for (const v of scoreMap.values()) {
      if (v > 0) { if (v < min) min = v; if (v > max) max = v }
    }
    return { min: min === Infinity ? 1 : min, max: max === 0 ? 14 : max }
  }, [scoreMap])

  const handleDayHover = useCallback((dateStr) => {
    if (leaveDays === 0) return
    const range = getLeaveRange(dateStr, leaveDays)
    setHoveredRange(prev =>
      prev?.start === range.startDate ? prev : { start: range.startDate, end: range.endDate }
    )
  }, [leaveDays])

  const handleDayLeave = useCallback(() => {
    setHoveredRange(null)
  }, [])

  const handleDayClick = useCallback((dateStr) => {
    setSelectedDate(dateStr)
  }, [])

  const compact = viewMode === '2x'

  const sharedProps = {
    scoreMap,
    colourRange,
    showSchoolHolidays,
    provinceCode,
    filterSet,
    compact,
    onDayClick: handleDayClick,
    hoveredRange,
    onDayHover: handleDayHover,
    onDayLeave: handleDayLeave,
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile: 2col shows month cards side-by-side; others use continuous scroll */}
      {viewMode === '2col' ? (
        <div className="sm:hidden grid grid-cols-2 gap-2 px-2">
          {months.map(({ year, month }) => (
            <MonthGrid key={`${year}-${month}`} year={year} month={month} {...sharedProps} />
          ))}
        </div>
      ) : (
        <div className="sm:hidden">
          <ContinuousCalendar months={months} {...sharedProps} />
        </div>
      )}

      {/* Desktop: month card grid */}
      <div className={`${compact ? 'hidden sm:flex sm:flex-wrap' : 'hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'} gap-5`}>
        {months.map(({ year, month }) => (
          <MonthGrid
            key={`${year}-${month}`}
            year={year}
            month={month}
            {...sharedProps}
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
