import { SavedBreaksTable } from './SavedBreaksTable'
import { AddedPrompt } from './AddedPrompt'
import { summariseBreaks, formatMultiplier, toCalendarEvent, breakKey } from '../../utils/breaks'
import { buildIcs, downloadIcs } from '../../utils/calendarExport'

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
 *   allowance    – yearly leave days
 *   justAddedKey – breakKey of the break just added (highlighted + calendar prompt)
 *   onOpen, onRemove – (brk) => void
 *   onDismissAdded
 *   mineOnly, onMineOnlyChange – same value as the rail's "Only my breaks"
 */
export function MyBreaksPanel({ breaks, allowance, justAddedKey, onOpen, onRemove, onDismissAdded, mineOnly, onMineOnlyChange }) {
  const totals = summariseBreaks(breaks)
  const justAdded = breaks.find(b => breakKey(b) === justAddedKey)
  const usedPct = Math.min(100, Math.round((totals.leaveUsed / allowance) * 100))

  return (
    <div className="flex flex-col gap-4">
      <h2 className="m-0 text-lg font-extrabold">
        My breaks <span className="text-sm font-semibold text-slate-500">({breaks.length})</span>
      </h2>

      <div className="grid grid-cols-3 gap-2">
        <Total value={totals.leaveUsed} suffix={`/${allowance}`} label="leave used" />
        <Total value={totals.daysOff} label="days off" />
        <Total value={breaks.length ? formatMultiplier(totals.multiplier) : '–'} label="overall" highlight />
      </div>
      <div className="h-2 rounded bg-slate-200 overflow-hidden">
        <div className="h-2 bg-sky-700" style={{ width: `${usedPct}%` }} />
      </div>

      <button
        type="button"
        aria-pressed={mineOnly}
        disabled={breaks.length === 0}
        onClick={() => onMineOnlyChange(!mineOnly)}
        className={`h-10 rounded-xl border text-sm font-bold disabled:opacity-40 ${mineOnly ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-300 hover:border-slate-400'}`}
      >
        {mineOnly ? '✓ Showing my leave only' : 'Show my leave only'}
      </button>

      {justAdded && <AddedPrompt brk={justAdded} onDismiss={onDismissAdded} />}

      {breaks.length === 0 ? (
        <div className="p-5 border-[1.5px] border-dashed border-slate-300 rounded-2xl text-sm text-slate-600 text-center">
          No breaks yet. Click any day to start.
        </div>
      ) : (
        <SavedBreaksTable breaks={breaks} justAddedKey={justAddedKey} onOpen={onOpen} onRemove={onRemove} />
      )}

      <button
        type="button"
        data-tour="export"
        disabled={breaks.length === 0}
        onClick={() => downloadIcs(buildIcs(breaks.map(toCalendarEvent)), 'my-leave-breaks.ics')}
        className="h-[50px] rounded-2xl bg-slate-900 text-white text-[15px] font-bold disabled:opacity-40"
      >
        Add all to calendar (.ics)
      </button>
    </div>
  )
}
