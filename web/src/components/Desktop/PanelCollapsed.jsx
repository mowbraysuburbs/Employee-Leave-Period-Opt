import { StatTile } from './StatTile'
import { formatMultiplier, summariseBreaks } from '../../utils/breaks'
import { fmtNumericRange } from '../../utils/dateFormat'

// Details / Summary as two small tab buttons.
function TabButton({ on, label, children, onClick }) {
  return (
    <button type="button" role="tab" aria-selected={on} aria-label={label} title={label} onClick={onClick} className={`w-11 py-1.5 rounded-[10px] text-[10px] font-extrabold leading-tight ${on ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
      {children}
    </button>
  )
}

/**
 * The Details / Summary panel collapsed to a slim strip on the right, built like
 * the collapsed left rail: « opens it again, and the tiles keep the numbers in
 * view. Details shows the clicked break (dates as numbers, its four stats, and
 * ⇆ with how many start dates give the same break); Summary shows your saved breaks' totals.
 *
 * Props:
 *   tab, onTabChange   – 'details' | 'summary'
 *   onExpand           – opens the full panel (optionally on a tab)
 *   brk                – the Details break, or null
 *   flexibleStarts     – how many start dates give the same break (1 = none)
 *   savedBreaks
 */
export function PanelCollapsed({ tab, onTabChange, onExpand, brk, flexibleStarts, savedBreaks }) {
  const totals = summariseBreaks(savedBreaks)
  const range = brk && fmtNumericRange(brk.startDate, brk.endDate)

  return (
    <aside aria-label="Details and summary (collapsed)" className="w-[60px] shrink-0 h-full overflow-y-auto flex flex-col items-center gap-1.5 py-2 bg-white rounded-2xl shadow-sm">
      <button type="button" onClick={() => onExpand()} aria-label="Expand details and summary" title="Expand" className="w-10 h-9 rounded-[10px] bg-slate-900 text-white text-[15px] font-bold">«</button>
      <span aria-hidden="true" className="w-8 h-px bg-slate-200 my-0.5" />
      <div role="tablist" aria-label="Side panel" className="flex flex-col gap-1">
        <TabButton on={tab === 'details'} label="Details" onClick={() => onTabChange('details')}>Details</TabButton>
        <TabButton on={tab === 'summary'} label={`Summary, ${savedBreaks.length} breaks`} onClick={() => onTabChange('summary')}>
          Sum.<br /><span className="text-[12px]">{savedBreaks.length}</span>
        </TabButton>
      </div>
      <span aria-hidden="true" className="w-8 h-px bg-slate-200 my-0.5" />

      {tab === 'details' && (brk ? (
        <>
          {/* Dates as numbers: "12–17 / Dec", or "30–4 / Dec–Jan" when it runs into the next month. */}
          <button type="button" onClick={() => onExpand('details')} aria-label={`Break ${range.days} ${range.months}`} className="w-11 py-1 rounded-[10px] border border-slate-300 text-center leading-tight">
            <span className="block text-[12px] font-extrabold">{range.days}</span>
            <span className="block text-[9.5px] font-bold text-slate-500">{range.months}</span>
          </button>
          <StatTile stacked kind="leave" value={brk.leaveDays} title={`${brk.leaveDays} leave days`} onClick={() => onExpand('details')} />
          <StatTile stacked kind="free" value={`+${brk.daysOff - brk.leaveDays}`} title={`${brk.daysOff - brk.leaveDays} free days`} onClick={() => onExpand('details')} />
          <StatTile stacked kind="total" value={brk.daysOff} title={`${brk.daysOff} days off`} onClick={() => onExpand('details')} />
          <StatTile stacked kind="multiplier" value={formatMultiplier(brk.multiplier)} title={`${formatMultiplier(brk.multiplier)} multiplier`} onClick={() => onExpand('details')} />
          {flexibleStarts > 1 && (
            <button type="button" onClick={() => onExpand('details')} title="Flexible start: other start dates give the same days off" aria-label={`Flexible start: ${flexibleStarts} start dates give the same days off`} className="w-11 py-1.5 rounded-[10px] bg-sky-50 text-sky-800 flex flex-col items-center gap-0.5">
              <span className="text-[14px] font-extrabold leading-none">⇆</span>
              <span className="text-[11px] font-extrabold leading-none">{flexibleStarts}</span>
            </button>
          )}
        </>
      ) : (
        <span className="px-1 text-[10px] text-slate-500 text-center leading-tight">Click a day</span>
      ))}

      {tab === 'summary' && (savedBreaks.length ? (
        <>
          <StatTile stacked kind="breaks" value={savedBreaks.length} title={`${savedBreaks.length} breaks`} onClick={() => onExpand('summary')} />
          <StatTile stacked kind="leave" value={totals.leaveUsed} title={`${totals.leaveUsed} leave used`} onClick={() => onExpand('summary')} />
          <StatTile stacked kind="total" value={totals.daysOff} title={`${totals.daysOff} days off`} onClick={() => onExpand('summary')} />
          <StatTile stacked kind="multiplier" value={formatMultiplier(totals.multiplier)} title={`${formatMultiplier(totals.multiplier)} overall multiplier`} onClick={() => onExpand('summary')} />
        </>
      ) : (
        <span className="px-1 text-[10px] text-slate-500 text-center leading-tight">No breaks yet</span>
      ))}
    </aside>
  )
}
