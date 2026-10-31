import { SavedBreakRow } from './SavedBreakRow'
import { AddedPrompt } from './AddedPrompt'
import { DAY_TYPE_LEGEND } from '../../utils/dayTypes'
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
 */
export function MyBreaksPanel({ breaks, allowance, justAddedKey, onOpen, onRemove, onDismissAdded }) {
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

      {justAdded && <AddedPrompt brk={justAdded} onDismiss={onDismissAdded} />}

      {breaks.length === 0 ? (
        <div className="p-5 border-[1.5px] border-dashed border-slate-300 rounded-2xl text-sm text-slate-600 text-center">
          No breaks yet. Click any day to start.
        </div>
      ) : (
        <div aria-label="Saved breaks" className="max-h-[440px] overflow-y-auto flex flex-col gap-2.5 pr-1.5">
          {breaks.map(b => (
            <SavedBreakRow
              key={breakKey(b)}
              brk={b}
              highlighted={breakKey(b) === justAddedKey}
              onOpen={() => onOpen(b)}
              onRemove={() => onRemove(b)}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3.5 text-xs text-slate-700">
        {DAY_TYPE_LEGEND.map(l => (
          <div key={l.type} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.colour }} />
            {l.label}
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={breaks.length === 0}
        onClick={() => downloadIcs(buildIcs(breaks.map(toCalendarEvent)), 'my-leave-breaks.ics')}
        className="h-[50px] rounded-2xl bg-slate-900 text-white text-[15px] font-bold disabled:opacity-40"
      >
        Add all to calendar (.ics)
      </button>
    </div>
  )
}
