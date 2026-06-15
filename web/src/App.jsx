import { useState, useMemo, useEffect } from 'react'
import { CalendarHeatmap } from './components/Calendar/CalendarHeatmap'
import { LeaveSelector } from './components/Features/LeaveSelector'
import { BestPeriodsTable } from './components/Features/BestPeriodsTable'
import { HolidaysList } from './components/Features/HolidaysList'
import { PlanTab } from './components/Features/PlanTab'
import { BottomTabBar } from './components/Layout/BottomTabBar'
import { computeLeaveScores } from './utils/leaveCalculator'
import { PROVINCES } from './data/schoolHolidays'

// ── Date helpers ────────────────────────────────────────────────
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function addMonths(ym, n) {
  const total = ym.year * 12 + (ym.month - 1) + n
  return { year: Math.floor(total / 12), month: (total % 12) + 1 }
}

function ymToStr(ym) {
  // e.g. { year: 2026, month: 6 } → "2026-6"
  return `${ym.year}-${ym.month}`
}

function strToYm(str) {
  const [y, m] = str.split('-')
  return { year: parseInt(y, 10), month: parseInt(m, 10) }
}

function monthLabel(ym) {
  return `${MONTH_SHORT[ym.month - 1]} ${ym.year}`
}

// ── Rolling window: 24 months starting from today ───────────────
const today = new Date()
const WINDOW_START = { year: today.getFullYear(), month: today.getMonth() + 1 }
const ALL_MONTHS = Array.from({ length: 24 }, (_, i) => addMonths(WINDOW_START, i))
// WINDOW_START = Jun 2026, ALL_MONTHS ends at May 2028

const DEFAULT_START = WINDOW_START                   // Jun 2026
const DEFAULT_END = addMonths(WINDOW_START, 11)      // May 2027 (12 months view)

// ── App ──────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('heatmap')
  const [leaveDays, setLeaveDays] = useState(3)
  const [viewStart, setViewStart] = useState(DEFAULT_START)
  const [viewEnd, setViewEnd] = useState(DEFAULT_END)
  const [showSchoolHols, setShowSchoolHols] = useState(false)
  const [provinceCode, setProvinceCode] = useState('GP')
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    document.documentElement.classList[darkMode ? 'add' : 'remove']('dark')
  }, [darkMode])

  // Convert {year, month} bounds into date strings for the calculator
  const startDateStr = `${viewStart.year}-${String(viewStart.month).padStart(2, '0')}-01`
  const endDateStr = (() => {
    const lastDay = new Date(viewEnd.year, viewEnd.month, 0).getDate()
    return `${viewEnd.year}-${String(viewEnd.month).padStart(2, '0')}-${lastDay}`
  })()

  // List of {year, month} objects to render as calendar months
  const months = useMemo(() => {
    const result = []
    let cur = { ...viewStart }
    while (cur.year < viewEnd.year || (cur.year === viewEnd.year && cur.month <= viewEnd.month)) {
      result.push({ ...cur })
      cur = addMonths(cur, 1)
    }
    return result
  }, [viewStart, viewEnd])

  // Compute leave scores for the entire visible range (memoised — only re-runs when range or leaveDays changes)
  const scores = useMemo(
    () => computeLeaveScores(startDateStr, endDateStr, leaveDays),
    [startDateStr, endDateStr, leaveDays]
  )

  function handleViewStartChange(e) {
    const ym = strToYm(e.target.value)
    setViewStart(ym)
    // Ensure end is never before start
    if (ym.year > viewEnd.year || (ym.year === viewEnd.year && ym.month > viewEnd.month)) {
      setViewEnd(ym)
    }
  }

  function handleViewEndChange(e) {
    const ym = strToYm(e.target.value)
    setViewEnd(ym)
    // Ensure start is never after end
    if (ym.year < viewStart.year || (ym.year === viewStart.year && ym.month < viewStart.month)) {
      setViewStart(ym)
    }
  }

  const leaveSelectorProps = {
    selected: leaveDays,
    onChange: setLeaveDays,
    showSchoolHols,
    onToggleSchool: () => setShowSchoolHols((v) => !v),
    provinceCode,
    onProvinceChange: setProvinceCode,
    provinces: PROVINCES,
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between sticky top-0 z-30 gap-3">
        <div className="flex-shrink-0">
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-none">
            Leave Optimiser 🇿🇦
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {monthLabel(viewStart)} – {monthLabel(viewEnd)}
          </p>
        </div>

        {/* Month range picker */}
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <div className="flex items-center gap-1">
            <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide hidden sm:block">
              From
            </label>
            <select
              value={ymToStr(viewStart)}
              onChange={handleViewStartChange}
              className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-2 py-1.5 border-0 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {ALL_MONTHS.map((ym) => (
                <option key={ymToStr(ym)} value={ymToStr(ym)}>
                  {monthLabel(ym)}
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-300 dark:text-slate-600 text-sm">→</span>

          <div className="flex items-center gap-1">
            <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide hidden sm:block">
              To
            </label>
            <select
              value={ymToStr(viewEnd)}
              onChange={handleViewEndChange}
              className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-2 py-1.5 border-0 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {ALL_MONTHS.map((ym) => (
                <option key={ymToStr(ym)} value={ymToStr(ym)}>
                  {monthLabel(ym)}
                </option>
              ))}
            </select>
          </div>

          {/* Dark / light mode toggle */}
          <button
            onClick={() => setDarkMode((v) => !v)}
            className="ml-1 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-base"
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — desktop only */}
        <aside className="hidden md:flex flex-col gap-6 w-64 border-r border-slate-200 dark:border-slate-700 p-4 overflow-y-auto flex-shrink-0 bg-white dark:bg-slate-900">
          <LeaveSelector {...leaveSelectorProps} />

          <nav className="flex flex-col gap-1">
            {[
              { id: 'heatmap', label: '📅  Heatmap' },
              { id: 'picks', label: '🏆  Best Periods' },
              { id: 'holidays', label: '🗓  Holidays' },
              { id: 'plan', label: '✏️  Plan my leave' },
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
        </aside>

        {/* Main content area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {activeTab === 'heatmap' && (
            <div className="md:hidden border-b border-slate-200 dark:border-slate-700 px-4 py-3 bg-white dark:bg-slate-900">
              <LeaveSelector {...leaveSelectorProps} />
            </div>
          )}

          <main className="flex-1 p-4 pb-24 md:pb-6 overflow-y-auto">
            {activeTab === 'heatmap' && (
              <CalendarHeatmap
                scores={scores}
                months={months}
                leaveDays={leaveDays}
                showSchoolHolidays={showSchoolHols}
                provinceCode={provinceCode}
              />
            )}
            {activeTab === 'picks' && (
              <BestPeriodsTable scores={scores} leaveDays={leaveDays} />
            )}
            {activeTab === 'holidays' && (
              <HolidaysList
                months={months}
                showSchoolHolidays={showSchoolHols}
                provinceCode={provinceCode}
              />
            )}
            {activeTab === 'plan' && <PlanTab />}
          </main>
        </div>
      </div>

      <BottomTabBar activeTab={activeTab} onChange={setActiveTab} />
    </div>
  )
}
