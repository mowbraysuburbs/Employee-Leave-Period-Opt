import { useState, useMemo } from 'react'
import { DesktopHeader } from './DesktopHeader'
import { LeaveDaysCard } from './LeaveDaysCard'
import { ColourModeCard } from './ColourModeCard'
import { CalendarToolbar } from './CalendarToolbar'
import { YearCalendar } from './YearCalendar'
import { BreakDetailPanel } from './BreakDetailPanel'
import { MyBreaksPanel } from './MyBreaksPanel'
import { HolidaysList } from '../Features/HolidaysList'
import { useSavedBreaks } from './useSavedBreaks'
import { buildBreak, buildBreaksInRange, breakKey } from '../../utils/breaks'
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
  // { startDate, leaveDays } of the break open in the side panel, or null.
  const [detail, setDetail] = useState(null)
  const [justAddedKey, setJustAddedKey] = useState(null)
  const { saved, add, remove } = useSavedBreaks()

  const months = useMemo(() => monthsBetween(from, to), [from, to])
  const breaks = useMemo(() => buildBreaksInRange(from, to, leaveDays), [from, to, leaveDays])

  const savedBreaks = useMemo(() => saved.map(s => buildBreak(s.startDate, s.leaveDays)).reverse(), [saved])
  const { savedDayTypes, savedStarts } = useMemo(() => {
    const types = new Map()
    for (const b of savedBreaks) for (const d of b.days) if (!types.has(d.date)) types.set(d.date, d.type)
    return { savedDayTypes: types, savedStarts: new Set(savedBreaks.map(b => b.startDate)) }
  }, [savedBreaks])

  const detailBreak = useMemo(() => detail && buildBreak(detail.startDate, detail.leaveDays), [detail])
  const nextBreak = useMemo(() => detail && buildBreak(detail.startDate, detail.leaveDays + 1), [detail])

  // Each holiday in the period once, for the filter menu.
  const holidayOptions = useMemo(() => {
    const seen = new Map()
    for (const brk of Object.values(breaks)) {
      const first = brk.days[0]
      if (first.holidayName && !seen.has(first.holidayName)) seen.set(first.holidayName, fmtDay(first.date).slice(4))
    }
    return [...seen].map(([name, when]) => ({ name, when }))
  }, [breaks])

  const legend = useMemo(() => {
    const values = Object.values(breaks).map(b => (colourBy === 'multiplier' ? multiplierBucket(b.multiplier) : b.daysOff))
    return [...new Set(values)].sort((a, b) => a - b).map(v => colourBy === 'multiplier'
      // Buckets are 0.25 steps, so show them exactly (1.25×) rather than rounded.
      ? { label: `${v}×`, colour: getColourForMultiplier(v) }
      : { label: String(v), colour: getColourForDaysOff(v) })
  }, [breaks, colourBy])

  function handleAdd() {
    add(detail)
    setJustAddedKey(breakKey(detail))
    setDetail(null)
  }

  function handleRemove(entry) {
    remove(entry)
    setDetail(null)
    if (breakKey(entry) === justAddedKey) setJustAddedKey(null)
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
              <ColourModeCard colourBy={colourBy} onColourByChange={setColourBy} legend={legend} picksOnly={picksOnly} />
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
                detail={detailBreak}
                onDayClick={date => { setDetail({ startDate: date, leaveDays }); setJustAddedKey(null) }}
              />

              <aside className="flex-[1_1_340px] min-w-0 bg-white rounded-[20px] p-[22px] shadow-sm">
                {detailBreak ? (
                  <BreakDetailPanel
                    brk={detailBreak}
                    nextBreak={detail.leaveDays < MAX_LEAVE ? nextBreak : null}
                    isSaved={saved.some(s => breakKey(s) === breakKey(detail))}
                    onAdd={handleAdd}
                    onRemove={() => handleRemove(detail)}
                    onBack={() => setDetail(null)}
                  />
                ) : (
                  <MyBreaksPanel
                    breaks={savedBreaks}
                    allowance={ALLOWANCE}
                    justAddedKey={justAddedKey}
                    onOpen={b => setDetail({ startDate: b.startDate, leaveDays: b.leaveDays })}
                    onRemove={handleRemove}
                    onDismissAdded={() => setJustAddedKey(null)}
                  />
                )}
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
