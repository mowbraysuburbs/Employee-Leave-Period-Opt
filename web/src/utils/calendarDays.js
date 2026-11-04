import { getColourForDaysOff, getColourForMultiplier } from './colorScale'
import { DAY_TYPE_COLOUR } from './dayTypes'
import { holidayNamesIn, formatMultiplier, hasGain } from './breaks'
import { getHolidayName } from '../data/publicHolidays'
import { fmtDay, addDays } from './dateFormat'

// Builds the coloured day cells for the calendar month grids, shared by the
// desktop year calendar and the mobile calendar.

// Palette variables (with light fallbacks) so these follow dark mode.
const OUTSIDE = { bg: 'transparent', fg: 'var(--color-slate-300, #cbd5e1)' }
const FADED = { bg: 'var(--color-slate-100, #f1f5f9)', fg: 'var(--color-slate-400, #94a3b8)' }
const NO_GAIN = { bg: 'transparent', fg: 'var(--color-slate-500, #64748b)' }

function typeLook(type) {
  return { bg: DAY_TYPE_COLOUR[type], fg: type === 'weekend' ? '#ffffff' : '#0f172a' }
}

function datesInMonth(year, month) {
  const count = new Date(year, month, 0).getDate()
  const mm = String(month).padStart(2, '0')
  return Array.from({ length: count }, (_, i) => `${year}-${mm}-${String(i + 1).padStart(2, '0')}`)
}

/**
 * Marks a day inside a break so the calendar draws a grey pill behind it: the
 * day keeps its coloured circle, and the pill joins the break's days, rounding
 * off where the break or a week row (or month) starts and ends. The clicked
 * (selected) break is a shade darker than the hovered one, and its first day
 * gets a small dot in the corner.
 */
export function withBand(day, brk, selected = false) {
  if (!brk || day.date < brk.startDate || day.date > brk.endDate) return day
  const weekday = new Date(day.date + 'T00:00:00').getDay()
  const roundLeft = day.date === brk.startDate || weekday === 0 || day.dayNumber === 1
  const roundRight = day.date === brk.endDate || weekday === 6 || addDays(day.date, 1).slice(5, 7) !== day.date.slice(5, 7)
  return { ...day, band: { roundLeft, roundRight, selected, start: day.date === brk.startDate } }
}

/**
 * Every month's day cells with their colour, ring, school bar and label.
 *
 * holidayView: no leave left, so there are no breaks: only public holidays
 * are coloured (a view; nothing can be tapped or added as leave).
 *
 * Options: months, breaks, colourBy, holidayFilter, picksOnly, savedDayTypes,
 * savedStarts, previewDayTypes, schoolDates, daysOffFilter
 * (see YearCalendar for what each means).
 */
export function buildMonthDays({ months, breaks, colourBy, holidayFilter, picksOnly, savedDayTypes, savedStarts, previewDayTypes, schoolDates, daysOffFilter, holidayView = false }) {
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

  // Saved breaks turn into one joined band of rectangles, rounded where a break
  // or a week row / month starts and ends; `start` marks a break's first day.
  // Off while previewing a plan.
  function saved(date) {
    if (previewDayTypes || !savedDayTypes.has(date)) return null
    const weekday = new Date(date + 'T00:00:00').getDay()
    const next = addDays(date, 1)
    return {
      roundLeft: savedStarts.has(date) || weekday === 0 || date.endsWith('-01') || !savedDayTypes.has(addDays(date, -1)),
      roundRight: weekday === 6 || next.slice(5, 7) !== date.slice(5, 7) || !savedDayTypes.has(next) || savedStarts.has(next),
      start: savedStarts.has(date),
    }
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
      if (holidayView) {
        const name = getHolidayName(date, Number(date.slice(0, 4)))
        return {
          school: school(date),
          date,
          dayNumber: Number(date.slice(8)),
          look: name ? typeLook('public_holiday') : OUTSIDE,
          saved: saved(date),
          isHoliday: !!name,
          disabled: true,
          ariaLabel: name ? `${fmtDay(date)}: ${name}` : fmtDay(date),
        }
      }
      return {
        school: school(date),
        date,
        dayNumber: Number(date.slice(8)),
        look: look(date, brk),
        saved: saved(date),
        isHoliday: brk?.days[0].type === 'public_holiday',
        disabled: !brk,
        ariaLabel: brk
          ? `${fmtDay(date)}: ${brk.daysOff} days off, ${formatMultiplier(brk.multiplier)} multiplier`
          : fmtDay(date),
      }
    }),
  }))
}

/**
 * With a days-off or public-holiday filter on, keeps only rows of months that
 * contain a matching day, but keeps each such row (`columns` months wide) whole
 * so the grid never has gaps. A day matches when its break passes every filter
 * that's on.
 *
 * filters: { daysOffFilter: Set | null, holidayFilter: string[] }
 */
export function keepMatchingRows(monthDays, breaks, { daysOffFilter = null, holidayFilter = [] }, columns) {
  if (!daysOffFilter && holidayFilter.length === 0) return monthDays
  const matches = brk => brk
    && (!daysOffFilter || daysOffFilter.has(brk.daysOff))
    && (holidayFilter.length === 0 || holidayNamesIn(brk).some(n => holidayFilter.includes(n)))
  const kept = []
  for (let i = 0; i < monthDays.length; i += columns) {
    const row = monthDays.slice(i, i + columns)
    if (row.some(m => m.days.some(d => matches(breaks[d.date])))) kept.push(...row)
  }
  return kept
}
