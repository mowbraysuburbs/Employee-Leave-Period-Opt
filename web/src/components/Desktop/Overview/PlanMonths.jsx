import { DAY_TYPE_COLOUR, DAY_TYPE_LEGEND } from '../../../utils/dayTypes'
import { monthsIn, monthLabel } from '../../../utils/planner'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function daysIn(key) {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

// One month, showing only the week rows that hold the plan's days, as joined
// rectangles in their day colours.
function Month({ monthKey, dayInfo }) {
  const [y, m] = monthKey.split('-').map(Number)
  const lead = new Date(y, m - 1, 1).getDay()
  const count = daysIn(monthKey)
  const cells = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)]
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  const dateOf = n => `${monthKey}-${String(n).padStart(2, '0')}`
  const kept = weeks.filter(w => w.some(n => n && dayInfo.has(dateOf(n))))

  return (
    <section aria-label={`${MONTH_NAMES[m - 1]} ${y}`} className="flex flex-col gap-1.5">
      <b className="text-[13px]">{MONTH_NAMES[m - 1]} {y}</b>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((w, i) => <span key={i} className="text-[9.5px] font-bold text-slate-500">{w}</span>)}
        {kept.flat().map((n, i) => {
          if (!n) return <span key={`b${i}`} />
          const date = dateOf(n)
          const info = dayInfo.get(date)
          if (!info) return <span key={date} className="h-[26px] flex items-center justify-center text-[11.5px] text-slate-400">{n}</span>
          const weekday = i % 7
          const left = info.first || weekday === 0 || n === 1
          const right = info.last || weekday === 6 || n === count
          return (
            <span
              key={date}
              className={`relative h-[26px] flex items-center justify-center text-[11.5px] font-bold ${left ? 'rounded-l-md' : ''} ${right ? 'rounded-r-md' : ''} ${info.ticked ? '' : 'opacity-35'}`}
              style={{ backgroundColor: DAY_TYPE_COLOUR[info.type], color: info.type === 'weekend' ? '#ffffff' : '#0f172a' }}
            >
              {n}
              {info.first && <i aria-hidden="true" className="absolute top-0.5 left-0.5 w-[5px] h-[5px] rounded-full bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.3)]" />}
            </span>
          )
        })}
      </div>
    </section>
  )
}

/**
 * Right-hand column of the Overview: the plan on a calendar, so you can see
 * how the breaks are spread. Only months with a break are shown, two at a
 * time, and only the weeks that matter. A month strip marks where the breaks
 * fall; "Open in calendar" goes to the full calendar.
 *
 * Props:
 *   period            – { from, to }
 *   breaks, ticked    – the plan's breaks and the ticked start dates
 *   month, onMonth    – the first month shown ('YYYY-MM' or null for the first break's), setter
 *   onOpen            – opens the full calendar with the ticked breaks
 *   phone             – no header or key (used inside the results card)
 */
export function PlanMonths({ period, breaks, ticked, month, onMonth, onOpen, phone = false }) {
  const months = monthsIn(period.from, period.to)
  const dayInfo = new Map()
  for (const b of breaks) {
    for (const d of b.days) dayInfo.set(d.date, { type: d.type, first: d.date === b.startDate, last: d.date === b.endDate, ticked: ticked.has(b.startDate) })
  }
  const breakMonths = months.filter(m => [...dayInfo.keys()].some(d => d.startsWith(m)))
  if (breakMonths.length === 0) return null
  // Two break months at a time.
  let index = breakMonths.indexOf(breakMonths.includes(month) ? month : breakMonths[0])
  index = Math.max(0, Math.min(index, breakMonths.length - 2))
  const shown = breakMonths.slice(index, index + 2)
  const twoYears = months[0].slice(0, 4) !== months.at(-1).slice(0, 4)
  const arrow = 'w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-extrabold disabled:bg-slate-100 disabled:text-slate-300'

  return (
    <aside aria-label="Plan on the calendar" className={phone ? 'flex flex-col gap-3' : 'flex-[0_0_300px] min-w-0 max-w-full bg-white rounded-[20px] shadow-sm p-3.5 flex flex-col gap-3'}>
      {!phone && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <b className="text-sm">On the calendar</b>
            <button type="button" onClick={onOpen} className="text-[12.5px] font-bold text-sky-700">Open in calendar →</button>
          </div>
          <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-[11px] text-slate-600">
            {DAY_TYPE_LEGEND.map(l => (
              <span key={l.type} className="inline-flex items-center gap-1"><i className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: l.colour }} />{l.label}</span>
            ))}
            <span>○ first day</span>
          </div>
        </div>
      )}
      <div className="flex items-center gap-1">
        <button type="button" aria-label="Earlier breaks" disabled={index === 0} onClick={() => onMonth(breakMonths[index - 1])} className={`shrink-0 ${arrow}`}>‹</button>
        <div className="flex-1 min-w-0 flex gap-0.5 overflow-x-auto [scrollbar-width:none]">
          {months.map(m => {
            const has = breakMonths.includes(m)
            const on = shown.includes(m)
            return (
              <button
                key={m}
                type="button"
                disabled={!has}
                onClick={() => onMonth(m)}
                aria-label={`${monthLabel(m, true)}${has ? ', has a break' : ''}`}
                className={`shrink-0 min-w-[30px] px-0.5 py-1 rounded-lg flex flex-col items-center gap-0.5 text-[10px] font-bold ${on ? 'bg-slate-900 text-white' : has ? 'text-slate-700' : 'text-slate-400'}`}
              >
                {monthLabel(m, twoYears && m.endsWith('-01'))}
                <i aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${has ? 'bg-sky-400' : 'border border-slate-300'}`} />
              </button>
            )
          })}
        </div>
        <button type="button" aria-label="Later breaks" disabled={index + 2 >= breakMonths.length} onClick={() => onMonth(breakMonths[index + 1])} className={`shrink-0 ${arrow}`}>›</button>
      </div>
      {shown.map(m => <Month key={m} monthKey={m} dayInfo={dayInfo} />)}
    </aside>
  )
}
