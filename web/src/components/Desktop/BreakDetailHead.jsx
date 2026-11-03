import { AddBreakControls } from './AddBreakControls'
import { StatTile } from './StatTile'
import { formatMultiplier } from '../../utils/breaks'
import { fmtDayRange } from '../../utils/dateFormat'

/**
 * The pinned top of Details: the break's dates, its four stats (as on the
 * hover card, with words), then Add / Remove. Stays in view while the rest
 * of the panel scrolls.
 *
 * Props:
 *   brk – the Details break, or null (nothing shows)
 *   row – the four stats in one row (the phone's day sheet)
 *   isSaved, onAdd, onRemove, overlaps, combined, onReplace – see AddBreakControls
 */
export function BreakDetailHead({ brk, row = false, ...addProps }) {
  if (!brk) return null
  return (
    <div className="flex flex-col gap-2">
      <h2 className="m-0 text-center text-[14.5px] font-bold">{fmtDayRange(brk.startDate, brk.endDate)}</h2>
      <div className={`grid gap-1.5 ${row ? 'grid-cols-4' : 'grid-cols-2'}`}>
        <StatTile kind="leave" value={brk.leaveDays} caption="leave days" />
        <StatTile kind="free" value={`+${brk.daysOff - brk.leaveDays}`} caption="free days" />
        <StatTile kind="total" value={brk.daysOff} caption="days off" />
        <StatTile kind="multiplier" value={formatMultiplier(brk.multiplier)} caption="multiplier" />
      </div>
      <AddBreakControls {...addProps} />
    </div>
  )
}
