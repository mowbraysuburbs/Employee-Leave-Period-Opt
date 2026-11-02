import { DAY_TYPE_COLOUR, DAY_TYPE_LEGEND } from '../../../utils/dayTypes'
import { monthsIn, monthLabel } from '../../../utils/planner'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function daysIn(key) {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

// One month with the plan's days as joined rectangles in their day colours.
function Month({ monthKey, dayInfo }) {
  const [y, m] = monthKey.split('-').map(Number)
  const lead = new Date(y, m - 1, 1).getDay()
  const count = daysIn(monthKey)
  return (
    <section aria-label={`${MONTH_NAMES[m - 1]} ${y}`} className="flex flex-col gap-1.5">
      <b className="text-[13px]">{MONTH_NAMES[m - 1]} {y}</b>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((w, i) => <span key={i} className="text-[9.5px] font-bold text-slate-500">{w}</span>)}
        {Array.from({ length: lead }, (_, i) => <span key={`b${i}`} />)}
        {Array.from({ length: count }, (_, i) => {
          const date = `${monthKey}-${String(i + 1).padStart(2, '0')}`
          const info = dayInfo.get(date)
          if (!info) return <span key={date} className="h-[26px] flex items-center justify-center text-[11.5px] text-slate-400">{i + 1}</span>
          const weekday = (lead + i) % 7
          const left = info.first || weekday === 0 || i === 0
          const right = info.last || weekday === 6 || i === count - 1
          return (
            <span
              key={date}
              className={`relative h-[26px] flex items-center justify-center text-[11.5px] font-bold ${left ? 'rounded-l-md' : ''} ${right ? 'rounded-r-md' : ''} ${info.ticked ? '' : 'opacity-35'}`}
              style={{ backgroundColor: DAY_TYPE_COLOUR[info.type], color: info.type === 'weekend' ? '#ffffff' : '#0f172a' }}
            >
              {i + 1}
              {info.first && <i aria-hidden="true" className="absolute top-0.5 left-0.5 w-[5px] h-[5px] rounded-full bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.3)]" />}
            </span>
          )
        })}
      </div>
    </section>
  )
}

/**
 * Right-hand column of the Overview: the plan on a calendar, two months at a
 * time, so you can see how the breaks are spread. A month strip on top marks
 * the months with a break; tap one (or use ‹ ›) to move.
 *
 * Props:
 *   period            – { from, to }
 *   breaks, ticked    – the plan's breaks and the ticked start dates
 *   month, onMonth    – the first month shown ('YYYY-MM' or null for the first break's), setter
 *   phone             – no header or legend (used inside the results card)
 */
export function PlanMonths({ period, breaks, ticked, month, onMonth, phone = false }) {
  const months = monthsIn(period.from, period.to)
  const dayInfo = new Map()
  for (const b of breaks) {
    for (const d of b.days) dayInfo.set(d.date, { type: d.type, first: d.date === b.startDate, last: d.date === b.endDate, ticked: ticked.has(b.startDate) })
  }
  const withBreak = new Set([...dayInfo.keys()].map(d => d.slice(0, 7)))
  const firstBreak = months.find(m => withBreak.has(m)) ?? months[0]
  // Two months at a time; the second can't run past the period.
  let index = months.indexOf(months.includes(month) ? month : firstBreak)
  index = Math.max(0, Math.min(index, months.length - 2))
  const shown = months.slice(index, index + 2)
  const twoYears = months[0].slice(0, 4) !== months.at(-1).slice(0, 4)
  const arrow = 'w-7 h-7 rounded-full flex items-center justify-center font-extrabold disabled:bg-slate-100 disabled:text-slate-300'

  return (
    <aside aria-label="Plan on the calendar" className={phone ? 'flex flex-col gap-3' : 'flex-[0_0_300px] max-w-full bg-white rounded-[20px] shadow-sm p-3.5 flex flex-col gap-3'}>
      <div className="flex items-center justify-between">
        {!phone && <b className="text-sm">On the calendar</b>}
        <span className="ml-auto flex gap-1">
          <button type="button" aria-label="Earlier months" disabled={index === 0} onClick={() => onMonth(months[index - 1])} className={`${arrow} bg-slate-900 text-white`}>‹</button>
          <button type="button" aria-label="Later months" disabled={index + 2 >= months.length} onClick={() => onMonth(months[index + 1])} className={`${arrow} bg-slate-900 text-white`}>›</button>
        </span>
      </div>
      <div className="flex gap-0.5 overflow-x-auto [scrollbar-width:none]">
        {months.map(m => {
          const on = shown.includes(m)
          return (
            <button
              key={m}
              type="button"
              onClick={() => onMonth(m)}
              aria-label={`${monthLabel(m, true)}${withBreak.has(m) ? ', has a break' : ''}`}
              className={`shrink-0 min-w-[36px] px-1 py-1 rounded-lg flex flex-col items-center gap-0.5 text-[10px] font-bold ${on ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
            >
              {monthLabel(m, twoYears && m.endsWith('-01'))}
              <i aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${withBreak.has(m) ? 'bg-sky-400' : 'border border-slate-300'}`} />
            </button>
          )
        })}
      </div>
      {shown.map(m => <Month key={m} monthKey={m} dayInfo={dayInfo} />)}
      {!phone && (
        <div className="flex flex-wrap gap-x-2.5 gap-y-1 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
          {DAY_TYPE_LEGEND.map(l => (
            <span key={l.type} className="inline-flex items-center gap-1"><i className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: l.colour }} />{l.label}</span>
          ))}
          <span>○ first day</span>
        </div>
      )}
    </aside>
  )
}
