import { aroundLabel } from '../../../utils/planner'
import { formatMultiplier } from '../../../utils/breaks'
import { fmtDayShortYear, fmtShortYear } from '../../../utils/dateFormat'

const COLUMNS = 'grid grid-cols-[22px_132px_78px_minmax(0,1fr)_52px_38px_40px] gap-2 items-center'
const PHONE_COLUMNS = 'grid grid-cols-[22px_minmax(0,1.35fr)_minmax(0,1fr)_30px_36px] gap-1.5 items-center'

// The start date, or a dropdown of other start dates that give the same days off.
function StartCell({ brk, options, onSwap, phone }) {
  // Plans can span two years, so every date carries a short year.
  const label = d => (phone ? fmtShortYear(d) : fmtDayShortYear(d))
  if (options.length < 2) return <b className={phone ? 'text-[12.5px]' : ''}>{label(brk.startDate)}</b>
  return (
    <select
      aria-label={`Start date for the break ending ${fmtDayShortYear(brk.endDate)}`}
      value={brk.startDate}
      onChange={e => onSwap(e.target.value)}
      className={`max-w-full border border-slate-300 rounded-lg bg-white font-bold text-sky-800 ${phone ? 'h-7 px-1 text-[12.5px]' : 'h-8 px-2 text-[13px]'}`}
    >
      {options.map(o => <option key={o.startDate} value={o.startDate}>{label(o.startDate)}</option>)}
    </select>
  )
}

/**
 * The planner's results: one row per break with a tick box, Start, End, what
 * it's built around, days off, leave and multiplier. Breaks that can start on
 * another day for the same days off get a dropdown on the start date.
 *
 * Props:
 *   breaks, startOptions – usePlanner() breaks and their equal start dates
 *   ticked, onToggle     – tick boxes
 *   onSwap               – (index, startDate) => void
 *   onHover              – optional (startDate | null) => void as a row is hovered (highlights it in the calendar column)
 *   phone                – Start · End · Off · Mult. with the holiday under the start
 */
export function PlannerTable({ breaks, startOptions, ticked, onToggle, onSwap, onHover, phone = false }) {
  const cols = phone ? PHONE_COLUMNS : COLUMNS
  const head = 'text-[11px] font-bold text-slate-500 uppercase tracking-wide'
  return (
    <div role="table" aria-label="Breaks in this plan" className="text-[13px]">
      <div role="row" className={`${cols} px-1.5 py-1.5 sticky top-0 z-10 bg-white border-b border-slate-200`}>
        <span />
        <span role="columnheader" className={head}>Start</span>
        <span role="columnheader" className={head}>End</span>
        {!phone && <span role="columnheader" className={head}>Around</span>}
        <span role="columnheader" className={head}>{phone ? 'Off' : 'Days off'}</span>
        {!phone && <span role="columnheader" className={head}>Leave</span>}
        <span role="columnheader" className={head}>Mult.</span>
      </div>
      {breaks.map((b, i) => {
        const around = aroundLabel(b)
        return (
          <div
            key={`${b.startDate}-${i}`}
            role="row"
            // Hovering a row (or tabbing into it) highlights its break in the calendar column.
            onMouseEnter={() => onHover?.(b.startDate)}
            onMouseLeave={() => onHover?.(null)}
            onFocus={() => onHover?.(b.startDate)}
            className={`${cols} px-1.5 py-2 border-t border-slate-100 ${onHover ? 'hover:bg-slate-50' : ''} ${ticked.has(b.startDate) ? '' : 'opacity-50'}`}
          >
            <input type="checkbox" aria-label={`Include ${fmtDayShortYear(b.startDate)}`} checked={ticked.has(b.startDate)} onChange={() => onToggle(b.startDate)} className="w-4 h-4 accent-sky-700" />
            <span role="cell" className="min-w-0">
              <StartCell brk={b} options={startOptions[i] ?? []} onSwap={d => onSwap(i, d)} phone={phone} />
              {phone && around && <span className="block truncate text-[10.5px] text-orange-800">{around}</span>}
            </span>
            <span role="cell" className={phone ? 'text-[12.5px]' : ''}>{fmtShortYear(b.endDate)}</span>
            {!phone && <span role="cell" className="min-w-0 text-orange-800 leading-tight [overflow-wrap:normal] hyphens-auto" lang="en">{around}</span>}
            <b role="cell">{b.daysOff}</b>
            {!phone && <span role="cell">{b.leaveDays}</span>}
            <span role="cell" className="font-bold text-amber-800">{formatMultiplier(b.multiplier)}</span>
          </div>
        )
      })}
      {/* Desktop shows this note above the table instead. */}
      {phone && startOptions.some(o => o.length > 1) && (
        <p className="m-0 mt-1.5 pt-2 px-1.5 border-t border-slate-100 text-[11.5px] text-slate-600">
          <b className="text-sky-700">▾</b> Same days off from another start date. Tap to swap.
        </p>
      )}
    </div>
  )
}
