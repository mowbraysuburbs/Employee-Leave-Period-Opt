import { PlanTheme } from './PlanTheme'
import { PlanStats } from './PlanStats'
import { PlanBreaksTable } from './PlanBreaksTable'
import { PlanBreaksTablePhone } from './PlanBreaksTablePhone'
import { BreakWeeks } from '../BreakWeeks'
import { BreakDaysTable } from '../BreakDaysTable'

// Panel colours per plan kind; kinds without a theme stay plain white.
const THEME_CLASSES = {
  xmas: 'bg-[#FFF8F8] border-red-200',
  easter: 'bg-[#FCFAFF] border-purple-200',
  school: 'bg-[#F7FBFF] border-sky-200',
  trip: 'bg-[#FFFDF5] border-amber-200',
  next: 'bg-[#FFF9FC] border-pink-200',
}

/**
 * Right-hand panel of the Overview: the selected plan in full. Multi-break
 * plans get tick boxes, and the stats and buttons follow what's ticked.
 *
 * Props:
 *   plan                    – { kind, title, rule, blurb, summary, breaks }
 *   ticked                  – Set of ticked break start dates
 *   onToggle, onToggleAll
 *   allSaved                – every ticked break is already in My breaks
 *   onAdd, onExport, onView – (tickedBreaks) => void
 *   topSlot                 – optional controls under the description (School run's province)
 *   phone                   – use the phone table (dates fixed, numbers scroll sideways)
 */
export function PlanDetails({ plan, ticked, onToggle, onToggleAll, allSaved, onAdd, onExport, onView, topSlot, phone = false }) {
  const chosen = plan.breaks.filter(b => ticked.has(b.startDate))
  const single = plan.breaks.length === 1
  const none = chosen.length === 0

  return (
    <article
      aria-label={plan.title}
      className={`relative overflow-hidden flex-[999_1_480px] min-w-0 rounded-[20px] shadow-sm border ${phone ? 'p-4 h-full flex flex-col' : 'p-[22px]'} ${THEME_CLASSES[plan.kind] ?? 'bg-white border-transparent'}`}
    >
      <PlanTheme kind={plan.kind} />
      <div className={`relative z-10 flex flex-col ${phone ? 'gap-3 flex-1 min-h-0' : 'gap-4'}`}>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="m-0 text-[22px] font-extrabold tracking-tight">{plan.title}</h2>
            {!phone && <span className="px-2.5 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-600 text-xs font-bold whitespace-nowrap">{plan.rule}</span>}
          </div>
          {/* Phones get a one-sentence summary instead of the rule pill and longer blurb. */}
          {phone
            ? <p className="m-0 mt-1 text-[13px] text-slate-600 leading-snug">{plan.summary}</p>
            : <p className="m-0 mt-1.5 text-sm text-slate-600 leading-relaxed max-w-[600px]">{plan.blurb}</p>}
        </div>

        {topSlot}

        <PlanStats breaks={chosen} total={plan.breaks.length} compact={phone} />

        {/* On phones only the breaks scroll, so the title, stats and buttons stay on screen. */}
        {phone ? (
          <div className="flex-1 min-h-0 overflow-y-auto rounded-2xl">
            {single ? (
              <div className="bg-white rounded-xl px-2"><BreakDaysTable brk={plan.breaks[0]} /></div>
            ) : (
              <PlanBreaksTablePhone breaks={plan.breaks} ticked={ticked} onToggle={onToggle} onToggleAll={onToggleAll} />
            )}
          </div>
        ) : single ? (
          <div className="flex flex-wrap gap-4">
            <div className="flex-[1_1_260px] min-w-0 bg-white rounded-2xl">
              <BreakWeeks brk={plan.breaks[0]} />
            </div>
            <div className="flex-[1_1_260px] min-w-0 bg-white rounded-xl px-2">
              <BreakDaysTable brk={plan.breaks[0]} />
            </div>
          </div>
        ) : (
          <PlanBreaksTable breaks={plan.breaks} ticked={ticked} onToggle={onToggle} onToggleAll={onToggleAll} />
        )}

        <div className={`flex gap-2 ${phone ? 'shrink-0' : 'flex-wrap'}`}>
          <button
            type="button"
            disabled={none || allSaved}
            onClick={() => onAdd(chosen)}
            className={`${phone ? 'flex-1' : 'flex-[1_1_170px]'} h-11 rounded-xl text-sm font-bold whitespace-nowrap disabled:opacity-50 ${allSaved ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-sky-700 text-white'}`}
          >
            {allSaved ? 'Added ✓' : single || phone ? `Add${single ? '' : ` (${chosen.length})`}` : `Add selected (${chosen.length})`}
          </button>
          <button
            type="button"
            disabled={none}
            onClick={() => onExport(chosen)}
            className={`${phone ? 'flex-1' : 'flex-[1_1_150px]'} h-11 rounded-xl bg-slate-900 text-white text-sm font-bold whitespace-nowrap disabled:opacity-50`}
          >
            {phone ? 'Export' : 'Export (.ics)'}
          </button>
          <button
            type="button"
            disabled={none}
            onClick={() => onView(chosen)}
            className={`${phone ? 'flex-1' : 'flex-[1_1_150px]'} h-11 rounded-xl border border-slate-300 bg-white text-sm font-bold whitespace-nowrap disabled:opacity-50`}
          >
            {phone ? 'Calendar →' : 'View on calendar →'}
          </button>
        </div>
      </div>
    </article>
  )
}
