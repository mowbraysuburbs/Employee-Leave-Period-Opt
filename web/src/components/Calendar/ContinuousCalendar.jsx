import { Fragment, useMemo } from 'react'
import { DayCell } from './DayCell'
import { getHolidayName, isPublicHoliday } from '../../data/publicHolidays'
import { getSchoolBreakLabel, isSchoolHoliday } from '../../data/schoolHolidays'

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function buildRows(months, scoreMap, filterSet) {
  if (months.length === 0) return []

  const { year: y0, month: m0 } = months[0]
  const firstDayMon = (new Date(y0, m0 - 1, 1).getDay() + 6) % 7

  const flat = []
  for (let i = 0; i < firstDayMon; i++) flat.push({ type: 'empty', key: `init-${i}` })

  for (const { year, month } of months) {
    const daysInMonth = new Date(year, month, 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) {
      const mm = String(month).padStart(2, '0')
      const dd = String(d).padStart(2, '0')
      const dateStr = `${year}-${mm}-${dd}`
      const weekdayIndex = flat.length % 7
      const raw = scoreMap.get(dateStr) ?? 0
      const daysOff = filterSet?.size > 0 && !filterSet.has(raw) ? 0 : raw
      flat.push({
        type: 'day', dateStr, dayNumber: d, weekdayIndex, daysOff, year,
        isFirstOfMonth: d === 1,
        monthLabel: d === 1 ? MONTH_SHORT[month - 1] : null,
        monthYear:  d === 1 ? `'${String(year).slice(2)}` : null,
      })
    }
  }

  while (flat.length % 7 !== 0) flat.push({ type: 'empty', key: `end-${flat.length}` })

  const rows = []
  let firstMonthSeen = false

  for (let r = 0; r < flat.length; r += 7) {
    const cells = flat.slice(r, r + 7)
    const firstOfMonth = cells.find(c => c.isFirstOfMonth)
    const hasMonthLabel = !!firstOfMonth
    const isTransitionRow = hasMonthLabel && firstMonthSeen

    // transitionIdx: which day-cell index (0–6) the new month starts on.
    // 0 = whole row is new month → straight border-t across the row.
    // >0 = mixed row → Z-step shape drawn within this row only.
    const transitionIdx = isTransitionRow
      ? cells.findIndex(c => c.isFirstOfMonth)
      : -1

    rows.push({
      monthLabel: firstOfMonth?.monthLabel ?? null,
      monthYear:  firstOfMonth?.monthYear ?? null,
      isTransitionRow,
      transitionIdx,
      cells,
    })
    if (hasMonthLabel) firstMonthSeen = true
  }

  return rows
}

const LINE = 'border-slate-500 dark:border-slate-400'

export function ContinuousCalendar({
  months,
  scoreMap,
  colourRange,
  showSchoolHolidays,
  provinceCode,
  filterSet,
  compact,
  onDayClick,
  hoveredRange,
  onDayHover,
  onDayLeave,
}) {
  const rows = useMemo(
    () => buildRows(months, scoreMap, filterSet),
    [months, scoreMap, filterSet]
  )

  return (
    <div className={`flex flex-col ${compact ? 'w-fit mx-auto' : ''}`} onMouseLeave={onDayLeave}>
      {rows.map((row, rowIdx) => {
        const { isTransitionRow, transitionIdx } = row

        // Step border logic (all within the transition row — no adjacent row changes):
        //
        //  transitionIdx === 0  → straight line: border-t on all cells + label
        //  transitionIdx  >  0  → Z-step (old month flows in from above, new month starts cleanly):
        //    old-month cells (0..transitionIdx-1) : border-b   ← bottom of Sep area
        //    corner cell    (transitionIdx)       : border-l + border-t  ← vertical + top of Oct
        //    new-month cells (transitionIdx+1..6) : border-t
        //    label                                : border-t
        //
        // With gap-0 the borders of adjacent cells share the same pixel → connected lines.

        const straight = isTransitionRow && transitionIdx === 0

        const labelBorder = !isTransitionRow ? ''
          : straight ? `border-t ${LINE}`
          : `border-t ${LINE}`

        return (
          <div key={rowIdx} className={`grid ${compact ? 'grid-cols-[repeat(7,28px)_24px]' : 'grid-cols-[repeat(7,1fr)_32px]'} gap-0`}>
            {/* Seven day cells first */}
            {row.cells.map((cell, ci) => {
              // ── Step separator borders (month boundary) ──────────────────────
              let stepClasses = ''
              if (straight) {
                stepClasses = `border-t ${LINE}`
              } else if (isTransitionRow) {
                if (ci < transitionIdx)      stepClasses = `border-b ${LINE}`
                else if (ci === transitionIdx) stepClasses = `border-l border-t ${LINE}`
                else                           stepClasses = `border-t ${LINE}`
              }

              if (cell.type === 'empty') {
                return (
                  <div
                    key={cell.key ?? `e-${rowIdx}-${ci}`}
                    className={stepClasses}
                    onMouseEnter={onDayLeave}
                  >
                    <div className="aspect-square" />
                  </div>
                )
              }

              const { dateStr, dayNumber, weekdayIndex, daysOff, year } = cell
              const pubHoliday = isPublicHoliday(dateStr, year)
              const schoolHol  = showSchoolHolidays && isSchoolHoliday(dateStr, provinceCode, year)

              return (
                <div key={dateStr} className={stepClasses}>
                  <DayCell
                    date={dateStr}
                    dayNumber={dayNumber}
                    daysOff={daysOff}
                    colourRange={colourRange}
                    isPublicHoliday={pubHoliday}
                    holidayName={getHolidayName(dateStr, year)}
                    isSchoolHoliday={schoolHol}
                    schoolBreakLabel={schoolHol ? getSchoolBreakLabel(dateStr, provinceCode, year) : null}
                    compact={compact}
                    onDayClick={onDayClick}
                    hoveredRange={hoveredRange}
                    weekdayIndex={weekdayIndex}
                    onDayHover={onDayHover}
                  />
                </div>
              )
            })}

            {/* Month label column — rightmost, text left-aligned towards the cells */}
            <div className={`flex flex-col items-start justify-center pl-2 ${labelBorder}`}>
              {row.monthLabel && (
                <>
                  <span className="text-[8px] font-bold text-slate-700 dark:text-slate-200 uppercase leading-tight">
                    {row.monthLabel}
                  </span>
                  <span className="text-[7px] font-medium text-slate-400 dark:text-slate-500 leading-tight">
                    {row.monthYear}
                  </span>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
