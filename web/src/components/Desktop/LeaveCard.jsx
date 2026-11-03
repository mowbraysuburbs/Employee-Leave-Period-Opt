import { LeaveBlocks, LeaveFraction } from './LeaveBlocks'

function Note({ c }) {
  const box = 'text-[11px] rounded-md px-2 py-1'
  if (c.leaveLeft === 0) return <span className={`${box} text-amber-800 bg-amber-50 border border-amber-200`}><b>No leave left.</b> Remove a break from your Summary or raise your limit.</span>
  if (c.leaveMode === 'snap') return <span className="text-[11px] text-slate-600">Showing the best breaks with the {c.leaveDays} you have left. Follows as you add breaks.</span>
  if (c.leaveDays > c.leaveLeft) {
    const over = c.leaveDays - c.leaveLeft
    return <span className={`${box} text-amber-800 bg-amber-50 border border-amber-200`}>{c.leaveDays} is <b>{over} more</b> than you have left. Fine for exploring.</span>
  }
  return null
}

/**
 * The calendar's one leave card: "5 / 10▾ limit", how much is left after your
 * Summary, ten blocks to pick the leave days the calendar shows, and Snap
 * (follow what's left) or Manual (explore up to your limit).
 *
 * Props: c – calendar controls (leaveDays, leaveMode, leaveLimit, leaveLeft,
 *            leaveInSummary and their setters); idPrefix keeps ids unique
 */
export function LeaveCard({ c, idPrefix = 'rail' }) {
  const snap = c.leaveMode === 'snap'
  const seg = on => `flex-1 py-1 rounded-lg text-xs font-bold ${on ? 'bg-white text-slate-900 shadow' : 'text-slate-600'}`

  return (
    <section data-tour="leave" aria-label="Leave days" className="bg-white border-2 border-sky-700 rounded-2xl px-3 py-2.5 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-bold whitespace-nowrap">Leave days</span>
        <span className="text-[11.5px] text-slate-600 whitespace-nowrap">
          <b className={c.leaveLeft ? 'text-green-800' : 'text-amber-700'}>{c.leaveLeft ? `${c.leaveLeft} left` : 'None left'}</b> · {c.leaveInSummary} used
        </span>
      </div>
      <LeaveFraction value={c.leaveDays} limit={c.leaveLimit} onLimitChange={c.onLeaveLimitChange} idPrefix={idPrefix} />
      <LeaveBlocks value={c.leaveDays} onChange={c.onLeaveDaysChange} left={c.leaveLeft} max={c.leaveLimit} />
      <div role="radiogroup" aria-label="Leave days mode" className="flex p-[3px] gap-[3px] rounded-xl bg-slate-100">
        <button type="button" role="radio" aria-checked={snap} onClick={() => c.onLeaveModeChange('snap')} className={seg(snap)}>📍 Snap to left</button>
        <button type="button" role="radio" aria-checked={!snap} onClick={() => c.onLeaveModeChange('manual')} className={seg(!snap)}>✋ Manual</button>
      </div>
      <Note c={c} />
    </section>
  )
}
