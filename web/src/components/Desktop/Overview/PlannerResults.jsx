import { PlanStats } from './PlanStats'
import { PlannerTable } from './PlannerTable'

/**
 * The plan the planner found: a title, the stat tiles (following the ticked
 * breaks), the breaks table, and Add / Export / View on calendar.
 *
 * Props:
 *   planner                 – usePlanner() result
 *   isSaved                 – (break) => bool
 *   onAdd, onExport, onView – (tickedBreaks) => void
 *   phone
 */
export function PlannerResults({ planner, isSaved, onAdd, onExport, onView, phone = false }) {
  const { period, breaks, startOptions, ticked, toggleTick, swapStart, leave } = planner
  const chosen = breaks.filter(b => ticked.has(b.startDate))
  const none = chosen.length === 0
  const allSaved = !none && chosen.every(isSaved)
  const count = breaks.length === 1 ? '1 break' : `${breaks.length} breaks`

  if (breaks.length === 0) {
    return (
      <div className="p-5 border-[1.5px] border-dashed border-slate-300 rounded-2xl text-sm text-slate-600 text-center">
        No breaks fit these settings. Try more leave days, or avoid fewer months.
      </div>
    )
  }

  const button = phone ? 'flex-1' : 'flex-[1_1_150px]'
  return (
    <div className={`flex flex-col ${phone ? 'gap-2.5 flex-1 min-h-0' : 'gap-3.5'}`}>
      {phone
        ? <div className="flex items-baseline justify-between"><b className="text-sm">{count} · {leave} leave</b></div>
        : <h3 className="m-0 text-xl font-extrabold">{period.title}: {count}</h3>}
      <PlanStats breaks={chosen} total={breaks.length} compact={phone} />
      <div className={phone ? 'flex-1 min-h-0 overflow-y-auto' : ''}>
        <PlannerTable breaks={breaks} startOptions={startOptions} ticked={ticked} onToggle={toggleTick} onSwap={swapStart} phone={phone} />
      </div>
      <div className={`flex gap-2 ${phone ? 'shrink-0' : 'flex-wrap'}`}>
        <button
          type="button"
          disabled={none || allSaved}
          onClick={() => onAdd(chosen)}
          className={`${button} h-11 rounded-xl text-sm font-bold whitespace-nowrap disabled:opacity-50 ${allSaved ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-sky-700 text-white'}`}
        >
          {allSaved ? 'Added ✓' : phone ? `Add (${chosen.length})` : `Add ticked (${chosen.length})`}
        </button>
        <button type="button" disabled={none} onClick={() => onExport(chosen)} className={`${button} h-11 rounded-xl bg-slate-900 text-white text-sm font-bold whitespace-nowrap disabled:opacity-50`}>
          {phone ? 'Export' : 'Export (.ics)'}
        </button>
        <button type="button" disabled={none} onClick={() => onView(chosen)} className={`${button} h-11 rounded-xl border border-slate-300 bg-white text-sm font-bold whitespace-nowrap disabled:opacity-50`}>
          {phone ? 'Calendar →' : 'View on calendar →'}
        </button>
      </div>
    </div>
  )
}
