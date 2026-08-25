import { useMemo, useState, useCallback, useRef, useEffect } from 'react'
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
  externalHoveredRange = null,
  restrictToDates = null,
}) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [hoveredRange, setHoveredRange] = useState(null)
  const activeHoveredRange = externalHoveredRange ?? hoveredRange

  const scoreMap = useMemo(() => {
    const map = new Map()
    for (const { date, daysOff, leaveDaysUsed } of scores) {
      if (restrictToDates && !restrictToDates.has(date)) continue
      map.set(date, smartFilter && daysOff <= leaveDaysUsed ? 0 : daysOff)
    }
    return map
  }, [scores, smartFilter, restrictToDates])

  // Each date's color comes from whichever leave-day spend gave it the best
  // ratio (see computeBestScores) — this map remembers which spend that was,
  // so hovering/clicking a day previews the period that actually earned its
  // color instead of always assuming the slider's full leave-day count.
  const leaveDaysUsedMap = useMemo(() => {
    const map = new Map()
    for (const { date, leaveDaysUsed } of scores) map.set(date, leaveDaysUsed)
    return map
  }, [scores])

  const colourRange = useMemo(() => {
    let min = Infinity, max = 0
    for (const v of scoreMap.values()) {
      if (v > 0) { if (v < min) min = v; if (v > max) max = v }
    }
    return { min: min === Infinity ? 1 : min, max: max === 0 ? 14 : max }
  }, [scoreMap])

  const handleDayHover = useCallback((dateStr) => {
    const k = leaveDaysUsedMap.get(dateStr) ?? leaveDays
    const range = getLeaveRange(dateStr, k)
    setHoveredRange(prev =>
      prev?.start === range.startDate ? prev : { start: range.startDate, end: range.endDate }
    )
  }, [leaveDaysUsedMap, leaveDays])

  const handleDayLeave = useCallback(() => {
    setHoveredRange(null)
  }, [])

  const handleDayClick = useCallback((dateStr) => {
    setSelectedDate(dateStr)
  }, [])

  const compact = viewMode === '2x'

  // Desktop month cards snap between three fixed cell sizes — never a
  // continuous shrink/grow, since the grid track width is always one of
  // exactly three pixel values, not a fraction of the container. The size
  // is picked from how much width each card would actually get if laid out
  // up to 4 per row, not from the pane's raw width alone — otherwise a pane
  // with plenty of room but only one or two month cards in it (e.g. a
  // page-restricted view) would stay small even though there's nothing else
  // competing for that space.
  const desktopGridRef = useRef(null)
  const [desktopWidth, setDesktopWidth] = useState(0)

  useEffect(() => {
    const el = desktopGridRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver((entries) => {
      setDesktopWidth(entries[0].contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const desktopCellPx = useMemo(() => {
    if (desktopWidth === 0) return 30
    const columns = Math.max(1, Math.min(months.length, 4))
    const perCardWidth = desktopWidth / columns
    return perCardWidth >= 300 ? 36 : perCardWidth >= 230 ? 30 : 24
  }, [desktopWidth, months.length])

  const sharedProps = {
    scoreMap,
    colourRange,
    showSchoolHolidays,
    provinceCode,
    filterSet,
    compact,
    onDayClick: handleDayClick,
    hoveredRange: activeHoveredRange,
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

      {/* Desktop: month card grid — always fixed-width cards that wrap, so
          the available row count adapts to the pane's width without any
          individual card ever resizing. */}
      <div ref={desktopGridRef} className="hidden sm:flex sm:flex-wrap gap-5">
        {months.map(({ year, month }) => (
          <MonthGrid
            key={`${year}-${month}`}
            year={year}
            month={month}
            cellPx={desktopCellPx}
            {...sharedProps}
          />
        ))}
      </div>

      {selectedDate && (
        <LeavePeriodPanel
          date={selectedDate}
          leaveDays={leaveDaysUsedMap.get(selectedDate) ?? leaveDays}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  )
}
