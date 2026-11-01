import { buildBreaksInRange, buildBestBreak } from './breaks'
import { getPublicHolidaysForYear } from '../data/publicHolidays'
import { addDays } from './dateFormat'

// Longest break first; ties go to the better multiplier, then the earlier start.
function byDaysOff(a, b) {
  return b.daysOff - a.daysOff || b.multiplier - a.multiplier || (a.startDate < b.startDate ? -1 : 1)
}

function overlaps(a, b) {
  return !(b.endDate < a.startDate || b.startDate > a.endDate)
}

// The first public holiday on or after `today`, as { date, name }, or null.
export function nextHoliday(today) {
  const year = Number(today.slice(0, 4))
  const upcoming = [...getPublicHolidaysForYear(year), ...getPublicHolidaysForYear(year + 1)]
    .filter(h => h.date >= today)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
  return upcoming[0] ?? null
}

// YYYY-MM-DD shifted by n calendar months (day of month kept, JS rolls over).
export function addMonths(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setMonth(d.getMonth() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * The four ready-made packages shown on the Overview page.
 *
 *   nextBig   – longest break that includes the next public holiday
 *   maxLeave  – best multiplier starting in `year`, using up to leaveDays
 *   sixMonths – longest break starting within six months of today
 *   yearPlan  – longest non-overlapping breaks starting in `year` until the
 *               allowance is spent (leave resets each calendar year)
 *
 * Returns { nextBig: { holiday, brk } | null, maxLeave, sixMonths, yearPlan: [] }
 */
export function computeQuickPicks({ today, lastDate, leaveDays, year, allowance }) {
  const exact = Object.values(buildBreaksInRange(today, lastDate, leaveDays))

  const holiday = nextHoliday(today)
  const nextBigBreak = holiday
    ? exact.filter(b => b.days.some(d => d.date === holiday.date)).sort(byDaysOff)[0] ?? null
    : null

  const yearFrom = `${year}-01-01` > today ? `${year}-01-01` : today
  const yearTo = `${year}-12-31` < lastDate ? `${year}-12-31` : lastDate
  let maxLeave = null
  for (let date = yearFrom; date <= yearTo; date = addDays(date, 1)) {
    const brk = buildBestBreak(date, leaveDays)
    if (!maxLeave || brk.multiplier > maxLeave.multiplier + 1e-9
      || (Math.abs(brk.multiplier - maxLeave.multiplier) < 1e-9 && brk.daysOff > maxLeave.daysOff)) {
      maxLeave = brk
    }
  }

  const sixEnd = addMonths(today, 6)
  const sixMonths = exact.filter(b => b.startDate < sixEnd).sort(byDaysOff)[0] ?? null

  const yearPlan = []
  let spent = 0
  for (const brk of exact.filter(b => b.startDate.startsWith(String(year))).sort(byDaysOff)) {
    if (spent + brk.leaveDays > allowance) continue
    if (yearPlan.some(p => overlaps(p, brk))) continue
    yearPlan.push(brk)
    spent += brk.leaveDays
  }
  yearPlan.sort((a, b) => (a.startDate < b.startDate ? -1 : 1))

  return {
    nextBig: holiday && nextBigBreak ? { holiday, brk: nextBigBreak } : null,
    maxLeave,
    sixMonths,
    yearPlan,
  }
}
