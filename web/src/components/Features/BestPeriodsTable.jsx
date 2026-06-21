import { useMemo, useState } from 'react'
import { LeavePeriodPanel } from '../Calendar/LeavePeriodPanel'
import { PUBLIC_HOLIDAYS } from '../../data/publicHolidays'

const ALL_HOLIDAYS = Object.values(PUBLIC_HOLIDAYS).flat()
  .sort((a, b) => a.date.localeCompare(b.date))

// Group holidays that fall within 7 days of each other into one window
const HOLIDAY_WINDOWS = (() => {
  const wins = []
  for (const h of ALL_HOLIDAYS) {
    const last = wins[wins.length - 1]
    if (last && h.date <= shiftDate(last.end, 7)) {
      if (h.date > last.end) last.end = h.date
      last.names.push(h.name)
    } else {
      wins.push({ start: h.date, end: h.date, names: [h.name] })
    }
  }
  return wins.map((w, id) => ({
    id,
    start: w.start,
    end: w.end,
    label: w.names.length <= 2
      ? w.names.join(' · ')
      : `${w.names[0]} · ${w.names[1]} +${w.names.length - 2}`,
  }))
})()

function shiftDate(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function findWindow(period) {
  return HOLIDAY_WINDOWS.find(w => w.start <= period.endDate && w.end >= period.startDate) ?? null
}

// Build a flat render list: heading → rows → separator → rows → heading → ...
function buildRenderList(periods) {
  // Assign a window to each period
  const tagged = periods.map(p => ({ ...p, win: findWindow(p) }))

  // Collect windows in the order their first period appears
  const seenWin = new Set()
  const winOrder = []
  const byWin = new Map()

  for (const p of tagged) {
    const key = p.win?.id ?? '__none__'
    if (!byWin.has(key)) byWin.set(key, [])
    byWin.get(key).push(p)
    if (p.win && !seenWin.has(p.win.id)) {
      seenWin.add(p.win.id)
      winOrder.push(p.win)
    }
  }

  const items = []

  for (const win of winOrder) {
    const group = byWin.get(win.id) ?? []
    // Within a window, keep existing sort order but group by leaveDaysUsed
    const subGroups = new Map()
    for (const p of group) {
      if (!subGroups.has(p.leaveDaysUsed)) subGroups.set(p.leaveDaysUsed, [])
      subGroups.get(p.leaveDaysUsed).push(p)
    }

    items.push({ type: 'heading', label: win.label })

    let first = true
    for (const subGroup of subGroups.values()) {
      if (!first) items.push({ type: 'separator' })
      for (const p of subGroup) items.push({ type: 'row', period: p })
      first = false
    }
  }

  // Periods with no holiday window — plain rows, no heading
  for (const p of byWin.get('__none__') ?? []) {
    items.push({ type: 'row', period: p })
  }

  return items
}

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


export function BestPeriodsTable({ allBestPeriods, leaveDays, filterSet, smartFilter, legend = [] }) {
  const [sortKey, setSortKey] = useState('ratio')
  const [sortDir, setSortDir] = useState('desc')
  const [panelDate, setPanelDate]           = useState(null)
  const [panelLeaveDays, setPanelLeaveDays] = useState(null)

  const colourMap = useMemo(
    () => new Map(legend.map(({ daysOff, colour }) => [daysOff, colour])),
    [legend]
  )

  const { periods, renderItems } = useMemo(() => {
    const filtered = [...allBestPeriods]
      .filter(p =>
        p.leaveDaysUsed <= leaveDays &&
        (!smartFilter || p.daysOff > leaveDays) &&
        (filterSet == null || filterSet.size === 0 || filterSet.has(p.daysOff))
      )
      .sort((a, b) => {
        const va = a[sortKey] ?? 0
        const vb = b[sortKey] ?? 0
        if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
        return sortDir === 'asc' ? va - vb : vb - va
      })
    return { periods: filtered, renderItems: buildRenderList(filtered) }
  }, [allBestPeriods, leaveDays, filterSet, smartFilter, sortKey, sortDir])

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortKey(key); setSortDir('desc') }
  }

  function openPanel(startDate, leaveDaysUsed) {
    setPanelDate(startDate)
    setPanelLeaveDays(leaveDaysUsed)
  }

  if (periods.length === 0) {
    return <p className="text-slate-500 dark:text-slate-400 text-xs px-4">No periods found.</p>
  }

  const firstPeriod = periods[0]

  return (
    <>
      <div className="flex flex-col">
        {/* Sticky segmented colour bar */}
        <div className="sticky top-0 md:top-[59px] z-20 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 md:rounded-xl md:rounded-b-none backdrop-blur-sm">
          <div className="flex items-center gap-2 px-3 py-2">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">low</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden flex">
              {legend.map(({ daysOff, colour }) => (
                <div key={daysOff} className="flex-1" style={{ backgroundColor: colour }} />
              ))}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">high</span>
          </div>
        </div>

        {/* Table — thead is sticky below the gradient bar */}
        <div className="border border-t-0 border-slate-200 dark:border-slate-700 md:rounded-xl md:rounded-t-none [overflow:clip]">
          <table className="w-full text-xs table-fixed">
            <thead className="sticky top-[27px] md:top-[86px] z-10 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                {COLS.map(({ key, label, align }) => (
                  <th
                    key={key}
                    onClick={() => toggleSort(key)}
                    className={`px-3 py-2 font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer whitespace-nowrap text-${align}`}
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
              {renderItems.map((item, i) => {
                if (item.type === 'heading') {
                  return (
                    <tr key={`h-${i}`} className="bg-white dark:bg-transparent">
                      <td colSpan={5} className="px-3 pt-3 pb-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 whitespace-nowrap">
                            {item.label}
                          </span>
                          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                        </div>
                      </td>
                    </tr>
                  )
                }

                if (item.type === 'separator') {
                  return (
                    <tr key={`s-${i}`} className="bg-white dark:bg-transparent">
                      <td colSpan={5}>
                        <div className="mx-3 h-px bg-slate-200 dark:bg-slate-700" />
                      </td>
                    </tr>
                  )
                }

                const { startDate, endDate, daysOff, leaveDaysUsed, ratio } = item.period
                const isFirst = startDate === firstPeriod.startDate && leaveDaysUsed === firstPeriod.leaveDaysUsed

                return (
                  <tr
                    key={`${startDate}-${leaveDaysUsed}`}
                    onClick={() => openPanel(startDate, leaveDaysUsed)}
                    className={`border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-700/60 transition-colors cursor-pointer ${
                      isFirst ? 'bg-sky-50 dark:bg-sky-900/20' : 'bg-white dark:bg-transparent'
                    }`}
                  >
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-300 tabular-nums">{fmt(startDate)}</td>
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-300 tabular-nums">{fmt(endDate)}</td>
                    <td className="px-3 py-2 text-center">
                      <span className="inline-block rounded-full px-2 py-0.5 font-semibold tabular-nums" style={{ backgroundColor: getUsedColour(leaveDaysUsed), color: '#1e293b' }}>
                        {leaveDaysUsed}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="inline-block rounded-full px-2 py-0.5 font-semibold tabular-nums" style={{ backgroundColor: colourMap.get(daysOff) ?? '#e2e8f0', color: '#1e293b' }}>
                        {daysOff}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="inline-block rounded-full px-2 py-0.5 font-semibold tabular-nums" style={{ backgroundColor: getIncreaseColour(ratio), color: '#1e293b' }}>
                        {ratio != null ? ratio.toFixed(1) : '—'}
                      </span>
                    </td>
                  </tr>
                )
              })}
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
