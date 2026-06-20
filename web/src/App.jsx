import { useState, useMemo, useEffect } from 'react'
import { CalendarHeatmap } from './components/Calendar/CalendarHeatmap'
import { LeaveSelector } from './components/Features/LeaveSelector'
import { HolidaysList } from './components/Features/HolidaysList'
import { LeavePlannerTab } from './components/Features/LeavePlannerTab'
import { BottomTabBar } from './components/Layout/BottomTabBar'
import { LeaveDayRoller } from './components/Layout/LeaveDayRoller'
import { computeLeaveScores } from './utils/leaveCalculator'
import { buildLegend } from './utils/colorScale'
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
  const [smartFilter, setSmartFilter] = useState(false)
  const [compact, setCompact] = useState(false)
  const [plannerStart, setPlannerStart] = useState(TODAY_STR)
  const [plannerEnd, setPlannerEnd] = useState(DATASET_END)
  const [dateSheetOpen, setDateSheetOpen] = useState(false)

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

  const legend = useMemo(() => buildLegend(scores), [scores])

// daysOff values that have at least one date where a public holiday is captured
  const bonusDaysOffValues = useMemo(() => {
    const set = new Set()
    for (const { daysOff, publicHolidays } of scores) {
      if ((publicHolidays ?? 0) > 0 && daysOff > 0) set.add(daysOff)
    }
    return set
  }, [scores])

  const leaveSelectorProps = {
    selected: leaveDays,
    onChange: setLeaveDays,
    showSchoolHols,
    onToggleSchool: () => setShowSchoolHols((v) => !v),
    provinceCode,
    onProvinceChange: setProvinceCode,
    provinces: PROVINCES,
    viewStart,
    allMonths: ALL_MONTHS,
    onViewStartChange: setViewStart,
    smartFilter,
    onToggleSmartFilter: () => setSmartFilter((v) => !v),
  }

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 flex-shrink-0">
        {/* Title row */}
        <div className="px-4 py-3 flex items-center justify-between md:justify-center">
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
              <div className="flex flex-col gap-1.5">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">From</p>
                <select
                  value={`${viewStart.year}-${viewStart.month}`}
                  onChange={(e) => {
                    const [y, m] = e.target.value.split('-')
                    setViewStart({ year: parseInt(y, 10), month: parseInt(m, 10) })
                  }}
                  className="w-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-sky-500"
                >
                  {ALL_MONTHS.map((ym) => (
                    <option key={`${ym.year}-${ym.month}`} value={`${ym.year}-${ym.month}`}>
                      {monthLabel(ym)}
                    </option>
                  ))}
                </select>
              </div>

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

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop only */}
        <aside className="hidden md:flex flex-col gap-6 w-64 border-r border-slate-200 dark:border-slate-700 p-4 overflow-y-auto flex-shrink-0 bg-white dark:bg-slate-900">
          <LeaveSelector {...leaveSelectorProps} />

          <nav className="flex flex-col gap-1">
            {[
              { id: 'heatmap', label: '📅  Heatmap' },
              { id: 'planner', label: '📋  Leave Planner' },
              { id: 'holidays', label: '🗓  Holidays' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === id
                    ? 'bg-slate-100 dark:bg-slate-700 text-sky-600 dark:text-sky-400 font-medium'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setDarkMode((v) => !v)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              <span>{darkMode ? '☀️' : '🌙'}</span>
              <span>{darkMode ? 'Light mode' : 'Dark mode'}</span>
            </button>
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {/* Sticky filter chips — desktop, heatmap + planner */}
            {(activeTab === 'heatmap' || activeTab === 'planner') && (
              <div className="hidden md:block sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <div className="flex px-4 py-2 items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 flex-shrink-0">
                    Days off
                  </span>
                  <div className="flex flex-nowrap gap-1.5 overflow-x-auto flex-1 py-1">
                    {legend.map(({ daysOff, colour }) => {
                      const isSelected = filterSet.has(daysOff)
                      const isBonus = bonusDaysOffValues.has(daysOff)
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
                          } ${activeTab === 'heatmap' && smartFilter && !isBonus ? 'opacity-25 hover:opacity-25' : ''}`}
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
                {/* Gradient bar — heatmap desktop, sits below chips */}
                {activeTab === 'heatmap' && (
                  <div className="flex items-center gap-2 px-4 pb-2">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">low</span>
                    <div className="flex-1 h-2 rounded-full" style={{ background: 'linear-gradient(to right, rgb(248,113,113), rgb(250,204,21), rgb(34,197,94), rgb(56,189,248), rgb(99,102,241))' }} />
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">high</span>
                  </div>
                )}
              </div>
            )}

            {/* Mobile weekday header + gradient bar — heatmap only */}
            {activeTab === 'heatmap' && (
              <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sm:hidden">
                <div className={`grid ${compact ? 'grid-cols-[repeat(7,28px)_24px] w-fit mx-auto' : 'grid-cols-[repeat(7,1fr)_32px] px-4'} gap-0 pb-1`}>
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
                {/* Gradient bar — mobile, sits below weekday letters */}
                <div className="flex items-center gap-2 px-4 pb-1.5">
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 whitespace-nowrap">low</span>
                  <div className="flex-1 h-1.5 rounded-full" style={{ background: 'linear-gradient(to right, rgb(248,113,113), rgb(250,204,21), rgb(34,197,94), rgb(56,189,248), rgb(99,102,241))' }} />
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 whitespace-nowrap">high</span>
                </div>
              </div>
            )}

            <div className={activeTab === 'planner' ? 'pb-48 md:p-4 md:pb-6' : 'p-4 pb-48 md:pb-6'}>
              {activeTab === 'heatmap' && (
                <CalendarHeatmap
                  scores={scores}
                  months={months}
                  leaveDays={leaveDays}
                  showSchoolHolidays={showSchoolHols}
                  provinceCode={provinceCode}
                  filterSet={filterSet}
                  smartFilter={smartFilter}
                  compact={compact}
                />
              )}
              {activeTab === 'planner' && (
                <LeavePlannerTab
                  leaveDays={leaveDays}
                  startDate={plannerStart}
                  endDate={plannerEnd}
                  onStartChange={setPlannerStart}
                  onEndChange={setPlannerEnd}
                  filterSet={filterSet}
                />
              )}
              {activeTab === 'holidays' && (
                <HolidaysList
                  months={months}
                  showSchoolHolidays={showSchoolHols}
                  provinceCode={provinceCode}
                />
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile bottom controls bar — sits above BottomTabBar */}
      <div className="fixed bottom-[52px] left-0 right-0 z-30 md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
        {/* Row 1: Date range pill — always visible */}
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

        {/* Row 2: Leave days roller + compact toggle */}
        <div className="px-4 py-1 flex items-center gap-3">
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
            onClick={() => setCompact(v => !v)}
            className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
              compact
                ? 'bg-sky-500 text-white'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}
          >
            {compact ? '2x' : '1x'}
          </button>
        </div>

        {/* Row 3: Days off chips — heatmap and planner tabs */}
        {(activeTab === 'heatmap' || activeTab === 'planner') && (
          <div className="px-4 pb-1.5 pt-1 flex items-center gap-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex-shrink-0 leading-tight">
              Days<br />Off
            </span>
            <div className="flex flex-nowrap gap-1.5 overflow-x-auto flex-1 py-0.5">
              {legend.map(({ daysOff, colour }) => {
                const isSelected = filterSet.has(daysOff)
                const isBonus = bonusDaysOffValues.has(daysOff)
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
                    } ${activeTab === 'heatmap' && smartFilter && !isBonus ? 'opacity-25 hover:opacity-25' : ''}`}
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
      </div>

      {/* Date range bottom sheet — mobile only */}
      {dateSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDateSheetOpen(false)} />
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
