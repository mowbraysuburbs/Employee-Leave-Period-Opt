import { useState } from 'react'
import { formatMultiplier } from '../../../utils/breaks'
import { fmtDayShortYear, fmtShortRange, fmtShortYear } from '../../../utils/dateFormat'
import { StartCell } from './StartCell'

// Start and End are as wide as their dates; the number columns share what's
// left equally (so they spread out on wide screens). Everything is centred.
const COLUMNS = 'grid grid-cols-[22px_146px_112px_minmax(60px,1fr)_minmax(44px,1fr)_minmax(46px,1fr)_minmax(86px,1fr)] gap-1 items-center justify-items-center text-center'
const PHONE_COLUMNS = 'grid grid-cols-[20px_96px_70px_repeat(3,minmax(30px,1fr))] gap-1 items-center justify-items-center text-center'

// Rank 1, 2, 3… where equal options share a number.
function ranks(options, value) {
  let rank = 0
  return options.map((o, i) => (i === 0 || value(o) !== value(options[i - 1]) ? ++rank : rank))
}

// Why an option can't be ticked (shown under its start date), or ''.
function blockedText(blocker) {
  if (blocker?.overlap) return `Already in your ${fmtShortRange(blocker.overlap.startDate, blocker.overlap.endDate)} break`
  if (blocker?.leave) return 'Not enough leave left'
  return ''
}

// The public holidays inside a break (their names show on hover).
const holidaysIn = brk => brk.days.filter(d => d.type === 'public_holiday')

// Columns you can sort by: click a heading to sort, click again to flip.
// 'rank' (best first) is the starting order and has no heading.
const SORTS = {
  rank: { label: 'Best first', value: o => o.rank, first: 'asc' },
  start: { label: 'Start', value: o => o.startDate, first: 'asc' },
  hols: { label: 'Holidays used', phone: 'Hols used', value: o => holidaysIn(o).length, first: 'desc' },
  off: { label: 'Days\noff', value: o => o.daysOff, first: 'desc' },
  leave: { label: 'Leave\ndays', value: o => o.leaveDays, first: 'asc' },
  mult: { label: 'Multiplier', phone: 'Mult.', value: o => o.multiplier, first: 'desc' },
}

// A column heading that sorts the table (aria-sort tells screen readers the order).
function SortHeading({ id, sort, onSort, phone, className }) {
  const on = sort.by === id
  const { label, phone: short } = SORTS[id]
  return (
    <span role="columnheader" aria-sort={on ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'} className={className}>
      <button type="button" onClick={() => onSort(id)} className={`uppercase tracking-wide text-center leading-tight ${on ? 'text-slate-900' : 'hover:text-slate-700'}`}>
        {/* A \n in the label is a line break (Days / off); the arrow stays with the last word. */}
        {(phone && short ? short : label).split('\n').map((part, i) => <span key={part}>{i > 0 && <br />}{part}</span>)}
        {on ? (sort.dir === 'asc' ? '\u00a0▲' : '\u00a0▼') : ''}
      </button>
    </span>
  )
}

/**
 * Custom dates' options, best first, nothing picked until you pick it:
 * Start and End (with weekdays), public holidays used, days off, leave and
 * multiplier. One long break: radio buttons (pick one). Holiday breaks: tick boxes; options
 * that overlap a pick, or need more leave than is left, are greyed with the
 * reason under the start date.
 * Click a column heading to sort by it. A start date with a dropdown can
 * move to another day for the same days off (the end follows).
 *
 * Props: planner – usePlanner() result; onHover – optional (startDate | null) => void; phone
 */
export function CustomOptionsTable({ planner, onHover, phone = false }) {
  const { options, aim } = planner
  const long = aim === 'long'
  const cols = phone ? PHONE_COLUMNS : COLUMNS
  const head = 'text-[11px] font-bold text-slate-500 uppercase tracking-wide'
  const [sort, setSort] = useState({ by: 'rank', dir: 'asc' })
  const onSort = id => setSort(prev => (prev.by === id
    ? { by: id, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
    : { by: id, dir: SORTS[id].first }))
  // Rank once (best first), then show the rows in the chosen order; ties keep the rank order.
  const rank = ranks(options, long ? o => o.daysOff : o => o.multiplier)
  const value = SORTS[sort.by].value
  const rows = options
    .map((o, i) => ({ o, rank: rank[i] }))
    .sort((a, b) => {
      const x = value({ ...a.o, rank: a.rank })
      const y = value({ ...b.o, rank: b.rank })
      const order = x < y ? -1 : x > y ? 1 : 0
      return (sort.dir === 'asc' ? order : -order) || a.rank - b.rank
    })

  return (
    <div role="table" aria-label="Options to pick from" className="text-[13px]">
      <div role="row" className={`${cols} !items-start px-1.5 py-1.5 sticky top-0 z-10 bg-white border-b border-slate-200`}>
        <span />
        <SortHeading id="start" sort={sort} onSort={onSort} className={head} />
        <span role="columnheader" className={head}>End</span>
        <SortHeading id="hols" sort={sort} onSort={onSort} phone={phone} className={head} />
        <SortHeading id="off" sort={sort} onSort={onSort} phone={phone} className={head} />
        {!phone && <SortHeading id="leave" sort={sort} onSort={onSort} className={head} />}
        <SortHeading id="mult" sort={sort} onSort={onSort} phone={phone} className={head} />
      </div>
      {rows.map(({ o }) => {
        const picked = planner.isPicked(o)
        const blocker = planner.blockerFor(o)
        const why = blockedText(blocker)
        const hols = holidaysIn(o)
        const date = d => (phone ? fmtShortYear(d) : fmtDayShortYear(d))
        const name = `${fmtDayShortYear(o.startDate)} to ${fmtDayShortYear(o.endDate)}, ${o.daysOff} days off`
        return (
            <div
              key={`${o.startDate}-${o.leaveDays}`}
              role="row"
              onMouseEnter={() => onHover?.(o.startDate)}
              onMouseLeave={() => onHover?.(null)}
              className={`${cols} px-1.5 py-2 border-t border-slate-100 ${picked ? 'bg-sky-50' : onHover ? 'hover:bg-slate-50' : ''} ${blocker ? 'opacity-50' : ''}`}
            >
              <input
                type={long ? 'radio' : 'checkbox'}
                name={long ? 'custom-long-break' : undefined}
                aria-label={`Pick ${name}`}
                checked={picked}
                disabled={!!blocker}
                onChange={() => planner.togglePick(o)}
                // A picked radio can be clicked again to clear it.
                onClick={() => long && picked && planner.togglePick(o)}
                className="w-4 h-4 accent-sky-700"
              />
              <span role="cell" className="min-w-0">
                <StartCell brk={o} options={planner.startChoicesFor(o)} onSwap={d => planner.swapOptionStart(o, d)} phone={phone} />
                {why && <span className={`block leading-tight text-slate-600 ${phone ? 'text-[10.5px]' : 'text-[11.5px]'}`}>{why}</span>}
              </span>
              <span role="cell" className={`whitespace-nowrap ${phone ? 'text-[12px]' : ''}`}>{date(o.endDate)}</span>
              <span role="cell" title={hols.map(h => h.holidayName).join(', ')} className="font-bold text-orange-800">{hols.length}</span>
              <b role="cell">{o.daysOff}</b>
              {!phone && <span role="cell">{o.leaveDays}</span>}
              <span role="cell" className="font-bold text-amber-800">{formatMultiplier(o.multiplier)}</span>
            </div>
        )
      })}
      {/* Desktop shows this note under the table instead. */}
      {phone && options.some(o => o.starts.length > 1) && (
        <p className="m-0 mt-1.5 pt-2 px-1.5 border-t border-slate-100 text-[11.5px] text-slate-600">
          <b className="text-sky-700">▾</b> Same days off from another start date. Tap to swap.
        </p>
      )}
    </div>
  )
}
