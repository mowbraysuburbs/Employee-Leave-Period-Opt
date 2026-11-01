import { RailExpanded } from './RailExpanded'
import { RailCollapsed } from './RailCollapsed'

/**
 * The calendar's control column, either open or collapsed to an icon strip.
 *
 * Props (all in `c`, since both versions need the same set):
 *   collapsed, onToggleCollapsed
 *   leaveDays, maxLeave, onLeaveDaysChange
 *   colourBy, onColourByChange, legend
 *   daysOffFilter, onToggleDaysOff, onClearDaysOff
 *   period                        – PeriodPicker props (from, to, changed, …)
 *   holidayOptions, holidayFilter, onHolidayFilterChange
 *   picksOnly, onPicksOnlyChange, savedCount
 *   previewCount, previewOnly, onPreviewOnlyChange
 *   schoolOn, onSchoolOnChange, provinceName
 *   province, onProvinceChange    – shared with School run on the Overview
 */
export function ControlRail({ c }) {
  return c.collapsed ? <RailCollapsed c={c} /> : <RailExpanded c={c} />
}
