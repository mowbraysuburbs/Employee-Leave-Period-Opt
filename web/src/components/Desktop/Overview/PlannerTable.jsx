import { aroundLabel } from '../../../utils/planner'
import { formatMultiplier } from '../../../utils/breaks'
import { fmtDayShortYear, fmtShortYear } from '../../../utils/dateFormat'
import { StartCell } from './StartCell'
import { holidaysIn, weekendsIn, freeDaysIn } from './breakCounts'

// Standard: Start · End · Holidays used · Days off · Leave · Multiplier (like the list table).
const COLUMNS = 'grid grid-cols-[22px_132px_112px_minmax(56px,1fr)_minmax(44px,1fr)_minmax(44px,1fr)_minmax(64px,1fr)] gap-1 items-center justify-items-center text-center'
// More columns: adds Around, Weekends used and Free days.
const MORE_COLUMNS = 'grid grid-cols-[22px_128px_92px_minmax(86px,2fr)_minmax(38px,1fr)_minmax(40px,1fr)_minmax(36px,1fr)_minmax(36px,1fr)_minmax(44px,1fr)_minmax(48px,1fr)] gap-1 items-center justify-items-center text-center'
const PHONE_COLUMNS = 'grid grid-cols-[22px_minmax(0,1.35fr)_minmax(0,1fr)_30px_36px] gap-1.5 items-center'

/**
 * The planner's results (Up next, School holidays): one row per break with a
 * tick box, Start, End, holidays used, days off, leave and multiplier; with
 * More columns, also what it's around, weekends used and free days. Breaks that
 * can start on another day for the same days off get a dropdown on the start date.
 *
 * Props:
 *   breaks, startOptions – usePlanner() breaks and their equal start dates
 *   ticked, onToggle     – tick boxes
 *   onSwap               – (index, startDate) => void
 *   onHover              – optional (startDate | null) => void as a row is hovered (highlights it in the calendar column)
 *   more                 – show the extra columns (desktop)
 *   phone                – Start · End · Off · Mult. with the holiday under the start
 */
export function PlannerTable({ breaks, startOptions, ticked, onToggle, onSwap, onHover, more = false, phone = false }) {
  const cols = phone ? PHONE_COLUMNS : more ? MORE_COLUMNS : COLUMNS
  const head = `${more && !phone ? 'text-[10px]' : 'text-[11px]'} font-bold text-slate-500 uppercase tracking-wide leading-tight`
  return (
    <div role="table" aria-label="Breaks in this plan" className="text-[13px]">
      <div role="row" className={`${cols} !items-end px-1.5 py-1.5 sticky top-0 z-10 bg-white border-b border-slate-200`}>
        <span />
        <span role="columnheader" className={head}>Start</span>
        <span role="columnheader" className={head}>End</span>
        {!phone && more && <span role="columnheader" className={head}>Around</span>}
        {!phone && <span role="columnheader" className={head}>{more ? 'Hols' : 'Holidays'}<br />used</span>}
        {!phone && more && <span role="columnheader" className={head}>Wknds<br />used</span>}
        {!phone && more && <span role="columnheader" className={head}>Free<br />days</span>}
        <span role="columnheader" className={head}>{phone ? 'Off' : <>Days<br />off</>}</span>
        {!phone && <span role="columnheader" className={head}>Leave<br />{more ? 'used' : 'days used'}</span>}
        <span role="columnheader" className={head}>{phone || more ? 'Mult.' : 'Multiplier'}</span>
      </div>
      {breaks.map((b, i) => {
        const around = aroundLabel(b)
        const hols = holidaysIn(b)
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
            {/* Desktop: the weekday too ("Sun 3 Jan '27"), like the list table. */}
            <span role="cell" className={`whitespace-nowrap ${phone ? 'text-[12.5px]' : ''}`}>{phone ? fmtShortYear(b.endDate) : fmtDayShortYear(b.endDate)}</span>
            {!phone && more && <span role="cell" className="min-w-0 text-orange-800 text-[12px] leading-tight [overflow-wrap:normal] hyphens-auto" lang="en">{around}</span>}
            {!phone && <span role="cell" title={hols.map(h => h.holidayName).join(', ')} className="font-bold text-orange-800">{hols.length}</span>}
            {!phone && more && <span role="cell">{weekendsIn(b)}</span>}
            {!phone && more && <span role="cell" className="text-green-800 font-semibold">+{freeDaysIn(b)}</span>}
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
