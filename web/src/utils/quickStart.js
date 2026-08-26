function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function addMonthsClamped(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return toDateStr(new Date(y, m - 1 + n, d))
}

// [{ value: 'YYYY-MM', label: 'Sep \'26' }, ...] from todayStr's month through datasetEnd's month.
const SHORT_MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export function monthOptions(todayStr, datasetEnd) {
  const [sy, sm] = todayStr.slice(0, 7).split('-').map(Number)
  const [ey, em] = datasetEnd.slice(0, 7).split('-').map(Number)
  const opts = []
  let y = sy, m = sm
  while (y < ey || (y === ey && m <= em)) {
    opts.push({ value: `${y}-${String(m).padStart(2, '0')}`, label: `${SHORT_MONTH[m - 1]} '${String(y).slice(2)}` })
    m++
    if (m > 12) { m = 1; y++ }
  }
  return opts
}

function firstDayOfMonth(ym) {
  return `${ym}-01`
}
function lastDayOfMonth(ym) {
  const [y, m] = ym.split('-').map(Number)
  return toDateStr(new Date(y, m, 0))
}

// preset: 'biggest' | 'next6' | 'custom'. Returns [startDate, endDate].
export function resolveWindowPreset(preset, todayStr, datasetEnd, customFromMonth, customToMonth) {
  if (preset === 'next6') {
    const end = addMonthsClamped(todayStr, 6)
    return [todayStr, end < datasetEnd ? end : datasetEnd]
  }
  if (preset === 'custom' && customFromMonth && customToMonth) {
    const start = firstDayOfMonth(customFromMonth) > todayStr ? firstDayOfMonth(customFromMonth) : todayStr
    const end = lastDayOfMonth(customToMonth)
    return [start, end < datasetEnd ? end : datasetEnd]
  }
  // 'biggest' (and fallback) — the whole remaining dataset horizon.
  return [todayStr, datasetEnd]
}

function touchesFocusDate(period, focusDates) {
  for (const d of focusDates) {
    if (d >= period.startDate && d <= period.endDate) return true
  }
  return false
}

// Continuous mode: top 3 candidates within window+budget, cache is already
// sorted ratio desc/daysOff desc so filtering preserves "best first" order.
// Focus dates are a soft preference — fall back to the unrestricted pool
// (and flag it) when nothing in the window touches any focus date.
export function selectContinuousTop3({ cache, startDate, endDate, budget, focusDates }) {
  const candidates = cache.filter(p =>
    p.startDate >= startDate && p.endDate <= endDate && p.leaveDaysUsed <= budget
  )
  if (candidates.length === 0) return { picks: [], focusFallback: false }

  let pool = candidates
  let focusFallback = false
  if (focusDates && focusDates.size > 0) {
    const focused = candidates.filter(p => touchesFocusDate(p, focusDates))
    if (focused.length > 0) pool = focused
    else focusFallback = true
  }

  return { picks: pool.slice(0, 3), focusFallback }
}

// Scattered mode: earliest-first greedy pick, never best-ratio-first — the
// idea is to prioritize the soonest opportunities, not cherry-pick the best
// ratio from anywhere in the window. No focus-date concept here (scattered
// skips that step entirely — it already optimizes for days-off efficiency).
export function selectScattered({ cache, startDate, endDate, budget }) {
  const candidates = cache.filter(p =>
    p.startDate >= startDate && p.endDate <= endDate && p.leaveDaysUsed <= budget
  )
  const sorted = [...candidates].sort((a, b) => a.startDate.localeCompare(b.startDate))

  const picks = []
  let remaining = budget
  for (const p of sorted) {
    if (p.leaveDaysUsed > remaining) continue
    const overlaps = picks.some(q => p.startDate <= q.endDate && p.endDate >= q.startDate)
    if (overlaps) continue
    picks.push(p)
    remaining -= p.leaveDaysUsed
    if (remaining <= 0) break
  }

  return { picks, daysUsed: budget - remaining }
}
