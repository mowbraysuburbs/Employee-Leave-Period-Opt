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
 * Every start date within `windowDays` either side of brk that gives exactly
 * the same result (same leave days and days off), so a break can be moved to
 * an equal alternative.
 *
 * Returns the equal breaks in date order, including brk itself.
 */
export function findEqualStarts(brk, windowDays = 7) {
  const equal = []
  for (let offset = -windowDays; offset <= windowDays; offset++) {
    const other = offset === 0 ? brk : buildBreak(addDays(brk.startDate, offset), brk.leaveDays)
    if (other.daysOff === brk.daysOff) equal.push(other)
  }
  return equal
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

// Two breaks overlap when they share at least one day.
export function breaksOverlap(a, b) {
  return a.startDate <= b.endDate && b.startDate <= a.endDate
}

/**
 * One break covering every day of `list` (breaks that overlap into one run):
 * it starts on the earliest day and spends a leave day on each working day
 * inside, so it ends exactly where the last of them ends.
 */
export function combineBreaks(list) {
  const startDate = list.reduce((min, b) => (b.startDate < min ? b.startDate : min), list[0].startDate)
  const leaveDates = new Set(list.flatMap(b => b.days.filter(d => d.type === 'leave').map(d => d.date)))
  return buildBreak(startDate, leaveDates.size)
}

/**
 * Adds brk to saved entries ([{ startDate, leaveDays }]) so that no two
 * breaks overlap: any saved break it touches is combined with it.
 * Returns a new array with the added (or combined) entry last.
 */
export function withBreakMerged(saved, brk) {
  const built = saved.map(s => buildBreak(s.startDate, s.leaveDays))
  const touching = built.filter(b => breaksOverlap(b, brk))
  const merged = touching.length ? combineBreaks([...touching, brk]) : brk
  const kept = saved.filter((_, i) => !touching.includes(built[i]))
  return [...kept, { startDate: merged.startDate, leaveDays: merged.leaveDays }]
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
