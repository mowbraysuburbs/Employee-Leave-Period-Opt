import { useState } from 'react'
import { PlanStats } from './PlanStats'
import { PlannerTable } from './PlannerTable'
import { PERIOD_DESCRIPTIONS } from './periodThemes'
import { fmtLongRange } from '../../../utils/dateFormat'

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

  const button = phone ? 'flex-1' : ''
  const actions = (
    <>
      <button
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
          // Desktop: a plain title and one Add to summary button (export is in the
          // Summary tab); the plan's stats are in Details. Then the dropdown note.
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
              <div className="flex-1 min-w-[124px]">
                <h3 className="m-0 text-[17px] leading-tight font-extrabold">{period.title}</h3>
                <span className="block text-[12px] leading-snug text-slate-500">
                  {[PERIOD_DESCRIPTIONS[period.kind], fmtLongRange(period.from, period.to)].filter(Boolean).join(' · ')}
                </span>
              </div>
              <button
                data-tour="plan-add"
                type="button"
                disabled={none || allSaved}
                onClick={() => onAdd(chosen)}
                className={`h-9 px-3 rounded-xl text-[13px] font-bold whitespace-nowrap disabled:opacity-50 ${allSaved ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-sky-700 text-white'}`}
              >
                {allSaved ? 'Added ✓' : `Add to summary (${chosen.length})`}
              </button>
            </div>
            {startOptions.some(o => o.length > 1) && (
              <p className="m-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-50 text-[12.5px] text-slate-700">
                <span aria-hidden="true" className="shrink-0 w-8 h-8 rounded-lg border border-sky-300 bg-white text-sky-700 flex items-center justify-center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg></span>
                <span>A <b>dropdown</b> on a start date means the break can start on other days for the same days off. Pick one; the end date follows.</span>
              </p>
            )}
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
