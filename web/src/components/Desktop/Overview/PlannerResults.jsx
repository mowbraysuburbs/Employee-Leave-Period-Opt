import { useState } from 'react'
import { PlanStats } from './PlanStats'
import { PlannerTable } from './PlannerTable'

/**
 * The plan the planner found: a title, the breaks table, and Add / Export
 * (plus View on calendar on phones). Desktop shows the plan's stats in Details.
 *
 * Props:
 *   planner                 – usePlanner() result
 *   isSaved                 – (break) => bool
 *   onAdd, onExport, onView – (tickedBreaks) => void (View is phone only; desktop has it on the calendar column)
 *   onHover                 – optional (startDate | null) => void as a row is hovered
 *   calendar                – phone only: the 2-month view, shown instead of the table when switched on
 *   phone
 */
export function PlannerResults({ planner, isSaved, onAdd, onExport, onView, onHover, calendar, phone = false }) {
  const [showCalendar, setShowCalendar] = useState(false)
  const { breaks, startOptions, ticked, toggleTick, swapStart, leave } = planner
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

  const button = phone ? 'flex-1' : ''
  const actions = (
    <>
      <button
        data-tour="plan-add"
        type="button"
        disabled={none || allSaved}
        onClick={() => onAdd(chosen)}
        className={`${button} ${phone ? 'h-11' : 'h-9 px-3.5'} rounded-xl text-sm font-bold whitespace-nowrap disabled:opacity-50 ${allSaved ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-sky-700 text-white'}`}
      >
        {allSaved ? 'Added ✓' : `Add (${chosen.length})`}
      </button>
      <button type="button" disabled={none} onClick={() => onExport(chosen)} className={`${button} ${phone ? 'h-11' : 'h-9 px-3.5'} rounded-xl bg-slate-900 text-white text-sm font-bold whitespace-nowrap disabled:opacity-50`}>
        {phone ? 'Export' : 'Export .ics'}
      </button>
      {/* On desktop, "Open in calendar" sits on the calendar column instead. */}
      {phone && (
        <button type="button" disabled={none} onClick={() => onView(chosen)} className={`${button} ${phone ? 'h-11' : 'h-9 px-3.5'} rounded-xl border border-slate-300 bg-white text-sm font-bold whitespace-nowrap disabled:opacity-50`}>
          Calendar →
        </button>
      )}
          </>
  )
  return (
    <div className={`flex flex-col flex-1 min-h-0 ${phone ? 'gap-2.5' : 'gap-3'}`}>
      {phone
        ? (
          <div className="flex items-center justify-between gap-2">
            <b className="text-sm">{count} · {leave} leave</b>
            <div role="radiogroup" aria-label="Show plan as" className="flex p-0.5 rounded-lg bg-slate-100 text-[11.5px] font-bold">
              <button type="button" role="radio" aria-checked={!showCalendar} onClick={() => setShowCalendar(false)} className={`px-2 h-6 rounded-md ${showCalendar ? 'text-slate-600' : 'bg-white shadow'}`}>List</button>
              <button type="button" role="radio" aria-checked={showCalendar} onClick={() => setShowCalendar(true)} className={`px-2 h-6 rounded-md ${showCalendar ? 'bg-white shadow' : 'text-slate-600'}`}>Calendar</button>
            </div>
          </div>
        )
        : (
          // Desktop: a plain title and Add / Export; the plan's stats are in Details.
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="m-0 text-[17px] font-extrabold whitespace-nowrap">Your breaks</h3>
            <span className="text-[12.5px] text-slate-500">Untick any you don't want</span>
            <span className="ml-auto flex gap-2">{actions}</span>
          </div>
        )}
      {phone && <PlanStats breaks={chosen} total={breaks.length} compact />}
      {/* The table scrolls on its own (header row stays), so the page doesn't have to. */}
      <div className={phone ? 'flex-1 min-h-0 overflow-y-auto' : 'flex-1 min-h-[200px] overflow-y-auto rounded-xl border border-slate-100'}>
        {phone && showCalendar
          ? calendar
          : <PlannerTable breaks={breaks} startOptions={startOptions} ticked={ticked} onToggle={toggleTick} onSwap={swapStart} onHover={onHover} phone={phone} />}
      </div>
      {phone && <div className="flex gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
