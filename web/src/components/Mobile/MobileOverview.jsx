import { useEffect, useState } from 'react'
import { PlanIcon } from '../Desktop/Overview/PlanIcon'
import { PlanMonths } from '../Desktop/Overview/PlanMonths'
import { PlannerResults } from '../Desktop/Overview/PlannerResults'
import { PeriodDates } from '../Desktop/Overview/PeriodDates'
import { PERIOD_DESCRIPTIONS } from '../Desktop/Overview/periodThemes'
import { fmtShortRange } from '../../utils/dateFormat'
import { PlanSettingsSheet } from './PlanSettingsSheet'

// Short labels for the period slider.
const SHORT = { custom: 'Custom', next: 'Up next', xmas: 'Christmas', easter: 'Easter', school: 'School', three: '3 months', six: '6 months', rest: 'This year' }
const AIM_LABEL = { max: 'Maximise', mix: 'Mix', long: 'Longest' }

/**
 * The phone Overview: the period's card on top (name, description, dates, and a
 * Summary button), the plan underneath, and the period slider above the bottom
 * tabs. The slider starts with a "10 days | Mix" button that opens the plan
 * settings (days off limit, aim, Advanced), with a badge when Advanced options are on.
 *
 * Props: planner, isSaved, onAdd, onView, province, onProvinceChange,
 *        savedCount, onOpenSummary – the My breaks sheet
 */
export function MobileOverview({ planner, isSaved, onAdd, onView, province, onProvinceChange, savedCount, onOpenSummary }) {
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
            <button
              type="button"
              data-tour="summary"
              onClick={onOpenSummary}
              aria-label={`Summary: ${savedCount} break${savedCount === 1 ? '' : 's'}`}
              className="relative shrink-0 w-[58px] h-11 rounded-xl bg-sky-100 text-sky-800 flex flex-col items-center justify-center text-[10.5px] font-extrabold leading-tight"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="7" width="16" height="13" rx="2" /><path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" /></svg>
              Summary
              {savedCount > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-sky-500 border-2 border-white text-white text-[10px] leading-[14px]">{savedCount}</span>}
            </button>
          </div>
          {custom && <PeriodDates period={period} onChange={planner.changeDates} active />}
        </section>

        <section data-tour="results" aria-label="Your plan" className="flex-1 min-h-0 rounded-2xl bg-white shadow-sm p-3 flex flex-col">
          <PlannerResults
            phone
            planner={planner}
            isSaved={isSaved}
            onAdd={list => { onAdd(list); setAdded(list.length) }}
            onView={onView}
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
          aria-label={`Plan settings: ${planner.leaveLimit} days off limit, ${AIM_LABEL[planner.goal]}${planner.moreCount ? `, ${planner.moreCount} advanced options on` : ''}`}
          className="relative shrink-0 w-14 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center text-[10.5px] font-extrabold leading-tight"
        >
          <span>{planner.leaveLimit} days</span>
          <span aria-hidden="true" className="w-7 h-px bg-white/40 my-[3px]" />
          <span>{AIM_LABEL[planner.goal]}</span>
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
