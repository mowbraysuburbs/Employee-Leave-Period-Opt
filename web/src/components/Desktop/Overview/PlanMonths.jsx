import { useEffect, useRef } from 'react'
import { DAY_TYPE_COLOUR, DAY_TYPE_LEGEND } from '../../../utils/dayTypes'
import { monthsIn } from '../../../utils/planner'
import { addDays } from '../../../utils/dateFormat'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const SHORT_MONTHS = MONTH_NAMES.map(n => n.slice(0, 3))

function daysIn(key) {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

// "March 2027", "March – April 2027", or "December 2026 – January 2027".
function groupTitle(months) {
  const [fy, fm] = months[0].split('-').map(Number)
  const [ly, lm] = months.at(-1).split('-').map(Number)
  if (months.length === 1) return `${MONTH_NAMES[fm - 1]} ${fy}`
  return fy === ly ? `${MONTH_NAMES[fm - 1]} – ${MONTH_NAMES[lm - 1]} ${ly}` : `${MONTH_NAMES[fm - 1]} ${fy} – ${MONTH_NAMES[lm - 1]} ${ly}`
}

// Months a break runs across are joined: a month joins the one before when
// some break has days in both.
function groupMonths(months, breaks) {
  const groups = []
  for (const m of months) {
    const prev = groups.at(-1)?.at(-1)
    const joined = prev && breaks.some(b => b.startDate.slice(0, 7) <= prev && b.endDate.slice(0, 7) >= m)
    if (joined) groups.at(-1).push(m)
    else groups.push([m])
  }
  return groups
}

// One month, or months joined into one strip, showing only the week rows that
// hold the plan's days, as joined rectangles in their day colours. In a joined
// strip the 1st of the next month shows its short name under the number (and a
// dark line before it when a break runs into it). Holidays name themselves on hover.
function Month({ months, dayInfo, highlight }) {
  const firstDay = `${months[0]}-01`
  const lastDay = `${months.at(-1)}-${String(daysIn(months.at(-1))).padStart(2, '0')}`
  const cells = []
  for (let date = addDays(firstDay, -new Date(firstDay + 'T00:00:00').getDay()); ; date = addDays(date, 1)) {
    cells.push(date >= firstDay && date <= lastDay ? date : null)
    if (date >= lastDay && cells.length % 7 === 0) break
  }
  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  const kept = weeks.filter(w => w.some(d => d && dayInfo.has(d)))

  return (
    <section aria-label={groupTitle(months)} className="flex flex-col gap-1.5">
      <b className="text-[13px]">{groupTitle(months)}</b>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAYS.map((w, i) => <span key={i} className="text-[9.5px] font-bold text-slate-500">{w}</span>)}
        {kept.flat().map((date, i) => {
          if (!date) return <span key={`b${i}`} />
          const n = Number(date.slice(8))
          // The 1st of a month joined onto the one before: "1" with "Apr" under it.
          const newMonth = n === 1 && date !== firstDay
          const label = newMonth && <span className="block text-[8px] leading-none font-extrabold">{SHORT_MONTHS[Number(date.slice(5, 7)) - 1]}</span>
          const info = dayInfo.get(date)
          if (!info) {
            return <span key={date} className="h-[26px] flex flex-col items-center justify-center text-[11.5px] leading-none text-slate-400">{n}{label}</span>
          }
          const weekday = i % 7
          const left = info.first || weekday === 0 || date === firstDay
          const right = info.last || weekday === 6 || date === lastDay
          // Unticked breaks fade; the break whose table row is hovered glows (nothing else changes).
          const dim = !info.ticked
          const glow = highlight === info.start
          return (
            <span
              key={date}
              data-break-start={info.first ? info.start : undefined}
              title={info.holiday ?? undefined}
              className={[
                'relative h-[26px] flex flex-col items-center justify-center text-[11.5px] leading-none font-bold transition-opacity',
                left ? 'rounded-l-md' : '',
                right ? 'rounded-r-md' : '',
                dim ? 'opacity-30' : '',
                glow ? 'z-10 shadow-[0_0_10px_3px_rgba(14,165,233,0.85)]' : '',
                info.holiday ? 'cursor-help' : '',
              ].join(' ')}
              style={{
                backgroundColor: DAY_TYPE_COLOUR[info.type],
                color: info.type === 'weekend' ? '#ffffff' : '#0f172a',
                boxShadow: newMonth && !info.first ? 'inset 2px 0 0 #0f172a' : undefined,
              }}
            >
              {n}
              {label}
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
 * scrolls underneath, showing only the weeks that matter (months a break runs
 * across are joined into one strip). Hovering a row in the
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
  const groups = groupMonths(breakMonths, breaks)

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
        {groups.map(g => <Month key={g[0]} months={g} dayInfo={dayInfo} highlight={highlight} />)}
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
        {groups.map(g => <Month key={g[0]} months={g} dayInfo={dayInfo} highlight={highlight} />)}
      </div>
    </aside>
  )
}
