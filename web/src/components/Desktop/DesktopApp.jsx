import { useState, useMemo } from 'react'
import { DesktopHeader } from './DesktopHeader'
import { LeaveDaysCard } from './LeaveDaysCard'
import { ColourModeCard } from './ColourModeCard'
import { CalendarToolbar } from './CalendarToolbar'
import { YearCalendar } from './YearCalendar'
import { SidePanel } from './SidePanel'
import { BreakDetailPanel } from './BreakDetailPanel'
import { YearPlanPreview } from './YearPlanPreview'
import { MyBreaksPanel } from './MyBreaksPanel'
import { PreviewBanner } from './PreviewBanner'
import { YearSwitch } from './YearSwitch'
import { OverviewPage } from './Overview/OverviewPage'
import { HolidaysList } from '../Features/HolidaysList'
import { useSavedBreaks } from './useSavedBreaks'
import { buildBreak, buildBreaksInRange, breakKey, hasGain } from '../../utils/breaks'
import { computeQuickPicks } from '../../utils/quickPicks'
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

// Plan years run from this year to the last full year the holiday data covers.
const FIRST_YEAR = Number(TODAY.slice(0, 4))
const LAST_YEAR = Number(LAST_DATE.slice(0, 4)) - 1
const PLAN_YEARS = Array.from({ length: Math.max(1, LAST_YEAR - FIRST_YEAR + 1) }, (_, i) => FIRST_YEAR + i)
  .map(y => ({ value: y, label: y === FIRST_YEAR ? `${y} (rest of year)` : String(y) }))
// Leave resets each calendar year, so in Nov/Dec people plan the coming one.
const DEFAULT_PLAN_YEAR = Number(TODAY.slice(5, 7)) >= 11 && FIRST_YEAR + 1 <= LAST_YEAR ? FIRST_YEAR + 1 : FIRST_YEAR

const PICK_TITLES = { next: 'Next big break', max: 'Maximise leave', six: 'Next 6 months', year: 'Year plan' }

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
  const [planYear, setPlanYear] = useState(DEFAULT_PLAN_YEAR)
  const [colourBy, setColourBy] = useState('daysOff')
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
  // Quick pick opened from Overview with "View on calendar": 'next' | 'max' | 'six' | 'year'.
  const [previewId, setPreviewId] = useState(null)
  const [confirmDate, setConfirmDate] = useState(null)
  const [justAddedKey, setJustAddedKey] = useState(null)
  const { saved, add, remove } = useSavedBreaks()

  const months = useMemo(() => monthsBetween(from, to), [from, to])
  // Multiplier mode colours each day by its best deal using up to leaveDays.
  const breaks = useMemo(
    () => buildBreaksInRange(from, to, leaveDays, { best: colourBy === 'multiplier' }),
    [from, to, leaveDays, colourBy]
  )
  const picks = useMemo(
    () => computeQuickPicks({ today: TODAY, lastDate: LAST_DATE, leaveDays, year: planYear, allowance: ALLOWANCE }),
    [leaveDays, planYear]
  )

  const savedBreaks = useMemo(() => saved.map(s => buildBreak(s.startDate, s.leaveDays)).reverse(), [saved])
  const savedKeys = useMemo(() => new Set(saved.map(breakKey)), [saved])
  const { savedDayTypes, savedStarts } = useMemo(() => {
    const types = new Map()
    for (const b of savedBreaks) for (const d of b.days) if (!types.has(d.date)) types.set(d.date, d.type)
    return { savedDayTypes: types, savedStarts: new Set(savedBreaks.map(b => b.startDate)) }
  }, [savedBreaks])

  const previewBreaks = useMemo(() => {
    if (previewId === 'next') return picks.nextBig ? [picks.nextBig.brk] : []
    if (previewId === 'max') return picks.maxLeave ? [picks.maxLeave] : []
    if (previewId === 'six') return picks.sixMonths ? [picks.sixMonths] : []
    if (previewId === 'year') return picks.yearPlan
    return null
  }, [previewId, picks])
  const preview = useMemo(() => {
    if (!previewBreaks) return { dayTypes: null, starts: null }
    const dayTypes = new Map()
    for (const b of previewBreaks) for (const d of b.days) dayTypes.set(d.date, d.type)
    return { dayTypes, starts: new Set(previewBreaks.map(b => b.startDate)) }
  }, [previewBreaks])

  // Details: the day under the mouse, else a pinned saved break, else the
  // previewed quick pick, else the last day hovered.
  const showYearPlan = previewId === 'year' && !hoveredDate && !pinned
  const previewSingle = previewBreaks && previewId !== 'year' ? previewBreaks[0] ?? null : null
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
  const bestNote = detailBreak && !pinned && detailBreak.leaveDays < leaveDays
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
  const yearSwitch = <YearSwitch years={PLAN_YEARS} value={planYear} onChange={setPlanYear} />

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
    setPreviewId(null)
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

  function viewOnCalendar(id) {
    setPreviewId(id)
    setPinned(null)
    setLastHoveredDate(null)
    setTab('details')
    setPage('calendar')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <DesktopHeader page={page} onPageChange={setPage} />
      <main className="max-w-[1320px] mx-auto px-8 pt-7 pb-12 flex flex-col gap-4">
        {page === 'overview' && (
          <OverviewPage
            picks={picks}
            year={planYear}
            years={PLAN_YEARS}
            onYearChange={setPlanYear}
            leaveDays={leaveDays}
            maxLeave={MAX_LEAVE}
            onLeaveDaysChange={setLeaveDays}
            isSaved={isSaved}
            onAdd={addBreaks}
            onView={viewOnCalendar}
            yearBreaks={savedBreaks.filter(b => b.startDate.startsWith(String(planYear)))}
            allowance={ALLOWANCE}
            onOpenCalendar={() => setPage('calendar')}
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
              rangeChanged={from !== TODAY || to !== LAST_DATE}
              onResetRange={() => { setFrom(TODAY); setTo(LAST_DATE) }}
              holidayOptions={holidayOptions}
              holidayFilter={holidayFilter}
              onHolidayFilterChange={setHolidayFilter}
              picksOnly={picksOnly}
              onPicksOnlyChange={setPicksOnly}
              savedCount={saved.length}
              colourBy={colourBy}
            />

            {previewId && (
              <PreviewBanner
                title={PICK_TITLES[previewId]}
                onBack={() => setPage('overview')}
                onClear={() => setPreviewId(null)}
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
                previewDayTypes={preview.dayTypes}
                previewStarts={preview.starts}
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
                details={showYearPlan ? (
                  <YearPlanPreview
                    year={planYear}
                    breaks={picks.yearPlan}
                    yearSwitch={yearSwitch}
                    allSaved={picks.yearPlan.length > 0 && picks.yearPlan.every(isSaved)}
                    onAddAll={() => addFromCalendar(picks.yearPlan)}
                  />
                ) : (
                  <BreakDetailPanel
                    brk={detailBreak}
                    nextBreak={nextBreak}
                    bestNote={bestNote}
                    label={showingPreview ? PICK_TITLES[previewId] : null}
                    topSlot={showingPreview && previewId === 'max' ? yearSwitch : null}
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
