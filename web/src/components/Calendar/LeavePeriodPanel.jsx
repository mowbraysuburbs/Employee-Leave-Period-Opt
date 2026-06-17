import { useMemo, useRef, useEffect, useState, useCallback } from 'react'
import { getLeaveRange } from '../../utils/leaveCalculator'
import ALL_EVENTS from '../../data/quicketEvents.json'

const SHORT_DAY   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const SHORT_MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const WEEKDAY_LABELS = ['M','T','W','T','F','S','S']

function formatNice(dateStr) {
  const [y, mo, day] = dateStr.split('-').map(Number)
  const d = new Date(y, mo - 1, day)
  return `${SHORT_DAY[d.getDay()]} ${d.getDate()} ${SHORT_MONTH[d.getMonth()]} '${String(y).slice(2)}`
}
function formatEventDate(isoStr) {
  const d = new Date(isoStr)
  return `${d.getDate()} ${SHORT_MONTH[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`
}
function formatTime(isoStr) {
  if (!isoStr) return null
  const d = new Date(isoStr)
  const h = d.getHours(), m = d.getMinutes()
  if (h === 0 && m === 0) return null
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}${m > 0 ? ':' + String(m).padStart(2, '0') : ''} ${ampm}`
}
function formatPrice(minPrice, maxPrice) {
  const min = parseFloat(minPrice)
  if (isNaN(min)) return null
  if (min === 0) return 'Free'
  const max = parseFloat(maxPrice)
  if (isNaN(max) || min === max) return `R${min.toLocaleString('en-ZA')}`
  return `R${min.toLocaleString('en-ZA')} – R${max.toLocaleString('en-ZA')}`
}
function toCellDate(year, month, dayNum) {
  return `${year}-${String(month).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`
}
function toggleSet(setter, value) {
  setter(prev => {
    const next = new Set(prev)
    next.has(value) ? next.delete(value) : next.add(value)
    return next
  })
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

function EventExpandedDetail({ ev }) {
  const cats     = ev.categories.split(', ').filter(Boolean)
  const price    = formatPrice(ev.minPrice, ev.maxPrice)
  const startTime = formatTime(ev.startDate)
  const endTime   = formatTime(ev.endDate)
  const sameDay   = ev.endDate && ev.endDate.slice(0,10) === ev.startDate.slice(0,10)

  return (
    <div className="flex flex-col gap-2 px-4 pb-3 pt-2">
      {/* Venue */}
      {ev.venue && (
        <div className="flex items-start gap-1.5">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5">📍</span>
          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            {ev.venue}{ev.city && ev.venue !== ev.city ? `, ${ev.city}` : ''}
          </p>
        </div>
      )}

      {/* Date + time */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0">🕐</span>
        <p className="text-[11px] text-slate-600 dark:text-slate-300">
          {sameDay
            ? <>{formatEventDate(ev.startDate)}{startTime ? ` · ${startTime}` : ''}{endTime && endTime !== startTime ? ` – ${endTime}` : ''}</>
            : <>{formatEventDate(ev.startDate)}{startTime ? ` ${startTime}` : ''} → {formatEventDate(ev.endDate)}{endTime ? ` ${endTime}` : ''}</>
          }
        </p>
      </div>

      {/* Price */}
      {price && (
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0">🎟</span>
          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{price}</p>
        </div>
      )}

      {/* Category chips */}
      {cats.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {cats.map(c => (
            <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">{c}</span>
          ))}
        </div>
      )}

      {/* Description (HTML from API) */}
      {ev.description && (
        <div
          className="max-h-36 overflow-y-auto text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed
            [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4
            [&_li]:mt-0.5 [&_strong]:font-semibold [&_em]:italic [&_a]:text-sky-500
            [&_br]:block border-t border-slate-100 dark:border-slate-700 pt-2 mt-1"
          dangerouslySetInnerHTML={{ __html: ev.description }}
        />
      )}

      {/* Book link */}
      <a
        href={ev.url}
        target="_blank"
        rel="noreferrer"
        className="text-[11px] font-bold text-sky-500 hover:text-sky-600 transition-colors self-start mt-0.5"
        onClick={e => e.stopPropagation()}
      >Book tickets →</a>
    </div>
  )
}

export function LeavePeriodPanel({ date, leaveDays, onClose }) {
  const { startDate, endDate, daysOff, breakdown } = useMemo(
    () => getLeaveRange(date, leaveDays), [date, leaveDays]
  )
  const rows       = useMemo(() => buildRows(breakdown), [breakdown])
  const leaveCount = breakdown.filter(d => d.type === 'leave').length
  const phCount    = breakdown.filter(d => d.type === 'public_holiday').length
  const wkndCount  = breakdown.filter(d => d.type === 'weekend').length

  const events = useMemo(() => {
    const s = startDate.slice(0, 10), e = endDate.slice(0, 10)
    return ALL_EVENTS.filter(ev => { const d = ev.startDate.slice(0,10); return d >= s && d <= e })
  }, [startDate, endDate])

  const availableLocations  = useMemo(() => [...new Set(events.map(e => e.city).filter(Boolean))].sort(), [events])
  const availableCategories = useMemo(() => {
    const cats = new Set()
    events.forEach(e => e.categories.split(', ').filter(Boolean).forEach(c => cats.add(c)))
    return [...cats].sort()
  }, [events])

  // Filter state
  const [selectedDates,  setSelectedDates]  = useState(new Set())
  const [locationFilter, setLocationFilter] = useState(new Set())
  const [categoryFilter, setCategoryFilter] = useState(new Set())
  const [locationOpen,   setLocationOpen]   = useState(false)
  const [categoryOpen,   setCategoryOpen]   = useState(false)
  const [categorySearch, setCategorySearch] = useState('')

  // Expanded card
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    setSelectedDates(new Set())
    setLocationFilter(new Set())
    setCategoryFilter(new Set())
    setLocationOpen(false)
    setCategoryOpen(false)
    setCategorySearch('')
    setExpandedId(null)
  }, [events]) // eslint-disable-line

  const filteredEvents = useMemo(() => events.filter(ev => {
    const d = ev.startDate.slice(0, 10)
    if (selectedDates.size  > 0 && !selectedDates.has(d))                                        return false
    if (locationFilter.size > 0 && !locationFilter.has(ev.city))                                  return false
    if (categoryFilter.size > 0 && !ev.categories.split(', ').some(c => categoryFilter.has(c))) return false
    return true
  }), [events, selectedDates, locationFilter, categoryFilter])

  const filteredCategories = useMemo(() =>
    categorySearch.trim()
      ? availableCategories.filter(c => c.toLowerCase().includes(categorySearch.toLowerCase()))
      : availableCategories,
    [availableCategories, categorySearch]
  )

  // Scroll + spotlight
  const [activeIdx,         setActiveIdx]         = useState(0)
  const [spotlightExpanded, setSpotlightExpanded] = useState(false)
  const scrollRef  = useRef(null)
  const cardRefs   = useRef([])
  const visibleSet = useRef(new Set())

  // Reset scroll + spotlight whenever the filtered list changes
  useEffect(() => {
    setActiveIdx(0)
    setExpandedId(null)
    setSpotlightExpanded(false)
    visibleSet.current = new Set()
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [filteredEvents])

  // IntersectionObserver — always tracks the topmost visible card
  useEffect(() => {
    if (!filteredEvents.length || !scrollRef.current) return
    cardRefs.current = cardRefs.current.slice(0, filteredEvents.length)
    visibleSet.current = new Set()

    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const idx = Number(e.target.dataset.index)
        if (e.isIntersecting) visibleSet.current.add(idx)
        else visibleSet.current.delete(idx)
      })
      if (visibleSet.current.size > 0) {
        setActiveIdx(Math.min(...visibleSet.current))
      }
    }, { root: scrollRef.current, threshold: 0.4 })

    cardRefs.current.forEach(el => el && observer.observe(el))
    return () => observer.disconnect()
  }, [filteredEvents])

  // Collapse spotlight when the active event changes
  useEffect(() => { setSpotlightExpanded(false) }, [activeIdx])

  const active     = filteredEvents[activeIdx]
  const activeDate = active?.startDate.slice(0, 10) ?? null

  const chipCls = isOn =>
    `text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 ${
      isOn
        ? 'bg-sky-500 text-white'
        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
    }`

  const handleCardClick = useCallback((ev, i) => {
    setExpandedId(id => id === ev.id ? null : ev.id)
  }, [])

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />

      <div
        className="relative z-50 w-full max-w-sm mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex-shrink-0 relative px-5 pt-5 pb-3 text-center">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-lg leading-none"
          >×</button>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100">Leave Period: {daysOff} Days</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{formatNice(startDate)} → {formatNice(endDate)}</p>
        </div>

        {/* ── Spotlight bar (click to expand/collapse) ── */}
        {active && (
          <div className="flex-shrink-0 border-t border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
            <button
              className="w-full px-4 py-3 flex gap-3 items-center text-left"
              onClick={() => setSpotlightExpanded(v => !v)}
            >
              <img
                src={`https:${active.imageUrl}`}
                alt=""
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-slate-200 dark:bg-slate-700"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight line-clamp-2">{active.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {formatEventDate(active.startDate)} · {active.city || active.venue}
                </p>
              </div>
              <span className={`flex-shrink-0 text-slate-400 dark:text-slate-500 text-sm transition-transform duration-200 ${spotlightExpanded ? 'rotate-180' : ''}`}>▾</span>
            </button>

            {/* Expanded spotlight details */}
            {spotlightExpanded && (
              <div className="border-t border-slate-100 dark:border-slate-800">
                <EventExpandedDetail ev={active} />
              </div>
            )}
          </div>
        )}

        {/* ── Calendar (static — dates clickable to filter) ── */}
        <div className="flex-shrink-0 px-4 pt-3">
          <div className="grid grid-cols-[repeat(7,1fr)_32px] mb-1">
            {WEEKDAY_LABELS.map((h, i) => (
              <div key={i} className={`text-center text-[10px] font-semibold uppercase ${i >= 5 ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500 dark:text-slate-400'}`}>{h}</div>
            ))}
            <div />
          </div>

          <div className="flex flex-col">
            {rows.map((row, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-[repeat(7,1fr)_32px]">
                {row.cells.map((cell, ci) => {
                  const cellDate   = !cell.outside ? toCellDate(cell.year, cell.month, cell.dayNum) : null
                  const isSelected = !!cellDate && selectedDates.has(cellDate)
                  const isDimmed   = !!cellDate && selectedDates.size > 0 && !isSelected
                  const isActive   = cellDate === activeDate

                  return (
                    <div
                      key={`${rowIdx}-${ci}`}
                      className={`flex items-center justify-center py-0.5 ${!cell.outside ? 'cursor-pointer' : ''}`}
                      onClick={() => { if (!cell.outside && cellDate) toggleSet(setSelectedDates, cellDate) }}
                    >
                      <div
                        className="w-full aspect-square rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200"
                        style={
                          cell.outside
                            ? { backgroundColor: 'transparent', color: '#64748b', opacity: 0.35 }
                            : {
                                backgroundColor: TYPE_COLOUR[cell.type],
                                color: '#fff',
                                opacity: isDimmed ? 0.3 : 1,
                                transform: isActive ? 'scale(1.15)' : isSelected ? 'scale(1.08)' : undefined,
                                boxShadow: isActive
                                  ? '0 0 0 2.5px #fff, 0 0 0 4.5px #38bdf8'
                                  : isSelected
                                  ? '0 0 0 2px #fff, 0 0 0 4px #94a3b8'
                                  : undefined,
                              }
                        }
                      >
                        {cell.dayNum}
                      </div>
                    </div>
                  )
                })}
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
          <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 py-3">
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
        </div>

        {/* ── Events header + filter dropdowns (static, inline-expanding) ── */}
        {events.length > 0 && (
          <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700">
            {/* Count + chip buttons */}
            <div className="px-4 py-2 flex items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex-shrink-0">
                Events · {filteredEvents.length}
                {filteredEvents.length !== events.length && (
                  <span className="text-slate-300 dark:text-slate-600"> / {events.length}</span>
                )}
              </p>
              <div className="flex gap-1.5 ml-auto">
                <button className={chipCls(locationFilter.size > 0 || locationOpen)} onClick={() => { setLocationOpen(v => !v); setCategoryOpen(false) }}>
                  Location{locationFilter.size > 0 ? ` (${locationFilter.size})` : ''} ▾
                </button>
                <button className={chipCls(categoryFilter.size > 0 || categoryOpen)} onClick={() => { setCategoryOpen(v => !v); setLocationOpen(false) }}>
                  Category{categoryFilter.size > 0 ? ` (${categoryFilter.size})` : ''} ▾
                </button>
              </div>
            </div>

            {/* Location dropdown */}
            {locationOpen && (
              <div className="max-h-36 overflow-y-auto border-t border-slate-100 dark:border-slate-700 px-4 py-1">
                {availableLocations.map(loc => (
                  <label key={loc} className="flex items-center gap-2.5 py-1.5 cursor-pointer select-none">
                    <input type="checkbox" checked={locationFilter.has(loc)} onChange={() => toggleSet(setLocationFilter, loc)} className="rounded accent-sky-500" />
                    <span className="text-xs text-slate-700 dark:text-slate-300">{loc}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Category dropdown with search */}
            {categoryOpen && (
              <div className="border-t border-slate-100 dark:border-slate-700 flex flex-col">
                <div className="px-3 pt-2 pb-1">
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={e => setCategorySearch(e.target.value)}
                    placeholder="Search categories…"
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-sky-400 dark:focus:border-sky-500 transition-colors"
                    autoFocus
                  />
                </div>
                <div className="max-h-32 overflow-y-auto px-4 py-1">
                  {filteredCategories.length === 0 && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 py-2 text-center">No matches</p>
                  )}
                  {filteredCategories.map(cat => (
                    <label key={cat} className="flex items-center gap-2.5 py-1.5 cursor-pointer select-none">
                      <input type="checkbox" checked={categoryFilter.has(cat)} onChange={() => toggleSet(setCategoryFilter, cat)} className="rounded accent-sky-500" />
                      <span className="text-xs text-slate-700 dark:text-slate-300">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Scrollable event list ── */}
        {events.length > 0 && (
          <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
            {filteredEvents.length === 0 && (
              <p className="px-4 py-6 text-xs text-center text-slate-400 dark:text-slate-500">No events match your filters.</p>
            )}
            {filteredEvents.map((ev, i) => {
              const isExpanded = expandedId === ev.id

              return (
                <div
                  key={ev.id}
                  data-index={i}
                  ref={el => { cardRefs.current[i] = el }}
                  className={`border-t border-slate-100 dark:border-slate-700 transition-colors ${
                    i === activeIdx ? 'bg-sky-50 dark:bg-sky-900/20' : ''
                  }`}
                >
                  {/* Card row — click to expand */}
                  <button
                    className="w-full px-4 py-2.5 flex gap-3 items-center text-left"
                    onClick={() => handleCardClick(ev, i)}
                  >
                    <img
                      src={`https:${ev.imageUrl}`}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-slate-200 dark:bg-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{ev.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{formatEventDate(ev.startDate)} · {ev.city || ev.venue}</p>
                    </div>
                    <span className={`flex-shrink-0 text-slate-300 dark:text-slate-600 text-xs transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▾</span>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && <EventExpandedDetail ev={ev} />}
                </div>
              )
            })}
            <div className="h-4" />
          </div>
        )}
      </div>
    </div>
  )
}
