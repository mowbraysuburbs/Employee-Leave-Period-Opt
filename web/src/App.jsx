import { useState, useMemo, useEffect } from 'react'
import { CalendarHeatmap } from './components/Calendar/CalendarHeatmap'
import { HolidaysList } from './components/Features/HolidaysList'
import { LeavePlannerTab } from './components/Features/LeavePlannerTab'
import { LeaveSummaryModal } from './components/Features/LeaveSummaryModal'
import { BottomTabBar } from './components/Layout/BottomTabBar'
import { LeaveDayRoller } from './components/Layout/LeaveDayRoller'
import { computeLeaveScores } from './utils/leaveCalculator'
import { getColourForDaysOff } from './utils/colorScale'
import { allBestPeriodsCache } from './components/Features/LeavePlannerTab'
import { PROVINCES } from './data/schoolHolidays'
import { PUBLIC_HOLIDAYS } from './data/publicHolidays'
import { fmt } from './utils/dateFormat'

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MAX_LEAVE = 10

function addMonths(ym, n) {
  const total = ym.year * 12 + (ym.month - 1) + n
  return { year: Math.floor(total / 12), month: (total % 12) + 1 }
}

const today = new Date()
const TODAY_STR = today.toISOString().slice(0, 10)
const DATASET_END = '2028-01-01'

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
  const [showSchoolHols, setShowSchoolHols] = useState(false)
  const [provinceCode, setProvinceCode] = useState('GP')
  const [darkMode, setDarkMode] = useState(false)
  const [filterSet, setFilterSet] = useState(new Set())
  const [holidayFilter, setHolidayFilter] = useState(new Set())
  const [holidayDropdownOpen, setHolidayDropdownOpen] = useState(false)
  const [selectedKeys, setSelectedKeys] = useState(new Set())
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [smartFilter, setSmartFilter] = useState(true)
  const [viewMode, setViewMode] = useState('1x')
  const [dateSheetOpen, setDateSheetOpen] = useState(false)
  const [plannerStart, setPlannerStart] = useState(TODAY_STR)
  const [plannerEnd, setPlannerEnd] = useState(DATASET_END)

  // Desktop header date inputs are pending until "Calculate" is clicked —
  // mobile's own date sheet still commits live, unaffected by this.
  const [pendingStart, setPendingStart] = useState(TODAY_STR)
  const [pendingEnd, setPendingEnd] = useState(DATASET_END)
  useEffect(() => { setPendingStart(plannerStart) }, [plannerStart])
  useEffect(() => { setPendingEnd(plannerEnd) }, [plannerEnd])

  // Desktop-only pane toggles — replace the old sidebar's exclusive tab nav.
  // Either or both can be on; a handler refuses to turn the last one off.
  const [calendarOn, setCalendarOn] = useState(true)
  const [plannerOn, setPlannerOn] = useState(false)
  const [splitRatio, setSplitRatio] = useState(0.5)
  const [dragging, setDragging] = useState(false)
  const [swapped, setSwapped] = useState(false)

  // Hovering a table row in the split view highlights that same date range
  // on the calendar, reusing the calendar's own day-hover range highlight.
  const [hoveredPeriodRange, setHoveredPeriodRange] = useState(null)

  // The planner table reports which periods are on its current page — while
  // it's visible, the calendar only colors those periods' start dates,
  // instead of every day in range, so paging through the table re-focuses
  // the calendar on exactly what's being reviewed right now.
  const [visiblePagePeriods, setVisiblePagePeriods] = useState(null)

  const isDesktop = useIsDesktop()

  useEffect(() => {
    document.documentElement.classList[darkMode ? 'add' : 'remove']('dark')
  }, [darkMode])

  // The calendar's visible months span exactly the From/To range — the same
  // range that filters the planner table, so both panes read one filter.
  const [plannerStartYear, plannerStartMonth] = plannerStart.split('-')
  const viewStart = { year: parseInt(plannerStartYear, 10), month: parseInt(plannerStartMonth, 10) }
  const [plannerEndYear, plannerEndMonth] = plannerEnd.split('-')
  const viewEnd = { year: parseInt(plannerEndYear, 10), month: parseInt(plannerEndMonth, 10) }

  // Scores start and stop exactly at the chosen dates — the calendar still
  // renders the whole first/last month (it can't show a partial month card),
  // but days outside [plannerStart, plannerEnd] get no score, so they show
  // blank instead of colored.
  const startDateStr = plannerStart
  const endDateStr = plannerEnd

  const months = useMemo(() => {
    const result = []
    let cur = { ...viewStart }
    while (cur.year < viewEnd.year || (cur.year === viewEnd.year && cur.month <= viewEnd.month)) {
      result.push({ ...cur })
      cur = addMonths(cur, 1)
    }
    return result
  }, [plannerStart, plannerEnd])

  const scores = useMemo(
    () => computeLeaveScores(startDateStr, endDateStr, leaveDays),
    [startDateStr, endDateStr, leaveDays]
  )

  // Which panes are visible, unified across breakpoints: desktop reads the new
  // calendarOn/plannerOn toggles, mobile keeps reading activeTab exactly as before.
  const showCalendarPane = isDesktop ? calendarOn : activeTab === 'heatmap'
  const showPlannerPane = isDesktop ? plannerOn : activeTab === 'planner'
  const showSplit = isDesktop && calendarOn && plannerOn

  // Two scopes, for two different jobs:
  //  - inScopePeriods: every period reachable at all (leaveDays + date range).
  //    Used only to decide whether an ACTIVE filter selection is still valid —
  //    kept broad so simply turning a page never silently drops a selection
  //    that's still perfectly valid on other pages.
  //  - pageScopePeriods: exactly what's on the table's current page right
  //    now. Used to decide what's OFFERED (which chips appear, which colour
  //    they use, which holidays are selectable) — and, critically, the same
  //    period set that already restricts the calendar's own coloring, so a
  //    chip's colour and a calendar day's colour for the same value are
  //    always computed from the same min/max, never two different scales.
  // Both drop to null the moment the table isn't shown, so every filter goes
  // back to its full, unrestricted range.
  const inScopePeriods = useMemo(() => {
    if (!showPlannerPane) return null
    return allBestPeriodsCache.filter(p =>
      p.leaveDaysUsed <= leaveDays && p.startDate >= plannerStart && p.endDate <= plannerEnd
    )
  }, [showPlannerPane, leaveDays, plannerStart, plannerEnd])

  const pageScopePeriods = showPlannerPane ? (visiblePagePeriods ?? inScopePeriods) : null

  // Legend and bonus values derived from the planner cache so every daysOff value
  // that appears in the table (including those from shorter leave periods) gets a chip and colour.
  // Colours come from the fixed palette (see colorScale.js) — every value has
  // one permanent colour, so there's no min/max to keep in sync with the
  // calendar's own scoping anymore.
  const legend = useMemo(() => {
    const base = pageScopePeriods ?? allBestPeriodsCache.filter(p => p.leaveDaysUsed <= leaveDays)
    const source = smartFilter ? base.filter(p => p.daysOff > leaveDays) : base
    const values = [...new Set(source.map(p => p.daysOff))].sort((a, b) => a - b)
    return values.map(daysOff => ({
      daysOff,
      colour: getColourForDaysOff(daysOff),
      label: `${daysOff} day${daysOff === 1 ? '' : 's'} off`,
    }))
  }, [pageScopePeriods, leaveDays, smartFilter])

  const bonusDaysOffValues = useMemo(() => {
    const source = pageScopePeriods ?? allBestPeriodsCache.filter(p => p.leaveDaysUsed <= leaveDays)
    return new Set(source.filter(p => p.daysOff > leaveDays).map(p => p.daysOff))
  }, [pageScopePeriods, leaveDays])

  // Remove from filterSet any selection no longer valid ANYWHERE in scope
  // (not just on the current page — see inScopePeriods above)
  useEffect(() => {
    const validValues = inScopePeriods
      ? new Set(inScopePeriods.map(p => p.daysOff))
      : new Set(legend.map(l => l.daysOff))
    setFilterSet(prev => {
      const next = new Set([...prev].filter(d =>
        validValues.has(d) && (!smartFilter || bonusDaysOffValues.has(d))
      ))
      return next.size === prev.size ? prev : next
    })
  }, [inScopePeriods, legend, smartFilter, bonusDaysOffValues])

  // Public holidays that fall inside the chosen From/To range — narrowed to
  // only holidays some period on the current page actually touches, while
  // the table is in view.
  const holidaysInRange = useMemo(() => {
    const inRange = Object.values(PUBLIC_HOLIDAYS).flat()
      .filter(h => h.date >= plannerStart && h.date <= plannerEnd)
      .sort((a, b) => a.date.localeCompare(b.date))
    if (!pageScopePeriods) return inRange
    return inRange.filter(h => pageScopePeriods.some(p => h.date >= p.startDate && h.date <= p.endDate))
  }, [plannerStart, plannerEnd, pageScopePeriods])

  // Drop any selected holiday no longer valid ANYWHERE in scope (mirrors the
  // filterSet cleanup above — broad, so paging never silently drops it)
  useEffect(() => {
    const validDates = inScopePeriods
      ? new Set(
          Object.values(PUBLIC_HOLIDAYS).flat()
            .filter(h => h.date >= plannerStart && h.date <= plannerEnd)
            .filter(h => inScopePeriods.some(p => h.date >= p.startDate && h.date <= p.endDate))
            .map(h => h.date)
        )
      : new Set(holidaysInRange.map(h => h.date))
    setHolidayFilter(prev => {
      const next = new Set([...prev].filter(d => validDates.has(d)))
      return next.size === prev.size ? prev : next
    })
  }, [inScopePeriods, holidaysInRange, plannerStart, plannerEnd])

  // Only restrict the calendar to the table's current page while the table
  // is actually on screen — guards against stale leftover data from a
  // previous view (e.g. right after switching back to Calendar-only). Reuses
  // the same pageScopePeriods that drives the days-off/holiday filter
  // options above, so the calendar's colours and the filter chips' colours
  // are always computed from the same min/max — never two different scales.
  const pageStartDates = useMemo(() => {
    if (!pageScopePeriods) return null
    return new Set(pageScopePeriods.map(p => p.startDate))
  }, [pageScopePeriods])

  // When a Days Off chip is active, a page-scoped date's color needs to
  // match the value that actually qualified it for the filter — not the
  // calendar's own independently-computed full-spend total, which can be a
  // completely different number (and color) if the qualifying table row
  // used fewer leave days than the slider. Every entry here already passed
  // the table's own filterSet check, so using it is always safe.
  const pageDaysOffMap = useMemo(() => {
    if (!pageScopePeriods) return null
    const map = new Map()
    for (const p of pageScopePeriods) map.set(p.startDate, p.daysOff)
    return map
  }, [pageScopePeriods])

  // While restricted, drop any month card that the current page's periods
  // never touch — but "touch" has to mean the whole [startDate, endDate]
  // span, not just the start date. A period starting 22 March and ending
  // 4 April genuinely runs into April, so April has to stay on the
  // calendar too, or hovering that period can't show its full extent. Sort
  // order doesn't matter here either way — this just asks "does this
  // year-month fall anywhere within some period's span," so a page sorted
  // by ratio/days-off (scattered across the year, not chronological) still
  // shows exactly the right, possibly non-contiguous, set of months.
  const visibleMonths = useMemo(() => {
    if (!pageScopePeriods) return months
    const monthKeys = new Set()
    for (const p of pageScopePeriods) {
      let [y, m] = p.startDate.slice(0, 7).split('-').map(Number)
      const [endY, endM] = p.endDate.slice(0, 7).split('-').map(Number)
      while (y < endY || (y === endY && m <= endM)) {
        monthKeys.add(`${y}-${String(m).padStart(2, '0')}`)
        m++
        if (m > 12) { m = 1; y++ }
      }
    }
    return months.filter(mo => monthKeys.has(`${mo.year}-${String(mo.month).padStart(2, '0')}`))
  }, [months, pageScopePeriods])

  function handleCalculate() {
    setPlannerStart(pendingStart)
    setPlannerEnd(pendingEnd)
  }

  // Selection lives here (not in BestPeriodsTable) so it survives toggling
  // the Calendar/Planner panes on and off, and so the header badge can read it.
  function toggleSelectPeriod(key) {
    setSelectedKeys(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const selectedPeriods = useMemo(
    () => allBestPeriodsCache.filter(p => selectedKeys.has(`${p.startDate}-${p.leaveDaysUsed}`)),
    [selectedKeys]
  )

  // The date range is the highest-priority filter — narrowing it drops any
  // selected period that's no longer in range, so the Share summary can
  // never keep stats for something you can't even see in the table anymore.
  useEffect(() => {
    setSelectedKeys(prev => {
      if (prev.size === 0) return prev
      const next = new Set(
        [...prev].filter(key => {
          const period = allBestPeriodsCache.find(p => `${p.startDate}-${p.leaveDaysUsed}` === key)
          return period && period.startDate >= plannerStart && period.endDate <= plannerEnd
        })
      )
      return next.size === prev.size ? prev : next
    })
  }, [plannerStart, plannerEnd])

  const selectedStats = useMemo(() => {
    let leaveDaysUsedSum = 0, daysOffSum = 0
    for (const p of selectedPeriods) {
      leaveDaysUsedSum += p.leaveDaysUsed
      daysOffSum += p.daysOff
    }
    return { count: selectedPeriods.length, leaveDaysUsed: leaveDaysUsedSum, daysOff: daysOffSum }
  }, [selectedPeriods])

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
        <div className="relative px-4 py-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
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

          <div className="flex items-center gap-4">
            <h1 className="text-[29px] font-bold text-slate-900 dark:text-slate-100 leading-none">
              StretchMyLeave
            </h1>

            <div className="hidden md:flex items-stretch rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex-shrink-0">
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
          </div>

          {/* Right side buttons — mobile only */}
          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={() => setHelpOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold transition-colors leading-none"
              aria-label="Help"
            >?</button>
          </div>

          {/* Date range — desktop only, absolutely centered so it never shifts as the Share button grows/shrinks */}
          <div className="hidden md:flex items-center gap-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <label className="absolute -top-4 left-0 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Start date
              </label>
              <input
                type="date"
                value={pendingStart}
                onChange={(e) => setPendingStart(e.target.value)}
                min={TODAY_STR}
                max={pendingEnd}
                className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>
            <span className="text-slate-400 dark:text-slate-500">–</span>
            <div className="relative">
              <label className="absolute -top-4 left-0 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                End date
              </label>
              <input
                type="date"
                value={pendingEnd}
                onChange={(e) => setPendingEnd(e.target.value)}
                min={pendingStart}
                max={DATASET_END}
                className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>
            <button
              onClick={handleCalculate}
              disabled={pendingStart === plannerStart && pendingEnd === plannerEnd}
              className="flex-shrink-0 px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-sky-500"
            >
              Calculate
            </button>
          </div>

          {/* Right side buttons — desktop only */}
          <div className="hidden md:flex items-center gap-2">
            {/* Selected-periods summary + share/export trigger */}
            <button
              onClick={() => setSummaryOpen(true)}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500 hover:bg-sky-400 text-white text-sm transition-colors"
            >
              {selectedStats.count > 0 && (
                <>
                  <span className="font-medium opacity-90 whitespace-nowrap">
                    {selectedStats.leaveDaysUsed} days used · {selectedStats.daysOff} days off
                  </span>
                  <span className="opacity-50 font-normal">|</span>
                </>
              )}
              <span className="font-bold">Share</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setSettingsOpen((v) => !v)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Settings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82A1.65 1.65 0 0 0 3 12.09H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>

              {settingsOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setSettingsOpen(false)} />
                  <div className="absolute top-full right-0 mt-1 z-30 w-60 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-2 px-3 flex flex-col gap-3">
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
                    {calendarOn && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700 dark:text-slate-300">Calendar size</span>
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
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Help icon — placeholder, not wired up yet */}
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Help"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>

          </div>
        </div>

        {/* Filters panel — desktop only, always shown */}
        <div className="hidden md:flex flex-col gap-3 px-4 pb-3 pt-4">
            <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide flex-shrink-0">
                Leave days
              </span>
              <button
                onClick={() => setLeaveDays((v) => Math.max(0, v - 1))}
                disabled={leaveDays === 0}
                className="w-6 h-6 flex-shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold leading-none flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Decrease leave days"
              >−</button>
              <input
                type="range"
                min={0}
                max={MAX_LEAVE}
                value={leaveDays}
                onChange={(e) => setLeaveDays(Number(e.target.value))}
                className="w-[173px] h-2 rounded-full accent-sky-500 cursor-pointer"
              />
              <button
                onClick={() => setLeaveDays((v) => Math.min(MAX_LEAVE, v + 1))}
                disabled={leaveDays === MAX_LEAVE}
                className="w-6 h-6 flex-shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold leading-none flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Increase leave days"
              >+</button>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums w-5 text-center flex-shrink-0">
                {leaveDays}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 flex-shrink-0">
                Days off <span className="font-normal normal-case text-slate-400 dark:text-slate-500">(click to filter)</span>
              </span>
              <div className="flex flex-nowrap gap-2">
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
                      className={`flex-shrink-0 w-[30px] h-[30px] rounded-full flex items-center justify-center text-xs font-bold transition-opacity focus:outline-none ${
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
            </div>
            </div>

            {holidaysInRange.length > 0 && (
              <div className="flex items-center gap-2 relative">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 flex-shrink-0">
                  Holidays
                </span>

                <div className="flex flex-wrap gap-2">
                  {holidaysInRange.filter(h => holidayFilter.has(h.date)).map(({ date, name }) => (
                    <button
                      key={date}
                      onClick={() => setHolidayFilter((prev) => {
                        const next = new Set(prev)
                        next.delete(date)
                        return next
                      })}
                      title={`${name} — click to remove`}
                      className="flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-sky-500 text-white transition-colors hover:bg-sky-600"
                    >
                      {name} <span className="opacity-70">{fmt(date)}</span>
                      <span className="ml-0.5">×</span>
                    </button>
                  ))}
                </div>

                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setHolidayDropdownOpen((v) => !v)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      holidayDropdownOpen
                        ? 'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {holidayFilter.size > 0 ? '+ Add' : 'Select holidays'} <span className="text-[10px]">▾</span>
                  </button>

                  {holidayDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setHolidayDropdownOpen(false)} />
                      <div className="absolute top-full right-0 mt-1 z-30 w-64 max-h-72 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1">
                        {holidaysInRange.map(({ date, name }) => {
                          const isSelected = holidayFilter.has(date)
                          return (
                            <button
                              key={date}
                              onClick={() => setHolidayFilter((prev) => {
                                const next = new Set(prev)
                                if (next.has(date)) next.delete(date)
                                else next.add(date)
                                return next
                              })}
                              className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs text-left transition-colors ${
                                isSelected
                                  ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                              }`}
                            >
                              <span>{name} <span className="opacity-60">{fmt(date)}</span></span>
                              {isSelected && <span className="flex-shrink-0">✓</span>}
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>

                {holidayFilter.size > 0 && (
                  <button
                    onClick={() => setHolidayFilter(new Set())}
                    className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex-shrink-0"
                  >×</button>
                )}
              </div>
            )}
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

      {summaryOpen && selectedPeriods.length > 0 && (
        <LeaveSummaryModal
          periods={selectedPeriods}
          onClose={() => setSummaryOpen(false)}
        />
      )}

      {/* Main content area — sidebar removed; desktop nav now lives in the header gear + bottom pill */}
      <main className={showSplit ? 'flex-1 overflow-hidden flex flex-col min-h-0' : 'flex-1 overflow-y-auto'}>
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
              {['S','M','T','W','T','F','S'].map((h, i) => (
                <div
                  key={i}
                  className={`text-center text-[10px] font-semibold uppercase ${
                    i === 0 || i === 6 ? 'text-slate-600 dark:text-slate-300' : 'text-slate-700 dark:text-slate-200'
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
              <div className="h-full min-h-0 overflow-y-auto pt-4 pl-4 pr-4 pb-6">
                <CalendarHeatmap
                  scores={scores}
                  months={visibleMonths}
                  leaveDays={leaveDays}
                  showSchoolHolidays={showSchoolHols}
                  provinceCode={provinceCode}
                  filterSet={filterSet}
                  smartFilter={smartFilter}
                  viewMode={viewMode}
                  externalHoveredRange={hoveredPeriodRange}
                  restrictToDates={pageStartDates}
                  pageDaysOffMap={pageDaysOffMap}
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
              <div className="h-full min-h-0 overflow-y-auto pb-6">
                <LeavePlannerTab
                  leaveDays={leaveDays}
                  startDate={plannerStart}
                  endDate={plannerEnd}
                  filterSet={filterSet}
                  smartFilter={smartFilter}
                  holidayFilter={holidayFilter}
                  nested
                  onHoverPeriod={setHoveredPeriodRange}
                  selectedKeys={selectedKeys}
                  onToggleSelect={toggleSelectPeriod}
                  onPageDatesChange={setVisiblePagePeriods}
                />
              </div>
            </div>
          </div>
        )}

        {/* Single-pane view — mobile (driven by activeTab), or desktop with exactly one pane on */}
        {!showSplit && (
          <div className={(showPlannerPane && !showCalendarPane) ? 'pb-48 md:p-4 md:pb-6' : 'p-4 pb-48 md:pb-6'}>
            {showCalendarPane && (
              <CalendarHeatmap
                scores={scores}
                months={visibleMonths}
                leaveDays={leaveDays}
                showSchoolHolidays={showSchoolHols}
                provinceCode={provinceCode}
                filterSet={filterSet}
                smartFilter={smartFilter}
                viewMode={viewMode}
                restrictToDates={pageStartDates}
                pageDaysOffMap={pageDaysOffMap}
              />
            )}
            {showPlannerPane && (
              <LeavePlannerTab
                leaveDays={leaveDays}
                startDate={plannerStart}
                endDate={plannerEnd}
                filterSet={filterSet}
                smartFilter={smartFilter}
                holidayFilter={holidayFilter}
                selectedKeys={selectedKeys}
                onToggleSelect={toggleSelectPeriod}
                onPageDatesChange={setVisiblePagePeriods}
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
