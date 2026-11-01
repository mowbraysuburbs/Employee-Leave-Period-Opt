import { BottomSheet } from './BottomSheet'
import { PeriodPicker } from '../Desktop/PeriodPicker'
import { HolidayFilterMenu } from '../Desktop/HolidayFilterMenu'
import { ProvincePicker } from '../Desktop/ProvincePicker'

const MODES = [
  { id: 'daysOff', label: 'Days off' },
  { id: 'multiplier', label: 'Multiplier' },
]

const toggle = on => [
  'w-full min-h-[42px] px-3 rounded-xl text-left text-sm font-semibold border',
  on ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-300',
].join(' ')

/**
 * Everything from the desktop control rail except leave days, which stays in
 * the bottom panel. Takes the same `c` object as ControlRail.
 */
export function FiltersSheet({ c, onClose }) {
  return (
    <BottomSheet label="Filters" title="Filters" backdrop onClose={onClose}>
      <div className="flex flex-col gap-4 pt-1">
        <section className="flex flex-col gap-1.5">
          <h3 className="m-0 text-[13px] font-bold">Colour by</h3>
          <div role="group" aria-label="Colour by" className="flex p-[3px] rounded-[10px] bg-slate-100">
            {MODES.map(m => (
              <button
                key={m.id}
                type="button"
                aria-pressed={c.colourBy === m.id}
                onClick={() => c.onColourByChange(m.id)}
                className={`flex-1 h-9 rounded-lg text-[13px] font-bold ${c.colourBy === m.id ? 'bg-white shadow' : 'text-slate-600'}`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-1.5">
          <h3 className="m-0 text-[13px] font-bold">Dates</h3>
          <PeriodPicker bare idPrefix="mobile-period" {...c.period} />
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="m-0 text-[13px] font-bold">Show</h3>
          <HolidayFilterMenu inline options={c.holidayOptions} selected={c.holidayFilter} onChange={c.onHolidayFilterChange} />
          {c.previewCount > 0 && (
            <button type="button" aria-pressed={c.previewOnly} onClick={() => c.onPreviewOnlyChange(!c.previewOnly)} className={toggle(c.previewOnly)}>
              Only selected dates ({c.previewCount})
            </button>
          )}
          <button type="button" aria-pressed={c.picksOnly} onClick={() => c.onPicksOnlyChange(!c.picksOnly)} className={toggle(c.picksOnly)}>
            Only my breaks ({c.savedCount})
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              aria-pressed={c.schoolOn}
              aria-label={`School holidays · ${c.provinceName}`}
              onClick={() => c.onSchoolOnChange(!c.schoolOn)}
              className={`flex-1 min-w-0 h-[42px] px-3 rounded-xl text-left text-sm font-semibold border ${c.schoolOn ? 'bg-green-100 text-green-800 border-green-300' : 'bg-white border-slate-300'}`}
            >
              School holidays
            </button>
            <div className="w-[130px] shrink-0">
              <ProvincePicker compact id="mobile-province" value={c.province} onChange={c.onProvinceChange} />
            </div>
          </div>
        </section>
      </div>
    </BottomSheet>
  )
}
