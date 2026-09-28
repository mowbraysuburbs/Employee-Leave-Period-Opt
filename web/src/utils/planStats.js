import { getLeaveRange } from './leaveCalculator'
import { getHolidayName } from '../data/publicHolidays'

/**
 * Summarise the user's ticked periods for the calendar's "My leave" view.
 *
 * Days are unioned across periods, so two overlapping selections never
 * count a shared day twice.
 *
 * Returns:
 *   {
 *     dayTypes:     Map(date -> 'leave' | 'public_holiday' | 'weekend'),
 *     leaveDays:    number,
 *     weekendDays:  number,
 *     holidays:     [{ date, name }] (chronological),
 *     totalDaysOff: number,
 *     months:       [{ year, month }] every month a period touches (chronological),
 *   }
 */
export function summarisePlan(periods) {
  const dayTypes = new Map()
  for (const { startDate, leaveDaysUsed } of periods) {
    for (const { date, type } of getLeaveRange(startDate, leaveDaysUsed).breakdown) {
      if (!dayTypes.has(date)) dayTypes.set(date, type)
    }
  }

  const dates = [...dayTypes.keys()].sort()
  let leaveDays = 0
  let weekendDays = 0
  const holidays = []
  const monthKeys = new Set()
  for (const date of dates) {
    const type = dayTypes.get(date)
    if (type === 'leave') leaveDays++
    else if (type === 'weekend') weekendDays++
    else holidays.push({ date, name: getHolidayName(date, Number(date.slice(0, 4))) ?? 'Public holiday' })
    monthKeys.add(date.slice(0, 7))
  }

  const months = [...monthKeys].map(key => {
    const [year, month] = key.split('-').map(Number)
    return { year, month }
  })

  return { dayTypes, leaveDays, weekendDays, holidays, totalDaysOff: dates.length, months }
}
