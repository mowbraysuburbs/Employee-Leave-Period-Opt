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
