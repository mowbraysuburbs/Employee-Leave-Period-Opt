import { useState } from 'react'
import { PeriodList } from './PeriodList'
import { LeaveControl } from './LeaveControl'
import { GoalChoice } from './GoalChoice'
import { PlanMonths } from './PlanMonths'
import { MoreOptions } from './MoreOptions'
import { PlannerResults } from './PlannerResults'
import { CustomDates } from './CustomDates'
import { PlanTheme } from './PlanTheme'
import { STRIP_THEMES } from './periodThemes'
import { EventsComingSoon } from '../EventsComingSoon'

/**
 * The page the desktop app opens on: a three-step leave planner. Pick a leave
 * period on the left; leave days and how many breaks sit above the results,
 * which update straight away. More options drops down under the settings.
 *
 * Props:
 *   planner                    – usePlanner() result
 *   isSaved                    – (break) => bool
 *   onAdd, onExport, onView    – (breaks) => void
 *   province, onProvinceChange – school province
 */
export function OverviewPage({ planner, isSaved, onAdd, onExport, onView, province, onProvinceChange }) {
  const [showEvents, setShowEvents] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  // First month in the calendar column ('YYYY-MM'); null = the first break's month.
  const [calMonth, setCalMonth] = useState(null)
  const { period } = planner

  function select(id) {
    setShowEvents(id === 'events')
    setCalMonth(null)
    if (id !== 'events') planner.selectPeriod(id)
  }

  return (
    <>
      <section>
        <h1 className="m-0 text-[28px] leading-tight font-extrabold tracking-tight">Plan your leave</h1>
        <p className="m-0 mt-1.5 text-[15px] text-slate-600">Pick a period, how many leave days, and how many breaks.</p>
      </section>

      <div className="flex flex-wrap gap-[18px] items-start">
        <PeriodList periods={planner.periods} cardStats={planner.cardStats} selectedId={showEvents ? 'events' : period.id} onSelect={select} />
        {showEvents ? <EventsComingSoon /> : (
          <article aria-label={`Plan: ${period.title}`} className="relative overflow-hidden flex-[999_1_520px] min-w-0 rounded-[20px] shadow-sm bg-white">
            <div className={`relative px-[22px] py-4 flex flex-col gap-3.5 border-b border-slate-100 ${STRIP_THEMES[period.kind]}`}>
              <PlanTheme kind={period.kind} />
              {period.id === 'custom' && <CustomDates value={planner.custom} onChange={planner.setCustom} />}
              <div className="relative z-10 flex flex-wrap items-start justify-between gap-3">
                <LeaveControl value={planner.leave} max={planner.maxLeave} onChange={planner.setLeave} idPrefix="planner" />
                <button
                  type="button"
                  aria-expanded={moreOpen}
                  onClick={() => setMoreOpen(o => !o)}
                  className="h-9 px-3 rounded-xl border border-slate-300 bg-white text-[13px] font-extrabold whitespace-nowrap"
                >
                  Advanced options {moreOpen ? '▴' : '▾'}
                  {planner.moreCount > 0 && <span className="ml-1.5 px-1.5 rounded-md bg-sky-700 text-white text-[11px]">{planner.moreCount}</span>}
                </button>
              </div>
              <div className="relative z-10"><GoalChoice goals={planner.goals} value={planner.goal} onChange={planner.setGoal} /></div>
            </div>
            {moreOpen && <MoreOptions planner={planner} province={province} onProvinceChange={onProvinceChange} />}
            <div className="px-[22px] py-5">
              <PlannerResults planner={planner} isSaved={isSaved} onAdd={onAdd} onExport={onExport} onView={onView} onPick={b => setCalMonth(b.startDate.slice(0, 7))} />
            </div>
          </article>
        )}
        {!showEvents && planner.breaks.length > 0 && (
          <PlanMonths
            period={period}
            breaks={planner.breaks}
            ticked={planner.ticked}
            month={calMonth}
            onMonth={setCalMonth}
            onOpen={() => onView(planner.breaks.filter(b => planner.ticked.has(b.startDate)))}
          />
        )}
      </div>
    </>
  )
}
