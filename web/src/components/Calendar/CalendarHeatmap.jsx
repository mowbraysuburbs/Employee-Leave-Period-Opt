import { useMemo, useState } from 'react'
import { MonthGrid } from './MonthGrid'
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
}) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [hoveredRange, setHoveredRange] = useState(null)

  const scoreMap = useMemo(() => {
    const map = new Map()
    for (const { date, daysOff } of scores) map.set(date, daysOff)
    return map
  }, [scores])

  function handleDayHover(dateStr) {
    if (leaveDays === 0) return
    const range = getLeaveRange(dateStr, leaveDays)
    setHoveredRange({ start: range.startDate, end: range.endDate })
  }

  function handleDayLeave() {
    setHoveredRange(null)
  }

  function handleDayClick(dateStr) {
    if (isTouch) {
      // Mobile: tap toggles the leave-period highlight instead of opening a panel
      if (leaveDays === 0) return
      const range = getLeaveRange(dateStr, leaveDays)
      if (hoveredRange?.start === range.startDate) {
        setHoveredRange(null)
      } else {
        setHoveredRange({ start: range.startDate, end: range.endDate })
      }
    } else {
      setSelectedDate(dateStr)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Month grids — 1 column on mobile so cells are large enough to tap */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {months.map(({ year, month }) => (
          <MonthGrid
            key={`${year}-${month}`}
            year={year}
            month={month}
            scoreMap={scoreMap}
            showSchoolHolidays={showSchoolHolidays}
            provinceCode={provinceCode}
            filterSet={filterSet}
            onDayClick={handleDayClick}
            hoveredRange={hoveredRange}
            onDayHover={handleDayHover}
            onDayLeave={handleDayLeave}
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
