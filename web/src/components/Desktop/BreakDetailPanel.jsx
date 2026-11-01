import { BreakWeeks } from './BreakWeeks'
import { BreakDaysTable } from './BreakDaysTable'
import { StartDateChips } from './StartDateChips'
import { AddBreakControls } from './AddBreakControls'
import { fmtDayRange } from '../../utils/dateFormat'
import { formatMultiplier } from '../../utils/breaks'

function Stat({ value, label, highlight }) {
  return (
    <div className={`rounded-xl px-3 py-2.5 ${highlight ? 'bg-amber-100 text-amber-900' : 'bg-slate-100'}`}>
      <div className="text-[22px] font-extrabold">{value}</div>
      <div className={`text-xs ${highlight ? '' : 'text-slate-600'}`}>{label}</div>
    </div>
  )
}

/**
 * Details tab content for one break.
 *
 * Props:
 *   brk        – the break (the clicked day, a saved break, or a previewed plan's earliest)
 *   nextBreak  – the same start with one more leave day, or null at the cap
 *   bestNote   – explains a break using fewer leave days than set
 *   label      – Overview plan name while one is previewed, e.g. "Up next"
 *   equalStarts, onPickStart – equal alternatives to move to (see StartDateChips)
 *   isSaved    – already in My breaks
 *   onAdd, onRemove
 *   overlaps, combined, onReplace, leaveLeft, allowance – see AddBreakControls
 */
export function BreakDetailPanel({ brk, nextBreak, bestNote, label, equalStarts, onPickStart, isSaved, onAdd, onRemove, ...addProps }) {
  if (!brk) {
    return (
      <div className="px-5 py-7 border-[1.5px] border-dashed border-slate-300 rounded-2xl text-sm text-slate-600 text-center">
        Click a day on the calendar to see its details here.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        {label && (
          <div className="mb-2 inline-block px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold">Overview plan · {label}</div>
        )}
        <h2 className="m-0 text-xl font-extrabold tracking-tight">{fmtDayRange(brk.startDate, brk.endDate)}</h2>
        {bestNote && (
          <div className="mt-1.5 inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">{bestNote}</div>
        )}
      </div>

      <AddBreakControls brk={brk} isSaved={isSaved} onAdd={onAdd} onRemove={onRemove} {...addProps} />

      <StartDateChips options={equalStarts} current={brk.startDate} onPick={onPickStart} />

      <div className="grid grid-cols-3 gap-2">
        <Stat value={brk.daysOff} label="days off" />
        <Stat value={brk.leaveDays} label="leave" />
        <Stat value={formatMultiplier(brk.multiplier)} label="multiplier" highlight />
      </div>

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
