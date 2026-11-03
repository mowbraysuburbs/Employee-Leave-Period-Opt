import { LeaveCard } from '../LeaveCard'
import { PeriodPicker } from '../PeriodPicker'
import { HolidayFilterMenu } from '../HolidayFilterMenu'
import { ProvincePicker } from '../ProvincePicker'

const MODES = [
  { id: 'daysOff', label: 'Total days' },
  { id: 'multiplier', label: 'Multiplier' },
]

const card = 'bg-white rounded-2xl p-3 shadow-sm flex flex-col gap-2'
const toggle = on => [
  'w-full min-h-9 px-3 py-1.5 rounded-lg text-left text-[13px] font-semibold border',
  on ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-300',
].join(' ')

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
        <div className="text-[13px] font-bold">Colour by</div>
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
        <p className="m-0 text-xs text-slate-600">{helpText(c.colourBy, c.picksOnly, c.leaveDays)}</p>
        <div className="flex flex-wrap gap-1">
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
        {filtering && (
          <button type="button" onClick={c.onClearDaysOff} className="self-start h-6 px-2 rounded-md bg-slate-100 text-sky-700 text-xs font-bold">
            Clear filter
          </button>
        )}
      </section>

      <section data-tour="dates" className={card}>
        <PeriodPicker stacked idPrefix="rail-period" {...c.period} />
      </section>

      <section data-tour="show" className={card}>
        <div className="text-[13px] font-bold">Show</div>
        <HolidayFilterMenu inline options={c.holidayOptions} selected={c.holidayFilter} onChange={c.onHolidayFilterChange} />
        {c.previewCount > 0 && (
          <button type="button" aria-pressed={c.previewOnly} onClick={() => c.onPreviewOnlyChange(!c.previewOnly)} className={toggle(c.previewOnly)}>
            Only plan dates ({c.previewCount})
          </button>
        )}
        <button type="button" aria-pressed={c.picksOnly} onClick={() => c.onPicksOnlyChange(!c.picksOnly)} className={toggle(c.picksOnly)}>
          Selected ({c.savedCount})
        </button>
        <div className="flex gap-1.5">
          <button
            type="button"
            aria-pressed={c.schoolOn}
            aria-label={`School holidays · ${c.provinceName}`}
            onClick={() => c.onSchoolOnChange(!c.schoolOn)}
            className={`flex-1 min-w-0 h-9 px-2.5 rounded-lg text-left text-xs font-semibold whitespace-nowrap border ${c.schoolOn ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-300'}`}
          >
            School holidays
          </button>
          <div className="w-[86px] shrink-0">
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
