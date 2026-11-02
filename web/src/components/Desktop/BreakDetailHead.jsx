import { AddBreakControls } from './AddBreakControls'
import { fmtDayRange } from '../../utils/dateFormat'

/**
 * The pinned top of Details: the break's dates, then Add / Remove, so both
 * stay in view while the rest of the panel scrolls.
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
      <AddBreakControls {...addProps} />
    </div>
  )
}
