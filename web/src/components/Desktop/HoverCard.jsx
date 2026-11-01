import { StatTile } from './StatTile'
import { fmtShortRange } from '../../utils/dateFormat'
import { formatMultiplier } from '../../utils/breaks'

/**
 * Quick preview above a hovered day: the date range, then a 2×2 grid of
 * leave · +free days / multiplier · total. Whichever number the calendar is
 * coloured by sits bottom-right, so the two modes read differently.
 */
export function HoverCard({ brk, colourBy }) {
  const free = brk.daysOff - brk.leaveDays
  const total = <StatTile key="total" kind="total" value={brk.daysOff} />
  const multiplier = <StatTile key="multiplier" kind="multiplier" value={formatMultiplier(brk.multiplier)} />

  return (
    <div
      role="tooltip"
      aria-label={`${brk.leaveDays} leave days plus ${free} free days: ${brk.daysOff} days off, ${formatMultiplier(brk.multiplier)}`}
      className="pointer-events-none absolute z-30 bottom-10 left-1/2 -translate-x-1/2 w-[132px] bg-white border border-slate-200 rounded-xl p-1 shadow-lg grid grid-cols-2 gap-1"
    >
      <div className="col-span-2 text-center text-xs font-bold text-slate-700 pt-0.5">
        {fmtShortRange(brk.startDate, brk.endDate)}
      </div>
      <StatTile kind="leave" value={brk.leaveDays} />
      <StatTile kind="free" value={`+${free}`} />
      {colourBy === 'multiplier' ? [total, multiplier] : [multiplier, total]}
    </div>
  )
}
