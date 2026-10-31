import { useState, useMemo } from 'react'
import { MonthCard } from './MonthCard'
import { getColourForDaysOff, getColourForMultiplier } from '../../utils/colorScale'
import { DAY_TYPE_COLOUR } from '../../utils/dayTypes'
import { holidayNamesIn, formatMultiplier } from '../../utils/breaks'
import { fmtDay } from '../../utils/dateFormat'

const OUTSIDE = { bg: 'transparent', fg: '#cbd5e1' }
const FADED = { bg: '#f1f5f9', fg: '#94a3b8' }
const ISOLATED = { bg: '#f8fafc', fg: '#cbd5e1' }
const START_RING = '0 0 0 3px #0f172a'
const SAVED_RING = 'inset 0 0 0 2px #0f172a'
const HOVER_RING = '0 0 0 2px #0369a1'

function typeLook(type) {
  return { bg: DAY_TYPE_COLOUR[type], fg: type === 'weekend' ? '#ffffff' : '#0f172a' }
}

function datesInMonth(year, month) {
  const count = new Date(year, month, 0).getDate()
  const mm = String(month).padStart(2, '0')
  return Array.from({ length: count }, (_, i) => `${year}-${mm}-${String(i + 1).padStart(2, '0')}`)
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
 *   detail         – the break open in the side panel, or null (isolates it)
 *   onDayClick     – (date) => void
 */
export function YearCalendar({
  months,
  breaks,
  colourBy,
  holidayFilter,
  picksOnly,
  savedDayTypes,
  savedStarts,
  detail,
  onDayClick,
}) {
  const [hoveredDate, setHoveredDate] = useState(null)

  // Colours depend on everything except the hover, so hovering stays cheap.
  const monthDays = useMemo(() => {
    const detailTypes = new Map(detail ? detail.days.map(d => [d.date, d.type]) : [])
    const passesFilter = brk => holidayFilter.length === 0 || holidayNamesIn(brk).some(n => holidayFilter.includes(n))

    function look(date, brk) {
      if (!brk) return OUTSIDE
      if (detail) return detailTypes.has(date) ? typeLook(detailTypes.get(date)) : ISOLATED
      if (picksOnly) return savedDayTypes.has(date) ? typeLook(savedDayTypes.get(date)) : FADED
      if (!passesFilter(brk)) return FADED
      const bg = colourBy === 'multiplier' ? getColourForMultiplier(brk.multiplier) : getColourForDaysOff(brk.daysOff)
      return { bg, fg: '#0f172a' }
    }

    function ring(date) {
      if (detail) return date === detail.startDate ? START_RING : null
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
  }, [months, breaks, colourBy, holidayFilter, picksOnly, savedDayTypes, savedStarts, detail])

  return (
    <section aria-label="Calendar" className="flex-[999_1_640px] min-w-0 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
      {monthDays.map(m => (
        <MonthCard
          key={`${m.year}-${m.month}`}
          year={m.year}
          month={m.month}
          days={hoveredDate ? m.days.map(d => d.date === hoveredDate && !d.ring ? { ...d, ring: HOVER_RING } : d) : m.days}
          hoveredDate={hoveredDate}
          hoverBreak={hoveredDate ? breaks[hoveredDate] : null}
          onDayClick={date => { setHoveredDate(null); onDayClick(date) }}
          onDayHover={setHoveredDate}
        />
      ))}
    </section>
  )
}
