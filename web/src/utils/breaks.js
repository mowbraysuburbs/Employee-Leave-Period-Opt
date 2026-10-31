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

// Every start day in [from, to] mapped to its break, keyed by YYYY-MM-DD.
export function buildBreaksInRange(from, to, leaveDays) {
  const result = {}
  for (let date = from; date <= to; date = addDays(date, 1)) {
    result[date] = buildBreak(date, leaveDays)
  }
  return result
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
