import { useMemo, useState } from 'react'
import { MonthGrid } from './MonthGrid'
import { LeavePeriodPanel } from './LeavePeriodPanel'
import { getLeaveRange } from '../../utils/leaveCalculator'

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

  return (
    <div className="flex flex-col gap-4">
      {/* Month grids */}
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {months.map(({ year, month }) => (
          <MonthGrid
            key={`${year}-${month}`}
            year={year}
            month={month}
            scoreMap={scoreMap}
            showSchoolHolidays={showSchoolHolidays}
            provinceCode={provinceCode}
            filterSet={filterSet}
            onDayClick={setSelectedDate}
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
