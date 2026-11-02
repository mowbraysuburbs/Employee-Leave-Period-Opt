import { BreakWeeks } from './BreakWeeks'
import { BreakDaysTable } from './BreakDaysTable'
import { StartDateChips } from './StartDateChips'
import { formatMultiplier } from '../../utils/breaks'

/**
 * Details tab content for one break, under the pinned Add + dates (BreakDetailHead).
 *
 * Props:
 *   brk        – the break (the clicked day, a saved break, or a previewed plan's earliest)
 *   nextBreak  – the same start with one more leave day, or null at the cap
 *   bestNote   – explains a break using fewer leave days than set
 *   label      – Overview plan name while one is previewed, e.g. "Up next"
 *   equalStarts, onPickStart – equal alternatives to move to (see StartDateChips)
 */
export function BreakDetailPanel({ brk, nextBreak, bestNote, label, equalStarts, onPickStart }) {
  if (!brk) {
    return (
      <div className="px-5 py-7 border-[1.5px] border-dashed border-slate-300 rounded-2xl text-sm text-slate-600 text-center">
        Click a day on the calendar to see its details here.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {(label || bestNote) && (
        <div className="flex flex-wrap gap-1.5">
          {label && (
            <div className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold">Overview plan · {label}</div>
          )}
          {bestNote && (
            <div className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">{bestNote}</div>
          )}
        </div>
      )}

      <StartDateChips options={equalStarts} current={brk.startDate} onPick={onPickStart} />

      <BreakWeeks brk={brk} />
      <BreakDaysTable brk={brk} />

      {nextBreak && (
        <p className="m-0 text-[13px] text-slate-600">
          +1 leave day → {nextBreak.daysOff} days off ({formatMultiplier(nextBreak.multiplier)})
        </p>
      )}
    </div>
  )
}
