import { getLeaveRange } from './leaveCalculator'
import { getHolidayName } from '../data/publicHolidays'
import { addDays } from './dateFormat'

/**
 * A "break" is the run of days off you get by starting leave on startDate
 * and spending leaveDays credits.
 *
 * Returns:
 *   {
 *     startDate, endDate, daysOff, leaveDays,
 *     multiplier: daysOff / leaveDays,
 *     days: [{ date, type, holidayName }]   type: 'leave' | 'public_holiday' | 'weekend'
 *   }
 */
export function buildBreak(startDate, leaveDays) {
  const { endDate, daysOff, breakdown } = getLeaveRange(startDate, leaveDays)
  const days = breakdown.map(({ date, type }) => ({
    date,
    type,
    holidayName: type === 'public_holiday' ? getHolidayName(date, Number(date.slice(0, 4))) : null,
  }))
  return {
    startDate,
    endDate,
    daysOff,
    leaveDays,
    multiplier: leaveDays > 0 ? daysOff / leaveDays : 0,
    days,
  }
}

/**
 * Multiplier mode: the best-value break starting on startDate when spending
 * anywhere from 1 to maxLeave leave days. On a tie the longer break wins.
 */
export function buildBestBreak(startDate, maxLeave) {
  let best = null
  for (let k = 1; k <= maxLeave; k++) {
    const brk = buildBreak(startDate, k)
    const better = !best
      || brk.multiplier > best.multiplier + 1e-9
      || (Math.abs(brk.multiplier - best.multiplier) < 1e-9 && brk.daysOff > best.daysOff)
    if (better) best = brk
  }
  return best
}

/**
 * Every start day in [from, to] mapped to its break, keyed by YYYY-MM-DD.
 * With best: true each day gets its buildBestBreak() instead of spending
 * exactly leaveDays.
 */
export function buildBreaksInRange(from, to, leaveDays, { best = false } = {}) {
  const result = {}
  for (let date = from; date <= to; date = addDays(date, 1)) {
    result[date] = best ? buildBestBreak(date, leaveDays) : buildBreak(date, leaveDays)
  }
  return result
}

/**
 * Other start dates within `windowDays` either side of brk that give exactly
 * the same result (same leave days and days off), so a break can be slid to
 * an equal alternative.
 *
 * Returns { earlier, later, count }: the nearest equal break before and after
 * (or null), and how many equal options there are including brk itself.
 */
export function findEqualShifts(brk, windowDays = 7) {
  const equal = []
  for (let offset = -windowDays; offset <= windowDays; offset++) {
    if (offset === 0) continue
    const other = buildBreak(addDays(brk.startDate, offset), brk.leaveDays)
    if (other.daysOff === brk.daysOff) equal.push({ offset, brk: other })
  }
  const earlier = equal.filter(e => e.offset < 0).at(-1)?.brk ?? null
  const later = equal.find(e => e.offset > 0)?.brk ?? null
  return { earlier, later, count: equal.length + 1 }
}

// A break with no free days (days off = leave days) isn't worth highlighting.
export function hasGain(brk) {
  return brk.daysOff > brk.leaveDays
}

/**
 * Whole weeks (Sunday → Saturday) that the break touches, for the Details
 * mini calendar. Days outside the break come back with type null.
 */
export function breakWeeks(brk) {
  const types = new Map(brk.days.map(d => [d.date, d.type]))
  const startWeekday = new Date(brk.startDate + 'T00:00:00').getDay()
  const endWeekday = new Date(brk.endDate + 'T00:00:00').getDay()
  const first = addDays(brk.startDate, -startWeekday)
  const last = addDays(brk.endDate, 6 - endWeekday)
  const cells = []
  for (let date = first; date <= last; date = addDays(date, 1)) {
    cells.push({ date, type: types.get(date) ?? null })
  }
  return cells
}

/**
 * The break as table rows: consecutive leave or weekend days collapse into
 * one row, while each public holiday keeps its own row (so its name shows).
 *
 * Returns [{ type, startDate, endDate, count, holidayName }]
 */
export function breakRows(brk) {
  const rows = []
  for (const day of brk.days) {
    const prev = rows[rows.length - 1]
    if (prev && day.type !== 'public_holiday' && prev.type === day.type) {
      rows[rows.length - 1] = { ...prev, endDate: day.date, count: prev.count + 1 }
    } else {
      rows.push({ type: day.type, startDate: day.date, endDate: day.date, count: 1, holidayName: day.holidayName })
    }
  }
  return rows
}

export function holidayNamesIn(brk) {
  return brk.days.filter(d => d.holidayName).map(d => d.holidayName)
}

export function formatMultiplier(multiplier) {
  return `${multiplier.toFixed(1)}×`
}

// Identifies a saved break: the same start date with a different leave
// amount is a different break.
export function breakKey({ startDate, leaveDays }) {
  return `${startDate}-${leaveDays}`
}

// Shape expected by utils/calendarExport (Google link and .ics builder).
export function toCalendarEvent(brk) {
  return { title: `On leave · ${brk.daysOff} days off`, startDate: brk.startDate, endDate: brk.endDate }
}

/**
 * Totals for a list of saved breaks. Each break keeps the leave amount it
 * was saved with, so changing the leave-days control never rewrites them.
 */
export function summariseBreaks(breaks) {
  const leaveUsed = breaks.reduce((sum, b) => sum + b.leaveDays, 0)
  const daysOff = breaks.reduce((sum, b) => sum + b.daysOff, 0)
  return { leaveUsed, daysOff, multiplier: leaveUsed > 0 ? daysOff / leaveUsed : 0 }
}
