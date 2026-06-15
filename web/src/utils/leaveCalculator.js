import { getPublicHolidaysForYear } from '../data/publicHolidays'

function isWeekend(date) {
  const day = date.getDay()
  return day === 0 || day === 6
}

function toDateStr(date) {
  // Use local time components — toISOString() returns UTC which shifts dates
  // backward in UTC+ timezones (e.g. South Africa is UTC+2)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(date, n) {
  const result = new Date(date)
  result.setDate(result.getDate() + n)
  return result
}

// Build one unified Set covering all public holidays across every year in the window
// (plus one extra year so leave periods can spill past year-end)
function buildMultiYearHolidaySet(startDateStr, endDateStr) {
  const startYear = parseInt(startDateStr.slice(0, 4), 10)
  const endYear = parseInt(endDateStr.slice(0, 4), 10)
  const set = new Set()
  for (let y = startYear; y <= endYear + 1; y++) {
    for (const h of getPublicHolidaysForYear(y)) set.add(h.date)
  }
  return set
}

function calcDaysOffFromDate(startDate, leaveDays, holidaySet) {
  let credits = leaveDays
  let totalDaysOff = 0
  let current = new Date(startDate)

  while (credits >= 0) {
    const dateStr = toDateStr(current)

    if (isWeekend(current) || holidaySet.has(dateStr)) {
      totalDaysOff++
    } else {
      credits--
      if (credits < 0) break
      totalDaysOff++
    }

    current = addDays(current, 1)
  }

  return totalDaysOff
}

/**
 * Compute a leave score for every day in [startDateStr, endDateStr].
 *
 * New signature: (startDateStr, endDateStr, leaveDays)
 * The old (year, leaveDays) signature is no longer supported.
 *
 * Returns [{ date: "YYYY-MM-DD", daysOff: number }, ...]
 */
export function computeLeaveScores(startDateStr, endDateStr, leaveDays) {
  const holidaySet = buildMultiYearHolidaySet(startDateStr, endDateStr)

  const scores = []
  const end = new Date(endDateStr + 'T00:00:00')
  let current = new Date(startDateStr + 'T00:00:00')

  while (current <= end) {
    scores.push({ date: toDateStr(current), daysOff: calcDaysOffFromDate(current, leaveDays, holidaySet) })
    current = addDays(current, 1)
  }

  return scores
}

/**
 * Walk forward from startDateStr spending leaveDays credits.
 * Returns the full day-by-day breakdown — used to render the leave period panel
 * when a user clicks a calendar cell.
 *
 * Returns:
 *   { startDate, endDate, daysOff, breakdown: [{ date, type }] }
 *   type: "leave" | "public_holiday" | "weekend"
 */
export function getLeaveRange(startDateStr, leaveDays) {
  const startYear = parseInt(startDateStr.slice(0, 4), 10)
  const holidaySet = new Set()
  for (let y = startYear; y <= startYear + 1; y++) {
    for (const h of getPublicHolidaysForYear(y)) holidaySet.add(h.date)
  }

  let credits = leaveDays
  const breakdown = []
  let current = new Date(startDateStr + 'T00:00:00')

  while (credits >= 0) {
    const dateStr = toDateStr(current)
    if (isWeekend(current)) {
      breakdown.push({ date: dateStr, type: 'weekend' })
    } else if (holidaySet.has(dateStr)) {
      breakdown.push({ date: dateStr, type: 'public_holiday' })
    } else {
      credits--
      if (credits < 0) break
      breakdown.push({ date: dateStr, type: 'leave' })
    }
    current = addDays(current, 1)
  }

  return {
    startDate: startDateStr,
    endDate: breakdown[breakdown.length - 1]?.date ?? startDateStr,
    daysOff: breakdown.length,
    breakdown,
  }
}

/**
 * From a scores array, return the top N leave periods sorted by daysOff descending.
 * Deduplicates overlapping periods.
 *
 * Each result: { startDate, endDate, daysOff, leaveDaysUsed }
 */
export function getBestPeriods(scores, leaveDays, _holidaySet, limit = 10) {
  const sorted = [...scores].sort((a, b) => b.daysOff - a.daysOff)
  const results = []
  const usedDates = new Set()

  for (const { date, daysOff } of sorted) {
    if (results.length >= limit) break
    if (usedDates.has(date)) continue

    const startDate = new Date(date + 'T00:00:00')
    const endDate = addDays(startDate, daysOff - 1)
    const endDateStr = toDateStr(endDate)

    let cursor = new Date(startDate)
    while (cursor <= endDate) {
      usedDates.add(toDateStr(cursor))
      cursor = addDays(cursor, 1)
    }

    results.push({ startDate: date, endDate: endDateStr, daysOff, leaveDaysUsed: leaveDays })
  }

  return results
}

/**
 * Plan leave within a fixed date range (for the Plan tab).
 * Returns { totalDaysOff, leaveDaysUsed, breakdown: [{ date, type }] }
 */
export function planLeaveInRange(startDateStr, endDateStr, maxLeaveDays) {
  const holidaySet = buildMultiYearHolidaySet(startDateStr, endDateStr)

  const start = new Date(startDateStr + 'T00:00:00')
  const end = new Date(endDateStr + 'T00:00:00')
  const breakdown = []
  let leaveDaysUsed = 0
  let current = new Date(start)

  while (current <= end) {
    const dateStr = toDateStr(current)
    if (isWeekend(current)) {
      breakdown.push({ date: dateStr, type: 'weekend' })
    } else if (holidaySet.has(dateStr)) {
      breakdown.push({ date: dateStr, type: 'public_holiday' })
    } else if (leaveDaysUsed < maxLeaveDays) {
      breakdown.push({ date: dateStr, type: 'leave' })
      leaveDaysUsed++
    } else {
      breakdown.push({ date: dateStr, type: 'workday' })
    }
    current = addDays(current, 1)
  }

  return { totalDaysOff: breakdown.filter((d) => d.type !== 'workday').length, leaveDaysUsed, breakdown }
}
