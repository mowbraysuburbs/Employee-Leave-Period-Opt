import { useMemo, useRef, useState, useEffect } from 'react'
import { MonthCard } from './MonthCard'
import { HoverCard } from './HoverCard'
import { AddPrompt } from './AddPrompt'
import { getColourForDaysOff, getColourForMultiplier } from '../../utils/colorScale'
import { DAY_TYPE_COLOUR } from '../../utils/dayTypes'
import { holidayNamesIn, formatMultiplier, hasGain } from '../../utils/breaks'
import { fmtDay, addDays } from '../../utils/dateFormat'

const OUTSIDE = { bg: 'transparent', fg: '#cbd5e1' }
const FADED = { bg: '#f1f5f9', fg: '#94a3b8' }
const NO_GAIN = { bg: 'transparent', fg: '#64748b' }
const START_RING = '0 0 0 3px #0f172a'
const SAVED_RING = 'inset 0 0 0 2px #0f172a'

function typeLook(type) {
  return { bg: DAY_TYPE_COLOUR[type], fg: type === 'weekend' ? '#ffffff' : '#0f172a' }
}

function datesInMonth(year, month) {
  const count = new Date(year, month, 0).getDate()
  const mm = String(month).padStart(2, '0')
  return Array.from({ length: count }, (_, i) => `${year}-${mm}-${String(i + 1).padStart(2, '0')}`)
}

/**
 * Hovering a day draws its whole break as one joined band, like the mobile
 * calendar: corners only round off where the band starts or ends a run (the
 * break's first/last day, a week row edge, or a month edge).
 */
function withBand(day, brk) {
  if (!brk || day.date < brk.startDate || day.date > brk.endDate) return day
  const weekday = new Date(day.date + 'T00:00:00').getDay()
  const isStart = day.date === brk.startDate
  const isEnd = day.date === brk.endDate
  const leftCap = isStart || weekday === 0 || day.dayNumber === 1
  const rightCap = isEnd || weekday === 6 || addDays(day.date, 1).slice(5, 7) !== day.date.slice(5, 7)

  let shape = 'rounded-none'
  if (leftCap && rightCap) shape = 'rounded-md'
  else if (leftCap) shape = 'rounded-l-md'
  else if (rightCap) shape = 'rounded-r-md'

  // Zero spread on the top/bottom lines so neighbouring days don't overlap
  // into visible seams; only the capped ends draw a side edge.
  const shadows = ['0 -1.5px 0 0 var(--range-border)', '0 1.5px 0 0 var(--range-border)']
  if (leftCap) shadows.push('-1.5px 0 0 0 var(--range-border)')
  if (rightCap) shadows.push('1.5px 0 0 0 var(--range-border)')
  if (isStart) shadows.push('-3px 0 8px 0 var(--range-glow)')
  if (isEnd) shadows.push('3px 0 8px 0 var(--range-glow)')
  if (day.ring) shadows.push(day.ring)

  return { ...day, inBand: true, shape, ring: shadows.join(', ') }
}

/**
 * Props:
 *   months         – [{ year, month }] every month the date period touches
 *   breaks         – { [date]: break } for each start day inside the period
 *   colourBy       – 'daysOff' | 'multiplier'
 *   holidayFilter  – string[]; non-matching start days fade out
 *   picksOnly      – show saved breaks by day type instead of the heatmap
 *   savedDayTypes  – Map(date -> type) across every saved break
 *   savedStarts    – Set of saved break start dates
 *   isSaved        – (break) => bool, to word the Add prompt as Add or Remove
 *   previewDayTypes, previewStarts – a quick pick being previewed from
 *                    Overview (Map date -> type, Set of start dates), or null
 *   schoolDates    – Set of school-holiday dates to underline, or null when the filter is off
 *   daysOffFilter  – Set of days-off values to keep coloured, or null; months without a
 *                    match are hidden, but any row with a match is kept whole
 *   hoveredDate    – day under the mouse (owned by the parent so Details can follow it)
 *   confirmDate    – day whose Add prompt is open, or null
 *   onDayHover, onDayClick, onConfirm, onCancelConfirm
 */
export function YearCalendar({
  months,
  breaks,
  colourBy,
  holidayFilter,
  picksOnly,
  savedDayTypes,
  savedStarts,
  isSaved,
  previewDayTypes,
  previewStarts,
  schoolDates,
  daysOffFilter,
  hoveredDate,
  confirmDate,
  onDayHover,
  onDayClick,
  onConfirm,
  onCancelConfirm,
}) {
  // Colours depend on everything except the hover, so hovering stays cheap.
  const monthDays = useMemo(() => {
    const passesFilter = brk => holidayFilter.length === 0 || holidayNamesIn(brk).some(n => holidayFilter.includes(n))

    function look(date, brk) {
      if (!brk) return OUTSIDE
      if (previewDayTypes) return previewDayTypes.has(date) ? typeLook(previewDayTypes.get(date)) : FADED
      if (picksOnly) return savedDayTypes.has(date) ? typeLook(savedDayTypes.get(date)) : FADED
      if (!hasGain(brk)) return NO_GAIN
      if (daysOffFilter && !daysOffFilter.has(brk.daysOff)) return FADED
      if (!passesFilter(brk)) return FADED
      const bg = colourBy === 'multiplier' ? getColourForMultiplier(brk.multiplier) : getColourForDaysOff(brk.daysOff)
      return { bg, fg: '#0f172a' }
    }

    function ring(date) {
      if (previewStarts) return previewStarts.has(date) ? START_RING : null
      if (savedStarts.has(date)) return START_RING
      if (!picksOnly && savedDayTypes.has(date)) return SAVED_RING
      return null
    }

    function school(date) {
      if (!schoolDates?.has(date)) return null
      const weekday = new Date(date + 'T00:00:00').getDay()
      return {
        roundLeft: weekday === 0 || date.endsWith('-01') || !schoolDates.has(addDays(date, -1)),
        roundRight: weekday === 6 || addDays(date, 1).slice(5, 7) !== date.slice(5, 7) || !schoolDates.has(addDays(date, 1)),
      }
    }

    return months.map(({ year, month }) => ({
      year,
      month,
      days: datesInMonth(year, month).map(date => {
        const brk = breaks[date]
        return {
          school: school(date),
          date,
          dayNumber: Number(date.slice(8)),
          look: look(date, brk),
          ring: ring(date),
          isHoliday: brk?.days[0].type === 'public_holiday',
          disabled: !brk,
          ariaLabel: brk
            ? `${fmtDay(date)}: ${brk.daysOff} days off, ${formatMultiplier(brk.multiplier)}`
            : fmtDay(date),
        }
      }),
    }))
  }, [months, breaks, colourBy, holidayFilter, picksOnly, savedDayTypes, savedStarts, previewDayTypes, previewStarts, schoolDates, daysOffFilter])

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

  // With a days-off filter, keep only rows of months that contain a match,
  // but keep each such row whole so the grid never has gaps.
  const visibleMonths = useMemo(() => {
    if (!daysOffFilter) return monthDays
    const kept = []
    for (let i = 0; i < monthDays.length; i += columns) {
      const row = monthDays.slice(i, i + columns)
      const hasMatch = row.some(m => m.days.some(d => breaks[d.date] && daysOffFilter.has(breaks[d.date].daysOff)))
      if (hasMatch) kept.push(...row)
    }
    return kept
  }, [monthDays, daysOffFilter, columns, breaks])

  const hoverBreak = hoveredDate ? breaks[hoveredDate] : null

  // The Add prompt wins over the hover card on the same day.
  function popoverFor(date) {
    if (date === confirmDate && breaks[date]) {
      return <AddPrompt brk={breaks[date]} isSaved={isSaved(breaks[date])} onConfirm={onConfirm} onCancel={onCancelConfirm} />
    }
    if (date === hoveredDate && hoverBreak) return <HoverCard brk={hoverBreak} colourBy={colourBy} />
    return null
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
            const banded = hoverBreak ? withBand(d, hoverBreak) : d
            return d.date === confirmDate ? { ...banded, confirming: true } : banded
          })}
          popoverFor={popoverFor}
          onDayClick={onDayClick}
          onDayHover={onDayHover}
        />
      ))}
    </section>
  )
}
