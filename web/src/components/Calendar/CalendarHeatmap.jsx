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
}) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [hoveredRange, setHoveredRange] = useState(null)

  const scoreMap = useMemo(() => {
    const map = new Map()
    for (const { date, daysOff, publicHolidays } of scores) {
      map.set(date, smartFilter && (publicHolidays ?? 0) === 0 ? 0 : daysOff)
    }
    return map
  }, [scores, smartFilter])

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
    if (isTouch) {
      if (leaveDays === 0) return
      const range = getLeaveRange(dateStr, leaveDays)
      setHoveredRange(prev =>
        prev?.start === range.startDate ? null : { start: range.startDate, end: range.endDate }
      )
    } else {
      setSelectedDate(dateStr)
    }
  }, [leaveDays])

  const sharedProps = {
    scoreMap,
    showSchoolHolidays,
    provinceCode,
    filterSet,
    onDayClick: handleDayClick,
    hoveredRange,
    onDayHover: handleDayHover,
    onDayLeave: handleDayLeave,
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile: continuous single-column calendar */}
      <div className="sm:hidden">
        <ContinuousCalendar months={months} {...sharedProps} />
      </div>

      {/* Desktop: month card grid */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
