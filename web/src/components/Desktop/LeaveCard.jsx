import { useState } from 'react'
import { MAX_LEAVE } from '../../hooks/useLeavePlanner'

const round = 'w-7 h-7 rounded-full text-base font-semibold disabled:opacity-40'

// The limit, shown as "limit 10"; tap it to change it with − / +. Shared with
// the Overview planner, so both pages use (and change) the same limit.
export function LimitEditor({ limit, onChange }) {
  const [open, setOpen] = useState(false)
  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} aria-label={`Your leave limit: ${limit}. Change your leave limit`} title="Change your leave limit" className="text-[11.5px] text-slate-600 whitespace-nowrap">
        limit <b className="text-sky-700 underline decoration-dotted underline-offset-2">{limit}</b>
      </button>
    )
  }
  return (
    <span className="flex items-center gap-1 text-[11.5px] text-slate-600">
      limit
      <button type="button" aria-label="Lower your leave limit" disabled={limit <= 1} onClick={() => onChange(limit - 1)} className="w-5 h-5 rounded-full bg-slate-200 font-bold disabled:opacity-40">−</button>
      <b className="w-4 text-center text-slate-900">{limit}</b>
      <button type="button" aria-label="Raise your leave limit" disabled={limit >= MAX_LEAVE} onClick={() => onChange(limit + 1)} className="w-5 h-5 rounded-full bg-slate-200 font-bold disabled:opacity-40">+</button>
      <button type="button" onClick={() => setOpen(false)} className="ml-0.5 font-bold text-sky-700">Done</button>
    </span>
  )
}

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
 * The calendar's one leave card: your limit, how much is left after your
 * Summary, and the leave days the calendar shows. Snap follows what's left;
 * Manual explores any amount up to 10 (touching − / + switches to Manual).
 *
 * Props: c – calendar controls (leaveDays, leaveMode, leaveLimit, leaveLeft,
 *            leaveInSummary and their setters); idPrefix keeps ids unique
 */
export function LeaveCard({ c, idPrefix = 'rail' }) {
  const snap = c.leaveMode === 'snap'
  // Where "N left" sits on the 1–10 slider.
  const leftPos = c.leaveLeft >= 1 ? ((Math.min(c.leaveLeft, MAX_LEAVE) - 1) / (MAX_LEAVE - 1)) * 100 : null
  const seg = on => `flex-1 py-1 rounded-lg text-xs font-bold ${on ? 'bg-white text-slate-900 shadow' : 'text-slate-600'}`

  return (
    <section data-tour="leave" aria-label="Leave days" className="bg-white border-2 border-sky-700 rounded-2xl px-3 py-2.5 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={`${idPrefix}-leave-days`} className="text-[13px] font-bold whitespace-nowrap">Leave days</label>
        <LimitEditor limit={c.leaveLimit} onChange={c.onLeaveLimitChange} />
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Fewer leave days" disabled={c.leaveDays <= 1} onClick={() => c.onLeaveDaysChange(c.leaveDays - 1)} className={`${round} bg-slate-200`}>−</button>
          <span className="w-7 text-center text-2xl font-extrabold">{c.leaveDays}</span>
          <button type="button" aria-label="More leave days" disabled={c.leaveDays >= MAX_LEAVE} onClick={() => c.onLeaveDaysChange(c.leaveDays + 1)} className={`${round} bg-sky-700 text-white`}>+</button>
        </div>
        <span className="text-[11.5px] text-slate-600 text-right leading-tight">
          <b className={c.leaveLeft ? 'text-green-800' : 'text-amber-700'}>{c.leaveLeft ? `${c.leaveLeft} left` : 'None left'}</b><br />{c.leaveInSummary} used
        </span>
      </div>
      <div className="relative pt-3.5">
        {leftPos !== null && (
          <span aria-hidden="true" className="absolute top-0 -translate-x-1/2 flex flex-col items-center" style={{ left: `calc(${leftPos}% + ${8 - leftPos * 0.16}px)` }}>
            <span className="text-[9.5px] font-extrabold text-green-800 leading-none whitespace-nowrap">{c.leaveLeft} left</span>
            <span className="w-0.5 h-3 bg-green-600 rounded" />
          </span>
        )}
        <input
          id={`${idPrefix}-leave-days`}
          type="range"
          min={1}
          max={MAX_LEAVE}
          value={c.leaveDays}
          onChange={e => c.onLeaveDaysChange(Number(e.target.value))}
          className="w-full accent-sky-700"
        />
      </div>
      <div role="radiogroup" aria-label="Leave days mode" className="flex p-[3px] gap-[3px] rounded-xl bg-slate-100">
        <button type="button" role="radio" aria-checked={snap} onClick={() => c.onLeaveModeChange('snap')} className={seg(snap)}>📍 Snap to left</button>
        <button type="button" role="radio" aria-checked={!snap} onClick={() => c.onLeaveModeChange('manual')} className={seg(!snap)}>✋ Manual</button>
      </div>
      <Note c={c} />
    </section>
  )
}
