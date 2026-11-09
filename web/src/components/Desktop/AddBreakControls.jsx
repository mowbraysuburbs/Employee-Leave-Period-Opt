import { breakKey } from '../../utils/breaks'
import { fmtDayRange } from '../../utils/dateFormat'

const primary = 'h-11 rounded-xl bg-sky-700 text-white text-[15px] font-bold'
const outline = 'rounded-xl bg-white border border-slate-300 text-slate-700 font-bold hover:border-slate-400'
const secondary = `h-9 text-[13px] ${outline}`

function overlapText(overlaps, detail) {
  if (overlaps.length > 1) return `Runs into ${overlaps.length} of your breaks`
  const o = overlaps[0]
  const range = fmtDayRange(o.startDate, o.endDate)
  // Right next to it (no shared days) or overlapping.
  return detail && (o.endDate < detail.startDate || o.startDate > detail.endDate) ? `Right next to your ${range} break` : `Overlaps your ${range} break`
}

/**
 * The Add / Combine / Remove buttons at the top of Details. Saved breaks never overlap: adding one that runs into,
 * or sits right next to, a saved break offers to combine them (or replace the old one).
 *
 * Props:
 *   brk                    – the Details break
 *   isSaved                – the Details break is saved as is
 *   overlaps               – saved breaks brk runs into or sits right next to
 *   combined               – the single break they'd make together, or null
 *   onAdd, onRemove, onReplace
 */
export function AddBreakControls({ brk, isSaved, overlaps, combined, onAdd, onRemove, onReplace }) {
  if (isSaved) {
    return (
      <div className="flex flex-col gap-2">
        <span className="self-center px-2.5 py-1 rounded-lg bg-green-50 text-green-800 text-[12.5px] font-bold">✓ In your Summary</span>
        <button type="button" onClick={onRemove} className="h-11 rounded-xl bg-white text-red-700 border border-red-300 text-[15px] font-bold">
          Remove from summary
        </button>
      </div>
    )
  }

  // Already inside one saved break: combining would change nothing.
  const covered = overlaps.length === 1 && breakKey(combined) === breakKey(overlaps[0])

  return (
    <div className="flex flex-col gap-2">
      {overlaps.length > 0 && (
        <div role="note" className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-[13px] text-amber-900">
          <strong>{covered ? 'Already in your plan' : overlapText(overlaps, brk)}</strong>
          {!covered && (
            <div className="text-xs">
              Together: {fmtDayRange(combined.startDate, combined.endDate)} · {combined.daysOff} days off for {combined.leaveDays} leave
            </div>
          )}
        </div>
      )}

      {overlaps.length === 0 && <button type="button" data-tour="add" onClick={onAdd} className={primary}>Add to summary</button>}
      {overlaps.length > 0 && !covered && (
        <div className="grid grid-cols-2 gap-2">
          <button type="button" data-tour="add" onClick={onAdd} className={primary}>Combine</button>
          <button type="button" onClick={onReplace} className={`h-11 text-[15px] ${outline}`}>Replace</button>
        </div>
      )}
      {covered && (
        <button type="button" onClick={onReplace} className={secondary}>Replace it with this shorter break</button>
      )}

    </div>
  )
}
