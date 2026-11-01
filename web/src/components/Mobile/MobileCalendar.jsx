import { useMemo, useRef, useEffect } from 'react'
import { MonthCard } from '../Desktop/MonthCard'
import { buildMonthDays, keepMatchingRows, withBand } from '../../utils/calendarDays'

const noPopover = () => null
const noHover = () => {}

/**
 * The phone calendar: one month per row, only the months scroll. The tapped
 * break is drawn as a band of squares and scrolled near the top, so it stays
 * visible above the day sheet.
 *
 * Props: the same colour options as buildMonthDays, plus
 *   selectedBreak – the tapped break, or null
 *   onDayClick    – (date) => void
 *   compact       – two smaller months per row instead of one
 */
export function MobileCalendar({ selectedBreak, onDayClick, compact = false, ...options }) {
  const { months, breaks, colourBy, holidayFilter, picksOnly, savedDayTypes, savedStarts, previewDayTypes, previewStarts, schoolDates, daysOffFilter } = options
  const monthDays = useMemo(
    () => buildMonthDays({ months, breaks, colourBy, holidayFilter, picksOnly, savedDayTypes, savedStarts, previewDayTypes, previewStarts, schoolDates, daysOffFilter }),
    [months, breaks, colourBy, holidayFilter, picksOnly, savedDayTypes, savedStarts, previewDayTypes, previewStarts, schoolDates, daysOffFilter]
  )
  // The days-off filter hides rows (one or two months) without a match.
  const columns = compact ? 2 : 1
  const visibleMonths = useMemo(() => keepMatchingRows(monthDays, breaks, daysOffFilter, columns), [monthDays, breaks, daysOffFilter, columns])

  // Bring the tapped break's first day near the top, above the sheet.
  const scrollRef = useRef(null)
  const startDate = selectedBreak?.startDate
  useEffect(() => {
    const box = scrollRef.current
    const day = startDate && box?.querySelector(`[data-date="${startDate}"]`)
    if (!day) return
    const offset = day.getBoundingClientRect().top - box.getBoundingClientRect().top
    box.scrollTo({ top: box.scrollTop + offset - 48, behavior: 'smooth' })
  }, [startDate])

  return (
    <section ref={scrollRef} aria-label="Calendar" className="flex-1 min-h-0 overflow-y-auto px-3 pt-3 pb-4">
      <div className={`w-full max-w-[520px] mx-auto grid ${compact ? 'grid-cols-2 gap-2' : 'grid-cols-1 gap-2.5'}`}>
        {visibleMonths.length === 0 && (
          <div className="col-span-full p-5 border-[1.5px] border-dashed border-slate-300 rounded-2xl text-sm text-slate-600 text-center">
            No start days give that many days off in this period. Pick other numbers or clear the filter.
          </div>
        )}
        {visibleMonths.map(m => (
          <MonthCard
            key={`${m.year}-${m.month}`}
            large={!compact}
            compact={compact}
            year={m.year}
            month={m.month}
            days={selectedBreak ? m.days.map(d => withBand(d, selectedBreak, true)) : m.days}
            popoverFor={noPopover}
            onDayClick={onDayClick}
            onDayHover={noHover}
          />
        ))}
      </div>
    </section>
  )
}
