import { breakKey } from '../../utils/breaks'
import { fmtDayRange } from '../../utils/dateFormat'

const primary = 'h-11 rounded-xl bg-sky-700 text-white text-[15px] font-bold'
const secondary = 'h-9 rounded-xl bg-white border border-slate-300 text-slate-700 text-[13px] font-bold hover:border-slate-400'

function overlapText(overlaps) {
  if (overlaps.length > 1) return `Overlaps ${overlaps.length} of your breaks`
  return `Overlaps your ${fmtDayRange(overlaps[0].startDate, overlaps[0].endDate)} break`
}

/**
 * The Add / Combine / Remove buttons at the top of Details, plus how much
 * leave is left. Saved breaks never overlap: adding one that runs into a
 * saved break offers to combine them (or replace the old one).
 *
 * Props:
 *   brk, isSaved           – the Details break and whether it's saved as is
 *   overlaps               – saved breaks brk runs into
 *   combined               – the single break they'd make together, or null
 *   leaveLeft, allowance   – leave days not yet used / yearly total
 *   onAdd, onRemove, onReplace
 */
export function AddBreakControls({ brk, isSaved, overlaps, combined, leaveLeft, allowance, onAdd, onRemove, onReplace }) {
  if (isSaved) {
    return (
      <button type="button" onClick={onRemove} className="h-11 rounded-xl bg-white text-red-700 border border-red-300 text-[15px] font-bold">
        Remove from my breaks
      </button>
    )
  }

  // Already inside one saved break: combining would change nothing.
  const covered = overlaps.length === 1 && breakKey(combined) === breakKey(overlaps[0])
  const extraLeave = combined ? combined.leaveDays - overlaps.reduce((sum, b) => sum + b.leaveDays, 0) : brk.leaveDays
  const tooMuch = !covered && extraLeave > leaveLeft

  return (
    <div className="flex flex-col gap-2">
      {overlaps.length > 0 && (
        <div role="note" className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-[13px] text-amber-900">
          <strong>{covered ? 'Already in your plan' : overlapText(overlaps)}</strong>
          {!covered && (
            <div className="text-xs">
              Together: {fmtDayRange(combined.startDate, combined.endDate)} · {combined.daysOff} days off for {combined.leaveDays} leave
            </div>
          )}
        </div>
      )}

      {overlaps.length === 0 && <button type="button" data-tour="add" onClick={onAdd} className={primary}>+ Add to my breaks</button>}
      {overlaps.length > 0 && !covered && <button type="button" data-tour="add" onClick={onAdd} className={primary}>Combine into one break</button>}
      {overlaps.length > 0 && (
        <button type="button" onClick={onReplace} className={secondary}>
          {covered ? 'Replace it with this shorter break' : 'Replace instead'}
        </button>
      )}

      <p className={`m-0 text-xs ${tooMuch ? 'text-amber-800 font-semibold' : 'text-slate-500'}`}>
        {tooMuch
          ? `Needs ${extraLeave} more leave · only ${leaveLeft} of ${allowance} left`
          : `${leaveLeft} of ${allowance} leave days left`}
      </p>
    </div>
  )
}
