import { PlanIcon } from './PlanIcon'
import { PERIOD_THEMES } from './periodThemes'
import { StatTile } from '../StatTile'
import { formatMultiplier } from '../../../utils/breaks'

// The card's plan at a glance, in a 2×2 grid of the calendar's stat tiles.
function CardStats({ stats }) {
  if (!stats || stats.breaks === 0) return null
  return (
    <span className="shrink-0 grid grid-cols-2 gap-[3px]" aria-label={`${stats.breaks} breaks, ${stats.leave} leave days, ${stats.daysOff} days off, ${formatMultiplier(stats.multiplier)} multiplier`}>
      <StatTile tiny kind="breaks" value={stats.breaks} title="Breaks" />
      <StatTile tiny kind="leave" value={stats.leave} title="Leave days used" />
      <StatTile tiny kind="total" value={stats.daysOff} title="Days off" />
      <StatTile tiny kind="multiplier" value={formatMultiplier(stats.multiplier)} title="Multiplier" />
    </span>
  )
}

function PeriodCard({ id, kind, title, subtitle, stats, selected, onSelect }) {
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
      <CardStats stats={stats} />
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
 *   cardStats          – { [periodId]: { breaks, leave, daysOff, multiplier } }
 */
export function PeriodList({ periods, selectedId, onSelect, cardStats }) {
  return (
    <nav aria-label="Leave periods" className="flex-[1_1_300px] max-w-[330px] min-w-0 flex flex-col gap-1.5">
      <h2 className="m-0 mb-0.5 text-xs font-extrabold text-slate-500 uppercase tracking-wide">1 · Pick a leave period</h2>
      <PeriodCard id="custom" kind="custom" title="Custom" subtitle="Choose your first and last day" selected={selectedId === 'custom'} onSelect={onSelect} />
      <span className="ml-1 text-[11px] font-bold text-slate-400">or pick one</span>
      {periods.map(p => (
        <PeriodCard key={p.id} {...p} stats={cardStats[p.id]} selected={p.id === selectedId} onSelect={onSelect} />
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
