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
  pageDaysOffMap = null,
}) {
  const [selectedDate, setSelectedDate] = useState(null)
  const [hoveredRange, setHoveredRange] = useState(null)
  const activeHoveredRange = externalHoveredRange ?? hoveredRange

  // A Days Off chip filters by a specific value — a page-scoped date has to
  // be coloured by whichever value actually qualified it for that filter,
  // not the calendar's own independently-computed full-spend total (which
  // can be a different number, and a different colour, if the qualifying
  // table row used fewer leave days than the slider). Every date in
  // pageDaysOffMap already passed the table's own filterSet check, so using
  // it here is always safe. Without an active filter, the calendar still
  // shows the full-spend max for every date, as it always has.
  const hasActiveFilter = filterSet && filterSet.size > 0
  const scoreMap = useMemo(() => {
    const map = new Map()
    for (const { date, daysOff } of scores) {
      if (restrictToDates && !restrictToDates.has(date)) continue
      const value = hasActiveFilter && pageDaysOffMap?.has(date) ? pageDaysOffMap.get(date) : daysOff
      map.set(date, smartFilter && value <= leaveDays ? 0 : value)
    }
    return map
  }, [scores, smartFilter, restrictToDates, leaveDays, hasActiveFilter, pageDaysOffMap])

  const colourRange = useMemo(() => {
    let min = Infinity, max = 0
    for (const v of scoreMap.values()) {
      if (v > 0) { if (v < min) min = v; if (v > max) max = v }
    }
    return { min: min === Infinity ? 1 : min, max: max === 0 ? 14 : max }
  }, [scoreMap])

  const handleDayHover = useCallback((dateStr) => {
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
    // When the table is already restricting which dates show (restrictToDates),
    // that restriction IS the days-off filter's effect — every date it lets
    // through already belongs to a qualifying table row, possibly one using
    // fewer leave days than the slider. Applying filterSet again here would
    // re-check against the calendar's own full-spend value for that date,
    // which can legitimately differ from the row that actually qualified,
    // and would wrongly hide a date the table says is a valid match. Only
    // apply it directly when there's no table driving what's shown (e.g.
    // Calendar-only mode), where it's the only filtering mechanism at all.
    filterSet: restrictToDates ? null : filterSet,
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
          leaveDays={leaveDays}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  )
}
