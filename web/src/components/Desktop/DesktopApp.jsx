import { useState, useMemo } from 'react'
import { DesktopHeader } from './DesktopHeader'
import { ControlRail } from './Rail/ControlRail'
import { YearCalendar } from './YearCalendar'
import { SidePanel } from './SidePanel'
import { BreakDetailPanel } from './BreakDetailPanel'
import { MyBreaksPanel } from './MyBreaksPanel'
import { PreviewBanner } from './PreviewBanner'
import { OverviewPage } from './Overview/OverviewPage'
import { EventsComingSoon } from './EventsComingSoon'
import { HolidaysList } from '../Features/HolidaysList'
import { useSavedBreaks } from './useSavedBreaks'
import { buildBreak, buildBreaksInRange, breakKey, hasGain, toCalendarEvent, findEqualShifts } from '../../utils/breaks'
import { computePlans, schoolBreaksFor, provinceLabel } from '../../utils/plans'
import { buildIcs, downloadIcs } from '../../utils/calendarExport'
import { getColourForDaysOff, getColourForMultiplier, multiplierBucket } from '../../utils/colorScale'
import { fmtDay, addDays } from '../../utils/dateFormat'

const MAX_LEAVE = 10
// BCEA minimum: 21 consecutive days, i.e. 15 working days.
const ALLOWANCE = 15
const LAST_DATE = '2028-01-01'

function localToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const TODAY = localToday()

const RAIL_KEY = 'stretchmyleave.railCollapsed'

// Remembered between visits; on first visit, narrower windows start collapsed.
function initialRailCollapsed() {
  try {
    const stored = localStorage.getItem(RAIL_KEY)
    if (stored !== null) return stored === 'true'
  } catch { /* storage unavailable — fall back to the window width */ }
  return window.innerWidth < 1200
}

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

export function DesktopApp() {
  const [page, setPage] = useState('overview')
  const [leaveDays, setLeaveDays] = useState(3)
  const [colourBy, setColourBy] = useState('daysOff')
  // One date period, shared by Overview and Calendar.
  const [from, setFrom] = useState(TODAY)
  const [to, setTo] = useState(LAST_DATE)
  const [holidayFilter, setHolidayFilter] = useState([])
  const [picksOnly, setPicksOnly] = useState(false)
  // Days-off values picked from the legend; only applies in Days off mode for now.
  const [daysOffFilter, setDaysOffFilter] = useState([])
  const [railCollapsed, setRailCollapsed] = useState(initialRailCollapsed)
  const [tab, setTab] = useState('details')
  // The day under the mouse only drives the hover card and band; Details
  // changes when a day is clicked, so people can read it while moving around.
  const [hoveredDate, setHoveredDate] = useState(null)
  const [detailDate, setDetailDate] = useState(null)
  // A saved break opened from Summary: { startDate, leaveDays } until the next click.
  const [pinned, setPinned] = useState(null)
  // Overview: the plan in the details panel, and per plan the break start
  // dates the user has unticked.
  const [selectedPlanId, setSelectedPlanId] = useState(null)
  const [unticked, setUnticked] = useState({})
  // An Overview plan opened with "View on calendar": { title, breaks } (the
  // ticked ones), and whether the calendar is filtered to only those dates.
  const [preview, setPreview] = useState(null)
  const [previewOnly, setPreviewOnly] = useState(true)
  // One school province, shared by School run and the calendar's school filter.
  const [province, setProvince] = useState('GP')
  const [schoolOn, setSchoolOn] = useState(false)
  const [confirmDate, setConfirmDate] = useState(null)
  const [justAddedKey, setJustAddedKey] = useState(null)
  const { saved, add, remove } = useSavedBreaks()

  const months = useMemo(() => monthsBetween(from, to), [from, to])
  // Multiplier mode colours each day by its best deal using up to leaveDays.
  const breaks = useMemo(
    () => buildBreaksInRange(from, to, leaveDays, { best: colourBy === 'multiplier' }),
    [from, to, leaveDays, colourBy]
  )
  const plans = useMemo(() => computePlans({ from, to, provinceCode: province }), [from, to, province])
  const schoolDates = useMemo(() => {
    if (!schoolOn) return null
    const dates = new Set()
    for (const sb of schoolBreaksFor(province, from, to)) {
      for (let d = sb.start; d <= sb.end; d = addDays(d, 1)) dates.add(d)
    }
    return dates
  }, [schoolOn, province, from, to])
  // 'events' selects the Overview's coming-soon Events row instead of a plan.
  const eventsSelected = selectedPlanId === 'events'
  const selectedPlan = eventsSelected ? null : plans.find(p => p.id === selectedPlanId) ?? plans[0] ?? null
  const ticked = useMemo(() => {
    if (!selectedPlan) return new Set()
    const off = unticked[selectedPlan.id] ?? []
    return new Set(selectedPlan.breaks.map(b => b.startDate).filter(d => !off.includes(d)))
  }, [selectedPlan, unticked])

  const savedBreaks = useMemo(() => saved.map(s => buildBreak(s.startDate, s.leaveDays)).reverse(), [saved])
  const savedKeys = useMemo(() => new Set(saved.map(breakKey)), [saved])
  const { savedDayTypes, savedStarts } = useMemo(() => {
    const types = new Map()
    for (const b of savedBreaks) for (const d of b.days) if (!types.has(d.date)) types.set(d.date, d.type)
    return { savedDayTypes: types, savedStarts: new Set(savedBreaks.map(b => b.startDate)) }
  }, [savedBreaks])

  const previewDays = useMemo(() => {
    if (!preview) return { dayTypes: null, starts: null }
    const dayTypes = new Map()
    for (const b of preview.breaks) for (const d of b.days) dayTypes.set(d.date, d.type)
    return { dayTypes, starts: new Set(preview.breaks.map(b => b.startDate)) }
  }, [preview])

  // Details: a saved break opened from Summary, else the clicked day, else the
  // earliest break of the previewed plan. Hovering never changes it.
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
  // Equal alternatives a week either side, for the ◀ ▶ shift buttons.
  const shift = useMemo(() => (detailBreak ? findEqualShifts(detailBreak) : null), [detailBreak])
  const nextBreak = useMemo(
    () => (detailBreak && detailBreak.leaveDays < MAX_LEAVE ? buildBreak(detailBreak.startDate, detailBreak.leaveDays + 1) : null),
    [detailBreak]
  )
  const bestNote = colourBy === 'multiplier' && detailBreak && !pinned && !showingPreview && detailBreak.leaveDays < leaveDays
    ? `Best value: uses ${detailBreak.leaveDays} of your ${leaveDays} leave days`
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
      // Buckets are 0.25 steps, so show them exactly (1.25×) rather than rounded.
      ? { value: v, label: `${v}×`, colour: getColourForMultiplier(v) }
      : { value: v, label: String(v), colour: getColourForDaysOff(v) })
  }, [breaks, colourBy])

  const activeDaysOff = useMemo(
    () => (colourBy === 'daysOff' && !picksOnly && daysOffFilter.length > 0 ? new Set(daysOffFilter) : null),
    [colourBy, picksOnly, daysOffFilter]
  )

  const isSaved = brk => savedKeys.has(breakKey(brk))
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

  // A click shows that day in Details (and opens its Add prompt).
  function handleDayClick(date) {
    setDetailDate(date)
    setPinned(null)
    setConfirmDate(date)
    setHoveredDate(null)
    setJustAddedKey(null)
    setTab('details')
  }

  // Saves every break not already saved; each keeps its own leave amount.
  function addBreaks(list) {
    const fresh = list.filter(b => !isSaved(b))
    for (const b of fresh) add({ startDate: b.startDate, leaveDays: b.leaveDays })
    if (fresh.length) setJustAddedKey(breakKey(fresh[fresh.length - 1]))
  }

  // The preview filter stays as it is, so people can keep working through the plan.
  function addFromCalendar(list) {
    addBreaks(list)
    setTab('summary')
  }

  function removeBreak(entry) {
    remove(entry)
    if (breakKey(entry) === justAddedKey) setJustAddedKey(null)
  }

  function handleConfirm() {
    const brk = breaks[confirmDate]
    if (isSaved(brk)) removeBreak(brk)
    else addFromCalendar([brk])
    setConfirmDate(null)
  }

  function toggleTick(startDate) {
    const off = unticked[selectedPlan.id] ?? []
    setUnticked({ ...unticked, [selectedPlan.id]: off.includes(startDate) ? off.filter(d => d !== startDate) : [...off, startDate] })
  }

  function toggleAllTicks() {
    const allTicked = (unticked[selectedPlan.id] ?? []).length === 0
    setUnticked({ ...unticked, [selectedPlan.id]: allTicked ? selectedPlan.breaks.map(b => b.startDate) : [] })
  }

  function exportBreaks(list) {
    downloadIcs(buildIcs(list.map(toCalendarEvent)), `${selectedPlan.id}-leave.ics`)
  }

  // Opens the calendar filtered to the ticked breaks, with the earliest in Details.
  function viewOnCalendar(list) {
    setPreview({ title: selectedPlan.title, breaks: list })
    setPreviewOnly(true)
    setPinned(null)
    setDetailDate(null)
    setTab('details')
    setPage('calendar')
  }

  function toggleRail() {
    const next = !railCollapsed
    setRailCollapsed(next)
    try {
      localStorage.setItem(RAIL_KEY, String(next))
    } catch { /* storage unavailable — just don't remember it */ }
  }

  const railControls = {
    collapsed: railCollapsed,
    onToggleCollapsed: toggleRail,
    leaveDays,
    maxLeave: MAX_LEAVE,
    // The days-off values change with leave days, so a new amount clears the filter.
    onLeaveDaysChange: v => { setLeaveDays(v); setDaysOffFilter([]) },
    colourBy,
    onColourByChange: setColourBy,
    legend,
    daysOffFilter,
    onToggleDaysOff: v => setDaysOffFilter(f => (f.includes(v) ? f.filter(x => x !== v) : [...f, v])),
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
  }

  // The calendar page is exactly one screen tall: only the months scroll, while
  // the controls and the Details/Summary panel stay put. Other pages scroll normally.
  const calendarPage = page === 'calendar'

  return (
    <div className={`bg-slate-50 text-slate-900 ${calendarPage ? 'h-screen flex flex-col overflow-hidden' : 'min-h-screen'}`}>
      <DesktopHeader page={page} onPageChange={setPage} />
      {calendarPage && (
        <main className="flex-1 min-h-0 w-full max-w-[1440px] mx-auto px-6 py-4 flex gap-5">
          <ControlRail c={railControls} />

          <div className="flex-1 min-w-0 min-h-0 flex flex-col gap-3">
            {preview && (
              <PreviewBanner
                title={preview.title}
                onBack={() => setPage('overview')}
                onClear={() => setPreview(null)}
              />
            )}
            <YearCalendar
              months={months}
              breaks={breaks}
              colourBy={colourBy}
              holidayFilter={holidayFilter}
              picksOnly={picksOnly}
              savedDayTypes={savedDayTypes}
              savedStarts={savedStarts}
              isSaved={isSaved}
              previewDayTypes={previewOnly ? previewDays.dayTypes : null}
              previewStarts={previewOnly ? previewDays.starts : null}
              schoolDates={schoolDates}
              daysOffFilter={activeDaysOff}
              hoveredDate={hoveredDate}
              confirmDate={confirmDate}
              onDayHover={setHoveredDate}
              onDayClick={handleDayClick}
              onConfirm={handleConfirm}
              onCancelConfirm={() => setConfirmDate(null)}
            />
          </div>

          <SidePanel
            tab={tab}
            onTabChange={setTab}
            savedCount={saved.length}
            details={
              <BreakDetailPanel
                brk={detailBreak}
                nextBreak={nextBreak}
                bestNote={bestNote}
                label={previewLabel}
                shift={shift}
                onShift={startDate => setPinned({ startDate, leaveDays: detailBreak.leaveDays })}
                isSaved={detailBreak ? isSaved(detailBreak) : false}
                onAdd={() => addFromCalendar([detailBreak])}
                onRemove={() => removeBreak(detailBreak)}
              />
            }
            summary={
              <MyBreaksPanel
                breaks={savedBreaks}
                allowance={ALLOWANCE}
                justAddedKey={justAddedKey}
                onOpen={b => { setPinned({ startDate: b.startDate, leaveDays: b.leaveDays }); setTab('details') }}
                onRemove={removeBreak}
                onDismissAdded={() => setJustAddedKey(null)}
              />
            }
          />
        </main>
      )}
      {!calendarPage && (
      <main className="max-w-[1320px] mx-auto px-6 pt-6 pb-10 flex flex-col gap-4">
        {page === 'overview' && (
          <OverviewPage
            plans={plans}
            selectedPlan={selectedPlan}
            onSelect={setSelectedPlanId}
            period={period}
            ticked={ticked}
            onToggle={toggleTick}
            onToggleAll={toggleAllTicks}
            isSaved={isSaved}
            onAdd={addBreaks}
            onExport={exportBreaks}
            onView={viewOnCalendar}
            province={province}
            onProvinceChange={setProvince}
            eventsSelected={eventsSelected}
          />
        )}

        {page === 'events' && <EventsComingSoon variant="page" />}

        {page === 'holidays' && <HolidaysList months={months} showSchoolHolidays={false} provinceCode="GP" />}
      </main>
      )}
    </div>
  )
}
