import { PlanIcon } from './PlanIcon'
import { PERIOD_THEMES } from './periodThemes'

function PeriodCard({ id, kind, title, subtitle, selected, onSelect }) {
  return (
    <button
      type="button"
      aria-current={selected ? 'true' : undefined}
      onClick={() => onSelect(id)}
      className={[
        'relative overflow-hidden w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-left border-2',
        PERIOD_THEMES[kind],
        selected ? 'border-slate-900 shadow-md' : kind === 'custom' ? '' : 'border-transparent shadow-sm hover:border-slate-300',
      ].join(' ')}
    >
      <PlanIcon kind={kind} />
      <span className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className="text-sm font-extrabold truncate">{title}</span>
        <span className="text-xs text-slate-600 truncate">{subtitle}</span>
      </span>
    </button>
  )
}

/**
 * Step 1 of the Overview planner: Custom first, then the ready-made leave
 * periods as colourful themed cards, then the coming-soon Events row.
 *
 * Props:
 *   periods            – planPeriods() result
 *   selectedId         – 'custom', a period id, or 'events'
 *   onSelect           – (id) => void
 */
export function PeriodList({ periods, selectedId, onSelect }) {
  return (
    <nav aria-label="Leave periods" className="flex-[1_1_280px] max-w-[320px] min-w-0 flex flex-col gap-1.5">
      <h2 className="m-0 mb-0.5 text-xs font-extrabold text-slate-500 uppercase tracking-wide">1 · Pick a leave period</h2>
      <PeriodCard id="custom" kind="custom" title="Custom" subtitle="Choose your first and last day" selected={selectedId === 'custom'} onSelect={onSelect} />
      <span className="ml-1 text-[11px] font-bold text-slate-400">or pick one</span>
      {periods.map(p => (
        <PeriodCard key={p.id} {...p} selected={p.id === selectedId} onSelect={onSelect} />
      ))}
      <button
        type="button"
        aria-current={selectedId === 'events' ? 'true' : undefined}
        onClick={() => onSelect('events')}
        className={[
          'mt-1.5 w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-left border-2',
          selectedId === 'events' ? 'bg-teal-50 border-teal-600' : 'bg-white border-dashed border-slate-300 hover:border-slate-400',
        ].join(' ')}
      >
        <PlanIcon kind="events" />
        <span className="flex-1 min-w-0 flex flex-col gap-0.5">
          <span className="text-sm font-extrabold truncate">Events</span>
          <span className="text-xs text-slate-600 truncate">What's on during your breaks</span>
        </span>
        <span className="shrink-0 px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold">Coming soon</span>
      </button>
    </nav>
  )
}
