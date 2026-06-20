import { useMemo } from 'react'
import { computeLeaveScores } from '../../utils/leaveCalculator'
import { BestPeriodsTable } from './BestPeriodsTable'

const TODAY = new Date().toISOString().slice(0, 10)
const DATASET_END = '2028-01-01'
const MAX_LEAVE = 10

function toEndDate(startDateStr, daysOff) {
  const d = new Date(startDateStr + 'T00:00:00')
  d.setDate(d.getDate() + daysOff - 1)
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-')
}

function buildCache() {
  const all = []
  // scoresMap[n] = Map(dateStr -> daysOff) — covers ALL dates including ratio=1
  const scoresMap = new Map()

  for (let n = 1; n <= MAX_LEAVE; n++) {
    const scores = computeLeaveScores(TODAY, DATASET_END, n)

    const nMap = new Map()
    scoresMap.set(n, nMap)

    const groups = new Map()
    for (const { date, daysOff } of scores) {
      nMap.set(date, daysOff)
      if (daysOff <= n) continue
      if (!groups.has(daysOff)) groups.set(daysOff, [])
      groups.get(daysOff).push(date)
    }

    for (const [daysOff, dates] of groups) {
      const ratio = daysOff / n
      for (const startDate of dates) {
        all.push({ startDate, endDate: toEndDate(startDate, daysOff), daysOff, leaveDaysUsed: n, ratio })
      }
    }
  }

  return {
    periods: all.sort((a, b) => (b.ratio ?? 0) - (a.ratio ?? 0) || b.daysOff - a.daysOff),
    scoresMap,
  }
}

const { periods: allBestPeriodsCache, scoresMap: plannerScoresMap } = buildCache()
export { allBestPeriodsCache }

export function LeavePlannerTab({ leaveDays, startDate, endDate, onStartChange, onEndChange, filterSet }) {
  const filtered = useMemo(
    () => allBestPeriodsCache.filter((p) => p.startDate >= startDate && p.endDate <= endDate),
    [startDate, endDate]
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Date inputs — desktop only; mobile uses the pill in the bottom bar */}
      <div className="hidden md:grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium uppercase tracking-wide">
            From
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartChange(e.target.value)}
            min={TODAY}
            max={endDate}
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
            onChange={(e) => onEndChange(e.target.value)}
            min={startDate}
            max={DATASET_END}
            className="w-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-lg px-3 py-2.5 border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      <BestPeriodsTable
        allBestPeriods={filtered}
        leaveDays={leaveDays}
        filterSet={filterSet}
      />
    </div>
  )
}
