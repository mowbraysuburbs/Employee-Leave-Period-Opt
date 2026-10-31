import { DayStrip } from './DayStrip'
import { fmtDayRange } from '../../utils/dateFormat'
import { formatMultiplier } from '../../utils/breaks'

export function SavedBreakRow({ brk, highlighted, onOpen, onRemove }) {
  return (
    <div
      className={[
        'flex-none flex flex-col gap-2 px-3.5 py-3 rounded-2xl',
        highlighted ? 'border-2 border-emerald-500 bg-emerald-50' : 'border border-slate-200',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={onOpen} className="text-left">
          <div className="text-[15px] font-bold">{fmtDayRange(brk.startDate, brk.endDate)}</div>
          <div className="text-[13px] text-slate-600 mt-0.5">
            {brk.leaveDays} leave → {brk.daysOff} days off · <strong className="text-amber-800">{formatMultiplier(brk.multiplier)}</strong>
          </div>
        </button>
        <button
          type="button"
          aria-label="Remove this break"
          onClick={onRemove}
          className="w-8 h-8 shrink-0 rounded-full bg-slate-100 text-slate-600 text-sm font-semibold"
        >
          ✕
        </button>
      </div>
      <DayStrip days={brk.days} height={10} />
    </div>
  )
}
