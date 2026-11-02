import { getSchoolBreaksForYear, PROVINCES } from '../data/schoolHolidays'
import { addDays } from './dateFormat'

// School-holiday helpers shared by the Overview planner and the calendar's school filter.

const maxDate = (a, b) => (a > b ? a : b)

export function provinceLabel(provinceCode) {
  return PROVINCES.find(p => p.code === provinceCode)?.label ?? provinceCode
}

/**
 * A province's school holidays that touch [from, to], as
 * [{ start, end, label }]. Summer breaks split at New Year are joined back
 * into one.
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
