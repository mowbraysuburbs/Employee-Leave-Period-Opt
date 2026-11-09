import { useEffect, useState } from 'react'
import { PlanIcon } from '../Desktop/Overview/PlanIcon'
import { PlanMonths } from '../Desktop/Overview/PlanMonths'
import { PlannerResults } from '../Desktop/Overview/PlannerResults'
import { PeriodMonths } from '../Desktop/Overview/PeriodMonths'
import { PERIOD_DESCRIPTIONS } from '../Desktop/Overview/periodThemes'
import { fmtShortRange } from '../../utils/dateFormat'
import { PlanSettingsSheet } from './PlanSettingsSheet'

// Short labels for the period slider.
const SHORT = { custom: 'Custom', next: 'Up next', xmas: 'Christmas', easter: 'Easter', school: 'School' }

/**
 * The phone Overview: the period's card on top (name, description and dates;
 * Summary is in the header), the plan underneath, and the period slider above the bottom
 * tabs. The slider starts with a "10 days" button that opens the plan
 * settings (days off limit, Advanced), with a badge when Advanced options are on.
 *
 * Props: planner, isSaved, onAdd, onView, onUseRest, province, onProvinceChange,
 *        onOpenSummary – the My breaks sheet (from the Added note)
 */
export function MobileOverview({ planner, isSaved, onAdd, onView, onUseRest, province, onProvinceChange, onOpenSummary }) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  // "Added N breaks · View summary" for a few seconds after adding.
  const [added, setAdded] = useState(0)
  useEffect(() => {
    if (!added) return
    const id = setTimeout(() => setAdded(0), 4000)
    return () => clearTimeout(id)
  }, [added])
  const { period } = planner
  const strip = [{ id: 'custom', kind: 'custom', title: 'Custom' }, ...planner.periods]
  const custom = period.id === 'custom'

  return (
    <>
      <main className="relative flex-1 min-h-0 p-2.5 flex flex-col gap-2">
        <section aria-label="Leave period" className="shrink-0 rounded-2xl bg-white shadow-sm px-3 py-2.5 flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <PlanIcon kind={period.kind} size={36} />
            <div className="flex-1 min-w-0">
              <h1 className="m-0 text-[15px] font-extrabold truncate">{period.title}</h1>
              <p className="m-0 text-[11.5px] leading-snug text-slate-500">
                {[PERIOD_DESCRIPTIONS[period.kind], fmtShortRange(period.from, period.to)].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
          {custom && <PeriodMonths idPrefix="mobile-overview" period={period} choices={planner.monthChoices} onChange={planner.changeMonths} active />}
        </section>

        <section data-tour="results" aria-label="Your plan" className="flex-1 min-h-0 rounded-2xl bg-white shadow-sm p-3 flex flex-col">
          <PlannerResults
            phone
            planner={planner}
            isSaved={isSaved}
            onAdd={list => { planner.markAdded(list); onAdd(list); setAdded(list.length) }}
            onView={onView}
            onUseRest={onUseRest}
            calendar={<PlanMonths phone period={period} breaks={planner.breaks} ticked={planner.ticked} />}
          />
        </section>

        {added > 0 && (
          <div role="status" className="absolute left-3 right-3 bottom-[76px] z-20 flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-slate-900 text-white text-[13px] shadow-lg">
            <span>✓ Added {added} break{added === 1 ? '' : 's'}</span>
            <button type="button" onClick={() => { setAdded(0); onOpenSummary() }} className="ml-auto font-extrabold text-sky-300">View summary</button>
          </div>
        )}
      </main>

      {/* The settings button stays put; only the periods slide. */}
      <div className="shrink-0 flex items-stretch gap-1 pl-2 pt-1.5 pb-1 bg-white border-t border-slate-200">
        <button
          type="button"
          data-tour="settings"
          onClick={() => setSettingsOpen(true)}
          aria-label={`Plan settings: ${planner.leaveLimit} days off limit${planner.moreCount ? `, ${planner.moreCount} advanced options on` : ''}`}
          className="relative shrink-0 w-14 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center text-[10.5px] font-extrabold leading-tight"
        >
          <span className="text-[15px] leading-none">{planner.leaveLimit}</span>
          <span>days</span>
          {planner.moreCount > 0 && <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-sky-500 border-2 border-white text-[9.5px] leading-[13px]">{planner.moreCount}</span>}
        </button>
        <span aria-hidden="true" className="shrink-0 w-px bg-slate-200 mx-0.5" />
        <nav data-tour="period" aria-label="Leave periods" className="flex-1 min-w-0 flex gap-1 items-stretch overflow-x-auto pr-2 [scrollbar-width:none]">
        {strip.map(p => {
          const on = p.id === period.id
          return (
            <button
              key={p.id}
              type="button"
              aria-label={p.title}
              aria-pressed={on}
              onClick={() => planner.selectPeriod(p.id)}
              className={`shrink-0 w-14 pt-0.5 pb-px rounded-xl border-2 flex flex-col items-center gap-px ${on ? 'border-slate-900 bg-slate-50' : 'border-transparent text-slate-700'}`}
            >
              <PlanIcon kind={p.kind} size={24} />
              <span className="text-[9.5px] font-bold whitespace-nowrap">{SHORT[p.kind] ?? p.title}</span>
            </button>
          )
        })}
        </nav>
      </div>

      {settingsOpen && (
        <PlanSettingsSheet planner={planner} province={province} onProvinceChange={onProvinceChange} onClose={() => setSettingsOpen(false)} />
      )}
    </>
  )
}
