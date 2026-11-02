import { useState } from 'react'

function TotalInput({ total, onChange, onDone }) {
  return (
    <input
      type="number"
      min={1}
      max={99}
      autoFocus
      aria-label="Leave days per year"
      defaultValue={total}
      onBlur={e => { const n = parseInt(e.target.value, 10); if (n > 0 && n < 100) onChange(n); onDone() }}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur() }}
      className="w-12 h-6 px-1 border border-slate-300 rounded-md bg-white text-xs font-bold text-slate-900"
    />
  )
}

/**
 * Footer of the side panel: how many leave days the Summary leaves you.
 *
 * Props:
 *   used     – leave days in the saved breaks
 *   adding   – extra leave days if the Details break were added (0 if none)
 *   total    – yearly leave days; click it to change
 *   onTotalChange
 */
export function LeaveBar({ used, adding, total, onTotalChange }) {
  const [editing, setEditing] = useState(false)
  const left = total - used
  const over = left < 0
  const headline = over ? `${-left} ${-left === 1 ? 'day' : 'days'} over` : left === 0 ? 'No leave days left' : `${left} leave ${left === 1 ? 'day' : 'days'} left`
  const tone = over ? 'text-red-700' : left === 0 ? 'text-amber-700' : 'text-slate-900'
  const fill = over ? 'bg-red-600' : left === 0 ? 'bg-amber-600' : 'bg-sky-700'
  const usedPct = Math.min(100, (used / total) * 100)
  const addPct = Math.min(100 - usedPct, (adding / total) * 100)

  return (
    <div data-tour="leave-left" className="px-[22px] pt-3 pb-4 border-t border-slate-200 bg-slate-50 rounded-b-[20px] flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className={`text-[13px] font-extrabold ${tone}`}>{headline}</span>
        <span className="text-xs text-slate-600 flex items-center gap-1">
          {used} of
          {editing
            ? <TotalInput total={total} onChange={onTotalChange} onDone={() => setEditing(false)} />
            : (
              <button type="button" onClick={() => setEditing(true)} title="Change your yearly leave days" className="font-bold text-sky-700 underline decoration-dotted underline-offset-2">
                {total}
              </button>
            )}
          used
        </span>
      </div>
      <div className="h-2 rounded bg-slate-200 overflow-hidden flex">
        <span className={fill} style={{ width: `${usedPct}%` }} />
        <span className="bg-sky-300" style={{ width: `${addPct}%` }} />
      </div>
      {adding > 0 && (
        <span className="text-[11px] text-slate-600">Light blue = this break, if you add it (→ {left - adding} left)</span>
      )}
    </div>
  )
}
