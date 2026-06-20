import { useMemo, useState } from 'react'
import { getColourForDaysOff } from '../../utils/colorScale'
import { LeavePeriodPanel } from '../Calendar/LeavePeriodPanel'

const GRADIENT_STOPS = [
  [254, 240, 138],
  [163, 230,  53],
  [ 34, 197,  94],
  [ 45, 212, 191],
  [103, 232, 249],
]

function interpolate(t) {
  const pos = t * (GRADIENT_STOPS.length - 1)
  const lo = Math.floor(pos)
  const hi = Math.min(lo + 1, GRADIENT_STOPS.length - 1)
  const f = pos - lo
  const [r, g, b] = [0, 1, 2].map(i =>
    Math.round(GRADIENT_STOPS[lo][i] + (GRADIENT_STOPS[hi][i] - GRADIENT_STOPS[lo][i]) * f)
  )
  return `rgb(${r},${g},${b})`
}

function getIncreaseColour(ratio) {
  if (ratio == null) return '#e2e8f0'
  return interpolate(Math.max(0, Math.min(1, (ratio - 1) / 4)))
}

function getUsedColour(used) {
  return interpolate(Math.max(0, Math.min(1, 1 - (used - 1) / 9)))
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

const GRADIENT_CSS_INCREASE = 'linear-gradient(to right, rgb(248,113,113), rgb(250,204,21), rgb(34,197,94), rgb(56,189,248), rgb(99,102,241))'

export function BestPeriodsTable({ allBestPeriods, leaveDays, filterSet }) {
  const [sortKey, setSortKey] = useState('ratio')
  const [sortDir, setSortDir] = useState('desc')
  const [panelDate, setPanelDate]           = useState(null)
  const [panelLeaveDays, setPanelLeaveDays] = useState(null)

  const { periods, daysOffRange } = useMemo(() => {
    const filtered = [...allBestPeriods]
      .filter((p) =>
        p.leaveDaysUsed <= leaveDays &&
        p.daysOff !== p.leaveDaysUsed &&
        (filterSet == null || filterSet.size === 0 || filterSet.has(p.daysOff))
      )
      .sort((a, b) => {
        const va = a[sortKey] ?? 0
        const vb = b[sortKey] ?? 0
        if (typeof va === 'string') {
          return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
        }
        return sortDir === 'asc' ? va - vb : vb - va
      })
    let min = Infinity, max = 0
    for (const p of filtered) { if (p.daysOff < min) min = p.daysOff; if (p.daysOff > max) max = p.daysOff }
    return { periods: filtered, daysOffRange: { min: min === Infinity ? 1 : min, max: max === 0 ? 14 : max } }
  }, [allBestPeriods, leaveDays, filterSet, sortKey, sortDir])

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  function openPanel(startDate, leaveDaysUsed) {
    setPanelDate(startDate)
    setPanelLeaveDays(leaveDaysUsed)
  }

  if (periods.length === 0) {
    return (
      <p className="text-slate-500 dark:text-slate-400 text-xs px-4">
        No periods found.
      </p>
    )
  }

  return (
    <>
      <div className="flex flex-col">
        {/* Sticky block: gradient key + column headers together */}
        <div className="sticky top-0 z-20 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 md:rounded-xl md:rounded-b-none backdrop-blur-sm">
          <div className="flex items-center gap-2 px-3 py-2">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">low</span>
            <div className="flex-1 h-2 rounded-full" style={{ background: GRADIENT_CSS_INCREASE }} />
            <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">high</span>
          </div>
          <div className="flex border-t border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
            {COLS.map(({ key, label, align }) => (
              <button
                key={key}
                onClick={() => toggleSort(key)}
                className={`flex-1 px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors whitespace-nowrap text-${align}`}
              >
                {label}
                <span className="ml-0.5 inline-block w-2.5 text-slate-400 dark:text-slate-500">
                  {sortKey === key ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table body */}
        <div className="border border-t-0 border-slate-200 dark:border-slate-700 md:rounded-xl md:rounded-t-none">
          <table className="w-full text-xs">
            <thead className="sr-only">
              <tr>
                {COLS.map(({ key, label }) => <th key={key}>{label}</th>)}
              </tr>
            </thead>
            <tbody>
              {periods.map(({ startDate, endDate, daysOff, leaveDaysUsed, ratio }, i) => (
                <tr
                  key={`${startDate}-${leaveDaysUsed}`}
                  onClick={() => openPanel(startDate, leaveDaysUsed)}
                  className={`border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-700/60 transition-colors cursor-pointer ${
                    i === 0 ? 'bg-sky-50 dark:bg-sky-900/20' : 'bg-white dark:bg-transparent'
                  }`}
                >
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-300 tabular-nums">{fmt(startDate)}</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-300 tabular-nums">{fmt(endDate)}</td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className="inline-block rounded-full px-2 py-0.5 font-semibold tabular-nums"
                      style={{ backgroundColor: getUsedColour(leaveDaysUsed), color: '#1e293b' }}
                    >
                      {leaveDaysUsed}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span
                      className="inline-block rounded-full px-2 py-0.5 font-semibold tabular-nums"
                      style={{ backgroundColor: getColourForDaysOff(daysOff, daysOffRange.min, daysOffRange.max) ?? '#e2e8f0', color: '#1e293b' }}
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
      </div>

      {panelDate && (
        <LeavePeriodPanel
          date={panelDate}
          leaveDays={panelLeaveDays}
          onClose={() => { setPanelDate(null); setPanelLeaveDays(null) }}
        />
      )}
    </>
  )
}
