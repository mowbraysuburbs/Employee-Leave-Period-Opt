import { useState } from 'react'
import { PeriodList } from './PeriodList'
import { LeaveControl } from './LeaveControl'
import { GoalChoice } from './GoalChoice'
import { PlanMonths, PlanKey } from './PlanMonths'
import { SidePanel } from '../SidePanel'
import { PanelCollapsed } from '../PanelCollapsed'
import { MoreOptions } from './MoreOptions'
import { PlannerResults } from './PlannerResults'
import { CustomDates } from './CustomDates'
import { PlanTheme } from './PlanTheme'
import { STRIP_THEMES } from './periodThemes'
import { EventsComingSoon } from '../EventsComingSoon'

/**
 * The page the desktop app opens on: a three-step leave planner. Pick a leave
 * period on the left; leave days and how many breaks sit above the results,
 * which update straight away. On the right, the same Details / Summary panel as
 * the calendar: Details shows the plan on a calendar, Summary is your breaks.
 *
 * Props:
 *   planner                    – usePlanner() result
 *   isSaved                    – (break) => bool
 *   onAdd, onExport, onView    – (breaks) => void
 *   province, onProvinceChange – school province
 *   savedCount, summary        – the Summary tab's count and panel (shared with the calendar)
 *   savedBreaks                – for the collapsed strip's Summary totals
 *   collapsed, onCollapsedChange – the panel collapsed to a strip (shared with the calendar)
 */
export function OverviewPage({ planner, isSaved, onAdd, onExport, onView, province, onProvinceChange, savedCount, summary, savedBreaks, collapsed, onCollapsedChange }) {
  const [showEvents, setShowEvents] = useState(false)
  const [tab, setTab] = useState('details')
  const [moreOpen, setMoreOpen] = useState(false)
  // The break whose table row is hovered, highlighted in the calendar column.
  const [hovered, setHovered] = useState(null)
  const { period } = planner

  function select(id) {
    setShowEvents(id === 'events')
    if (id !== 'events') planner.selectPeriod(id)
  }

  return (
    <>

      {/* Same layout as the calendar: on wide screens one screen tall, each column scrolling on its own. */}
      <div className="flex flex-wrap gap-5 items-start lg:flex-nowrap lg:items-stretch lg:h-full">
        <PeriodList periods={planner.periods} cardStats={planner.cardStats} selectedId={showEvents ? 'events' : period.id} onSelect={select} />
        {showEvents ? <EventsComingSoon /> : (
          <article aria-label={`Plan: ${period.title}`} className="relative overflow-hidden flex-[999_1_520px] min-w-0 rounded-[20px] shadow-sm bg-white flex flex-col">
            <div className={`relative px-[22px] py-3 flex flex-col gap-2 border-b border-slate-100 ${STRIP_THEMES[period.kind]}`}>
              <PlanTheme kind={period.kind} />
              {period.id === 'custom' && <CustomDates value={planner.custom} onChange={planner.setCustom} />}
              {/* Step 2 with Advanced options on the right, then step 3 with the gap rule after it. */}
              <div className="relative z-10 flex items-center gap-3">
                <LeaveControl value={planner.leave} max={planner.maxLeave} limit={planner.leaveLimit} onLimitChange={planner.setLeaveLimit} onChange={planner.setLeave} idPrefix="planner" />
                <button
                  type="button"
                  aria-expanded={moreOpen}
                  onClick={() => setMoreOpen(o => !o)}
                  className="ml-auto self-start h-8 px-3 rounded-xl border border-slate-300 bg-white text-[13px] font-extrabold whitespace-nowrap"
                >
                  Advanced options {moreOpen ? '▴' : '▾'}
                  {planner.moreCount > 0 && <span className="ml-1.5 px-1.5 rounded-md bg-sky-700 text-white text-[11px]">{planner.moreCount}</span>}
                </button>
              </div>
              <div className="relative z-10 flex flex-wrap items-center gap-x-3 gap-y-1">
                <GoalChoice goals={planner.goals} value={planner.goal} onChange={planner.setGoal} />
                <span className="text-[11px] text-slate-600" title="Hover a choice to see its result">↔ Breaks ≥ one working week apart</span>
              </div>
            </div>
            {moreOpen && <MoreOptions planner={planner} province={province} onProvinceChange={onProvinceChange} />}
            <div className="px-[22px] py-4 flex-1 min-h-0 flex flex-col">
              <PlannerResults planner={planner} isSaved={isSaved} onAdd={list => { onAdd(list); setTab('summary') }} onExport={onExport} onView={onView} onHover={setHovered} />
            </div>
          </article>
        )}
        {collapsed ? (
          <PanelCollapsed
            tab={tab}
            onTabChange={setTab}
            onExpand={onTab => {
              onCollapsedChange(false)
              if (onTab) setTab(onTab)
            }}
            planBreaks={planner.breaks.filter(b => planner.ticked.has(b.startDate))}
            savedBreaks={savedBreaks}
          />
        ) : (
          // Same as the calendar: a "Collapse to icons" bar above the panel.
          <div className="w-[300px] xl:w-[340px] shrink-0 h-full flex flex-col gap-2">
            <button
              type="button"
              onClick={() => onCollapsedChange(true)}
              aria-label="Collapse details and summary"
              className="shrink-0 h-7 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-bold"
            >
              Collapse to icons »
            </button>
            <SidePanel
              width="w-full flex-1 min-h-0"
              tab={tab}
              onTabChange={setTab}
              savedCount={savedCount}
              head={tab === 'details' && (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={!planner.breaks.some(b => planner.ticked.has(b.startDate))}
                    onClick={() => onView(planner.breaks.filter(b => planner.ticked.has(b.startDate)))}
                    className="h-10 rounded-xl bg-sky-700 text-white text-sm font-bold disabled:opacity-50"
                  >
                    Go to calendar →
                  </button>
                  <PlanKey />
                </div>
              )}
              details={planner.breaks.length > 0
                ? <PlanMonths bare period={period} breaks={planner.breaks} ticked={planner.ticked} highlight={hovered} />
                : <p className="m-0 text-sm text-slate-600">No breaks to show for these settings.</p>}
              summary={summary}
            />
          </div>
        )}
      </div>
    </>
  )
}
