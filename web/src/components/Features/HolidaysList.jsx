import { getPublicHolidaysForYear } from '../../data/publicHolidays'
import { SCHOOL_HOLIDAYS_2025, SCHOOL_HOLIDAYS_2026, SCHOOL_HOLIDAYS_2027, SCHOOL_HOLIDAYS_2028 } from '../../data/schoolHolidays'

const SCHOOL_BY_YEAR = {
  2025: SCHOOL_HOLIDAYS_2025,
  2026: SCHOOL_HOLIDAYS_2026,
  2027: SCHOOL_HOLIDAYS_2027,
  2028: SCHOOL_HOLIDAYS_2028,
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-ZA', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

function monthKey(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`
}

/**
 * Props:
 *   months             – [{ year, month }] array (same range as CalendarHeatmap)
 *   showSchoolHolidays – bool
 *   provinceCode       – string
 */
export function HolidaysList({ months, showSchoolHolidays, provinceCode }) {
  // Group public holidays by "YYYY-MM" key
  const byMonth = {}
  const seenYears = new Set()

  for (const { year, month } of months) {
    seenYears.add(year)
    const key = monthKey(year, month)
    const holidays = getPublicHolidaysForYear(year).filter(
      (h) => h.date.slice(0, 7) === key
    )
    if (holidays.length > 0) byMonth[key] = holidays
  }

  // Collect school break periods that overlap any visible month
  const schoolBreaks = []
  if (showSchoolHolidays) {
    const firstMonth = months[0]
    const lastMonth = months[months.length - 1]
    const rangeStart = `${firstMonth.year}-${String(firstMonth.month).padStart(2, '0')}-01`
    const rangeEnd = `${lastMonth.year}-${String(lastMonth.month).padStart(2, '0')}-31`

    for (const year of seenYears) {
      const data = (SCHOOL_BY_YEAR[year] ?? SCHOOL_HOLIDAYS_2026)[provinceCode]
      if (!data) continue
      for (const b of data.breaks) {
        // Include break if it overlaps the visible range at all
        if (b.end >= rangeStart && b.start <= rangeEnd) {
          schoolBreaks.push({ ...b, year })
        }
      }
    }
    // Sort by start date
    schoolBreaks.sort((a, b) => a.start.localeCompare(b.start))
    // Deduplicate breaks that appear in multiple years with the same dates
    const seen = new Set()
    for (let i = schoolBreaks.length - 1; i >= 0; i--) {
      const key = schoolBreaks[i].start
      if (seen.has(key)) schoolBreaks.splice(i, 1)
      else seen.add(key)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Public holidays
      </h2>

      {months.map(({ year, month }) => {
        const key = monthKey(year, month)
        const holidays = byMonth[key]
        if (!holidays) return null

        return (
          <div key={key}>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              {MONTH_NAMES[month - 1]} {year}
            </h3>
            <div className="flex flex-col gap-1">
              {holidays.map((h) => (
                <div
                  key={h.date}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800"
                >
                  <span className="text-xs text-slate-500 dark:text-slate-400 w-24 flex-shrink-0">
                    {formatDate(h.date)}
                  </span>
                  <span className="text-sm text-slate-800 dark:text-slate-200">{h.name}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {showSchoolHolidays && schoolBreaks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-2">
            School holidays — {(SCHOOL_BY_YEAR[months[0]?.year] ?? SCHOOL_HOLIDAYS_2026)[provinceCode]?.label}
          </h2>
          <div className="flex flex-col gap-2 mt-3">
            {schoolBreaks.map((b) => (
              <div
                key={b.start}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-l-2 border-sky-500"
              >
                <div className="flex flex-col flex-1">
                  <span className="text-sm text-slate-800 dark:text-slate-200">{b.label}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(b.start)} – {formatDate(b.end)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
