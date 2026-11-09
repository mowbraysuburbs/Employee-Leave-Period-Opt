import { BottomSheet } from './BottomSheet'
import { PeriodPicker } from '../Desktop/PeriodPicker'
import { HolidayFilterMenu } from '../Desktop/HolidayFilterMenu'
import { ProvincePicker } from '../Desktop/ProvincePicker'
import { SwitchRow } from '../Desktop/SwitchRow'

/**
 * The phone calendar's filters (leave days and colours live in the bottom
 * panel): Selected only, public holidays, leave fills a gap, plan dates, school holidays, the
 * dates and Clear all. Takes the same `c` object as ControlRail.
 *
 * Props: c, activeCount, onClearAll, onClose
 */
export function FiltersSheet({ c, activeCount, onClearAll, onClose }) {
  return (
    <BottomSheet label="More filters" title="More filters" backdrop onClose={onClose}>
      <div className="flex flex-col gap-4 pt-1 pb-2">
        <section className="flex flex-col gap-2">
          <SwitchRow large label={`Selected breaks (${c.savedCount})`} on={c.picksOnly} onChange={c.onPicksOnlyChange} />
          <HolidayFilterMenu inline options={c.holidayOptions} selected={c.holidayFilter} onChange={c.onHolidayFilterChange} />
          <SwitchRow large label="Leave fills a gap" on={c.gapOnly} onChange={c.onGapOnlyChange} />
          {c.previewCount > 0 && <SwitchRow large label={`Only plan dates (${c.previewCount})`} on={c.previewOnly} onChange={c.onPreviewOnlyChange} />}
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <SwitchRow large label="School holidays" ariaLabel={`School holidays · ${c.provinceName}`} on={c.schoolOn} onChange={c.onSchoolOnChange} />
            </div>
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
        <p className="m-0 -mt-2 text-center text-[11.5px] text-slate-500">Tip: hold the filter button to remove all filters.</p>
      </div>
    </BottomSheet>
  )
}
