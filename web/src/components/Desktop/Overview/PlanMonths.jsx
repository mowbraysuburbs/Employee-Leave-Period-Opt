import { useEffect, useRef } from 'react'
import { DAY_TYPE_COLOUR, DAY_TYPE_LEGEND } from '../../../utils/dayTypes'
import { monthsIn } from '../../../utils/planner'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function daysIn(key) {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

// One month, showing only the week rows that hold the plan's days, as joined
// rectangles in their day colours. Holidays name themselves on hover.
function Month({ monthKey, dayInfo, highlight }) {
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
          // Unticked breaks fade; the break whose table row is hovered glows (nothing else changes).
          const dim = !info.ticked
          const glow = highlight === info.start
          return (
            <span
              key={date}
              data-break-start={info.first ? info.start : undefined}
              title={info.holiday ?? undefined}
              className={[
                'relative h-[26px] flex items-center justify-center text-[11.5px] font-bold transition-opacity',
                left ? 'rounded-l-md' : '',
                right ? 'rounded-r-md' : '',
                dim ? 'opacity-30' : '',
                glow ? 'z-10 shadow-[0_0_10px_3px_rgba(14,165,233,0.85)]' : '',
                info.holiday ? 'cursor-help' : '',
              ].join(' ')}
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

// The 2×2 key: under the column heading, or pinned under the Overview's Details tab.
export function PlanKey() {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11.5px] text-slate-700">
      {DAY_TYPE_LEGEND.map(l => (
        <span key={l.type} className="flex items-center gap-1.5"><i className="w-3 h-3 rounded-[3px] shrink-0" style={{ backgroundColor: l.colour }} />{l.label}</span>
      ))}
      <span className="flex items-center gap-1.5">
        <i className="relative w-3 h-3 rounded-[3px] shrink-0 bg-slate-200"><i className="absolute top-0.5 left-0.5 w-[5px] h-[5px] rounded-full bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.3)]" /></i>
        First day of a break
      </span>
    </div>
  )
}

/**
 * Right-hand column of the Overview: the plan on a calendar, so you can see how
 * the breaks are spread. The heading and key stay put; every month with a break
 * scrolls underneath, showing only the weeks that matter. Hovering a row in the
 * results makes that break glow here and scrolls it into view.
 *
 * Props:
 *   period          – { from, to }
 *   breaks, ticked  – the plan's breaks and the ticked start dates
 *   highlight       – start date of the break to highlight (a hovered row), or null
 *   onOpen          – opens the full calendar with the ticked breaks
 *   phone           – no column frame or Open link (shown inside the results card)
 *   bare            – just the months (the Overview's Details tab, which pins the key itself)
 */
export function PlanMonths({ period, breaks, ticked, highlight, onOpen, phone = false, bare = false }) {
  const scroller = useRef(null)
  const dayInfo = new Map()
  for (const b of breaks) {
    for (const d of b.days) {
      dayInfo.set(d.date, {
        type: d.type,
        start: b.startDate,
        first: d.date === b.startDate,
        last: d.date === b.endDate,
        ticked: ticked.has(b.startDate),
        holiday: d.type === 'public_holiday' ? d.holidayName : null,
      })
    }
  }
  const breakMonths = monthsIn(period.from, period.to).filter(m => [...dayInfo.keys()].some(d => d.startsWith(m)))

  // Scroll the months (not the page) so the highlighted break's first day shows.
  useEffect(() => {
    const box = scroller.current
    const target = highlight && box?.querySelector(`[data-break-start="${highlight}"]`)
    if (!target) return
    if (bare) {
      // Inside the side panel, which does the scrolling.
      target.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      return
    }
    const top = target.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop
    box.scrollTo({ top: Math.max(0, top - 40), behavior: 'smooth' })
  }, [highlight, bare])

  if (breakMonths.length === 0) return null

  if (bare) {
    return (
      <div ref={scroller} aria-label="Plan on the calendar" className="flex flex-col gap-3">
        {breakMonths.map(m => <Month key={m} monthKey={m} dayInfo={dayInfo} highlight={highlight} />)}
      </div>
    )
  }

  return (
    <aside
      aria-label="Plan on the calendar"
      className={phone ? 'flex flex-col gap-3' : 'flex-[0_0_300px] min-w-0 max-w-full max-h-[600px] lg:max-h-none lg:h-full bg-white rounded-[20px] shadow-sm flex flex-col overflow-hidden'}
    >
      <div className={`flex flex-col gap-2 ${phone ? '' : 'px-3.5 pt-3.5 pb-2.5 border-b border-slate-100'}`}>
        {!phone && (
          <div className="flex items-center justify-between gap-2">
            <b className="text-sm">On the calendar</b>
            <button type="button" onClick={onOpen} className="text-[12.5px] font-bold text-sky-700">Open in calendar →</button>
          </div>
        )}
        <PlanKey />
        {!phone && <span className="text-[11px] text-slate-500">Hover a holiday to see its name.</span>}
      </div>
      <div ref={scroller} className={phone ? 'flex flex-col gap-3' : 'flex-1 min-h-0 overflow-y-auto px-3.5 py-3 flex flex-col gap-3'}>
        {breakMonths.map(m => <Month key={m} monthKey={m} dayInfo={dayInfo} highlight={highlight} />)}
      </div>
    </aside>
  )
}
