// Shifts a YYYY-MM-DD date string by n days (n can be negative).
export function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function fmt(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y.slice(2)}`
}

// Drop the year from the start date when it matches the end date's year —
// the end date always keeps its year so the range stays unambiguous.
export function fmtRange(startDate, endDate) {
  const [, ms, ds] = startDate.split('-')
  const startNoYear = `${ds}/${ms}`
  return startDate.slice(0, 4) === endDate.slice(0, 4)
    ? [startNoYear, fmt(endDate)]
    : [fmt(startDate), fmt(endDate)]
}

// a and b are YYYY-MM-DD with a <= b. Compresses to a bare day range only
// when they share a month+year, so a run crossing a month/year boundary
// never gets misread as a plain "05–08" style range.
function fmtSubRange(a, b) {
  if (a === b) return fmt(a).slice(0, 5)
  if (a.slice(0, 7) === b.slice(0, 7)) return `${a.slice(8, 10)}–${b.slice(8, 10)}`
  const sameYear = a.slice(0, 4) === b.slice(0, 4)
  const short = d => (sameYear ? `${d.slice(8, 10)}/${d.slice(5, 7)}` : fmt(d))
  return `${short(a)}–${short(b)}`
}

// For a run of adjacent periods with an identical result, show the span of
// start dates and the span of end dates separately — so the collapsed row
// reads as "several options in this range", not one continuous holiday.
export function fmtGroupRange(group) {
  return {
    startLabel: fmtSubRange(group[0].startDate, group[group.length - 1].startDate),
    endLabel: fmtSubRange(group[0].endDate, group[group.length - 1].endDate),
  }
}

const SHORT_MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// "03 May '26" — a friendlier alternative to fmt()'s "03/05/26", used by the
// best-periods table only (other callers keep the slash format).
export function fmtNice(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return `${d} ${SHORT_MONTH[+m - 1]} '${y.slice(2)}`
}

export function fmtRangeNice(startDate, endDate) {
  const [, ms, ds] = startDate.split('-')
  const startNoYear = `${ds} ${SHORT_MONTH[+ms - 1]}`
  return startDate.slice(0, 4) === endDate.slice(0, 4)
    ? [startNoYear, fmtNice(endDate)]
    : [fmtNice(startDate), fmtNice(endDate)]
}

function fmtSubRangeNice(a, b) {
  const [ay, am, ad] = a.split('-')
  const [by, , bd] = b.split('-')
  if (a === b) return `${ad} ${SHORT_MONTH[+am - 1]}`
  if (a.slice(0, 7) === b.slice(0, 7)) return `${ad}–${bd} ${SHORT_MONTH[+am - 1]}`
  const sameYear = ay === by
  const short = d => {
    const [, mo, da] = d.split('-')
    return sameYear ? `${da} ${SHORT_MONTH[+mo - 1]}` : fmtNice(d)
  }
  return `${short(a)}–${short(b)}`
}

export function fmtGroupRangeNice(group) {
  return {
    startLabel: fmtSubRangeNice(group[0].startDate, group[group.length - 1].startDate),
    endLabel: fmtSubRangeNice(group[0].endDate, group[group.length - 1].endDate),
  }
}

const FULL_MONTH = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const shortYear = y => `'${y.slice(2)}`

// "12 December '26" — full day and month, short year. Used by the
// best-periods table's separate Start Date / End Date columns.
export function fmtFull(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return `${parseInt(d, 10)} ${FULL_MONTH[+m - 1]} ${shortYear(y)}`
}

function fmtSubRangeFull(a, b) {
  if (a === b) return fmtFull(a)
  const [ay, am, ad] = a.split('-')
  const [by, bm, bd] = b.split('-')
  if (a.slice(0, 7) === b.slice(0, 7)) {
    return `${parseInt(ad, 10)}–${parseInt(bd, 10)} ${FULL_MONTH[+am - 1]} ${shortYear(ay)}`
  }
  if (ay === by) {
    return `${parseInt(ad, 10)} ${FULL_MONTH[+am - 1]} – ${parseInt(bd, 10)} ${FULL_MONTH[+bm - 1]} ${shortYear(ay)}`
  }
  return `${fmtFull(a)} – ${fmtFull(b)}`
}

export function fmtGroupRangeFull(group) {
  return {
    startLabel: fmtSubRangeFull(group[0].startDate, group[group.length - 1].startDate),
    endLabel: fmtSubRangeFull(group[0].endDate, group[group.length - 1].endDate),
  }
}
