import { useState } from 'react'
import { StatTile } from '../StatTile'
import { summarise } from '../../../utils/planner'
import { formatMultiplier } from '../../../utils/breaks'
import { PlannerTable } from './PlannerTable'
import { CustomOptionsTable } from './CustomOptionsTable'
import { RecLine } from './RecLine'
import { PERIOD_DESCRIPTIONS } from './periodThemes'
import { fmtLongRange } from '../../../utils/dateFormat'

/**
 * The plan the planner found: a title, the line under it (long break or best
 * multiplier, see RecLine), the breaks table, and Add / Export
 * (plus View on calendar on phones). Desktop shows the plan's stats in Details.
 *
 * Props:
 *   planner                 – usePlanner() result
 *   isSaved                 – (break) => bool
 *   onAdd, onView           – (tickedBreaks) => void (View is phone only; desktop has it in Details)
 *   onHover                 – optional (startDate | null) => void as a row is hovered
 *   onRaiseLimit, onOpenSummary – the buttons when your whole limit is in the Summary
 *   calendar                – phone only: the 2-month view, shown instead of the table when switched on
 *   phone
 */
// Your whole limit is in the Summary: one message, with the two ways out.
function NoLeaveLeft({ planner, onRaiseLimit, onOpenSummary }) {
  const btn = 'h-9 px-3.5 rounded-xl text-[13px] font-extrabold'
  return (
    <div role="status" className="m-3 p-5 border-[1.5px] border-dashed border-slate-300 rounded-2xl flex flex-col items-center gap-2 text-center">
      <b className="text-[15px]">All {planner.leaveLimit} leave day{planner.leaveLimit === 1 ? ' is' : 's are'} in your Summary</b>
      <span className="text-sm text-slate-600">You can still look around the periods, but there's nothing left to plan with.</span>
      <div className="flex gap-2 mt-1">
        {onRaiseLimit && <button type="button" onClick={onRaiseLimit} className={`${btn} bg-sky-700 text-white`}>Raise my limit</button>}
        {onOpenSummary && <button type="button" onClick={onOpenSummary} className={`${btn} border-[1.5px] border-slate-300 text-slate-800`}>Open Summary</button>}
      </div>
    </div>
  )
}

// Why a list period has nothing to pick from.
function customEmpty(planner, actions) {
  if (planner.leaveLeft === 0) return <NoLeaveLeft planner={planner} {...actions} />
  return <p className="m-3 p-5 border-[1.5px] border-dashed border-slate-300 rounded-2xl text-sm text-slate-600 text-center">No breaks fit these settings. Try fewer leave days, or avoid fewer months.</p>
}

// More columns (Around, Weekends used, Free days): remembered between visits.
const MORE_KEY = 'stretchmyleave.moreColumns'
function initialMore() {
  try { return localStorage.getItem(MORE_KEY) === 'true' } catch { return false }
}

export function PlannerResults({ planner, isSaved, onAdd, onView, onUseRest, onHover, onRaiseLimit, onOpenSummary, calendar, phone = false }) {
  const [more, setMore] = useState(initialMore)
  const toggleMore = () => setMore(m => {
    try { localStorage.setItem(MORE_KEY, String(!m)) } catch { /* not remembered */ }
    return !m
  })
  const noLeaveActions = { onRaiseLimit, onOpenSummary }
  const [showCalendar, setShowCalendar] = useState(false)
  const { period, breaks, startOptions, ticked, toggleTick, swapStart } = planner
  const chosen = breaks.filter(b => ticked.has(b.startDate))
  const none = chosen.length === 0
  const allSaved = !none && chosen.every(isSaved)
  const count = planner.listMode
    ? `${breaks.length} picked`
    : breaks.length === 1 ? '1 break' : `${breaks.length} breaks`

  // Custom, Easter and Christmas keep their title and say why the list is empty (see customEmpty).
  if (!planner.listMode && breaks.length === 0) {
    if (planner.leaveLeft === 0) return <NoLeaveLeft planner={planner} {...noLeaveActions} />
    return (
      <div className="p-5 border-[1.5px] border-dashed border-slate-300 rounded-2xl text-sm text-slate-600 text-center">
        No breaks fit these settings. Try more leave days, or avoid fewer months.
      </div>
    )
  }

  // Phones: Add to summary and a jump to the calendar, under the table.
  const actions = (
    <>
      <button
        type="button"
        disabled={none || allSaved}
        onClick={() => onAdd(chosen)}
        className={`flex-[1.6] h-11 rounded-xl text-sm font-bold whitespace-nowrap disabled:opacity-50 ${allSaved ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-sky-700 text-white'}`}
      >
        {allSaved ? 'Added ✓' : `Add to summary (${chosen.length})`}
      </button>
      <button type="button" disabled={none} onClick={() => onView(chosen)} className="flex-1 h-11 rounded-xl border border-slate-300 bg-white text-sm font-bold whitespace-nowrap disabled:opacity-50">
        Calendar →
      </button>
    </>
  )
  const t = summarise(chosen)
  return (
    <div className={`flex flex-col flex-1 min-h-0 ${phone ? 'gap-2.5' : 'gap-3'}`}>
      {phone
        ? (
          <div className="flex items-center justify-between gap-2">
            <b className="text-sm">{count}</b>
            <div role="radiogroup" aria-label="Show plan as" className="flex p-0.5 rounded-lg bg-slate-100 text-[11.5px] font-bold">
              <button type="button" role="radio" aria-checked={!showCalendar} onClick={() => setShowCalendar(false)} className={`px-2 h-6 rounded-md ${showCalendar ? 'text-slate-600' : 'bg-white shadow'}`}>List</button>
              <button type="button" role="radio" aria-checked={showCalendar} onClick={() => setShowCalendar(true)} className={`px-2 h-6 rounded-md ${showCalendar ? 'bg-white shadow' : 'text-slate-600'}`}>Calendar</button>
            </div>
          </div>
        )
        : (
          // Desktop: a plain title and one Add to summary button (export is in the
          // Summary tab); the plan's stats are in Details. The dropdown note is under the table.
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
              <div className="flex-1 min-w-[124px]">
                <h3 className="m-0 text-[17px] leading-tight font-extrabold">{period.title}</h3>
                <span className="block text-[12px] leading-snug text-slate-500">
                  {[PERIOD_DESCRIPTIONS[period.kind], fmtLongRange(period.from, period.to)].filter(Boolean).join(' · ')}
                </span>
              </div>
              <button
                type="button"
                aria-pressed={more}
                onClick={toggleMore}
                title="Around, weekends used and free days"
                className={`h-9 px-3 rounded-xl border-[1.5px] text-[12.5px] font-bold whitespace-nowrap ${more ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-500'}`}
              >
                {more ? 'Fewer columns' : 'More columns'}
              </button>
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
            <RecLine planner={planner} onUseRest={onUseRest} />
          </div>
        )}
      {phone && <RecLine phone planner={planner} onUseRest={onUseRest} />}
      {/* Phones: the plan's stats as the calendar's four tiles (desktop shows them in Details). */}
      {phone && (
        <div className="grid grid-cols-4 gap-1.5">
          <StatTile kind="leave" value={t.leave} caption="leave" />
          <StatTile kind="free" value={`+${t.daysOff - t.leave}`} caption="free" />
          <StatTile kind="total" value={t.daysOff} caption="days off" />
          <StatTile kind="multiplier" value={formatMultiplier(t.multiplier)} caption="mult." />
        </div>
      )}
      {/* The table scrolls on its own (header row stays), so the page doesn't have to. */}
      <div className={phone ? 'flex-1 min-h-0 overflow-y-auto' : 'flex-1 min-h-[200px] overflow-auto rounded-xl border border-slate-100'}>
        {phone && showCalendar
          ? calendar
          : planner.listMode
            ? (planner.options.length ? <CustomOptionsTable planner={planner} onHover={onHover} more={more} phone={phone} /> : customEmpty(planner, noLeaveActions))
            : <PlannerTable breaks={breaks} startOptions={startOptions} ticked={ticked} onToggle={toggleTick} onSwap={swapStart} onHover={onHover} more={more} phone={phone} />}
      </div>
      {/* Desktop: the dropdown note, fixed under the table (rows scroll above it). */}
      {!phone && startOptions.some(o => o.length > 1) && (
        <p className="m-0 shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-sky-50 text-[12.5px] text-slate-700">
          <span aria-hidden="true" className="shrink-0 w-8 h-8 rounded-lg border border-sky-300 bg-white text-sky-700 flex items-center justify-center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg></span>
          <span>A <b>dropdown</b> on a start date means the break can start on other days for the same days off. Pick one; the end date follows.</span>
        </p>
      )}
      {phone && <div data-tour="plan-add" className="flex gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
