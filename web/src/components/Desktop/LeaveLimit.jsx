import { MAX_LEAVE } from '../../hooks/useLeavePlanner'

/**
 * "Your leave limit": the most leave days you have to spend in total (1–10),
 * with a bar of how much your Summary already uses. What's left caps the
 * leave days for one break.
 *
 * Props: c – calendar controls (leaveLimit, leaveLeft, leaveInSummary, onLeaveLimitChange)
 */
export function LeaveLimit({ c }) {
  const { leaveLimit, leaveLeft, leaveInSummary, onLeaveLimitChange } = c
  const none = leaveLeft === 0
  const pct = Math.min(100, (leaveInSummary / leaveLimit) * 100)
  return (
    <section aria-label="Your leave limit" className="bg-white rounded-2xl px-3 py-2.5 flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-bold">Your leave limit</span>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Lower your leave limit" disabled={leaveLimit <= 1} onClick={() => onLeaveLimitChange(leaveLimit - 1)} className="w-6 h-6 rounded-full bg-slate-200 text-sm font-semibold disabled:opacity-40">−</button>
          <span className="w-6 text-center text-lg font-extrabold">{leaveLimit}</span>
          <button type="button" aria-label="Raise your leave limit" disabled={leaveLimit >= MAX_LEAVE} onClick={() => onLeaveLimitChange(leaveLimit + 1)} className="w-6 h-6 rounded-full bg-slate-200 text-sm font-semibold disabled:opacity-40">+</button>
        </div>
      </div>
      <div className="h-2 rounded bg-slate-200 overflow-hidden">
        <div className={`h-full ${none ? 'bg-amber-600' : 'bg-sky-700'}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-[11.5px] ${none ? 'text-amber-800 font-bold' : 'text-slate-600'}`}>
        {none ? 'No leave left' : <b className="text-slate-900">{leaveLeft} left</b>} · {leaveInSummary} used in your Summary
      </span>
    </section>
  )
}
