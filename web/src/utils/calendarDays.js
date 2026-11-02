import { getColourForDaysOff, getColourForMultiplier } from './colorScale'
import { DAY_TYPE_COLOUR } from './dayTypes'
import { holidayNamesIn, formatMultiplier, hasGain } from './breaks'
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
 * (selected) break is a shade darker than the hovered one.
 */
export function withBand(day, brk, selected = false) {
  if (!brk || day.date < brk.startDate || day.date > brk.endDate) return day
  const weekday = new Date(day.date + 'T00:00:00').getDay()
  const roundLeft = day.date === brk.startDate || weekday === 0 || day.dayNumber === 1
  const roundRight = day.date === brk.endDate || weekday === 6 || addDays(day.date, 1).slice(5, 7) !== day.date.slice(5, 7)
  return { ...day, band: { roundLeft, roundRight, selected } }
}

/**
 * Every month's day cells with their colour, ring, school bar and label.
 *
 * Options: months, breaks, colourBy, holidayFilter, picksOnly, savedDayTypes,
 * savedStarts, previewDayTypes, schoolDates, daysOffFilter
 * (see YearCalendar for what each means).
 */
export function buildMonthDays({ months, breaks, colourBy, holidayFilter, picksOnly, savedDayTypes, savedStarts, previewDayTypes, schoolDates, daysOffFilter }) {
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

  // Saved breaks glow (see .saved-glow in index.css); a break's first day
  // breathes. Off while previewing a plan, and with "Selected" on only the
  // first days glow, since every coloured day is saved then.
  function saved(date) {
    if (previewDayTypes) return null
    if (savedStarts.has(date)) return 'start'
    if (!picksOnly && savedDayTypes.has(date)) return 'day'
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
 * With a days-off filter, keeps only rows of months that contain a match, but
 * keeps each such row (`columns` months wide) whole so the grid never has gaps.
 */
export function keepMatchingRows(monthDays, breaks, daysOffFilter, columns) {
  if (!daysOffFilter) return monthDays
  const kept = []
  for (let i = 0; i < monthDays.length; i += columns) {
    const row = monthDays.slice(i, i + columns)
    const hasMatch = row.some(m => m.days.some(d => breaks[d.date] && daysOffFilter.has(breaks[d.date].daysOff)))
    if (hasMatch) kept.push(...row)
  }
  return kept
}
