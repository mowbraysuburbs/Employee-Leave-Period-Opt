import { useState, useMemo, useEffect } from 'react'
import { CalendarHeatmap } from './components/Calendar/CalendarHeatmap'
import { HolidaysList } from './components/Features/HolidaysList'
import { LeavePlannerTab } from './components/Features/LeavePlannerTab'
import { BottomTabBar } from './components/Layout/BottomTabBar'
import { LeaveDayRoller } from './components/Layout/LeaveDayRoller'
import { computeLeaveScores } from './utils/leaveCalculator'
import { getColourForDaysOff } from './utils/colorScale'
import { allBestPeriodsCache } from './components/Features/LeavePlannerTab'
import { PROVINCES } from './data/schoolHolidays'

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MAX_LEAVE = 10

function addMonths(ym, n) {
  const total = ym.year * 12 + (ym.month - 1) + n
  return { year: Math.floor(total / 12), month: (total % 12) + 1 }
}

function monthLabel(ym) {
  return `${MONTH_SHORT[ym.month - 1]} ${ym.year}`
}

const today = new Date()
const TODAY_STR = today.toISOString().slice(0, 10)
const DATASET_END = '2028-01-01'
const WINDOW_START = { year: today.getFullYear(), month: today.getMonth() + 1 }
const ALL_MONTHS = Array.from({ length: 13 }, (_, i) => addMonths(WINDOW_START, i))

function fmtPill(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return `${d} ${MONTH_SHORT[+m - 1]} ${y.slice(2)}`
}

// Desktop's Calendar/Planner panes are a genuinely different shape than mobile's
// single active tab (a resizable split vs one full-width view), so we mount
// exactly one of the two content trees rather than CSS-hiding both.
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

// Calendar-specific "From month" control — desktop only, lives beside the
// Calendar pane rather than in a global settings popup.
function MonthPicker({ viewStart, onChange }) {
  return (
    <div className="hidden md:flex items-center gap-2 mb-3">
      <label className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide flex-shrink-0">
        From
      </label>
      <select
        value={`${viewStart.year}-${viewStart.month}`}
        onChange={(e) => {
          const [y, m] = e.target.value.split('-')
          onChange({ year: parseInt(y, 10), month: parseInt(m, 10) })
        }}
        className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-lg px-3 py-1.5 border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-sky-500"
      >
        {ALL_MONTHS.map((ym) => (
          <option key={`${ym.year}-${ym.month}`} value={`${ym.year}-${ym.month}`}>
            {monthLabel(ym)}
          </option>
        ))}
      </select>
    </div>
  )
}

function SwapIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 5h18" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 19H3" />
    </svg>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('heatmap')
  const [leaveDays, setLeaveDays] = useState(3)
  const [viewStart, setViewStart] = useState(WINDOW_START)
  const [showSchoolHols, setShowSchoolHols] = useState(false)
  const [provinceCode, setProvinceCode] = useState('GP')
  const [darkMode, setDarkMode] = useState(true)
  const [filterSet, setFilterSet] = useState(new Set())
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [smartFilter, setSmartFilter] = useState(true)
  const [viewMode, setViewMode] = useState('1x')
  const [dateSheetOpen, setDateSheetOpen] = useState(false)
  const [plannerStart, setPlannerStart] = useState(TODAY_STR)
  const [plannerEnd, setPlannerEnd] = useState(DATASET_END)

  // Desktop-only pane toggles — replace the old sidebar's exclusive tab nav.
  // Either or both can be on; a handler refuses to turn the last one off.
  const [calendarOn, setCalendarOn] = useState(true)
  const [plannerOn, setPlannerOn] = useState(false)
  const [splitRatio, setSplitRatio] = useState(0.5)
  const [dragging, setDragging] = useState(false)
  const [swapped, setSwapped] = useState(false)

  const isDesktop = useIsDesktop()

  useEffect(() => {
    document.documentElement.classList[darkMode ? 'add' : 'remove']('dark')
  }, [darkMode])

  const viewEnd = addMonths(viewStart, 11)

  const startDateStr = `${viewStart.year}-${String(viewStart.month).padStart(2, '0')}-01`
  const endDateStr = (() => {
    const lastDay = new Date(viewEnd.year, viewEnd.month, 0).getDate()
    return `${viewEnd.year}-${String(viewEnd.month).padStart(2, '0')}-${lastDay}`
  })()

  const months = useMemo(() => {
    const result = []
    let cur = { ...viewStart }
    while (cur.year < viewEnd.year || (cur.year === viewEnd.year && cur.month <= viewEnd.month)) {
      result.push({ ...cur })
      cur = addMonths(cur, 1)
    }
    return result
  }, [viewStart])

  const scores = useMemo(
    () => computeLeaveScores(startDateStr, endDateStr, leaveDays),
    [startDateStr, endDateStr, leaveDays]
  )

  // Legend and bonus values derived from the planner cache so every daysOff value
  // that appears in the table (including those from shorter leave periods) gets a chip and colour.
  const legend = useMemo(() => {
    const values = [...new Set(
      allBestPeriodsCache.filter(p => p.leaveDaysUsed <= leaveDays).map(p => p.daysOff)
    )].sort((a, b) => a - b)
    if (!values.length) return []
    const min = values[0]
    const max = values[values.length - 1]
    return values.map(daysOff => ({
      daysOff,
      colour: getColourForDaysOff(daysOff, min, max),
      label: `${daysOff} day${daysOff === 1 ? '' : 's'} off`,
    }))
  }, [leaveDays])

  const bonusDaysOffValues = useMemo(() => {
    const set = new Set()
    for (const p of allBestPeriodsCache) {
      if (p.leaveDaysUsed <= leaveDays && p.daysOff > leaveDays) set.add(p.daysOff)
    }
    return set
  }, [leaveDays])

  // Remove from filterSet any chips that are now hidden by the bonus filter
  useEffect(() => {
    if (!smartFilter) return
    setFilterSet(prev => {
      const next = new Set([...prev].filter(d => bonusDaysOffValues.has(d)))
      return next.size === prev.size ? prev : next
    })
  }, [smartFilter, bonusDaysOffValues])

  // Which panes are visible, unified across breakpoints: desktop reads the new
  // calendarOn/plannerOn toggles, mobile keeps reading activeTab exactly as before.
  const showCalendarPane = isDesktop ? calendarOn : activeTab === 'heatmap'
  const showPlannerPane = isDesktop ? plannerOn : activeTab === 'planner'
  const showSplit = isDesktop && calendarOn && plannerOn

  // splitRatio always means "the pane currently on the left"'s share, so swapping
  // just changes which pane that is without the on-screen widths jumping.
  const leftBasis = `${splitRatio * 100}%`
  const rightBasis = `${(1 - splitRatio) * 100}%`
  const calendarBasis = showSplit ? (swapped ? rightBasis : leftBasis) : (calendarOn ? '100%' : '0%')
  const plannerBasis = showSplit ? (swapped ? leftBasis : rightBasis) : (plannerOn ? '100%' : '0%')
  const calendarOrder = swapped ? 2 : 0
  const plannerOrder = swapped ? 0 : 2

  function toggleCalendarPane() {
    setCalendarOn(prev => (prev && !plannerOn) ? prev : !prev)
  }
  function togglePlannerPane() {
    setPlannerOn(prev => (prev && !calendarOn) ? prev : !prev)
  }
  function toggleSwap() {
    setSwapped(v => !v)
  }

  function startDrag(e) {
    e.preventDefault()
    const row = e.currentTarget.parentElement
    const rect = row.getBoundingClientRect()
    setDragging(true)
    function onMove(ev) {
      let ratio = (ev.clientX - rect.left) / rect.width
      ratio = Math.min(0.8, Math.max(0.2, ratio))
      setSplitRatio(ratio)
    }
    function onUp() {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      setDragging(false)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }
  function resetSplit(e) {
    e.preventDefault()
    setSplitRatio(0.5)
  }

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 flex-shrink-0">
        {/* Title row */}
        <div className="relative px-4 py-3 flex items-center justify-between md:justify-center">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open filters"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Settings gear — desktop only */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82A1.65 1.65 0 0 0 3 12.09H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>

          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-none">
            Leave Optimiser 🇿🇦
          </h1>

          {/* Right side buttons — mobile only */}
          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={() => setHelpOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold transition-colors leading-none"
              aria-label="Help"
            >?</button>
          </div>
        </div>

      </header>

      {/* Mobile filter drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileDrawerOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[85vw] bg-white dark:bg-slate-900 shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">Filters</h2>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close filters"
              >✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">School holidays</span>
                <button
                  onClick={() => setShowSchoolHols((v) => !v)}
                  role="switch"
                  aria-checked={showSchoolHols}
                  className={`relative inline-flex w-11 h-6 rounded-full overflow-hidden transition-colors duration-200 focus:outline-none ${
                    showSchoolHols ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    showSchoolHols ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {showSchoolHols && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Province</p>
                  <select
                    value={provinceCode}
                    onChange={(e) => setProvinceCode(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-sky-500"
                  >
                    {PROVINCES.map(({ code, label }) => (
                      <option key={code} value={code}>{label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">Bonus days only</span>
                <button
                  onClick={() => setSmartFilter((v) => !v)}
                  role="switch"
                  aria-checked={smartFilter}
                  className={`relative inline-flex w-11 h-6 rounded-full overflow-hidden transition-colors duration-200 focus:outline-none ${
                    smartFilter ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    smartFilter ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setDarkMode((v) => !v)}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span>{darkMode ? '☀️' : '🌙'}</span>
                  <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help modal */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setHelpOpen(false)} />
          <div className="relative z-10 w-full max-w-sm mx-4 mb-4 md:mb-0 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">How it works</h2>
              <button
                onClick={() => setHelpOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >✕</button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300">
              <p>Each coloured circle shows how many <strong className="text-slate-900 dark:text-slate-100">total days off</strong> you'd get if you start leave on that day — weekends and public holidays are included for free.</p>
              <p>Tap any coloured day for a <strong className="text-slate-900 dark:text-slate-100">full breakdown</strong> of your leave period.</p>
              <p>Use the <strong className="text-slate-900 dark:text-slate-100">filter bar</strong> to highlight only the day counts you care about.</p>
              <p>Tap <strong className="text-slate-900 dark:text-slate-100">☰</strong> to change the date range or show school holidays.</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings modal — desktop only (opened by the header gear icon) */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSettingsOpen(false)} />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">Settings</h2>
              <button
                onClick={() => setSettingsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >✕</button>
            </div>
            <div className="px-5 py-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">Dark mode</span>
                <button
                  onClick={() => setDarkMode((v) => !v)}
                  role="switch"
                  aria-checked={darkMode}
                  className={`relative inline-flex w-11 h-6 rounded-full overflow-hidden transition-colors duration-200 focus:outline-none ${
                    darkMode ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    darkMode ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 dark:text-slate-300">Bonus days only</span>
                <button
                  onClick={() => setSmartFilter((v) => !v)}
                  role="switch"
                  aria-checked={smartFilter}
                  className={`relative inline-flex w-11 h-6 rounded-full overflow-hidden transition-colors duration-200 focus:outline-none ${
                    smartFilter ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    smartFilter ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content area — sidebar removed; desktop nav now lives in the header gear + bottom pill */}
      <main className={showSplit ? 'flex-1 overflow-hidden flex flex-col min-h-0' : 'flex-1 overflow-y-auto'}>
        {/* Sticky filter chips — desktop, whenever a pane is visible */}
        {(showCalendarPane || showPlannerPane) && (
          <div className="hidden md:block flex-shrink-0 sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <div className="flex px-4 py-2 items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 flex-shrink-0">
                Days off
              </span>
              <div className="flex flex-nowrap gap-2 overflow-x-auto flex-1 py-2 px-1">
                {legend.filter(({ daysOff }) => !smartFilter || bonusDaysOffValues.has(daysOff)).map(({ daysOff, colour }) => {
                  const isSelected = filterSet.has(daysOff)
                  return (
                    <button
                      key={daysOff}
                      onClick={() => setFilterSet((prev) => {
                        const next = new Set(prev)
                        if (next.has(daysOff)) next.delete(daysOff)
                        else next.add(daysOff)
                        return next
                      })}
                      title={`${daysOff} days off — click to filter`}
                      className={`flex-shrink-0 w-[34px] h-[34px] rounded-full flex items-center justify-center text-xs font-bold transition-opacity focus:outline-none ${
                        isSelected
                          ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white ring-offset-white dark:ring-offset-slate-900'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: colour, color: '#1e293b' }}
                    >
                      {daysOff}
                    </button>
                  )
                })}
              </div>
              {filterSet.size > 0 && (
                <button
                  onClick={() => setFilterSet(new Set())}
                  className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex-shrink-0"
                >×</button>
              )}
              {showCalendarPane && (
                <button
                  onClick={() => setViewMode(v => v === '1x' ? '2x' : '1x')}
                  className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                    viewMode === '2x'
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {viewMode === '2x' ? '2x' : '1x'}
                </button>
              )}
            </div>
            {/* Segmented colour bar — heatmap desktop, sits below chips */}
            {showCalendarPane && (
              <div className="flex items-center gap-2 px-4 pb-2">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">low</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden flex">
                  {legend.map(({ daysOff, colour }) => (
                    <div key={daysOff} className="flex-1" style={{ backgroundColor: colour }} />
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">high</span>
              </div>
            )}
          </div>
        )}

        {/* Mobile weekday header + gradient bar — heatmap only, not in 2col (cards have own headers) */}
        {showCalendarPane && viewMode !== '2col' && (
          <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sm:hidden">
            {/* Segmented colour bar — mobile, sits above weekday letters */}
            <div className="flex items-center gap-2 px-4 py-2">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">low</span>
              <div className="flex-1 h-2 rounded-full overflow-hidden flex">
                {legend.map(({ daysOff, colour }) => (
                  <div key={daysOff} className="flex-1" style={{ backgroundColor: colour }} />
                ))}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">high</span>
            </div>
            <div className={`grid ${viewMode === '2x' ? 'grid-cols-[repeat(7,28px)_24px] w-fit mx-auto' : 'grid-cols-[repeat(7,1fr)_32px] px-4'} gap-0 pb-1`}>
              {['M','T','W','T','F','S','S'].map((h, i) => (
                <div
                  key={i}
                  className={`text-center text-[10px] font-semibold uppercase ${
                    i >= 5 ? 'text-slate-600 dark:text-slate-300' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {h}
                </div>
              ))}
              <div />
            </div>
          </div>
        )}

        {/* Desktop split view — both panes on, resizable side by side */}
        {showSplit && (
          <div className="flex-1 min-h-0 flex flex-row px-4 pb-2">
            <div className="min-w-0 h-full" style={{ flexBasis: calendarBasis, order: calendarOrder }}>
              <div className="h-full min-h-0 overflow-y-auto pb-24">
                <MonthPicker viewStart={viewStart} onChange={setViewStart} />
                <CalendarHeatmap
                  scores={scores}
                  months={months}
                  leaveDays={leaveDays}
                  showSchoolHolidays={showSchoolHols}
                  provinceCode={provinceCode}
                  filterSet={filterSet}
                  smartFilter={smartFilter}
                  viewMode={viewMode}
                />
              </div>
            </div>

            <div className="w-2.5 flex-shrink-0 flex items-center justify-center relative cursor-col-resize group" style={{ order: 1 }} onPointerDown={startDrag} onDoubleClick={resetSplit}>
              <button
                onClick={toggleSwap}
                onPointerDown={(e) => e.stopPropagation()}
                className="absolute -top-16 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-sky-500 hover:border-sky-500 flex items-center justify-center transition-colors"
                aria-label="Swap panels"
              >
                <SwapIcon className="w-3.5 h-3.5" />
              </button>
              {dragging && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  {Math.round(splitRatio * 100)} / {Math.round((1 - splitRatio) * 100)}
                </span>
              )}
              <div className={`w-[3px] h-full rounded-full transition-colors ${dragging ? 'bg-sky-400' : 'bg-slate-200 dark:bg-slate-700 group-hover:bg-sky-400'}`} />
              <div className="absolute w-4 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-0.5">
                <span className="w-0.5 h-3 rounded-full bg-slate-400 dark:bg-slate-500" />
                <span className="w-0.5 h-3 rounded-full bg-slate-400 dark:bg-slate-500" />
              </div>
            </div>

            <div className="min-w-0 h-full" style={{ flexBasis: plannerBasis, order: plannerOrder }}>
              <div className="h-full min-h-0 overflow-y-auto pb-24">
                <LeavePlannerTab
                  leaveDays={leaveDays}
                  startDate={plannerStart}
                  endDate={plannerEnd}
                  onStartChange={setPlannerStart}
                  onEndChange={setPlannerEnd}
                  filterSet={filterSet}
                  smartFilter={smartFilter}
                  legend={legend}
                />
              </div>
            </div>
          </div>
        )}

        {/* Single-pane view — mobile (driven by activeTab), or desktop with exactly one pane on */}
        {!showSplit && (
          <div className={(showPlannerPane && !showCalendarPane) ? 'pb-48 md:p-4 md:pb-24' : 'p-4 pb-48 md:pb-24'}>
            {showCalendarPane && (
              <>
                <MonthPicker viewStart={viewStart} onChange={setViewStart} />
                <CalendarHeatmap
                  scores={scores}
                  months={months}
                  leaveDays={leaveDays}
                  showSchoolHolidays={showSchoolHols}
                  provinceCode={provinceCode}
                  filterSet={filterSet}
                  smartFilter={smartFilter}
                  viewMode={viewMode}
                />
              </>
            )}
            {showPlannerPane && (
              <LeavePlannerTab
                leaveDays={leaveDays}
                startDate={plannerStart}
                endDate={plannerEnd}
                onStartChange={setPlannerStart}
                onEndChange={setPlannerEnd}
                filterSet={filterSet}
                smartFilter={smartFilter}
                legend={legend}
              />
            )}
            {!isDesktop && activeTab === 'holidays' && (
              <HolidaysList
                months={months}
                showSchoolHolidays={showSchoolHols}
                provinceCode={provinceCode}
              />
            )}
          </div>
        )}
      </main>

      {/* Mobile bottom controls bar — sits above BottomTabBar */}
      <div className="fixed bottom-[52px] left-0 right-0 z-30 md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
        {/* Row 1: Date range pill */}
        <div className="px-4 py-1 flex items-center justify-center border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setDateSheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 active:bg-slate-200 dark:active:bg-slate-700 transition-colors"
          >
            <span className="text-slate-400 dark:text-slate-500 text-[10px]">📅</span>
            <span>{fmtPill(plannerStart)}</span>
            <span className="text-slate-400 dark:text-slate-500">–</span>
            <span>{fmtPill(plannerEnd)}</span>
          </button>
        </div>

        {/* Row 2: Days off chips — heatmap and planner tabs */}
        {(activeTab === 'heatmap' || activeTab === 'planner') && (
          <div className="px-4 pb-2 pt-1.5 flex items-center gap-2 border-b border-slate-200 dark:border-slate-700">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex-shrink-0 leading-tight">
              Days<br />Off
            </span>
            <div className="flex flex-nowrap gap-2 overflow-x-auto flex-1 py-2 px-1">
              {legend.filter(({ daysOff }) => !smartFilter || bonusDaysOffValues.has(daysOff)).map(({ daysOff, colour }) => {
                const isSelected = filterSet.has(daysOff)
                return (
                  <button
                    key={daysOff}
                    onClick={() => setFilterSet((prev) => {
                      const next = new Set(prev)
                      if (next.has(daysOff)) next.delete(daysOff)
                      else next.add(daysOff)
                      return next
                    })}
                    title={`${daysOff} days off — click to filter`}
                    className={`flex-shrink-0 w-[28px] h-[28px] rounded-full flex items-center justify-center text-xs font-bold transition-opacity focus:outline-none ${
                      isSelected
                        ? 'ring-2 ring-offset-1 ring-slate-900 dark:ring-white ring-offset-white dark:ring-offset-slate-900'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: colour, color: '#1e293b' }}
                  >
                    {daysOff}
                  </button>
                )
              })}
            </div>
            {filterSet.size > 0 && (
              <button
                onClick={() => setFilterSet(new Set())}
                className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex-shrink-0"
              >×</button>
            )}
          </div>
        )}

        {/* Row 3: Leave days roller + compact toggle */}
        <div className="px-4 py-2 flex items-center gap-3">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 leading-tight flex-shrink-0">
            Leave<br />Days
          </p>
          <LeaveDayRoller
            value={leaveDays}
            min={0}
            max={MAX_LEAVE}
            onChange={setLeaveDays}
          />
          <button
            onClick={() => setViewMode(v => v === '1x' ? '2col' : v === '2col' ? '2x' : '1x')}
            className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
              viewMode !== '1x'
                ? 'bg-sky-500 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}
          >
            {viewMode}
          </button>
        </div>
      </div>

      {/* Desktop bottom bar — Calendar/Planner pill + leave-day count, replaces the old sidebar's nav role */}
      <div className="hidden md:flex fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 items-center justify-between px-6 py-3">
        <div className="flex items-stretch rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
          <button
            onClick={toggleCalendarPane}
            style={{ order: calendarOrder }}
            className={`px-6 py-2 text-sm font-semibold transition-colors ${
              calendarOn ? 'bg-sky-500 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Calendar
          </button>
          <div className="w-px bg-slate-200 dark:bg-slate-600" style={{ order: 1 }} />
          <button
            onClick={togglePlannerPane}
            style={{ order: plannerOrder }}
            className={`px-6 py-2 text-sm font-semibold transition-colors ${
              plannerOn ? 'bg-sky-500 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Planner
          </button>
        </div>

        <div className="w-56">
          <LeaveDayRoller
            value={leaveDays}
            min={0}
            max={MAX_LEAVE}
            onChange={setLeaveDays}
          />
        </div>
      </div>

      {/* Date range bottom sheet — mobile only */}
      {dateSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 w-full bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl border-t border-slate-200 dark:border-slate-700 px-5 pt-5 pb-8 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">Date Range</h2>
              <button
                onClick={() => setDateSheetOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium uppercase tracking-wide">From</label>
                <input
                  type="date"
                  value={plannerStart}
                  onChange={(e) => setPlannerStart(e.target.value)}
                  min={TODAY_STR}
                  max={plannerEnd}
                  className="w-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-lg px-3 py-2.5 border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium uppercase tracking-wide">To</label>
                <input
                  type="date"
                  value={plannerEnd}
                  onChange={(e) => setPlannerEnd(e.target.value)}
                  min={plannerStart}
                  max={DATASET_END}
                  className="w-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-lg px-3 py-2.5 border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomTabBar activeTab={activeTab} onChange={setActiveTab} />
    </div>
  )
}
