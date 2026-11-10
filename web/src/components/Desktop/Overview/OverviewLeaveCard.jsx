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
 * blocks, which pick this plan's leave (any number, amber past what's left;
 * see LimitPicker). Under the fraction, "Snap to N days left" (always there);
 * at the bottom one fixed line, the prompt when you've gone over.
 *
 * Props: planner – usePlanner() result; phone – stacked, for the Plan settings sheet
 */
// The best number you can pick within what's left: the highest one that isn't
// struck through (list periods), else what's left itself (0 = nothing left).
function snapTarget(planner) {
  const most = Math.min(planner.leaveLeft, planner.maxLeave)
  const marks = planner.limitMarks.marks
  for (let n = most; n >= 1; n--) if (marks?.[n - 1] !== 'pad') return n
  return most
}

export function OverviewLeaveCard({ planner, phone = false }) {
  const left = planner.leaveLeftNow
  const target = snapTarget(planner)
  const over = planner.leave - planner.leaveLeft
  // "Snap to 6 days left" is always there (so the card never changes height);
  // greyed when you're already on it or nothing is left.
  const snap = (
    <button
      type="button"
      disabled={!target || target === planner.leave}
      onClick={() => planner.setLeave(target)}
      title={!target ? 'No leave left to snap to' : target < Math.min(planner.leaveLeft, planner.maxLeave) ? `${target} is the best number you can pick within your ${planner.leaveLeft} left` : `Use the ${target} days you have left`}
      className="self-start h-8 px-3 rounded-lg border-[1.5px] border-green-600 bg-white text-green-800 text-[13px] font-extrabold whitespace-nowrap hover:bg-green-50 disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white"
    >
      {!target ? 'No days left' : target < Math.min(planner.leaveLeft, planner.maxLeave) ? `Snap to ${target} (best of ${planner.leaveLeft} left)` : `Snap to ${target} days left`}
    </button>
  )
  // Gone over: under the blocks, in two lines kept free in every state (so the card never changes height).
  const note = over > 0
    ? `You've picked ${over} more leave day${over === 1 ? '' : 's'} than you have left. Raise your limit or remove a break from your Summary to add ${over === 1 ? 'it' : 'them'}.`
    : planner.maxLeave < 10 ? `Only ${planner.maxLeave} workdays in these dates.` : ''
  const blocks = (
    <LimitPicker
      phone={phone}
      value={planner.leave}
      onChange={planner.setLeave}
      maxPick={planner.maxLeave}
      left={planner.leaveLeft < 10 ? planner.leaveLeft : null}
      rec={planner.listMode ? null : planner.rec?.leave}
      reason={planner.rec?.reason}
      {...planner.limitMarks}
    />
  )
  return (
    <section data-tour="limit" aria-label="Choose leave day limit" className="flex-1 min-w-0 bg-white border-2 border-sky-700 rounded-2xl px-4 py-3 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <StepBadge />
        <h2 className="m-0 text-[13px] font-bold whitespace-nowrap">Choose leave day limit</h2>
        <span className="ml-auto text-[11.5px] text-slate-600 whitespace-nowrap">
          <b className={left ? 'text-green-800' : 'text-amber-700'}>{left ? `${left} left` : 'None left'}</b> · {planner.leaveInSummary} used
        </span>
      </div>
      <div className={phone ? 'flex flex-col gap-4' : 'flex items-stretch gap-6'}>
        <div className="shrink-0 flex flex-col gap-4">
          <LeaveFraction value={planner.leave} limit={planner.leaveLimit} onLimitChange={planner.setLeaveLimit} idPrefix={phone ? 'plan-sheet' : 'overview'} size={phone ? 'md' : 'lg'} />
          {snap}
        </div>
        {/* The blocks, centred beside the fraction near the top, and the prompt under them. */}
        <div className={`min-w-0 flex flex-col gap-1.5 ${phone ? '' : 'flex-1 items-center'}`}>
          <div className={phone ? '' : 'w-full max-w-[480px]'}>{blocks}</div>
          <span role={over > 0 ? 'status' : undefined} title={note || undefined} className={`h-8 w-full max-w-[480px] line-clamp-2 text-center text-[11.5px] leading-4 ${over > 0 ? 'text-amber-800 font-semibold' : 'text-slate-500'}`}>{note}</span>
        </div>
      </div>
    </section>
  )
}
