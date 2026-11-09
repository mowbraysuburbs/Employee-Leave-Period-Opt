import { AddBreakControls } from './AddBreakControls'
import { StatTile } from './StatTile'
import { formatMultiplier } from '../../utils/breaks'
import { fmtDayRange } from '../../utils/dateFormat'

/**
 * The pinned top of Details: the break's dates, its four stats in one row (as
 * on the hover card, with words), then Add / Remove. Stays in view while the rest
 * of the panel scrolls.
 *
 * Props:
 *   brk – the Details break, or null (nothing shows)
 *   isSaved, onAdd, onRemove, overlaps, combined, onReplace – see AddBreakControls
 */
export function BreakDetailHead({ brk, ...addProps }) {
  if (!brk) return null
  return (
    <div className="flex flex-col gap-2">
      <h2 className="m-0 text-center text-[14.5px] font-bold">{fmtDayRange(brk.startDate, brk.endDate)}</h2>
      {/* One row of four (compact tiles), like the Overview's Details. */}
      <div className="grid grid-cols-4 gap-1">
        <StatTile kind="leave" value={brk.leaveDays} caption="leave days" compact />
        <StatTile kind="free" value={`+${brk.daysOff - brk.leaveDays}`} caption="free days" compact />
        <StatTile kind="total" value={brk.daysOff} caption="days off" compact />
        <StatTile kind="multiplier" value={formatMultiplier(brk.multiplier)} caption="multiplier" compact />
      </div>
      <AddBreakControls brk={brk} {...addProps} />
    </div>
  )
}
