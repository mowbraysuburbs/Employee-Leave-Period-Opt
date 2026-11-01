import { useMemo } from 'react'
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
      if (picksOnly) return savedDayTypes.has(date) ? typeLook(savedDayTypes.get(date)) : FADED
      if (!hasGain(brk)) return NO_GAIN
      if (!passesFilter(brk)) return FADED
      const bg = colourBy === 'multiplier' ? getColourForMultiplier(brk.multiplier) : getColourForDaysOff(brk.daysOff)
      return { bg, fg: '#0f172a' }
    }

    function ring(date) {
      if (savedStarts.has(date)) return START_RING
      if (!picksOnly && savedDayTypes.has(date)) return SAVED_RING
      return null
    }

    return months.map(({ year, month }) => ({
      year,
      month,
      days: datesInMonth(year, month).map(date => {
        const brk = breaks[date]
        return {
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
  }, [months, breaks, colourBy, holidayFilter, picksOnly, savedDayTypes, savedStarts])

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
    <section aria-label="Calendar" className="flex-[999_1_640px] min-w-0 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
      {monthDays.map(m => (
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
