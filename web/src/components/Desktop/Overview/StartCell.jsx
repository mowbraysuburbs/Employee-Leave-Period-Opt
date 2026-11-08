import { fmtDayShortYear, fmtShortYear } from '../../../utils/dateFormat'

/**
 * The start date, or a dropdown of other start dates that give the same days
 * off (picking one swaps the break; its end date follows). Used by the plan
 * table and Custom's options table.
 *
 * Props: brk; options – equal breaks (incl. brk); onSwap(startDate); phone
 */
export function StartCell({ brk, options, onSwap, phone }) {
  // Plans can span two years, so every date carries a short year.
  const label = d => (phone ? fmtShortYear(d) : fmtDayShortYear(d))
  if (options.length < 2) return <b className={`whitespace-nowrap ${phone ? 'text-[12.5px]' : ''}`}>{label(brk.startDate)}</b>
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
