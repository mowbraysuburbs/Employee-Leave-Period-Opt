import { BottomSheet } from './BottomSheet'
import { PeriodPicker } from '../Desktop/PeriodPicker'
import { HolidayFilterMenu } from '../Desktop/HolidayFilterMenu'
import { ProvincePicker } from '../Desktop/ProvincePicker'

const toggle = on => [
  'w-full min-h-[42px] px-3 rounded-xl text-left text-sm font-semibold border',
  on ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-900 border-slate-300',
].join(' ')

/**
 * The phone calendar's filters (leave days and colours live in the bottom
 * panel): Selected only, public holidays, plan dates, school holidays, the
 * dates and Clear all. Takes the same `c` object as ControlRail.
 *
 * Props: c, activeCount, onClearAll, onClose
 */
export function FiltersSheet({ c, activeCount, onClearAll, onClose }) {
  return (
    <BottomSheet label="Filters" title="Filters" backdrop onClose={onClose}>
      <div className="flex flex-col gap-4 pt-1 pb-2">
        <section className="flex flex-col gap-2">
          <button type="button" aria-pressed={c.picksOnly} onClick={() => c.onPicksOnlyChange(!c.picksOnly)} className={toggle(c.picksOnly)}>
            👁 Selected breaks only ({c.savedCount})
          </button>
          <HolidayFilterMenu inline options={c.holidayOptions} selected={c.holidayFilter} onChange={c.onHolidayFilterChange} />
          {c.previewCount > 0 && (
            <button type="button" aria-pressed={c.previewOnly} onClick={() => c.onPreviewOnlyChange(!c.previewOnly)} className={toggle(c.previewOnly)}>
              Only plan dates ({c.previewCount})
            </button>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              aria-pressed={c.schoolOn}
              aria-label={`School holidays · ${c.provinceName}`}
              onClick={() => c.onSchoolOnChange(!c.schoolOn)}
              className={`flex-1 min-w-0 h-[42px] px-3 rounded-xl text-left text-sm font-semibold border ${c.schoolOn ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-300'}`}
            >
              🎓 School holidays
            </button>
            <div className="w-[130px] shrink-0">
              <ProvincePicker compact id="mobile-province" value={c.province} onChange={c.onProvinceChange} />
            </div>
          </div>
        </section>
        <section className="flex flex-col gap-1.5">
          <PeriodPicker stacked idPrefix="mobile-period" {...c.period} />
        </section>
        <button type="button" disabled={!activeCount} onClick={onClearAll} className="h-10 rounded-xl text-sm font-bold text-red-700 disabled:text-slate-300">
          Clear all filters{activeCount ? ` (${activeCount})` : ''}
        </button>
      </div>
    </BottomSheet>
  )
}
