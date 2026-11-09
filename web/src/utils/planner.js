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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const minDate = (a, b) => (a < b ? a : b)
const maxDate = (a, b) => (a > b ? a : b)

function isWeekend(date) {
  const day = new Date(date + 'T00:00:00').getDay()
  return day === 0 || day === 6
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
  "St. Stephen's Day": 'Christmas',
}
const groupName = name => GROUPS[name] ?? name

/**
 * The leave periods offered in step 1 (Custom is handled by the caller).
 *
 * Returns [{ id, kind, title, subtitle, from, to }] in display
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
      from: maxDate(addDays(today, 1), addDays(next, -7)), to: addDays(lastOfSet, 7),
    })
  }

  // Christmas: 15 Dec to 10 Jan, this year's unless it's already over.
  const year = Number(today.slice(0, 4))
  const xmasYear = today > `${year}-12-25` ? year + 1 : year
  periods.push({
    id: 'xmas', kind: 'xmas', title: 'Christmas holidays', subtitle: 'Dec – Jan',
    from: maxDate(addDays(today, 1), `${xmasYear}-12-15`), to: `${xmasYear + 1}-01-10`,
  })

  // Easter: about ten days before Good Friday to two weeks after.
  const goodFriday = sorted.find(d => d > today && holidays.get(d) === 'Good Friday')
  if (goodFriday) {
    const from = maxDate(addDays(today, 1), addDays(goodFriday, -10))
    const to = addDays(goodFriday, 14)
    periods.push({ id: 'easter', kind: 'easter', title: 'Easter', subtitle: fmtShortRange(from, to), from, to })
  }

  // School holidays: the next (or current) one for the province.
  const school = schoolBreaksFor(provinceCode, addDays(today, 1), horizon)[0]
  if (school) {
    const from = maxDate(addDays(today, 1), school.start)
    periods.push({
      id: 'school', kind: 'school', title: 'School holidays', subtitle: `${provinceLabel(provinceCode)} · ${fmtShortRange(from, school.end)}`,
      from, to: school.end,
    })
  }

  periods.push({ id: 'year', kind: 'year', title: String(year + 1), subtitle: 'Jan – Dec', from: `${year + 1}-01-01`, to: `${year + 1}-12-31` })

  const valid = periods.filter(p => p.from <= p.to)

  // When the next holiday IS Christmas or Easter, that card replaces Up next
  // at the top (only if its dates hold the holiday, so it's the right one).
  const leadId = next && { Christmas: 'xmas', Easter: 'easter' }[groupName(holidays.get(next))]
  const lead = valid.find(p => p.id === leadId && p.from <= next && next <= p.to)
  if (!lead) return valid
  return [lead, ...valid.filter(p => p !== lead && p.id !== 'next')]
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

/** Totals for a plan: { breaks, leave, daysOff, multiplier }. */
export function summarise(breaks) {
  const leave = breaks.reduce((t, b) => t + b.leaveDays, 0)
  const daysOff = breaks.reduce((t, b) => t + b.daysOff, 0)
  return { breaks: breaks.length, leave, daysOff, multiplier: leave ? daysOff / leave : 0 }
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

// ---- Custom: whole months, and options you pick yourself ----

/** A Custom period needs at least this many workdays (the most leave you can plan). */
export const MIN_CUSTOM_WORKDAYS = MAX_LEAVE

const lastDayOf = month => {
  const [y, m] = month.split('-').map(Number)
  return `${month}-${String(new Date(y, m, 0).getDate()).padStart(2, '0')}`
}
const nextMonth = m => {
  const [y, mm] = m.split('-').map(Number)
  return mm === 12 ? `${y + 1}-01` : `${y}-${String(mm + 1).padStart(2, '0')}`
}

/** The dates a Custom month range covers: the 1st (or tomorrow, this month) to the last day. */
export function monthsPeriod(fromMonth, toMonth, today) {
  const first = `${fromMonth}-01`
  return { from: maxDate(first, addDays(today, 1)), to: lastDayOf(toMonth) }
}

/**
 * The months Custom can use, 'YYYY-MM' in order: this month (only when it
 * still has MIN_CUSTOM_WORKDAYS workdays after today) up to lastDate's month.
 */
export function customMonths(today, lastDate) {
  const out = []
  for (let m = monthKey(today); m <= monthKey(lastDate); m = nextMonth(m)) {
    const { from, to } = monthsPeriod(m, m, today)
    if (m === monthKey(today) && (from > to || workdaysIn(from, to) < MIN_CUSTOM_WORKDAYS)) continue
    out.push(m)
  }
  return out
}

// The weekday public holidays a break uses, as a key: 'Easter@2027+Freedom Day@2027'.
// Holidays on a weekend give no free day, so they don't count; sets (Easter,
// Christmas) count once.
function holidayKey(brk) {
  const names = new Set()
  for (const d of brk.days) {
    if (d.type === 'public_holiday' && !isWeekend(d.date)) names.add(`${groupName(d.holidayName)}@${d.date.slice(0, 4)}`)
  }
  return [...names].sort().join('+')
}

/**
 * Custom's options to pick from (nothing is picked for you), best first.
 *   aim 'long' – single breaks using all `leave` days, most days off first
 *   aim 'max'  – holidays only: for each public holiday, and each run of
 *                holidays joined together, the best-value break (fewest leave
 *                on a tie). No plain long weekends and no padding. Joins first,
 *                then the single holidays (best value first).
 * Equal starts collapse to the earliest (as in planLeave); never past `to`;
 * avoided months and `within` (school holidays) apply; a long break must
 * touch every included month (holiday breaks: you pick the months yourself). At most `limit`.
 */
export function customOptions({ from, to, leave, aim, avoidMonths = new Set(), includeMonths = new Set(), within = null, limit = 12 }) {
  if (leave < 1 || from > to) return []
  const holidays = holidaysAround(from, to)
  const isFree = date => isWeekend(date) || holidays.has(date)
  const sizes = aim === 'long' ? [leave] : Array.from({ length: leave }, (_, i) => i + 1)
  const options = []
  for (let date = from; date <= to; date = addDays(date, 1)) {
    if (date !== from && isFree(addDays(date, -1))) continue
    for (const k of sizes) {
      const brk = buildBreak(date, k)
      if (brk.endDate > to) break
      if (within && !within.some(w => brk.startDate >= w.start && brk.endDate <= w.end)) continue
      const months = new Set(brk.days.map(d => monthKey(d.date)))
      if ([...months].some(m => avoidMonths.has(m))) continue
      // One long break must touch every month you asked to include.
      if (aim === 'long' && [...includeMonths].some(m => !months.has(m))) continue
      options.push(brk)
    }
  }
  if (aim === 'max') {
    // One break per holiday (or set of joined holidays): the best multiplier.
    const best = new Map()
    for (const brk of options) {
      const key = holidayKey(brk)
      if (!key) continue
      const old = best.get(key)
      if (!old || brk.multiplier > old.multiplier || (brk.multiplier === old.multiplier && brk.leaveDays < old.leaveDays)) best.set(key, brk)
    }
    options.splice(0, options.length, ...best.values())
  }
  const byDate = (a, b) => (a.startDate < b.startDate ? -1 : a.startDate > b.startDate ? 1 : 0)
  // Holiday breaks: joins first (most holidays, then most days off), then the
  // single holidays' breaks, best value first; every row stays in the list.
  const joined = brk => holidayKey(brk).split('+').length
  options.sort(aim === 'long'
    ? (a, b) => b.daysOff - a.daysOff || byDate(a, b)
    : (a, b) => Math.min(joined(b), 2) - Math.min(joined(a), 2) || (joined(a) > 1 ? joined(b) - joined(a) || b.daysOff - a.daysOff : 0) || b.multiplier - a.multiplier || b.daysOff - a.daysOff || byDate(a, b))
  // No public holidays at all: every week is the same, so one row per week (its best start).
  const noHolidays = ![...holidays.keys()].some(d => d >= from && d <= to && !isWeekend(d))
  if (aim === 'long' && noHolidays) {
    // Shifted starts in the same week stay in the start dropdown.
    const week = o => o.days.find(d => new Date(d.date + 'T00:00:00').getDay() === 6)?.date ?? o.startDate
    const seen = new Set()
    return options.filter(o => o.daysOff === options[0].daysOff && !seen.has(week(o)) && seen.add(week(o))).slice(0, limit)
  }
  // The same break shifted by a day or two (same leave and days off, overlapping) shows once.
  const kept = []
  for (const brk of options) {
    const twin = kept.some(k => k.leaveDays === brk.leaveDays && k.daysOff === brk.daysOff && brk.startDate <= k.endDate && k.startDate <= brk.endDate)
    if (!twin) kept.push(brk)
    if (kept.length === limit) break
  }
  return kept
}

/** Whether two breaks share any day. */
export function overlaps(a, b) {
  return a.startDate <= b.endDate && b.startDate <= a.endDate
}

/**
 * Why an option can't be ticked next to the picks (holiday breaks), or null:
 * { overlap: brk } when it shares days with a picked break, { leave: true }
 * when there isn't enough leave left in `budget`. (Custom picks can sit
 * close together: you choose them, so the one-week gap doesn't apply.)
 */
export function pickBlocker(option, picks, budget) {
  const overlap = picks.find(p => p !== option && overlaps(p, option))
  if (overlap) return { overlap }
  const used = picks.reduce((t, p) => t + p.leaveDays, 0)
  return used + option.leaveDays > budget ? { leave: true } : null
}

/**
 * What each leave number (1–10) does in a Custom range, from its weekday public
 * holidays (Easter, Christmas + Day of Goodwill and other holidays with no
 * workday between count as one):
 *   'min'     – the first proper break (MIN tag): one holiday's long weekend
 *               or full week (Mon / Fri), or the last long weekend before a join
 *   'weekend' – another holiday reaches a weekend (a long weekend)
 *   'join'    – holidays join into one break (the JOINS tag)
 *   'pad'     – nothing new, it only makes a break a day longer (skipped)
 *   'long'    – past the proper break (one holiday) or the last join: a longer break
 * Returns { holidays, marks, joins: [{ leave, names }], allJoin, minLeave }:
 *   holidays = how many (grouped) weekday holidays; marks = 10 entries, or null
 *   for several seasons (more than two clusters); allJoin = they all join within
 *   MAX_LEAVE days; minLeave = the first number that isn't skipped.
 * See "Leave number rules" in CLAUDE.md.
 */
export function customLeaveMap(from, to) {
  const holidays = holidaysAround(from, to)
  const days = []
  for (let d = from; d <= to; d = addDays(d, 1)) days.push(d)
  const n = days.length
  const free = days.map(d => isWeekend(d) || holidays.has(d))
  const weekend = days.map(isWeekend)
  // Group weekday holidays that have no workday between them.
  const group = new Array(n).fill(-1)
  const names = []
  let last = -1
  for (let i = 0; i < n; i++) {
    if (!holidays.has(days[i]) || weekend[i]) continue
    const name = groupName(holidays.get(days[i]))
    let joined = last >= 0
    for (let j = last + 1; joined && j < i; j++) if (!free[j]) joined = false
    if (!joined) names.push([])
    const g = names.length - 1
    if (!names[g].includes(name)) names[g].push(name)
    group[i] = g
    last = i
  }
  const count = names.length
  const usable = marks => marks.findIndex(m => m !== 'pad') + 1
  // No holidays: every week is the same; 1 leave day already makes a 3-day weekend.
  if (count === 0) {
    const marks = ['min', ...new Array(MAX_LEAVE - 1).fill('long')]
    return { holidays: 0, marks, joins: [], allJoin: false, minLeave: 1 }
  }

  // Every break that holds a holiday and can't grow for free (starts and ends next to a workday).
  const breaks = []
  for (let s = 0; s < n; s++) {
    if (s > 0 && free[s - 1]) continue
    let leave = 0
    let weekendDays = 0
    const groups = new Set()
    for (let e = s; e < n; e++) {
      if (!free[e]) leave++
      if (leave > MAX_LEAVE) break
      if (weekend[e]) weekendDays++
      if (group[e] >= 0) groups.add(group[e])
      if (e < n - 1 && free[e + 1]) continue
      if (groups.size) breaks.push({ s, e, leave, weekendDays, groups: new Set(groups), bridged: weekendDays ? groups.size : 0 })
    }
  }
  // Each holiday's first proper break: the fewest leave days that catch a
  // weekend it doesn't already have for free (Tue / Thu 1, Wed 2, Mon / Fri 4).
  const properMin = g => {
    const i = group.indexOf(g)
    let a = i
    let b = i
    while (a > 0 && free[a - 1]) a--
    while (b < n - 1 && free[b + 1]) b++
    let freeWeekend = 0
    for (let k = a; k <= b; k++) if (weekend[k]) freeWeekend++
    const fits = breaks.filter(x => x.leave > 0 && x.groups.has(g) && x.weekendDays > freeWeekend)
    return fits.length ? Math.min(...fits.map(x => x.leave)) : null
  }
  const firstProper = Math.min(...names.map((_, g) => properMin(g) ?? Infinity))

  // One holiday: below its first proper break skipped, then every number makes it longer.
  if (count === 1) {
    const marks = Array.from({ length: MAX_LEAVE }, (_, i) => (i + 1 < firstProper ? 'pad' : i + 1 === firstProper ? 'min' : 'long'))
    return { holidays: 1, marks, joins: [], allJoin: false, minLeave: usable(marks) }
  }

  // Most holidays that reach a weekend, using separate breaks (a day apart at least), per leave budget.
  const ending = Array.from({ length: n }, () => [])
  for (const b of breaks) ending[b.e].push(b)
  const best = Array.from({ length: n + 1 }, () => new Array(MAX_LEAVE + 1).fill(0))
  for (let i = 0; i < n; i++) {
    for (let L = 0; L <= MAX_LEAVE; L++) {
      let v = Math.max(best[i][L], L ? best[i + 1][L - 1] : 0)
      for (const b of ending[i]) if (b.leave <= L) v = Math.max(v, best[Math.max(0, b.s - 1)][L - b.leave] + b.bridged)
      best[i + 1][L] = v
    }
  }
  const bridged = best[n]
  // Most holidays one break can join, per leave budget.
  const joinMax = Array.from({ length: MAX_LEAVE + 1 }, (_, L) => Math.max(0, ...breaks.filter(b => b.leave <= L).map(b => b.groups.size)))
  const allJoin = joinMax[MAX_LEAVE] === count

  // Holidays in clusters (each joins the next within 10 days). More than two
  // clusters = several seasons (e.g. a whole year): the row can't describe it, so it stays plain.
  let clusters = 1
  for (let g = 1; g < count; g++) {
    const joinsNext = breaks.some(b => b.groups.has(g - 1) && b.groups.has(g))
    if (!joinsNext) clusters++
  }
  if (clusters > 2) return { holidays: count, marks: null, joins: [], allJoin: false, minLeave: 1 }

  const joins = []
  for (let L = 1; L <= MAX_LEAVE; L++) {
    if (joinMax[L] > joinMax[L - 1] && joinMax[L] > 1) {
      const brk = breaks.filter(b => b.leave <= L && b.groups.size === joinMax[L]).sort((a, b) => a.leave - b.leave)[0]
      joins.push({ leave: L, names: [...brk.groups].sort((a, b) => a - b).map(g => names[g].join(' + ')) })
    }
  }
  const joinAt = new Set(joins.map(j => j.leave))
  const lastJoin = joins.length ? joins[joins.length - 1].leave : null
  const firstJoin = joins.length ? joins[0].leave : null
  const marks = []
  for (let L = 1; L <= MAX_LEAVE; L++) {
    if (joinAt.has(L)) marks.push('join')
    // Once every holiday that can join has joined, every number makes the break longer.
    else if (lastJoin && L > lastJoin) marks.push('long')
    else if (bridged[L] > bridged[L - 1]) marks.push('weekend')
    // No long weekend to make (Mon / Fri holidays): the first proper break, if it comes before the join.
    else if (L === firstProper && (!firstJoin || L < firstJoin)) marks.push('min')
    else if (!joins.length && L > firstProper) marks.push('long')
    else marks.push('pad')
  }
  // The last long weekend before the first join is the minimum for a proper set of breaks.
  const lastWeekend = marks.lastIndexOf('weekend')
  if (lastWeekend >= 0 && (!firstJoin || lastWeekend + 1 < firstJoin)) marks[lastWeekend] = 'min'
  return { holidays: count, marks, joins, allJoin, minLeave: usable(marks) }
}

/**
 * Which sections the list of a list period shows for these leave days:
 *   long    – "One long break": all your leave in one go (once a long break is
 *             worth it: from the last join, or from MIN when nothing joins)
 *   holiday – "Holiday breaks": joins and each holiday's own break (2+ holidays)
 * No or one holiday: only the long breaks. Returns { long, holiday }.
 */
export function listSections(map, leave) {
  if (!map || map.holidays < 2) return { long: true, holiday: false }
  const joins = map.joins ?? []
  const from = joins.length ? joins[joins.length - 1].leave : map.minLeave
  return { long: leave >= from, holiday: true }
}

/**
 * Which Custom list to show for these leave days, and whether step 3 (choose)
 * appears: no or one holiday → one long break; holidays that all join within
 * 10 days → holiday breaks below the last join, one long break from it; holidays
 * too far apart to join → step 3, your choice.
 * Returns { list: 'max' | 'long', choose: boolean }.
 */
export function customListFor(map, leave, chosen) {
  if (map.holidays < 2) return { list: 'long', choose: false }
  if (map.allJoin) return { list: leave < map.joins[map.joins.length - 1].leave ? 'max' : 'long', choose: false }
  return { list: chosen, choose: true }
}

/**
 * The picks a themed period starts with (Easter, Christmas): one long break →
 * the top option; holiday breaks → joins first (most holidays, then most days
 * off), then the rest best value first, as long as they fit the leave and don't overlap.
 */
export function suggestedPicks(options, leave, list) {
  if (list === 'long') return options.slice(0, 1)
  const joined = o => holidayKey(o).split('+').length
  // Joins (most holidays, then most days off) first; the rest keep their best-value order.
  const joins = options.filter(o => joined(o) > 1).sort((a, b) => joined(b) - joined(a) || b.daysOff - a.daysOff)
  const order = [...joins, ...options.filter(o => joined(o) < 2)]
  const picks = []
  for (const o of order) if (!pickBlocker(o, picks, leave)) picks.push(o)
  return picks
}

/** "Mar" or "Mar '27" for a 'YYYY-MM' key, adding the year when the period spans two. */
export function monthLabel(key, withYear = false) {
  const label = MONTHS[Number(key.slice(5, 7)) - 1]
  return withYear ? `${label} '${key.slice(2, 4)}` : label
}

/**
 * The recommended leave days for a period: the fewest that give one long
 * break joining the most public holidays (best multiplier on a tie). For
 * school holidays: enough to cover the whole school holiday when that's 10 or
 * fewer. Next year and Custom have none (they always go for the best multiplier).
 *
 * Returns { leave, brk, whole, reason } (brk = that break; whole = covers the
 * whole school holiday; reason = a short tag: 'covers the school holiday',
 * 'joins holidays' or 'best bang for buck'), or null.
 */
export function recommendedLeave(period) {
  if (period.kind === 'year' || period.kind === 'custom') return null
  const work = workdaysIn(period.from, period.to)
  if (work < 1) return null
  if (period.kind === 'school' && work <= MAX_LEAVE) {
    const [brk] = planLeave({ from: period.from, to: period.to, leave: work, maxBreaks: 1 })
    return brk ? { leave: work, brk, whole: true, reason: 'covers the school holiday' } : null
  }
  let best = null
  for (let leave = 1; leave <= Math.min(MAX_LEAVE, work); leave++) {
    const [brk] = planLeave({ from: period.from, to: period.to, leave, maxBreaks: 1 })
    if (!brk) continue
    const holidays = brk.days.filter(d => d.holidayName).length
    if (!best || holidays > best.holidays || (holidays === best.holidays && brk.multiplier > best.brk.multiplier)) {
      best = { leave, brk, holidays }
    }
  }
  if (!best || best.holidays === 0) return null
  // Two or more holidays (Easter counts as one) joined = "joins holidays".
  const groups = new Set(best.brk.days.filter(d => d.holidayName).map(d => groupName(d.holidayName)))
  return { leave: best.leave, brk: best.brk, whole: false, reason: groups.size > 1 ? 'joins holidays' : 'best bang for buck' }
}

/** How many breaks the plan may use: one long break once you have the recommended days, else as many as help. */
export const breaksFor = (rec, leave) => (rec && leave >= rec.leave ? 1 : null)
