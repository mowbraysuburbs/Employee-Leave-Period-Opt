import { buildBreak, findEqualStarts } from './breaks'
import { schoolBreaksFor, provinceLabel } from './plans'
import { getPublicHolidaysForYear } from '../data/publicHolidays'
import { addDays, fmtDay, fmtShortRange } from './dateFormat'

// The Overview planner: pick a leave period, how many leave days and how many
// breaks, and get the plan with the most days off. Pure functions only.

// Nobody plans with more than this many leave days (the calendar uses it too).
export const MAX_LEAVE = 10

// Breaks in a plan are at least this many workdays apart (one working week).
export const BREAK_GAP_WORKDAYS = 5

// "How many breaks?" choices; null means as many as possible.
export const BREAK_CHOICES = [1, 2, 3, null]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const minDate = (a, b) => (a < b ? a : b)
const maxDate = (a, b) => (a > b ? a : b)

function isWeekend(date) {
  const day = new Date(date + 'T00:00:00').getDay()
  return day === 0 || day === 6
}

// YYYY-MM-DD shifted by n calendar months, minus a day (so "3 months from 2 Nov" ends 1 Feb).
function monthsAhead(date, n) {
  const d = new Date(date + 'T00:00:00')
  d.setMonth(d.getMonth() + n)
  const shifted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return addDays(shifted, -1)
}

// Public holidays from a year before `from` to a year after `to`, date → name.
function holidaysAround(from, to) {
  const map = new Map()
  for (let y = Number(from.slice(0, 4)) - 1; y <= Number(to.slice(0, 4)) + 1; y++) {
    for (const h of getPublicHolidaysForYear(y)) map.set(h.date, h.name)
  }
  return map
}

// Holidays that come as a set are named as one: Easter, Christmas.
const GROUPS = {
  'Good Friday': 'Easter',
  'Family Day': 'Easter',
  'Christmas Day': 'Christmas',
  'Day of Goodwill': 'Christmas',
}
const groupName = name => GROUPS[name] ?? name

/**
 * The leave periods offered in step 1 (Custom is handled by the caller).
 *
 * Returns [{ id, kind, title, subtitle, from, to, defaultBreaks }] in display
 * order, skipping any that fall outside the holiday data.
 */
export function planPeriods({ today, provinceCode = 'GP' }) {
  const horizon = `${Number(today.slice(0, 4)) + 2}-12-31`
  const holidays = holidaysAround(today, horizon)
  const sorted = [...holidays.keys()].sort()
  const periods = []

  // Up next: a week either side of the next weekday public holiday (or holiday set).
  const next = sorted.find(d => d > today && !isWeekend(d))
  if (next) {
    const name = groupName(holidays.get(next))
    const lastOfSet = sorted.filter(d => d >= next && d <= addDays(next, 4) && groupName(holidays.get(d)) === name).pop()
    const span = lastOfSet === next ? fmtDay(next) : fmtShortRange(next, lastOfSet)
    periods.push({
      id: 'next', kind: 'next', title: 'Up next', subtitle: `${name} · ${span}`,
      from: maxDate(addDays(today, 1), addDays(next, -7)), to: addDays(lastOfSet, 7), defaultBreaks: 1,
    })
  }

  // Christmas: 15 Dec to 10 Jan, this year's unless it's already over.
  const year = Number(today.slice(0, 4))
  const xmasYear = today > `${year}-12-25` ? year + 1 : year
  periods.push({
    id: 'xmas', kind: 'xmas', title: 'Christmas', subtitle: 'Dec – Jan',
    from: maxDate(addDays(today, 1), `${xmasYear}-12-15`), to: `${xmasYear + 1}-01-10`, defaultBreaks: 2,
  })

  // Easter: about ten days before Good Friday to two weeks after.
  const goodFriday = sorted.find(d => d > today && holidays.get(d) === 'Good Friday')
  if (goodFriday) {
    const from = maxDate(addDays(today, 1), addDays(goodFriday, -10))
    const to = addDays(goodFriday, 14)
    periods.push({ id: 'easter', kind: 'easter', title: 'Easter', subtitle: fmtShortRange(from, to), from, to, defaultBreaks: 1 })
  }

  // School holidays: the next (or current) one for the province.
  const school = schoolBreaksFor(provinceCode, addDays(today, 1), horizon)[0]
  if (school) {
    const from = maxDate(addDays(today, 1), school.start)
    periods.push({
      id: 'school', kind: 'school', title: 'School holidays', subtitle: `${provinceLabel(provinceCode)} · ${fmtShortRange(from, school.end)}`,
      from, to: school.end, defaultBreaks: 2,
    })
  }

  const start = addDays(today, 1)
  const monthSpan = (from, to) => `${MONTHS[Number(from.slice(5, 7)) - 1]} – ${MONTHS[Number(to.slice(5, 7)) - 1]}`
  const three = monthsAhead(start, 3)
  const six = monthsAhead(start, 6)
  periods.push({ id: 'three', kind: 'three', title: 'Next 3 months', subtitle: monthSpan(start, three), from: start, to: three, defaultBreaks: 3 })
  periods.push({ id: 'six', kind: 'six', title: 'Next 6 months', subtitle: monthSpan(start, six), from: start, to: six, defaultBreaks: 3 })
  periods.push({ id: 'rest', kind: 'rest', title: 'Rest of the year', subtitle: `until 31 Dec`, from: start, to: `${year}-12-31`, defaultBreaks: 3 })
  periods.push({ id: 'year', kind: 'year', title: String(year + 1), subtitle: 'Jan – Dec', from: `${year + 1}-01-01`, to: `${year + 1}-12-31`, defaultBreaks: 3 })

  return periods.filter(p => p.from <= p.to)
}

/** How many workdays (so the most leave days you can use) fall in [from, to]. */
export function workdaysIn(from, to) {
  const holidays = holidaysAround(from, to)
  let count = 0
  for (let d = from; d <= to; d = addDays(d, 1)) if (!isWeekend(d) && !holidays.has(d)) count++
  return count
}

/** Whether any school holiday for the province overlaps [from, to]. */
export function schoolHolidaysIn(provinceCode, from, to) {
  return schoolBreaksFor(provinceCode, from, to).map(sb => ({ start: maxDate(sb.start, from), end: minDate(sb.end, to) }))
}

const monthKey = date => date.slice(0, 7)

/**
 * The plan with the most days off in [from, to].
 *
 * Options:
 *   leave         – leave days to spend (at most)
 *   maxBreaks     – 1, 2, 3 or null (as many as possible)
 *   avoidMonths   – Set of 'YYYY-MM': no break may touch these months
 *   includeMonths – Set of 'YYYY-MM': each needs a break touching it
 *   within        – optional [{ start, end }]: breaks must sit inside one of these (school holidays)
 *
 * Breaks never run past `to`, and are at least one working week apart.
 * Returns the breaks in date order (empty if nothing fits).
 */
export function planLeave({ from, to, leave, maxBreaks = null, avoidMonths = new Set(), includeMonths = new Set(), within = null }) {
  if (leave < 1 || from > to) return []
  const holidays = holidaysAround(from, to)
  const isFree = date => isWeekend(date) || holidays.has(date)
  const include = [...includeMonths].filter(m => m >= monthKey(from) && m <= monthKey(to)).sort()
  const fullMask = (1 << include.length) - 1

  // Candidates: every start day (the day after a workday, so equal starts
  // collapse to the earliest) with 1..leave leave days, never past `to`.
  const candidates = []
  for (let date = from; date <= to; date = addDays(date, 1)) {
    if (date !== from && isFree(addDays(date, -1))) continue
    for (let k = 1; k <= leave; k++) {
      const brk = buildBreak(date, k)
      if (brk.endDate > to) break
      if (within && !within.some(w => brk.startDate >= w.start && brk.endDate <= w.end)) continue
      const months = new Set(brk.days.map(d => monthKey(d.date)))
      if ([...months].some(m => avoidMonths.has(m))) continue
      let mask = 0
      include.forEach((m, i) => { if (months.has(m)) mask |= 1 << i })
      candidates.push({ brk, mask })
    }
  }
  if (candidates.length === 0) return []

  candidates.sort((a, b) => (a.brk.endDate < b.brk.endDate ? -1 : a.brk.endDate > b.brk.endDate ? 1 : 0))
  const ends = candidates.map(c => c.brk.endDate)

  // The previous break must end before the 5th workday back from this start.
  const cutoff = start => {
    let d = start
    for (let n = 0; n < BREAK_GAP_WORKDAYS;) {
      d = addDays(d, -1)
      if (!isFree(d)) n++
    }
    return d
  }
  const before = candidates.map(c => {
    const cut = cutoff(c.brk.startDate)
    let lo = 0
    let hi = ends.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (ends[mid] < cut) lo = mid + 1
      else hi = mid
    }
    return lo
  })

  // dp[i] holds, for the first i candidates, the most days off for each
  // (leave used, breaks used, included months covered); -1 = impossible.
  const counts = Math.min(maxBreaks ?? leave, leave)
  const masks = fullMask + 1
  const size = (leave + 1) * (counts + 1) * masks
  const at = (b, n, m) => (b * (counts + 1) + n) * masks + m
  const empty = new Int32Array(size).fill(-1)
  empty[at(0, 0, 0)] = 0
  const dp = [empty]
  candidates.forEach(({ brk, mask }, i) => {
    const row = dp[i].slice()
    const base = dp[before[i]]
    for (let b = brk.leaveDays; b <= leave; b++) {
      for (let n = 1; n <= counts; n++) {
        for (let m = 0; m < masks; m++) {
          const prev = base[at(b - brk.leaveDays, n - 1, m)]
          if (prev < 0) continue
          const target = at(b, n, m | mask)
          if (prev + brk.daysOff > row[target]) row[target] = prev + brk.daysOff
        }
      }
    }
    dp.push(row)
  })

  // Best finish that covers every included month: most days off, then fewer leave, then fewer breaks.
  const last = dp[candidates.length]
  let best = null
  for (let b = 0; b <= leave; b++) {
    for (let n = 0; n <= counts; n++) {
      const v = last[at(b, n, fullMask)]
      if (v > 0 && (!best || v > best.v)) best = { v, b, n }
    }
  }
  if (!best) return []

  // Walk back through the table to recover which breaks made the total.
  const picked = []
  let { b, n } = best
  let m = fullMask
  let i = candidates.length
  while (i > 0 && n > 0) {
    const target = dp[i][at(b, n, m)]
    if (target === dp[i - 1][at(b, n, m)]) {
      i--
      continue
    }
    const { brk, mask } = candidates[i - 1]
    const base = dp[before[i - 1]]
    // Find which earlier mask led here (this break may have added some months).
    let prevMask = -1
    for (let pm = 0; pm < masks; pm++) {
      if ((pm | mask) === m && base[at(b - brk.leaveDays, n - 1, pm)] === target - brk.daysOff) {
        prevMask = pm
        break
      }
    }
    picked.push(brk)
    b -= brk.leaveDays
    n -= 1
    m = prevMask
    i = before[i - 1]
  }
  return picked.reverse()
}

const planKey = breaks => breaks.map(b => `${b.startDate}|${b.leaveDays}`).join(',')

/**
 * Plans for every "How many breaks?" choice, and which choices add nothing
 * over a smaller one (those get greyed out).
 *
 * Returns [{ choice, breaks, same }] in BREAK_CHOICES order; same = true when
 * the plan matches the previous choice's.
 */
export function planAllChoices(options) {
  const out = []
  for (const choice of BREAK_CHOICES) {
    const breaks = planLeave({ ...options, maxBreaks: choice })
    const prev = out[out.length - 1]
    out.push({ choice, breaks, same: prev ? planKey(prev.breaks) === planKey(breaks) : false })
  }
  return out
}

/**
 * Other start dates for brk that give the same days off and still sit inside
 * [from, to], in date order including brk itself (at most `limit`).
 */
export function equalStartsWithin(brk, from, to, limit = 4) {
  const options = findEqualStarts(brk).filter(b => b.startDate >= from && b.endDate <= to)
  if (options.length <= limit) return options
  const i = options.findIndex(b => b.startDate === brk.startDate)
  const start = Math.max(0, Math.min(i - 1, options.length - limit))
  return options.slice(start, start + limit)
}

/** What a break is built around, e.g. "Christmas & New Year's Day", or "Long weekend". */
export function aroundLabel(brk) {
  const names = []
  for (const d of brk.days) {
    if (d.type !== 'public_holiday') continue
    const name = groupName(d.holidayName)
    if (!names.includes(name)) names.push(name)
  }
  if (names.length === 0) return brk.leaveDays <= 2 ? 'Long weekend' : ''
  return names.length > 2 ? `${names.slice(0, -1).join(', ')} & ${names.at(-1)}` : names.join(' & ')
}

/** The months ('YYYY-MM') a period covers, for the avoid / include buttons. */
export function monthsIn(from, to) {
  const out = []
  for (let m = monthKey(from); m <= monthKey(to);) {
    out.push(m)
    const [y, mm] = m.split('-').map(Number)
    m = mm === 12 ? `${y + 1}-01` : `${y}-${String(mm + 1).padStart(2, '0')}`
  }
  return out
}

/** "Mar" or "Mar '27" for a 'YYYY-MM' key, adding the year when the period spans two. */
export function monthLabel(key, withYear = false) {
  const label = MONTHS[Number(key.slice(5, 7)) - 1]
  return withYear ? `${label} '${key.slice(2, 4)}` : label
}
