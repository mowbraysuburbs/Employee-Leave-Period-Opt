import { useState, useMemo } from 'react'
import { DesktopHeader } from './DesktopHeader'
import { LeaveDaysCard } from './LeaveDaysCard'
import { ColourModeCard } from './ColourModeCard'
import { CalendarToolbar } from './CalendarToolbar'
import { YearCalendar } from './YearCalendar'
import { SidePanel } from './SidePanel'
import { BreakDetailPanel } from './BreakDetailPanel'
import { MyBreaksPanel } from './MyBreaksPanel'
import { HolidaysList } from '../Features/HolidaysList'
import { useSavedBreaks } from './useSavedBreaks'
import { buildBreak, buildBreaksInRange, breakKey, hasGain } from '../../utils/breaks'
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
  const [page, setPage] = useState('calendar')
  const [leaveDays, setLeaveDays] = useState(3)
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
  const [confirmDate, setConfirmDate] = useState(null)
  const [justAddedKey, setJustAddedKey] = useState(null)
  const { saved, add, remove } = useSavedBreaks()

  const months = useMemo(() => monthsBetween(from, to), [from, to])
  // Multiplier mode colours each day by its best deal using up to leaveDays.
  const breaks = useMemo(
    () => buildBreaksInRange(from, to, leaveDays, { best: colourBy === 'multiplier' }),
    [from, to, leaveDays, colourBy]
  )

  const savedBreaks = useMemo(() => saved.map(s => buildBreak(s.startDate, s.leaveDays)).reverse(), [saved])
  const savedKeys = useMemo(() => new Set(saved.map(breakKey)), [saved])
  const { savedDayTypes, savedStarts } = useMemo(() => {
    const types = new Map()
    for (const b of savedBreaks) for (const d of b.days) if (!types.has(d.date)) types.set(d.date, d.type)
    return { savedDayTypes: types, savedStarts: new Set(savedBreaks.map(b => b.startDate)) }
  }, [savedBreaks])

  const detailBreak = useMemo(() => {
    if (pinned) return buildBreak(pinned.startDate, pinned.leaveDays)
    return (lastHoveredDate && breaks[lastHoveredDate]) || null
  }, [pinned, lastHoveredDate, breaks])
  const nextBreak = useMemo(
    () => (detailBreak && detailBreak.leaveDays < MAX_LEAVE ? buildBreak(detailBreak.startDate, detailBreak.leaveDays + 1) : null),
    [detailBreak]
  )
  const bestNote = !pinned && colourBy === 'multiplier' && detailBreak && detailBreak.leaveDays < leaveDays
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

  function handleDayHover(date) {
    setHoveredDate(date)
    if (date) {
      setLastHoveredDate(date)
      setPinned(null)
    }
  }

  function addBreak(brk) {
    add({ startDate: brk.startDate, leaveDays: brk.leaveDays })
    setJustAddedKey(breakKey(brk))
    setTab('summary')
  }

  function removeBreak(entry) {
    remove(entry)
    if (breakKey(entry) === justAddedKey) setJustAddedKey(null)
  }

  function handleConfirm() {
    const brk = breaks[confirmDate]
    if (isSaved(brk)) removeBreak(brk)
    else addBreak(brk)
    setConfirmDate(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <DesktopHeader page={page} onPageChange={setPage} />
      <main className="max-w-[1320px] mx-auto px-8 pt-7 pb-12 flex flex-col gap-4">
        {page === 'holidays' ? (
          <HolidaysList months={months} showSchoolHolidays={false} provinceCode="GP" />
        ) : (
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
                details={
                  <BreakDetailPanel
                    brk={detailBreak}
                    nextBreak={nextBreak}
                    bestNote={bestNote}
                    isSaved={detailBreak ? isSaved(detailBreak) : false}
                    onAdd={() => addBreak(detailBreak)}
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
            </div>
          </>
        )}
      </main>
    </div>
  )
}
