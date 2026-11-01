import { useState, useMemo } from 'react'
import { DesktopHeader } from './DesktopHeader'
import { LeaveDaysCard } from './LeaveDaysCard'
import { ColourModeCard } from './ColourModeCard'
import { CalendarToolbar } from './CalendarToolbar'
import { YearCalendar } from './YearCalendar'
import { SidePanel } from './SidePanel'
import { BreakDetailPanel } from './BreakDetailPanel'
import { PlanPreview } from './PlanPreview'
import { MyBreaksPanel } from './MyBreaksPanel'
import { PreviewBanner } from './PreviewBanner'
import { OverviewPage } from './Overview/OverviewPage'
import { HolidaysList } from '../Features/HolidaysList'
import { useSavedBreaks } from './useSavedBreaks'
import { buildBreak, buildBreaksInRange, breakKey, hasGain, toCalendarEvent } from '../../utils/breaks'
import { computePlans } from '../../utils/plans'
import { buildIcs, downloadIcs } from '../../utils/calendarExport'
import { getColourForDaysOff, getColourForMultiplier, multiplierBucket } from '../../utils/colorScale'
import { fmtDay } from '../../utils/dateFormat'

const MAX_LEAVE = 10
// BCEA minimum: 21 consecutive days, i.e. 15 working days.
const ALLOWANCE = 15
const LAST_DATE = '2028-01-01'

function localToday() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const TODAY = localToday()

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
  const [tab, setTab] = useState('details')
  // Details follows the hovered day and keeps showing the last one, so the
  // mouse can travel over to the panel without it going blank.
  const [hoveredDate, setHoveredDate] = useState(null)
  const [lastHoveredDate, setLastHoveredDate] = useState(null)
  // A saved break opened from Summary: { startDate, leaveDays } until the next hover.
  const [pinned, setPinned] = useState(null)
  // Overview: the plan in the details panel, and per plan the break start
  // dates the user has unticked.
  const [selectedPlanId, setSelectedPlanId] = useState(null)
  const [unticked, setUnticked] = useState({})
  // An Overview plan opened with "View on calendar": { title, breaks } (the ticked ones).
  const [preview, setPreview] = useState(null)
  const [confirmDate, setConfirmDate] = useState(null)
  const [justAddedKey, setJustAddedKey] = useState(null)
  const { saved, add, remove } = useSavedBreaks()

  const months = useMemo(() => monthsBetween(from, to), [from, to])
  // Multiplier mode colours each day by its best deal using up to leaveDays.
  const breaks = useMemo(
    () => buildBreaksInRange(from, to, leaveDays, { best: colourBy === 'multiplier' }),
    [from, to, leaveDays, colourBy]
  )
  const plans = useMemo(() => computePlans({ from, to }), [from, to])
  const selectedPlan = plans.find(p => p.id === selectedPlanId) ?? plans[0] ?? null
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

  // Details: the day under the mouse, else a pinned saved break, else the
  // previewed plan, else the last day hovered.
  const showPlanPreview = !!preview && preview.breaks.length > 1 && !hoveredDate && !pinned
  const previewSingle = preview && preview.breaks.length === 1 ? preview.breaks[0] : null
  const detailBreak = useMemo(() => {
    if (hoveredDate && breaks[hoveredDate]) return breaks[hoveredDate]
    if (pinned) return buildBreak(pinned.startDate, pinned.leaveDays)
    if (previewSingle) return previewSingle
    return (lastHoveredDate && breaks[lastHoveredDate]) || null
  }, [hoveredDate, pinned, previewSingle, lastHoveredDate, breaks])
  const showingPreview = !!previewSingle && detailBreak === previewSingle
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
      ? { label: `${v}×`, colour: getColourForMultiplier(v) }
      : { label: String(v), colour: getColourForDaysOff(v) })
  }, [breaks, colourBy])

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

  function handleDayHover(date) {
    setHoveredDate(date)
    if (date) {
      setLastHoveredDate(date)
      setPinned(null)
    }
  }

  // Saves every break not already saved; each keeps its own leave amount.
  function addBreaks(list) {
    const fresh = list.filter(b => !isSaved(b))
    for (const b of fresh) add({ startDate: b.startDate, leaveDays: b.leaveDays })
    if (fresh.length) setJustAddedKey(breakKey(fresh[fresh.length - 1]))
  }

  function addFromCalendar(list) {
    addBreaks(list)
    setPreview(null)
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

  function viewOnCalendar(list) {
    setPreview({ title: selectedPlan.title, breaks: list })
    setPinned(null)
    setLastHoveredDate(null)
    setTab('details')
    setPage('calendar')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <DesktopHeader page={page} onPageChange={setPage} />
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
          />
        )}

        {page === 'holidays' && <HolidaysList months={months} showSchoolHolidays={false} provinceCode="GP" />}

        {page === 'calendar' && (
          <>
            <div className="flex flex-wrap gap-4 items-stretch">
              <LeaveDaysCard value={leaveDays} min={1} max={MAX_LEAVE} onChange={setLeaveDays} />
              <ColourModeCard
                colourBy={colourBy}
                onColourByChange={setColourBy}
                legend={legend}
                picksOnly={picksOnly}
                leaveDays={leaveDays}
              />
            </div>

            <CalendarToolbar
              from={from}
              to={to}
              minDate={TODAY}
              maxDate={LAST_DATE}
              onFromChange={setFrom}
              onToChange={setTo}
              rangeChanged={period.changed}
              onResetRange={period.onReset}
              holidayOptions={holidayOptions}
              holidayFilter={holidayFilter}
              onHolidayFilterChange={setHolidayFilter}
              picksOnly={picksOnly}
              onPicksOnlyChange={setPicksOnly}
              savedCount={saved.length}
              colourBy={colourBy}
            />

            {preview && (
              <PreviewBanner
                title={preview.title}
                onBack={() => setPage('overview')}
                onClear={() => setPreview(null)}
              />
            )}

            <div className="flex flex-wrap gap-6 items-start">
              <YearCalendar
                months={months}
                breaks={breaks}
                colourBy={colourBy}
                holidayFilter={holidayFilter}
                picksOnly={picksOnly}
                savedDayTypes={savedDayTypes}
                savedStarts={savedStarts}
                isSaved={isSaved}
                previewDayTypes={previewDays.dayTypes}
                previewStarts={previewDays.starts}
                hoveredDate={hoveredDate}
                confirmDate={confirmDate}
                onDayHover={handleDayHover}
                onDayClick={date => { setConfirmDate(date); setHoveredDate(null); setJustAddedKey(null) }}
                onConfirm={handleConfirm}
                onCancelConfirm={() => setConfirmDate(null)}
              />

              <SidePanel
                tab={tab}
                onTabChange={setTab}
                savedCount={saved.length}
                details={showPlanPreview ? (
                  <PlanPreview
                    title={preview.title}
                    breaks={preview.breaks}
                    allSaved={preview.breaks.every(isSaved)}
                    onAddAll={() => addFromCalendar(preview.breaks)}
                  />
                ) : (
                  <BreakDetailPanel
                    brk={detailBreak}
                    nextBreak={nextBreak}
                    bestNote={bestNote}
                    label={showingPreview ? preview.title : null}
                    isSaved={detailBreak ? isSaved(detailBreak) : false}
                    onAdd={() => addFromCalendar([detailBreak])}
                    onRemove={() => removeBreak(detailBreak)}
                  />
                )}
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
            </div>
          </>
        )}
      </main>
    </div>
  )
}
