import { LeaveBlocks, LeaveFraction } from './LeaveBlocks'

/**
 * The calendar's one leave card: "5 / 10▾ limit", how much is left after your
 * Summary, ten blocks to pick the leave days the calendar shows (amber past
 * what's left), and a "Snap to N days left" button like the Overview's: it
 * makes the calendar follow what's left (greyed while it does; picking a block
 * stops it). No notes under the card.
 *
 * Props: c – calendar controls (leaveDays, leaveMode, leaveLimit, leaveLeft,
 *            leaveInSummary and their setters); idPrefix keeps ids unique
 */
export function LeaveCard({ c, idPrefix = 'rail' }) {
  const snap = c.leaveMode === 'snap'

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
      {/* Snap: follow your days left (also at 0: then only the public holidays show). */}
      <button
        type="button"
        disabled={snap}
        aria-pressed={snap}
        onClick={() => c.onLeaveModeChange('snap')}
        title={snap ? `Following your ${c.leaveLeft} days left` : `Use the ${c.leaveLeft} days you have left`}
        className="self-start h-8 px-3 rounded-lg border-[1.5px] border-green-600 bg-white text-green-800 text-[13px] font-extrabold whitespace-nowrap hover:bg-green-50 disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white"
      >
        Snap to {c.leaveLeft} day{c.leaveLeft === 1 ? '' : 's'} left
      </button>
    </section>
  )
}
