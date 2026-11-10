import { useState } from 'react'
import { OptionRow } from './OptionRow'
import { holidaysIn, weekendsIn, freeDaysIn } from './breakCounts'

// Start and End are as wide as their dates; the number columns share what's
// left equally (so they spread out on wide screens). Everything is centred.
const COLUMNS = 'grid grid-cols-[22px_146px_112px_minmax(60px,1fr)_minmax(44px,1fr)_minmax(46px,1fr)_minmax(86px,1fr)] gap-1 items-center justify-items-center text-center'
// More columns: adds Around, Weekends used and Free days.
const MORE_COLUMNS = 'grid grid-cols-[22px_128px_92px_minmax(86px,2fr)_minmax(38px,1fr)_minmax(40px,1fr)_minmax(36px,1fr)_minmax(36px,1fr)_minmax(44px,1fr)_minmax(48px,1fr)] gap-1 items-center justify-items-center text-center'
const PHONE_COLUMNS = 'grid grid-cols-[20px_96px_70px_repeat(3,minmax(30px,1fr))] gap-1 items-center justify-items-center text-center'

// Rank 1, 2, 3… where equal options share a number.
function ranks(options, value) {
  let rank = 0
  return options.map((o, i) => (i === 0 || value(o) !== value(options[i - 1]) ? ++rank : rank))
}

// The two sections: their heading and how their rows rank (best first).
const SECTIONS = {
  // Each section has its own colour (heading + a stripe down its rows) so the two read apart.
  long: { title: 'One long break', sub: leave => `all ${leave} leave days in one go`, rankBy: o => o.daysOff, head: 'bg-sky-50 text-sky-900 hover:bg-sky-100 border-sky-200' },
  holiday: { title: 'Holiday breaks', sub: () => 'tick as many as fit', rankBy: o => o.multiplier, head: 'bg-violet-50 text-violet-900 hover:bg-violet-100 border-violet-200' },
}

// What a small (collapsed) section says instead of its rows: how many breaks and the best of them.
function summary(id, rows) {
  const n = rows.length
  const count = `${n} break${n === 1 ? '' : 's'}`
  if (id === 'long') return `${count} · up to ${Math.max(...rows.map(r => r.o.daysOff))} days off`
  const leave = rows.map(r => r.o.leaveDays)
  const lo = Math.min(...leave)
  const hi = Math.max(...leave)
  return `${count} · ${lo === hi ? lo : `${lo}–${hi}`} leave day${hi === 1 ? '' : 's'} each`
}

// Columns you can sort by: click a heading to sort, click again to flip.
// 'rank' (best first) is the starting order and has no heading.
const SORTS = {
  rank: { label: 'Best first', value: o => o.rank, first: 'asc' },
  start: { label: 'Start', value: o => o.startDate, first: 'asc' },
  hols: { label: 'Holidays\nused', compact: 'Hols\nused', phone: 'Hols used', value: o => holidaysIn(o).length, first: 'desc' },
  wknd: { label: 'Wknds\nused', value: o => weekendsIn(o), first: 'desc' },
  free: { label: 'Free\ndays', value: o => freeDaysIn(o), first: 'desc' },
  off: { label: 'Days\noff', value: o => o.daysOff, first: 'desc' },
  leave: { label: 'Leave\ndays used', compact: 'Leave\nused', value: o => o.leaveDays, first: 'asc' },
  mult: { label: 'Multiplier', phone: 'Mult.', value: o => o.multiplier, first: 'desc' },
}

// A column heading that sorts the table (aria-sort tells screen readers the order).
function SortHeading({ id, sort, onSort, phone, compact = false, className }) {
  const on = sort.by === id
  const { label: full, phone: short, compact: tight } = SORTS[id]
  const label = compact && tight ? tight : full
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
 * The options of a list period (Custom, Easter, Christmas), nothing ticked until
 * you tick it, in two sections (planner.sections):
 *   One long break – all your leave in one go, most days off first
 *   Holiday breaks – joins first, then each holiday's own break, best value first
 * Click a section's heading to make it small (just the heading) or big again.
 * Every row is a tick box; rows that clash with your ticks are greyed, with one
 * note under the table. Click a column heading to sort (within each section).
 * A start date with a dropdown can move to another day for the same days off.
 *
 * Props: planner – usePlanner() result; onHover – optional (break | null) => void;
 *   more – show Around, Weekends used and Free days (desktop); phone
 */
export function CustomOptionsTable({ planner, onHover, more = false, phone = false }) {
  const { options } = planner
  const extra = more && !phone
  const cols = phone ? PHONE_COLUMNS : extra ? MORE_COLUMNS : COLUMNS
  const head = `${extra ? 'text-[10px]' : 'text-[11px]'} font-bold text-slate-500 uppercase tracking-wide`
  const [sort, setSort] = useState({ by: 'rank', dir: 'asc' })
  // Sections you've made small: 'long' / 'holiday' → true.
  const [small, setSmall] = useState({})
  const onSort = id => setSort(prev => (prev.by === id
    ? { by: id, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
    : { by: id, dir: SORTS[id].first }))
  const value = SORTS[sort.by].value
  // Each section's rows: ranked once (best first), then in the chosen order; ties keep the rank.
  const rowsOf = id => {
    const list = options.filter(o => o.section === id)
    const rank = ranks(list, SECTIONS[id].rankBy)
    return list
      .map((o, i) => ({ o, rank: rank[i] }))
      .sort((a, b) => {
        const x = value({ ...a.o, rank: a.rank })
        const y = value({ ...b.o, rank: b.rank })
        const order = x < y ? -1 : x > y ? 1 : 0
        return (sort.dir === 'asc' ? order : -order) || a.rank - b.rank
      })
  }
  const shown = ['long', 'holiday'].map(id => ({ id, rows: rowsOf(id) })).filter(s => s.rows.length)
  const both = shown.length > 1

  return (
    <div role="table" aria-label="Options to pick from" className="text-[13px]">
      <div role="row" className={`${cols} !items-start px-1.5 py-1.5 sticky top-0 z-10 bg-white border-b border-slate-200`}>
        <span />
        <SortHeading id="start" sort={sort} onSort={onSort} className={head} />
        <span role="columnheader" className={head}>End</span>
        {extra && <span role="columnheader" className={head}>Around</span>}
        <SortHeading id="hols" sort={sort} onSort={onSort} phone={phone} compact={extra} className={head} />
        {extra && <SortHeading id="wknd" sort={sort} onSort={onSort} className={head} />}
        {extra && <SortHeading id="free" sort={sort} onSort={onSort} className={head} />}
        <SortHeading id="off" sort={sort} onSort={onSort} phone={phone} className={head} />
        {!phone && <SortHeading id="leave" sort={sort} onSort={onSort} compact={extra} className={head} />}
        <SortHeading id="mult" sort={sort} onSort={onSort} phone={phone || extra} className={head} />
      </div>
      {shown.map(({ id, rows }) => (
        <div key={id} role="rowgroup" aria-label={SECTIONS[id].title}>
          {/* With both sections, each has a heading that makes it small or big. */}
          {both && (
            <div role="row">
              <button
                type="button"
                aria-expanded={!small[id]}
                onClick={() => setSmall(prev => ({ ...prev, [id]: !prev[id] }))}
                className={`w-full flex items-center gap-2 px-2 py-2 border-t text-left text-[11.5px] font-extrabold uppercase tracking-wide ${SECTIONS[id].head}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`shrink-0 transition-transform ${small[id] ? '-rotate-90' : ''}`}><polyline points="6 9 12 15 18 9" /></svg>
                {SECTIONS[id].title}
                <span className="normal-case font-medium tracking-normal opacity-75">· {small[id] ? summary(id, rows) : SECTIONS[id].sub(planner.leave)}</span>
              </button>
            </div>
          )}
          {!small[id] && rows.map(({ o }) => (
            <OptionRow key={`${o.startDate}-${o.leaveDays}`} planner={planner} option={o} cols={cols} onHover={onHover} phone={phone} more={extra} stripe={both ? id : null} />
          ))}
        </div>
      ))}
      {/* Greyed rows: one note for all of them, only when there are some. */}
      {options.some(o => planner.blockerFor(o)) && (
        <p className={`m-0 mt-1.5 pt-2 px-1.5 border-t border-slate-100 text-slate-600 ${phone ? 'text-[11.5px]' : 'text-[12px]'}`}>
          <b className="text-slate-500">Greyed:</b> overlaps a break you ticked, or not enough leave left. Untick a break to pick it.
        </p>
      )}
      {/* Desktop shows this note under the table instead. */}
      {phone && options.some(o => o.starts.length > 1) && (
        <p className="m-0 mt-1.5 pt-2 px-1.5 border-t border-slate-100 text-[11.5px] text-slate-600">
          <b className="text-sky-700">▾</b> Same days off from another start date. Tap to swap.
        </p>
      )}
    </div>
  )
}
