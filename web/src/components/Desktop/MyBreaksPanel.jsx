import { SavedBreaksTable } from './SavedBreaksTable'
import { CalendarExport } from './CalendarExport'
import { summariseBreaks, formatMultiplier } from '../../utils/breaks'

function Total({ value, suffix, label, highlight }) {
  return (
    <div className={`rounded-xl px-3 py-2.5 ${highlight ? 'bg-amber-100 text-amber-900' : 'bg-slate-100'}`}>
      <div className="text-[22px] font-extrabold">
        {value}
        {suffix && <span className="text-[13px] font-semibold text-slate-600">{suffix}</span>}
      </div>
      <div className={`text-xs ${highlight ? '' : 'text-slate-600'}`}>{label}</div>
    </div>
  )
}

/**
 * Props:
 *   breaks       – saved breaks, newest first
 *   justAddedKey – breakKey of the break just added (highlighted)
 *   onOpen, onRemove – (brk) => void
 *   mineOnly, onMineOnlyChange – same value as the rail's "Selected"
 */
export function MyBreaksPanel({ breaks, justAddedKey, onOpen, onRemove, mineOnly, onMineOnlyChange }) {
  const totals = summariseBreaks(breaks)

  return (
    <div className="flex flex-col gap-4">
      <h2 className="m-0 text-lg font-extrabold">
        My breaks <span className="text-sm font-semibold text-slate-500">({breaks.length})</span>
      </h2>

      <div className="grid grid-cols-3 gap-2">
        <Total value={totals.leaveUsed} label="leave used" />
        <Total value={totals.daysOff} label="days off" />
        <Total value={breaks.length ? formatMultiplier(totals.multiplier) : '–'} label="overall multiplier" highlight />
      </div>

      <button
        type="button"
        aria-pressed={mineOnly}
        disabled={breaks.length === 0}
        onClick={() => onMineOnlyChange(!mineOnly)}
        className={`h-10 rounded-xl border text-sm font-bold disabled:opacity-40 ${mineOnly ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-300 hover:border-slate-400'}`}
      >
        {mineOnly ? '✓ ' : ''}Show selected ({breaks.length})
      </button>

      <CalendarExport breaks={breaks} />

      {breaks.length === 0 ? (
        <div className="p-5 border-[1.5px] border-dashed border-slate-300 rounded-2xl text-sm text-slate-600 text-center">
          No breaks yet. Click any day to start.
        </div>
      ) : (
        <SavedBreaksTable breaks={breaks} justAddedKey={justAddedKey} onOpen={onOpen} onRemove={onRemove} />
      )}

    </div>
  )
}
