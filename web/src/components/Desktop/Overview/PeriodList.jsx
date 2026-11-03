import { PlanIcon } from './PlanIcon'
import { StatTile } from '../StatTile'
import { StepHeading } from './StepHeading'
import { formatMultiplier } from '../../../utils/breaks'

// What each leave period means, in a few words.
const DESCRIPTIONS = {
  custom: 'Choose your own first and last day',
  next: 'The next public holiday',
  xmas: 'Christmas, Day of Goodwill & New Year',
  easter: 'Human Rights Day, Good Friday & Family Day',
  school: 'The next school holidays in your province',
  three: 'Every holiday from today',
  six: 'Every holiday from today',
  rest: "What's left of this year",
  year: 'Plan next year ahead',
}

// The card's plan at a glance: days off, multiplier, breaks and leave as small tiles.
function QuickStats({ stats }) {
  if (!stats || stats.breaks === 0) return null
  return (
    <span className="flex flex-wrap gap-[3px] mt-1" aria-label={`${stats.daysOff} days off, ${formatMultiplier(stats.multiplier)} multiplier, ${stats.breaks} breaks, ${stats.leave} leave days`}>
      <StatTile tiny kind="total" value={stats.daysOff} title="Days off" />
      <StatTile tiny kind="multiplier" value={formatMultiplier(stats.multiplier)} title="Multiplier" />
      <StatTile tiny kind="breaks" value={stats.breaks} title="Breaks" />
      <StatTile tiny kind="leave" value={stats.leave} title="Leave days used" />
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
        'w-full flex items-start gap-2.5 px-3 py-2.5 rounded-2xl text-left border-2 bg-white',
        selected ? 'border-slate-900 shadow-md' : kind === 'custom' ? 'border-dashed border-slate-300 hover:border-slate-400' : 'border-transparent shadow-sm hover:border-slate-300',
      ].join(' ')}
    >
      <PlanIcon kind={kind} size={30} />
      <span className="flex-1 min-w-0 flex flex-col">
        <span className="text-[13.5px] font-extrabold">{title}</span>
        <span className="text-[11.5px] leading-snug text-slate-600">{DESCRIPTIONS[kind]}</span>
        {subtitle && <span className="text-[11px] text-slate-400">{subtitle}</span>}
        <QuickStats stats={stats} />
      </span>
    </button>
  )
}

/**
 * Step 1 of the Overview planner: Custom first, then the ready-made leave
 * periods, each saying what it is, its dates, and its plan's quick stats.
 * The list scrolls on its own.
 *
 * Props:
 *   periods    – planPeriods() result
 *   selectedId – 'custom' or a period id
 *   onSelect   – (id) => void
 *   cardStats  – { [periodId]: { breaks, leave, daysOff, multiplier } }
 */
export function PeriodList({ periods, selectedId, onSelect, cardStats }) {
  return (
    <div className="w-[270px] shrink-0 flex flex-col gap-2 lg:h-full min-h-0">
      <div className="h-10 shrink-0 flex items-center"><StepHeading number={1}>Pick a leave period</StepHeading></div>
      <nav data-tour="period" aria-label="Leave periods" className="flex-1 min-h-0 flex flex-col gap-1.5 lg:overflow-y-auto lg:pr-1 lg:pb-2 [&>*]:shrink-0">
        <PeriodCard id="custom" kind="custom" title="Custom dates" selected={selectedId === 'custom'} onSelect={onSelect} />
        {periods.map(p => (
          <PeriodCard key={p.id} {...p} stats={cardStats[p.id]} selected={p.id === selectedId} onSelect={onSelect} />
        ))}
      </nav>
    </div>
  )
}
