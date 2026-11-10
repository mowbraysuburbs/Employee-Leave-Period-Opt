import { LeaveFraction } from '../LeaveBlocks'
import { LimitPicker } from './LimitPicker'

/**
 * Step 2 of the Overview: the Calendar's leave card, laid out long. "Leave
 * days · 6 left · 4 used", the "3 / 10▾ limit" fraction (the limit is shared
 * with the Calendar and only changes in its dropdown), and the blocks, which
 * pick this plan's leave (see LimitPicker for which numbers can be picked).
 *
 * Props: planner – usePlanner() result; phone – stacked for the Plan settings sheet
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
        : 'Tap a number to pick your leave days'
  return (
    <section
      data-tour="limit"
      aria-label="Leave days"
      className={`bg-white border-2 border-sky-700 rounded-2xl px-3 py-2 ${phone ? 'flex flex-col gap-1' : 'flex items-center gap-4 flex-1 min-w-0'}`}
    >
      <div className="flex flex-col gap-1.5 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-bold whitespace-nowrap">Leave days</span>
          <span className="text-[11.5px] text-slate-600 whitespace-nowrap">
            <b className={left ? 'text-green-800' : 'text-amber-700'}>{left ? `${left} left` : 'None left'}</b> · {planner.leaveInSummary} used
          </span>
        </div>
        <LeaveFraction value={planner.leave} limit={planner.leaveLimit} onLimitChange={planner.setLeaveLimit} idPrefix={phone ? 'plan-sheet' : 'overview'} size="md" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
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
        <span className={`text-[10.5px] ${planner.maxLeave === 0 ? 'text-amber-800 font-semibold' : 'text-slate-500'}`}>{note}</span>
      </div>
    </section>
  )
}
