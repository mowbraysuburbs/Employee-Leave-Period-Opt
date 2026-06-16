import { useMemo, useState } from 'react'
import { getColourForDaysOff } from '../../utils/colorScale'

// Yellow → lime → green → teal → cyan: all positive, no red connotation.
// ratio 1.0 = yellow (low end), 5.0+ = cyan (high end).
function getIncreaseColour(ratio) {
  if (ratio == null) return '#e2e8f0'
  const t = Math.max(0, Math.min(1, (ratio - 1) / 4))
  const stops = [
    [254, 240, 138],  // yellow-200
    [163, 230,  53],  // lime-400
    [ 34, 197,  94],  // green-500
    [ 45, 212, 191],  // teal-400
    [103, 232, 249],  // cyan-300
  ]
  const pos = t * (stops.length - 1)
  const lo = Math.floor(pos)
  const hi = Math.min(lo + 1, stops.length - 1)
  const f = pos - lo
  const [r, g, b] = [0, 1, 2].map(i => Math.round(stops[lo][i] + (stops[hi][i] - stops[lo][i]) * f))
  return `rgb(${r},${g},${b})`
}

function fmt(dateStr) {
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y.slice(2)}`
}

const COLS = [
  { key: 'startDate',     label: 'Start',    align: 'left' },
  { key: 'endDate',       label: 'End',      align: 'left' },
  { key: 'leaveDaysUsed', label: 'Used',     align: 'center' },
  { key: 'daysOff',       label: 'Off',      align: 'center' },
  { key: 'ratio',         label: 'Increase', align: 'center' },
]

export function BestPeriodsTable({ allBestPeriods, leaveDays }) {
  const [sortKey, setSortKey] = useState('ratio')
  const [sortDir, setSortDir] = useState('desc')

  const periods = useMemo(() => {
    return [...allBestPeriods]
      .filter((p) => p.leaveDaysUsed <= leaveDays)
      .sort((a, b) => {
        const va = a[sortKey] ?? 0
        const vb = b[sortKey] ?? 0
        if (typeof va === 'string') {
          return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
        }
        return sortDir === 'asc' ? va - vb : vb - va
      })
      .slice(0, 20)
  }, [allBestPeriods, leaveDays, sortKey, sortDir])

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  if (periods.length === 0) {
    return (
      <p className="text-slate-500 dark:text-slate-400 text-xs">
        No periods found.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Best periods · up to {leaveDays} leave day{leaveDays === 1 ? '' : 's'}
      </h2>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
              {COLS.map(({ key, label, align }) => (
                <th
                  key={key}
                  onClick={() => toggleSort(key)}
                  className={`px-3 py-2 font-medium text-slate-500 dark:text-slate-400 cursor-pointer select-none hover:text-slate-800 dark:hover:text-slate-200 transition-colors whitespace-nowrap text-${align}`}
                >
                  {label}
                  <span className="ml-0.5 inline-block w-2.5 text-slate-400 dark:text-slate-500">
                    {sortKey === key ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map(({ startDate, endDate, daysOff, leaveDaysUsed, ratio }, i) => (
              <tr
                key={`${startDate}-${leaveDaysUsed}`}
                className={`border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                  i === 0 ? 'bg-sky-50 dark:bg-sky-900/20' : 'bg-white dark:bg-transparent'
                }`}
              >
                <td className="px-3 py-2 text-slate-700 dark:text-slate-300 tabular-nums">{fmt(startDate)}</td>
                <td className="px-3 py-2 text-slate-700 dark:text-slate-300 tabular-nums">{fmt(endDate)}</td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-block bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 rounded-full px-2 py-0.5 font-semibold tabular-nums">
                    {leaveDaysUsed}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span
                    className="inline-block rounded-full px-2 py-0.5 font-semibold tabular-nums"
                    style={{ backgroundColor: getColourForDaysOff(daysOff) ?? '#e2e8f0', color: '#1e293b' }}
                  >
                    {daysOff}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span
                    className="inline-block rounded-full px-2 py-0.5 font-semibold tabular-nums"
                    style={{ backgroundColor: getIncreaseColour(ratio), color: '#1e293b' }}
                  >
                    {ratio != null ? ratio.toFixed(1) : '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-slate-400 dark:text-slate-500">
        Tap a column to sort. Increase = days off ÷ leave days used. Slider filters to periods using up to that many days.
      </p>
    </div>
  )
}
