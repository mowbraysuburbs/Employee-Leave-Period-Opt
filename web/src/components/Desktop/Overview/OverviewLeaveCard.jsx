import { LeaveFraction } from '../LeaveBlocks'
import { LimitPicker } from './LimitPicker'

// The step number inside the card (desktop: no heading row above it).
function StepBadge() {
  return <span aria-hidden="true" className="shrink-0 w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-extrabold flex items-center justify-center">2</span>
}

/**
 * Step 2 of the Overview: the Calendar's leave card, laid out long and kept
 * short. Top row: ② "Choose leave day limit" and, on the right (over the
 * blocks), "6 left · 4 used". Second row: the "6 / 10⌄ limit" fraction (the
 * limit is shared with the Calendar and only changes in its dropdown) and the
 * blocks, which pick this plan's leave (see LimitPicker for which numbers can
 * be picked). A note shows only when numbers are locked or nothing is left.
 *
 * Props: planner – usePlanner() result; phone – stacked, for the Plan settings sheet
 */
export function OverviewLeaveCard({ planner, phone = false }) {
  const left = planner.leaveLeftNow
  const lockedFrom = planner.maxLeave + 1
  const note = planner.maxLeave === 0
    ? 'No leave left: raise your limit or remove a break from your Summary.'
    : planner.maxLeave < 10 && planner.maxLeave < planner.leaveLimit
      ? `${lockedFrom}${lockedFrom < 10 ? '–10' : ''}: only ${planner.maxLeave} left. Raise your limit or remove a break from your Summary.`
      : planner.maxLeave < 10 && planner.maxLeave === planner.workdays
        ? `Only ${planner.maxLeave} workdays in these dates.`
        : null
  const blocks = (
    <LimitPicker
      phone={phone}
      value={planner.leave}
      onChange={planner.setLeave}
      maxPick={planner.maxLeave}
      left={planner.maxLeave > 0 && planner.maxLeave < 10 && planner.maxLeave < planner.leaveLimit ? planner.maxLeave : null}
      rec={planner.listMode ? null : planner.rec?.leave}
      reason={planner.rec?.reason}
      {...planner.limitMarks}
    />
  )
  return (
    <section data-tour="limit" aria-label="Choose leave day limit" className="flex-1 min-w-0 bg-white border-2 border-sky-700 rounded-2xl px-3 py-1.5 flex flex-col">
      <div className="flex items-center gap-2">
        <StepBadge />
        <h2 className="m-0 text-[13px] font-bold whitespace-nowrap">Choose leave day limit</h2>
        <span className="ml-auto text-[11.5px] text-slate-600 whitespace-nowrap">
          <b className={left ? 'text-green-800' : 'text-amber-700'}>{left ? `${left} left` : 'None left'}</b> · {planner.leaveInSummary} used
        </span>
      </div>
      <div className={phone ? 'flex flex-col gap-1 mt-1' : 'flex items-center gap-4'}>
        <div className="shrink-0">
          <LeaveFraction value={planner.leave} limit={planner.leaveLimit} onLimitChange={planner.setLeaveLimit} idPrefix={phone ? 'plan-sheet' : 'overview'} size="md" />
        </div>
        <div className={`min-w-0 ${phone ? '' : 'flex-1 max-w-[420px] ml-auto'}`}>{blocks}</div>
      </div>
      {note && <span className={`text-[10.5px] ${planner.maxLeave === 0 ? 'text-amber-800 font-semibold' : 'text-slate-500'} ${phone ? '' : 'text-right'}`}>{note}</span>}
    </section>
  )
}
