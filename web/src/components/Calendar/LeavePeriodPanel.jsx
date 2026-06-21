import { useMemo, useState, useEffect, useRef } from 'react'
import { getLeaveRange } from '../../utils/leaveCalculator'
import { PUBLIC_HOLIDAYS } from '../../data/publicHolidays'

const HOLIDAY_MAP = new Map(
  Object.values(PUBLIC_HOLIDAYS).flat().map(({ date, name }) => [date, name])
)

const SHORT_DAY   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const SHORT_MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const WEEKDAY_LABELS = ['M','T','W','T','F','S','S']

function formatNice(dateStr) {
  const [y, mo, day] = dateStr.split('-').map(Number)
  const d = new Date(y, mo - 1, day)
  return `${SHORT_DAY[d.getDay()]} ${d.getDate()} ${SHORT_MONTH[d.getMonth()]} '${String(y).slice(2)}`
}
function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function buildIcs(startDate, endDate, daysOff, leaveDays) {
  const start  = startDate.replace(/-/g, '')
  const excEnd = addDays(endDate, 1).replace(/-/g, '')
  const summary = `Leave – ${daysOff} days off`
  const desc    = `${leaveDays} leave day${leaveDays !== 1 ? 's' : ''} used · ${daysOff} total days off`
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Leave Planner//EN',
    'BEGIN:VEVENT',
    `UID:leave-${start}@leaveplanner`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${excEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${desc}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}
function downloadIcs(startDate, endDate, daysOff, leaveDays) {
  const ics  = buildIcs(startDate, endDate, daysOff, leaveDays)
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'leave.ics'
  a.click()
  URL.revokeObjectURL(url)
}

const LEGEND = [
  { type: 'leave',          colour: '#38bdf8', label: 'Leave day' },
  { type: 'public_holiday', colour: '#fb923c', label: 'Public holiday' },
  { type: 'weekend',        colour: '#475569', label: 'Weekend' },
]
const TYPE_COLOUR = Object.fromEntries(LEGEND.map(l => [l.type, l.colour]))

function buildRows(breakdown) {
  if (!breakdown.length) return []
  const [fy, fm, fd] = breakdown[0].date.split('-').map(Number)
  const startObj    = new Date(fy, fm - 1, fd)
  const firstDayMon = (startObj.getDay() + 6) % 7
  const allCells    = []
  for (let i = 0; i < firstDayMon; i++) {
    const d = new Date(startObj)
    d.setDate(d.getDate() - (firstDayMon - i))
    allCells.push({ outside: true, dayNum: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() })
  }
  for (const { date: dateStr, type } of breakdown) {
    const [dy, dm, dd] = dateStr.split('-').map(Number)
    allCells.push({ outside: false, type, dayNum: dd, month: dm, year: dy })
  }
  const last = allCells[allCells.length - 1]
  const tail = new Date(last.year, last.month - 1, last.dayNum)
  while (allCells.length % 7 !== 0) {
    tail.setDate(tail.getDate() + 1)
    allCells.push({ outside: true, dayNum: tail.getDate(), month: tail.getMonth() + 1, year: tail.getFullYear() })
  }
  const rows = []
  let prevMonth = null
  for (let r = 0; r < allCells.length; r += 7) {
    const cells = allCells.slice(r, r + 7)
    const nm = cells.find(c => c.month !== prevMonth)
    if (nm) {
      rows.push({ cells, monthLabel: SHORT_MONTH[nm.month - 1], monthYear: `'${String(nm.year).slice(2)}` })
      prevMonth = nm.month
    } else {
      rows.push({ cells, monthLabel: null, monthYear: null })
    }
  }
  return rows
}

export function LeavePeriodPanel({ date, leaveDays, onClose }) {
  const [currentDate, setCurrentDate] = useState(date)
  const openedAt = useRef(Date.now())

  useEffect(() => { setCurrentDate(date) }, [date])

  function shiftDay(delta) { setCurrentDate(prev => addDays(prev, delta)) }

  const [offset, setOffset]       = useState(0)
  const [animating, setAnimating] = useState(false)
  const touchStartX = useRef(0)

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
    setAnimating(false)
  }
  function handleTouchMove(e) {
    setOffset(e.touches[0].clientX - touchStartX.current)
  }
  function handleTouchEnd(e) {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) < 50) {
      setAnimating(true)
      setOffset(0)
      return
    }
    const goNext  = dx < 0
    const exitTo  = goNext ? -380 : 380
    const enterFrom = goNext ? 380 : -380
    setAnimating(true)
    setOffset(exitTo)
    setTimeout(() => {
      shiftDay(goNext ? 1 : -1)
      setAnimating(false)
      setOffset(enterFrom)
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setAnimating(true)
        setOffset(0)
      }))
    }, 126)
  }

  const { startDate, endDate, daysOff, breakdown } = useMemo(
    () => getLeaveRange(currentDate, leaveDays), [currentDate, leaveDays]
  )
  const rows       = useMemo(() => buildRows(breakdown), [breakdown])
  const leaveCount = breakdown.filter(d => d.type === 'leave').length
  const phCount    = breakdown.filter(d => d.type === 'public_holiday').length
  const wkndCount  = breakdown.filter(d => d.type === 'weekend').length

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" onClick={() => { if (Date.now() - openedAt.current > 800) onClose() }}>
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      <div
        className="relative z-50 w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex-shrink-0 relative px-5 pt-5 pb-3 text-center">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-lg leading-none"
          >×</button>

          <p className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100">
            Leave Period: {daysOff} Days
          </p>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {formatNice(startDate)} → {formatNice(endDate)}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1">swipe calendar to change day</p>

        </div>

        {/* ── Sync button ── */}
        <div className="flex-shrink-0 px-5 pb-3 pt-1">
          <button
            onClick={() => downloadIcs(startDate, endDate, daysOff, leaveDays)}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-semibold transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.89 2 3 2.9 3 4v16c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H5V8h14v14z"/>
            </svg>
            Sync to Calendar
          </button>
        </div>

        {/* ── Calendar — swipe left/right to change day ── */}
        <div
          className="flex-shrink-0 px-4 pt-3 pb-4 flex flex-col items-center select-none overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="w-full max-w-xs"
            style={{
              transform: `translateX(${offset}px)`,
              transition: animating ? 'transform 0.15s cubic-bezier(0.25,0.46,0.45,0.94)' : 'none',
              opacity: Math.max(0.3, 1 - Math.abs(offset) / 300),
            }}
          >
          <div className="grid grid-cols-[repeat(7,1fr)_32px] mb-1">
            {WEEKDAY_LABELS.map((h, i) => (
              <div key={i} className={`text-center text-[10px] font-semibold uppercase ${i >= 5 ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>{h}</div>
            ))}
            <div />
          </div>

          <div className="flex flex-col">
            {rows.map((row, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-[repeat(7,1fr)_32px]">
                {row.cells.map((cell, ci) => (
                  <div
                    key={`${rowIdx}-${ci}`}
                    className="flex items-center justify-center py-0.5"
                  >
                    <div
                      className="w-full aspect-square rounded-full flex items-center justify-center text-xs font-semibold"
                      style={
                        cell.outside
                          ? { backgroundColor: 'transparent', color: '#64748b', opacity: 0.35 }
                          : { backgroundColor: TYPE_COLOUR[cell.type], color: '#fff' }
                      }
                    >
                      {cell.dayNum}
                    </div>
                  </div>
                ))}
                <div className="flex flex-col items-start justify-center pl-2">
                  {row.monthLabel && (
                    <>
                      <span className="text-[8px] font-bold text-slate-700 dark:text-slate-200 uppercase leading-tight">{row.monthLabel}</span>
                      <span className="text-[7px] font-medium text-slate-400 dark:text-slate-500 leading-tight">{row.monthYear}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 pt-3">
            {LEGEND.map(({ type, colour, label }) => {
              const count = type === 'leave' ? leaveCount : type === 'public_holiday' ? phCount : wkndCount
              if (!count) return null
              return (
                <span key={type} className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colour }} />
                  {label}
                </span>
              )
            })}
          </div>

          {/* Public holidays list */}
          {phCount > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-1.5">
              {breakdown
                .filter(d => d.type === 'public_holiday')
                .map(({ date }) => (
                  <div key={date} className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                      {HOLIDAY_MAP.get(date) ?? 'Public Holiday'}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums whitespace-nowrap">
                      {formatNice(date)}
                    </span>
                  </div>
                ))}
            </div>
          )}
          </div>
        </div>

      </div>
    </div>
  )
}
