import { breakKey } from '../../utils/breaks'
import { fmtDay } from '../../utils/dateFormat'

const COLUMNS = 'grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_40px_24px] gap-2 items-center'

/**
 * Saved breaks as a compact table: start | end | days off | remove.
 * Clicking a row opens that break in Details.
 *
 * Props:
 *   breaks       – saved breaks, newest first
 *   justAddedKey – breakKey of the row to highlight
 *   onOpen, onRemove – (brk) => void
 */
export function SavedBreaksTable({ breaks, justAddedKey, onOpen, onRemove }) {
  return (
    <div role="table" aria-label="Saved breaks" className="text-[13px] border border-slate-200 rounded-xl overflow-hidden">
      <div role="row" className={`${COLUMNS} px-2.5 py-2 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wide`}>
        <span role="columnheader">Start</span>
        <span role="columnheader">End</span>
        <span role="columnheader" className="text-right">Days</span>
        <span role="columnheader"><span className="sr-only">Remove</span></span>
      </div>
      <div className="max-h-[440px] overflow-y-auto">
        {breaks.map(b => (
          <div
            key={breakKey(b)}
            role="row"
            className={`${COLUMNS} px-2.5 py-2 border-t border-slate-100 ${breakKey(b) === justAddedKey ? 'bg-sky-50' : ''}`}
          >
            <span role="cell" className="min-w-0">
              <button type="button" onClick={() => onOpen(b)} className="w-full text-left font-bold truncate hover:underline">
                {fmtDay(b.startDate)}
              </button>
            </span>
            <span role="cell" className="text-slate-600 truncate">{fmtDay(b.endDate)}</span>
            <span role="cell" className="text-right font-extrabold">{b.daysOff}</span>
            <span role="cell">
              <button
                type="button"
                aria-label={`Remove ${fmtDay(b.startDate)} break`}
                onClick={() => onRemove(b)}
                className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-[11px] hover:bg-red-50 hover:text-red-700"
              >
                ✕
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
