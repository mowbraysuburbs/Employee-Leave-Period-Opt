import { useMemo, useState } from 'react'

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
                  <span className="inline-block bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full px-2 py-0.5 font-semibold tabular-nums">
                    {daysOff}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="inline-block bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full px-2 py-0.5 font-semibold tabular-nums">
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
