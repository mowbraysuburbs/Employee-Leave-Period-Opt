import { useState } from 'react'
import { planLeaveInRange } from '../../utils/leaveCalculator'

const TYPE_LABELS = {
  weekend: 'Weekend',
  public_holiday: 'Public Holiday',
  leave: 'Leave Day',
  workday: 'Work Day',
}

const TYPE_COLOURS = {
  weekend: 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200',
  public_holiday: 'bg-violet-100 dark:bg-violet-700 text-violet-700 dark:text-white',
  leave: 'bg-sky-100 dark:bg-sky-600 text-sky-700 dark:text-white',
  workday: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
}

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-ZA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function PlanTab() {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [maxLeave, setMaxLeave] = useState(3)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  function handleCalculate() {
    setError('')
    setResult(null)

    if (!startDate || !endDate) {
      setError('Please select both a start and end date.')
      return
    }
    if (startDate > endDate) {
      setError('Start date must be before end date.')
      return
    }

    const rangeMs = new Date(endDate) - new Date(startDate)
    const rangeDays = rangeMs / (1000 * 60 * 60 * 24)
    if (rangeDays > 60) {
      setError('Please select a range of 60 days or less for a meaningful result.')
      return
    }

    const plan = planLeaveInRange(startDate, endDate, maxLeave)
    setResult(plan)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Plan my leave</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Pick a date range and your available leave days — we'll tell you the best days
          to apply for leave within that window.
        </p>
      </div>

      {/* Inputs */}
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium uppercase tracking-wide">
              From
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min="2026-01-01"
              max="2028-12-31"
              className="w-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-lg px-3 py-2.5 border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium uppercase tracking-wide">
              To
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || '2026-01-01'}
              max="2028-12-31"
              className="w-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-lg px-3 py-2.5 border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium uppercase tracking-wide">
            Max leave days available: {maxLeave}
          </label>
          <input
            type="range"
            min={0}
            max={10}
            value={maxLeave}
            onChange={(e) => setMaxLeave(Number(e.target.value))}
            className="w-full accent-sky-500"
          />
          <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1">
            <span>0</span>
            <span>10</span>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={handleCalculate}
          className="w-full sm:w-auto px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-lg transition-colors"
        >
          Calculate best strategy
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="flex flex-col gap-4 border-t border-slate-200 dark:border-slate-700 pt-4">
          {/* Summary */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex flex-col items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-5 py-3">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{result.totalDaysOff}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Total days off</span>
            </div>
            <div className="flex flex-col items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-5 py-3">
              <span className="text-2xl font-bold text-sky-600 dark:text-sky-400">{result.leaveDaysUsed}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Leave days used</span>
            </div>
            <div className="flex flex-col items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-5 py-3">
              <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                {result.breakdown.filter((d) => d.type === 'public_holiday').length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Public holidays</span>
            </div>
          </div>

          {/* Day-by-day breakdown */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              Day-by-day breakdown
            </h3>
            <div className="flex flex-col gap-1">
              {result.breakdown.map(({ date, type }) => (
                <div key={date} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 dark:text-slate-500 w-24 flex-shrink-0">
                    {formatDate(date)}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${TYPE_COLOURS[type]}`}
                  >
                    {TYPE_LABELS[type]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
