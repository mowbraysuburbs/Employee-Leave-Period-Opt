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
const START_RING = '0 0 0 3px var(--color-slate-900, #0f172a)'
const SAVED_RING = 'inset 0 0 0 2px var(--color-slate-900, #0f172a)'

function typeLook(type) {
  return { bg: DAY_TYPE_COLOUR[type], fg: type === 'weekend' ? '#ffffff' : '#0f172a' }
}

function datesInMonth(year, month) {
  const count = new Date(year, month, 0).getDate()
  const mm = String(month).padStart(2, '0')
  return Array.from({ length: count }, (_, i) => `${year}-${mm}-${String(i + 1).padStart(2, '0')}`)
}

/**
 * Draws a break as one joined band of squares: corners only round off where
 * the band starts or ends a run (the break's first/last day, a week row edge,
 * or a month edge). The hovered break gets a soft outline; the clicked
 * (selected) break is just the joined squares, no outline, until another day is clicked.
 */
export function withBand(day, brk, selected = false) {
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

  // No outline on the selected break: uncoloured days inside it get a light
  // fill instead, so the band still reads as one block.
  if (selected) {
    const look = day.look.bg === 'transparent' ? { ...day.look, bg: 'var(--color-slate-200, #e2e8f0)' } : day.look
    return { ...day, inBand: true, shape, look }
  }

  // Zero spread on the top/bottom lines so neighbouring days don't overlap
  // into visible seams; only the capped ends draw a side edge.
  const edge = '1.5px 0 0 var(--range-border)'
  const shadows = [`0 -${edge}`, `0 ${edge}`]
  if (leftCap) shadows.push(`-${edge}`)
  if (rightCap) shadows.push(edge)
  if (isStart) shadows.push('-3px 0 8px 0 var(--range-glow)')
  if (isEnd) shadows.push('3px 0 8px 0 var(--range-glow)')
  if (day.ring) shadows.push(day.ring)

  return { ...day, inBand: true, shape, ring: shadows.join(', ') }
}

/**
 * Every month's day cells with their colour, ring, school bar and label.
 *
 * Options: months, breaks, colourBy, holidayFilter, picksOnly, savedDayTypes,
 * savedStarts, previewDayTypes, previewStarts, schoolDates, daysOffFilter
 * (see YearCalendar for what each means).
 */
export function buildMonthDays({ months, breaks, colourBy, holidayFilter, picksOnly, savedDayTypes, savedStarts, previewDayTypes, previewStarts, schoolDates, daysOffFilter }) {
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
