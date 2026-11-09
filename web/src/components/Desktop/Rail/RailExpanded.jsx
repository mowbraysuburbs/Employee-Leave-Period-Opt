import { LeaveCard } from '../LeaveCard'
import { PeriodPicker } from '../PeriodPicker'
import { HolidayFilterMenu } from '../HolidayFilterMenu'
import { ProvincePicker } from '../ProvincePicker'
import { SwitchRow } from '../SwitchRow'

const MODES = [
  { id: 'daysOff', label: 'Total days' },
  { id: 'multiplier', label: 'Multiplier' },
]

const card = 'bg-white rounded-2xl p-3 shadow-sm flex flex-col gap-2'
function helpText(colourBy, picksOnly, leaveDays) {
  if (picksOnly) return 'Showing only your breaks.'
  if (colourBy === 'multiplier') return `Best deal using up to ${leaveDays} leave days.`
  return 'Days off if leave starts that day. Click numbers to filter.'
}

/**
 * The calendar's control column, fully open. See ControlRail for props.
 */
export function RailExpanded({ c }) {
  // The days-off filter only applies in Days off mode for now.
  const filterable = c.colourBy === 'daysOff' && !c.picksOnly
  const filtering = filterable && c.daysOffFilter.length > 0

  return (
    <aside aria-label="Calendar controls" className="w-[236px] shrink-0 h-full overflow-y-auto flex flex-col gap-2 pr-1">
      <button
        type="button"
        data-tour="collapse"
        onClick={c.onToggleCollapsed}
        className="shrink-0 h-7 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-bold"
      >
        « Collapse to icons
      </button>

      <LeaveCard c={c} />

      <section data-tour="colours" className={card}>
        {/* Clear filter sits beside the heading, so it never moves the card. */}
        <div className="h-5 flex items-center justify-between">
          <span className="text-[13px] font-bold">Colour by</span>
          {filtering && <button type="button" onClick={c.onClearDaysOff} className="text-xs font-bold text-sky-700">Clear filter</button>}
        </div>
        <div role="group" aria-label="Colour by" className="flex p-[3px] rounded-[10px] bg-slate-100">
          {MODES.map(m => (
            <button
              key={m.id}
              type="button"
              aria-pressed={c.colourBy === m.id}
              onClick={() => c.onColourByChange(m.id)}
              className={`flex-1 h-8 rounded-lg text-[13px] font-bold ${c.colourBy === m.id ? 'bg-white shadow' : 'text-slate-600'}`}
            >
              {m.label}
            </button>
          ))}
        </div>
        {/* Fixed heights (two lines of help, two rows of chips) so the
            card never grows or shrinks as the leave days, colouring or filter change. */}
        <p className="m-0 min-h-8 text-xs text-slate-600">{helpText(c.colourBy, c.picksOnly, c.leaveDays)}</p>
        <div className="h-[52px] flex flex-wrap content-start gap-1 overflow-hidden">
          {c.legend.map(l => {
            const chip = 'min-w-[26px] h-6 px-1 rounded-full inline-flex items-center justify-center text-[11px] font-bold text-slate-900'
            if (!filterable) return <span key={l.label} className={chip} style={{ backgroundColor: l.colour }}>{l.label}</span>
            const on = c.daysOffFilter.includes(l.value)
            return (
              <button
                key={l.label}
                type="button"
                aria-pressed={on}
                aria-label={`${on ? 'Hide' : 'Show only'} days with ${l.label} days off`}
                onClick={() => c.onToggleDaysOff(l.value)}
                className={`${chip} ${on ? 'ring-2 ring-slate-900 ring-offset-1' : filtering ? 'opacity-30' : ''}`}
                style={{ backgroundColor: l.colour }}
              >
                {l.label}
              </button>
            )
          })}
        </div>
      </section>

      <section data-tour="dates" className={card}>
        <PeriodPicker idPrefix="rail-period" {...c.period} />
      </section>

      <section data-tour="show" className={card}>
        <div className="text-[13px] font-bold">Show</div>
        <HolidayFilterMenu inline options={c.holidayOptions} selected={c.holidayFilter} onChange={c.onHolidayFilterChange} />
        <SwitchRow label="Leave fills a gap" on={c.gapOnly} onChange={c.onGapOnlyChange} />
        {c.previewCount > 0 && <SwitchRow label={`Only plan dates (${c.previewCount})`} on={c.previewOnly} onChange={c.onPreviewOnlyChange} />}
        <SwitchRow label={`Selected breaks (${c.savedCount})`} on={c.picksOnly} onChange={c.onPicksOnlyChange} />
        <SwitchRow label="School holidays" ariaLabel={`School holidays · ${c.provinceName}`} on={c.schoolOn} onChange={c.onSchoolOnChange} />
        <div className="flex items-center justify-between gap-2 -mt-1 text-xs text-slate-600">
          Province
          <div className="w-[96px] shrink-0">
            <ProvincePicker compact id="rail-province" value={c.province} onChange={c.onProvinceChange} />
          </div>
        </div>
      </section>
      <button
        type="button"
        onClick={c.onClearAll}
        disabled={!c.activeCount}
        className="shrink-0 mt-auto h-9 rounded-xl border border-red-300 bg-white text-red-700 text-[13px] font-bold disabled:border-slate-200 disabled:text-slate-300"
      >
        {c.activeCount ? `✕ Clear filters (${c.activeCount})` : 'No filters on'}
      </button>
    </aside>
  )
}
