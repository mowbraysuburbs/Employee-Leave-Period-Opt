import { useState, useMemo } from 'react'
import { useSavedBreaks } from '../components/Desktop/useSavedBreaks'
import { buildBreak, buildBreaksInRange, breakKey, hasGain, toCalendarEvent, findEqualStarts, breaksOverlap, combineBreaks, withBreakMerged } from '../utils/breaks'
import { schoolBreaksFor, provinceLabel } from '../utils/plans'
import { usePlanner } from './usePlanner'
import { MAX_LEAVE } from '../utils/planner'
import { buildIcs, downloadIcs } from '../utils/calendarExport'
import { getColourForDaysOff, getColourForMultiplier, multiplierBucket } from '../utils/colorScale'
import { fmtDay, fmtShortYear, addDays } from '../utils/dateFormat'

export { MAX_LEAVE }
const LAST_DATE = '2028-01-01'

function localToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
// Today's date (YYYY-MM-DD, local time); also marks today on the calendars.
export const TODAY = localToday()

function monthsBetween(from, to) {
  const result = []
  let year = Number(from.slice(0, 4))
  let month = Number(from.slice(5, 7))
  const endIndex = Number(to.slice(0, 4)) * 12 + Number(to.slice(5, 7))
  while (year * 12 + month <= endIndex) {
    result.push({ year, month })
    month = month === 12 ? 1 : month + 1
    if (month === 1) year++
  }
  return result
}

/**
 * Everything the desktop and mobile apps share: leave days, the date period,
 * filters, the break shown in Details, saved breaks and the Overview plans.
 * Layout-only state (pages, tabs, hover, sheets) stays in each app.
 *
 * Args: { leaveLimit, onLeaveLimitChange } – the most leave days the user has
 * to spend in total (from settings); what's left after the Summary caps the
 * leave days for one break.
 */
export function useLeavePlanner({ leaveLimit = MAX_LEAVE, onLeaveLimitChange = () => {} } = {}) {
  const [leaveDays, setLeaveDays] = useState(3)
  const [colourBy, setColourBy] = useState('daysOff')
  // One date period, shared by Overview and Calendar.
  const [from, setFrom] = useState(TODAY)
  const [to, setTo] = useState(LAST_DATE)
  const [holidayFilter, setHolidayFilter] = useState([])
  const [picksOnly, setPicksOnly] = useState(false)
  // Days-off values picked from the legend; only applies in Days off mode for now.
  const [daysOffFilter, setDaysOffFilter] = useState([])
  // Details changes when a day is clicked/tapped, never on hover.
  const [detailDate, setDetailDate] = useState(null)
  // A saved break opened from Summary: { startDate, leaveDays } until the next click.
  const [pinned, setPinned] = useState(null)
  // An Overview plan opened with "View on calendar": { title, breaks } (the
  // ticked ones), and whether the calendar is filtered to only those dates.
  const [preview, setPreview] = useState(null)
  const [previewOnly, setPreviewOnly] = useState(true)
  // One school province, shared by School run and the calendar's school filter.
  const [province, setProvince] = useState('GP')
  const [schoolOn, setSchoolOn] = useState(false)
  const [justAddedKey, setJustAddedKey] = useState(null)
  const { saved, remove, replaceAll } = useSavedBreaks()

  // Leave left = your limit minus the leave in your Summary. It caps the leave
  // days for one break, so the calendar always shows what you can still take.
  const leaveInSummary = saved.reduce((t, s) => t + s.leaveDays, 0)
  const leaveLeft = Math.max(0, leaveLimit - leaveInSummary)
  const maxPerBreak = Math.max(1, Math.min(MAX_LEAVE, leaveLeft))
  const leaveDaysUsed = Math.min(leaveDays, maxPerBreak)

  const months = useMemo(() => monthsBetween(from, to), [from, to])
  // Multiplier mode colours each day by its best deal using up to leaveDays.
  const breaks = useMemo(
    () => buildBreaksInRange(from, to, leaveDaysUsed, { best: colourBy === 'multiplier' }),
    [from, to, leaveDaysUsed, colourBy]
  )
  // The guided tour taps this date as its example: the longest break in the
  // first month (earliest on a tie).
  const demoDate = useMemo(() => {
    const first = months[0] && `${months[0].year}-${String(months[0].month).padStart(2, '0')}`
    let best = null
    for (const [date, brk] of Object.entries(breaks)) {
      if (date.slice(0, 7) === first && (!best || brk.daysOff > breaks[best].daysOff)) best = date
    }
    return best
  }, [months, breaks])
  // The Overview planner (period, leave days, breaks, results).
  const planner = usePlanner({ today: TODAY, province })
  const schoolDates = useMemo(() => {
    if (!schoolOn) return null
    const dates = new Set()
    for (const sb of schoolBreaksFor(province, from, to)) {
      for (let d = sb.start; d <= sb.end; d = addDays(d, 1)) dates.add(d)
    }
    return dates
  }, [schoolOn, province, from, to])

  const savedBreaks = useMemo(() => saved.map(s => buildBreak(s.startDate, s.leaveDays)).reverse(), [saved])
  const savedKeys = useMemo(() => new Set(saved.map(breakKey)), [saved])
  const { savedDayTypes, savedStarts } = useMemo(() => {
    const types = new Map()
    for (const b of savedBreaks) for (const d of b.days) if (!types.has(d.date)) types.set(d.date, d.type)
    return { savedDayTypes: types, savedStarts: new Set(savedBreaks.map(b => b.startDate)) }
  }, [savedBreaks])

  const previewDays = useMemo(() => {
    if (!preview) return { dayTypes: null }
    const dayTypes = new Map()
    for (const b of preview.breaks) for (const d of b.days) dayTypes.set(d.date, d.type)
    return { dayTypes }
  }, [preview])

  // Details: a saved break opened from Summary, else the clicked day, else the
  // earliest break of the previewed plan.
  const previewFirst = preview?.breaks[0] ?? null
  const detailBreak = useMemo(() => {
    if (pinned) return buildBreak(pinned.startDate, pinned.leaveDays)
    if (detailDate && breaks[detailDate]) return breaks[detailDate]
    return previewFirst
  }, [pinned, detailDate, breaks, previewFirst])
  const showingPreview = !!previewFirst && detailBreak === previewFirst
  const previewLabel = showingPreview
    ? (preview.breaks.length > 1 ? `${preview.title} · earliest of ${preview.breaks.length}` : preview.title)
    : null
  // Equal alternatives next to it, shown as day icons in Details.
  const equalStarts = useMemo(() => (detailBreak ? findEqualStarts(detailBreak) : null), [detailBreak])
  const bestNote = colourBy === 'multiplier' && detailBreak && !pinned && !showingPreview && detailBreak.leaveDays < leaveDaysUsed
    ? `Best value: uses ${detailBreak.leaveDays} of your ${leaveDaysUsed} leave days`
    : null

  // Each holiday in the period once, for the filter menu.
  const holidayOptions = useMemo(() => {
    const seen = new Map()
    for (const brk of Object.values(breaks)) {
      const first = brk.days[0]
      if (first.holidayName && !seen.has(first.holidayName)) seen.set(first.holidayName, fmtDay(first.date).slice(4))
    }
    return [...seen].map(([name, when]) => ({ name, when }))
  }, [breaks])

  // Breaks with no free days are left uncoloured, so they're left out here too.
  const legend = useMemo(() => {
    const gaining = Object.values(breaks).filter(hasGain)
    const values = gaining.map(b => (colourBy === 'multiplier' ? multiplierBucket(b.multiplier) : b.daysOff))
    return [...new Set(values)].sort((a, b) => a - b).map(v => colourBy === 'multiplier'
      // Buckets are 0.25 steps, shown with two decimals like every multiplier.
      ? { value: v, label: v.toFixed(2), colour: getColourForMultiplier(v) }
      : { value: v, label: String(v), colour: getColourForDaysOff(v) })
  }, [breaks, colourBy])

  const activeDaysOff = useMemo(
    () => (colourBy === 'daysOff' && !picksOnly && daysOffFilter.length > 0 ? new Set(daysOffFilter) : null),
    [colourBy, picksOnly, daysOffFilter]
  )

  const isSaved = brk => savedKeys.has(breakKey(brk))
  // Saved breaks the Details break runs into; adding it combines them.
  const overlaps = useMemo(
    () => (detailBreak && !savedKeys.has(breakKey(detailBreak)) ? savedBreaks.filter(b => breaksOverlap(b, detailBreak)) : []),
    [detailBreak, savedBreaks, savedKeys]
  )
  const combined = useMemo(() => (overlaps.length ? combineBreaks([...overlaps, detailBreak]) : null), [overlaps, detailBreak])
  const period = {
    from,
    to,
    minDate: TODAY,
    maxDate: LAST_DATE,
    onFromChange: setFrom,
    onToChange: setTo,
    changed: from !== TODAY || to !== LAST_DATE,
    onReset: () => { setFrom(TODAY); setTo(LAST_DATE) },
  }

  // A click/tap selects that day: its break is banded and shown in Details.
  function selectDay(date) {
    setDetailDate(date)
    setPinned(null)
    setJustAddedKey(null)
  }

  // The days-off values change with leave days, so a new amount clears the filter.
  function changeLeaveDays(v) {
    setLeaveDays(v)
    setDaysOffFilter([])
  }

  function toggleDaysOff(v) {
    setDaysOffFilter(f => (f.includes(v) ? f.filter(x => x !== v) : [...f, v]))
  }

  // Shows a saved break (or an equal start) in Details until the next click.
  function openBreak(b) {
    setPinned({ startDate: b.startDate, leaveDays: b.leaveDays })
  }

  // Saves every break not already saved, combining any that overlap so the
  // totals never count a day twice. Returns the last entry added, or null.
  function addBreaks(list) {
    const fresh = list.filter(b => !isSaved(b))
    if (!fresh.length) return null
    const next = fresh.reduce(withBreakMerged, saved)
    replaceAll(next)
    setJustAddedKey(breakKey(next.at(-1)))
    return next.at(-1)
  }

  // Adds the Details break; Details then shows what was saved (the combined
  // break, if it merged).
  function addDetailBreak() {
    const last = addBreaks([detailBreak])
    if (last) setPinned(last)
  }

  // Swaps the overlapping saved breaks for the Details break.
  function replaceOverlaps() {
    const keys = new Set(overlaps.map(breakKey))
    const entry = { startDate: detailBreak.startDate, leaveDays: detailBreak.leaveDays }
    replaceAll([...saved.filter(s => !keys.has(breakKey(s))), entry])
    setJustAddedKey(breakKey(entry))
    setPinned(entry)
  }

  function removeBreak(entry) {
    remove(entry)
    if (breakKey(entry) === justAddedKey) setJustAddedKey(null)
  }

  function exportBreaks(list) {
    downloadIcs(buildIcs(list.map(toCalendarEvent)), `${planner.period.id}-leave.ics`)
  }

  // Filters the calendar to the planner's ticked breaks, earliest in Details.
  function openPreview(list) {
    setPreview({ title: planner.period.title, breaks: list })
    setPreviewOnly(true)
    setPinned(null)
    setDetailDate(null)
  }

  // Every filter that's narrowing the calendar right now, with how to clear it:
  // a count on the rail's Clear filters button and the phone's Filters button.
  const activeFilters = [
    activeDaysOff && { key: 'daysOff', label: 'Days off', value: [...daysOffFilter].sort((a, b) => a - b).join(', '), clear: () => setDaysOffFilter([]) },
    period.changed && { key: 'dates', label: 'Dates', value: `${fmtShortYear(from)} – ${fmtShortYear(to)}`, clear: period.onReset },
    holidayFilter.length > 0 && { key: 'holidays', label: 'Holidays', value: holidayFilter.length === 1 ? holidayFilter[0] : `${holidayFilter.length} picked`, clear: () => setHolidayFilter([]) },
    picksOnly && { key: 'mine', label: 'Selected', value: '', clear: () => setPicksOnly(false) },
    schoolOn && { key: 'school', label: 'School holidays', value: provinceLabel(province), clear: () => setSchoolOn(false) },
  ].filter(Boolean)

  function clearAllFilters() {
    activeFilters.forEach(f => f.clear())
  }

  // The calendar controls as one object, for the desktop rail and the mobile Filters sheet.
  const controls = {
    leaveDays: leaveDaysUsed,
    maxLeave: maxPerBreak,
    onLeaveDaysChange: changeLeaveDays,
    // Set higher than the leave left, so the calendar uses the leave left instead.
    leaveCapped: leaveDays > maxPerBreak,
    leaveLimit,
    leaveLeft,
    leaveInSummary,
    onLeaveLimitChange,
    colourBy,
    onColourByChange: setColourBy,
    legend,
    daysOffFilter,
    onToggleDaysOff: toggleDaysOff,
    onClearDaysOff: () => setDaysOffFilter([]),
    period,
    holidayOptions,
    holidayFilter,
    onHolidayFilterChange: setHolidayFilter,
    picksOnly,
    onPicksOnlyChange: setPicksOnly,
    savedCount: saved.length,
    previewCount: preview?.breaks.length ?? 0,
    previewOnly,
    onPreviewOnlyChange: setPreviewOnly,
    schoolOn,
    onSchoolOnChange: setSchoolOn,
    provinceName: provinceLabel(province),
    province,
    onProvinceChange: setProvince,
  }

  return {
    controls, activeFilters, clearAllFilters,
    leaveDays: leaveDaysUsed, changeLeaveDays, colourBy, setColourBy, period, leaveLimit, leaveLeft, leaveInSummary,
    holidayFilter, setHolidayFilter, holidayOptions, picksOnly, setPicksOnly,
    daysOffFilter, toggleDaysOff, clearDaysOff: () => setDaysOffFilter([]), activeDaysOff, legend,
    province, setProvince, schoolOn, setSchoolOn, schoolDates,
    months, breaks, demoDate, planner, exportBreaks,
    preview, setPreview, previewOnly, setPreviewOnly, previewDays, previewLabel, openPreview,
    saved, savedBreaks, savedDayTypes, savedStarts, isSaved, justAddedKey, setJustAddedKey,
    detailBreak, bestNote, equalStarts, overlaps, combined,
    selectDay, openBreak, addBreaks, addDetailBreak, replaceOverlaps, removeBreak,
  }
}
