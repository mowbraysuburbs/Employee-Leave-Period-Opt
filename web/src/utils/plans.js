import { buildBreak } from './breaks'
import { getPublicHolidaysForYear } from '../data/publicHolidays'
import { getSchoolBreaksForYear, PROVINCES } from '../data/schoolHolidays'
import { addDays, fmtDay, fmtShortRange } from './dateFormat'

// The Overview always plans with this many leave days; fine-tuning happens on the calendar.
export const OVERVIEW_LEAVE = 10

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const minDate = (a, b) => (a < b ? a : b)
const maxDate = (a, b) => (a > b ? a : b)

function isWeekend(date) {
  const day = new Date(date + 'T00:00:00').getDay()
  return day === 0 || day === 6
}

// YYYY-MM-DD shifted by n calendar months (day of month kept, JS rolls over).
function addMonths(date, n) {
  const d = new Date(date + 'T00:00:00')
  d.setMonth(d.getMonth() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Every public holiday from the year before `from` to the year after `to`.
function holidaysAround(from, to) {
  const map = new Map()
  for (let y = Number(from.slice(0, 4)) - 1; y <= Number(to.slice(0, 4)) + 1; y++) {
    for (const h of getPublicHolidaysForYear(y)) map.set(h.date, h.name)
  }
  return map
}

/**
 * Most days off from non-overlapping breaks within a leave budget
 * (weighted interval scheduling with a budget). On a tie the reconstruction
 * skips the later break, so earlier dates win.
 */
function bestSet(candidates, budget) {
  const list = [...candidates].sort((a, b) => (a.endDate < b.endDate ? -1 : a.endDate > b.endDate ? 1 : 0))
  const ends = list.map(c => c.endDate)
  // before[i] = how many breaks end before break i starts.
  const before = list.map(c => {
    let lo = 0
    let hi = ends.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (ends[mid] < c.startDate) lo = mid + 1
      else hi = mid
    }
    return lo
  })
  const dp = [new Array(budget + 1).fill(0)]
  list.forEach((c, i) => {
    const row = dp[i].slice()
    for (let b = c.leaveDays; b <= budget; b++) {
      row[b] = Math.max(row[b], dp[before[i]][b - c.leaveDays] + c.daysOff)
    }
    dp.push(row)
  })

  let budgetUsed = 0
  dp[list.length].forEach((v, b) => { if (v > dp[list.length][budgetUsed]) budgetUsed = b })
  const picked = []
  for (let i = list.length; i > 0 && budgetUsed > 0;) {
    if (dp[i][budgetUsed] === dp[i - 1][budgetUsed]) {
      i--
      continue
    }
    const c = list[i - 1]
    picked.push(c)
    budgetUsed -= c.leaveDays
    i = before[i - 1]
  }
  return picked.reverse()
}

export function provinceLabel(provinceCode) {
  return PROVINCES.find(p => p.code === provinceCode)?.label ?? provinceCode
}

/**
 * A province's school holidays that touch [from, to], as
 * [{ start, end, label }]. Summer breaks split at New Year are joined back
 * into one. Shared by School run and the calendar's school filter.
 */
export function schoolBreaksFor(provinceCode, from, to) {
  const joined = []
  for (let y = Number(from.slice(0, 4)); y <= Number(to.slice(0, 4)); y++) {
    for (const sb of getSchoolBreaksForYear(y, provinceCode)) {
      const prev = joined[joined.length - 1]
      if (prev && sb.start <= addDays(prev.end, 1)) prev.end = maxDate(prev.end, sb.end)
      else joined.push({ ...sb, label: sb.label.replace(' Break', ' break') })
    }
  }
  return joined.filter(sb => sb.end >= from && sb.start <= to)
}

/**
 * The ready-made plans on the Overview for the period [from, to].
 *
 * Returns [{ id, kind, title, rule, blurb, summary, breaks }], skipping plans that
 * found nothing. kind: 'next' | 'three' | 'xmas' | 'easter' | 'school' | 'year' | 'trip'.
 */
export function computePlans({ from, to, leave = OVERVIEW_LEAVE, provinceCode = 'GP' }) {
  const holidays = holidaysAround(from, to)
  const end = addDays(to, 1)
  const isFree = date => isWeekend(date) || holidays.has(date)
  const hasWeekdayHoliday = brk => brk.days.some(d => d.type === 'public_holiday' && !isWeekend(d.date))

  // Many plans ask about the same start + leave amount, so remember each one.
  const cache = new Map()
  const breakAt = (date, leaveDays) => {
    const key = `${date}|${leaveDays}`
    if (!cache.has(key)) cache.set(key, buildBreak(date, leaveDays))
    return cache.get(key)
  }

  // Every sensible break starting in [a, b): it starts the day after a working
  // day, so equal options collapse to the earliest one; it uses 1..maxPer
  // leave days and, unless anyHoliday, takes in a weekday public holiday.
  function candidates(a, b, maxPer, anyHoliday = false) {
    const out = []
    for (let date = a; date < b; date = addDays(date, 1)) {
      if (isFree(addDays(date, -1))) continue
      for (let k = 1; k <= maxPer; k++) {
        const brk = breakAt(date, k)
        if (anyHoliday || hasWeekdayHoliday(brk)) out.push(brk)
      }
    }
    return out
  }

  const plans = []

  // Up next: within a week either side of the next weekday public holiday,
  // the break that includes it with the best multiplier; earliest on ties.
  const nextHoliday = [...holidays.keys()].sort().find(d => d >= from && d <= to && !isWeekend(d))
  if (nextHoliday) {
    const windowEnd = minDate(addDays(nextHoliday, 7), to)
    let best = null
    for (let date = maxDate(addDays(nextHoliday, -7), from); date <= nextHoliday; date = addDays(date, 1)) {
      for (let k = 1; k <= leave; k++) {
        const brk = breakAt(date, k)
        if (brk.endDate < nextHoliday || brk.endDate > windowEnd) continue
        if (!best || brk.multiplier > best.multiplier + 1e-9) best = brk
      }
    }
    if (best) {
      plans.push({
        id: 'next', kind: 'next', title: 'Up next', rule: 'best ×, ± 1 week', breaks: [best],
        blurb: `The best value break within a week either side of the next public holiday, ${holidays.get(nextHoliday)} on ${fmtDay(nextHoliday)}.`,
        summary: `The best-value break around ${holidays.get(nextHoliday)}, ${fmtDay(nextHoliday).slice(4)}.`,
      })
    }
  }

  const threeEnd = minDate(addMonths(from, 3), end)
  plans.push({
    id: 'three', kind: 'three', title: 'Next 3 months', rule: `${leave} days · any split`,
    breaks: bestSet(candidates(from, threeEnd, leave), leave),
    blurb: `Your ${leave} leave days spent around public holidays before ${fmtDay(threeEnd).slice(4)}, for the most days off. One long break or several short ones, whichever adds up to more.`,
    summary: 'The most days off from your leave over the next three months.',
  })

  // Christmas special: the first Christmas in the period, about 15 Dec to 10 Jan.
  const firstYear = Number(from.slice(0, 4))
  const lastYear = Number(to.slice(0, 4))
  for (let y = firstYear; y <= lastYear; y++) {
    if (`${y}-12-25` < from || `${y}-12-25` > to) continue
    plans.push({
      id: `xmas-${y}`, kind: 'xmas', title: 'Christmas special', rule: `${leave} days · Dec–Jan`,
      breaks: bestSet(candidates(maxDate(from, `${y}-12-15`), minDate(end, `${y + 1}-01-11`), leave), leave),
      blurb: `The most days off over Christmas and New Year ${y}–${String(y + 1).slice(2)}, joining Day of Reconciliation, Christmas, the day after and New Year with the weekends.`,
      summary: 'The most days off over Christmas and New Year.',
    })
    break
  }

  // Easter break: about ten days either side of Good Friday and Family Day.
  const goodFriday = [...holidays.entries()].sort().find(([d, name]) => name === 'Good Friday' && d >= from && d <= to)?.[0]
  if (goodFriday) {
    plans.push({
      id: `easter-${goodFriday.slice(0, 4)}`, kind: 'easter', title: 'Easter break', rule: `${leave} days · around Easter`,
      breaks: bestSet(candidates(maxDate(from, addDays(goodFriday, -10)), minDate(end, addDays(goodFriday, 14)), leave), leave),
      blurb: `The most days off around Easter ${goodFriday.slice(0, 4)}, using Good Friday and Family Day (and Human Rights Day when it falls close by).`,
      summary: `The most days off around Easter ${goodFriday.slice(0, 4)}.`,
    })
  }

  // School run: leave periods inside the next school holiday, the most days
  // off from the budget bridging any public holidays in it; if it has none,
  // the longest single block, so parents are home while school is closed.
  const nextSchool = schoolBreaksFor(provinceCode, from, to)[0]
  if (nextSchool) {
    const a = maxDate(from, nextSchool.start)
    const b = minDate(end, addDays(nextSchool.end, 1))
    const inside = brk => brk.endDate <= nextSchool.end
    let schoolBreaks = bestSet(candidates(a, b, leave).filter(inside), leave)
    if (schoolBreaks.length === 0) {
      const longest = candidates(a, b, leave, true).filter(inside).sort((x, y) => y.daysOff - x.daysOff)[0]
      schoolBreaks = longest ? [longest] : []
    }
    const label = provinceLabel(provinceCode)
    plans.push({
      id: 'school', kind: 'school', title: 'School run', rule: label, breaks: schoolBreaks,
      blurb: `${label} school holiday: ${nextSchool.label}, school closed ${fmtShortRange(a, nextSchool.end)}. These are your leave periods inside it, using up to ${leave} leave days, so you're home with the kids.`,
      summary: `Leave inside the ${label} school holiday, so you're home with the kids.`,
    })
  }

  // Year plans: short 1–2 day bridges for each calendar year in the period.
  for (let y = firstYear; y <= lastYear; y++) {
    const a = maxDate(from, `${y}-01-01`)
    const b = minDate(end, `${y + 1}-01-01`)
    const whole = a === `${y}-01-01` && b === `${y + 1}-01-01`
    const title = whole
      ? `${y} plan`
      : b === `${y + 1}-01-01`
        ? `Rest of ${y}`
        : `${y} (${MONTHS[Number(a.slice(5, 7)) - 1]}–${MONTHS[Number(addDays(b, -1).slice(5, 7)) - 1]})`
    plans.push({
      id: `year-${y}`, kind: 'year', title, rule: `up to ${leave} · 1–2 per break`,
      breaks: bestSet(candidates(a, b, 2), leave),
      blurb: `The most effective leave in ${whole ? y : `this part of ${y}`}: short 1–2 day bridges that join public holidays to weekends, using up to ${leave} days.`,
      summary: `Short bridges that join holidays to weekends across ${y}.`,
    })
  }

  const trip = candidates(from, end, leave).filter(b => b.leaveDays === leave).sort((a, b) => b.daysOff - a.daysOff)[0]
  plans.push({
    id: 'trip', kind: 'trip', title: 'One big trip', rule: `${leave} days · one block`, breaks: trip ? [trip] : [],
    blurb: `All ${leave} leave days in one go: the longest single holiday in this period, for when you want to get properly away.`,
    summary: 'All your leave in one go, for one long trip.',
  })

  return plans.filter(p => p.breaks.length > 0)
}
