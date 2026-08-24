import { Fragment, useMemo, useState } from 'react'
import { LeavePeriodPanel } from '../Calendar/LeavePeriodPanel'
import { LeaveSummaryModal } from './LeaveSummaryModal'
import { PUBLIC_HOLIDAYS } from '../../data/publicHolidays'
import { addDays, fmtRange, fmtGroupRange } from '../../utils/dateFormat'

const ALL_HOLIDAYS = Object.values(PUBLIC_HOLIDAYS).flat()
  .sort((a, b) => a.date.localeCompare(b.date))

// Group holidays that fall within 7 days of each other into one window
const HOLIDAY_WINDOWS = (() => {
  const wins = []
  for (const h of ALL_HOLIDAYS) {
    const last = wins[wins.length - 1]
    if (last && h.date <= addDays(last.end, 7)) {
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

function findWindow(period) {
  return HOLIDAY_WINDOWS.find(w => w.start <= period.endDate && w.end >= period.startDate) ?? null
}

// A "run" is 2+ periods that sit on consecutive start dates and give the
// exact same result — these collapse into a single row in the table.
function collapseConsecutiveRuns(periods) {
  const runs = []
  for (const p of periods) {
    const last = runs[runs.length - 1]
    const lastP = last?.[last.length - 1]
    if (
      lastP &&
      lastP.daysOff === p.daysOff &&
      lastP.leaveDaysUsed === p.leaveDaysUsed &&
      addDays(lastP.startDate, 1) === p.startDate
    ) {
      last.push(p)
    } else {
      runs.push([p])
    }
  }
  return runs
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

  function pushRuns(list) {
    for (const run of collapseConsecutiveRuns(list)) {
      items.push({ type: 'row', period: run[0], group: run.length > 1 ? run : null })
    }
  }

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
      pushRuns(subGroup)
      first = false
    }
  }

  // Periods with no holiday window — plain rows, no heading
  pushRuns(byWin.get('__none__') ?? [])

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

function TrendingUpIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 17 9 11 13 15 21 7" />
      <polyline points="15 7 21 7 21 13" />
    </svg>
  )
}

function LayersIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}

function ChevronDownIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

const COLS = [
  { key: 'startDate',     label: 'Start Date', align: 'left',   width: '22%' },
  { key: 'endDate',       label: 'End Date',   align: 'left',   width: '22%' },
  { key: 'leaveDaysUsed', label: 'Days Used',  align: 'center', width: '16%' },
  { key: 'daysOff',       label: 'Days Off',   align: 'center', width: '16%' },
  { key: 'ratio',         label: null,         align: 'center', width: '16%' },
]

function ValuePill({ colour, children }) {
  return (
    <span className="inline-block rounded-full px-2 py-0.5 font-semibold tabular-nums" style={{ backgroundColor: colour, color: '#1e293b' }}>
      {children}
    </span>
  )
}

// One ordinary row — either a single candidate period, or a member of an
// expanded group. Always has its own checkbox and opens the detail panel.
function PeriodRow({ period, selected, onToggleSelect, onOpen, colourMap, highlight, onHover }) {
  const { startDate, endDate, daysOff, leaveDaysUsed, ratio } = period
  const [startLabel, endLabel] = fmtRange(startDate, endDate)
  const key = `${startDate}-${leaveDaysUsed}`

  return (
    <tr
      onClick={() => onOpen(startDate, leaveDaysUsed)}
      onMouseEnter={() => onHover?.({ start: startDate, end: endDate })}
      className={`border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-700/60 transition-colors cursor-pointer ${
        highlight ? 'bg-sky-50 dark:bg-sky-900/20' : 'bg-white dark:bg-transparent'
      }`}
    >
      <td className="px-2 py-2 text-center" onClick={e => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(key)}
          className="w-4 h-4 rounded accent-sky-500 align-middle cursor-pointer"
        />
      </td>
      <td className="px-3 py-2 text-slate-700 dark:text-slate-300 tabular-nums">{startLabel}</td>
      <td className="px-3 py-2 text-slate-700 dark:text-slate-300 tabular-nums">{endLabel}</td>
      <td className="px-3 py-2 text-center">
        <ValuePill colour={getUsedColour(leaveDaysUsed)}>{leaveDaysUsed}</ValuePill>
      </td>
      <td className="px-3 py-2 text-center">
        <ValuePill colour={colourMap.get(daysOff) ?? '#e2e8f0'}>{daysOff}</ValuePill>
      </td>
      <td className="px-3 py-2 text-center">
        <ValuePill colour={getIncreaseColour(ratio)}>{ratio != null ? ratio.toFixed(1) : '—'}</ValuePill>
      </td>
    </tr>
  )
}

// A collapsed run of adjacent same-result periods. Shows a layers icon +
// count instead of a checkbox — tap it to expand into individual PeriodRows.
function GroupRow({ group, groupKey, onToggleExpand, colourMap, onHoverClear }) {
  const { daysOff, leaveDaysUsed, ratio } = group[0]
  const { startLabel, endLabel } = fmtGroupRange(group)

  return (
    <tr
      onClick={() => onToggleExpand(groupKey)}
      onMouseEnter={onHoverClear}
      className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/60 active:bg-slate-100 dark:active:bg-slate-700/60 transition-colors cursor-pointer bg-white dark:bg-transparent"
    >
      <td className="px-2 py-2 text-center">
        <span className="inline-flex flex-col items-center gap-0.5 text-slate-400 dark:text-slate-500">
          <LayersIcon className="w-4 h-4" />
          <span className="text-[9px] font-semibold leading-none">×{group.length}</span>
        </span>
      </td>
      <td className="pl-5 pr-3 py-2 text-slate-700 dark:text-slate-300 tabular-nums">{startLabel}</td>
      <td className="pl-5 pr-3 py-2 text-slate-700 dark:text-slate-300 tabular-nums">{endLabel}</td>
      <td className="px-3 py-2 text-center">
        <ValuePill colour={getUsedColour(leaveDaysUsed)}>{leaveDaysUsed}</ValuePill>
      </td>
      <td className="px-3 py-2 text-center">
        <ValuePill colour={colourMap.get(daysOff) ?? '#e2e8f0'}>{daysOff}</ValuePill>
      </td>
      <td className="px-3 py-2 text-center">
        <ValuePill colour={getIncreaseColour(ratio)}>{ratio != null ? ratio.toFixed(1) : '—'}</ValuePill>
      </td>
    </tr>
  )
}

function GroupCollapseRow({ groupKey, onToggleExpand, onHoverClear }) {
  return (
    <tr
      onClick={() => onToggleExpand(groupKey)}
      onMouseEnter={onHoverClear}
      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
    >
      <td colSpan={6} className="py-1">
        <div className="flex justify-center">
          <ChevronDownIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 rotate-180" />
        </div>
      </td>
    </tr>
  )
}

export function BestPeriodsTable({ allBestPeriods, leaveDays, filterSet, smartFilter, holidayFilter, legend = [], nested = false, onHoverPeriod }) {
  const [sortKey, setSortKey] = useState('ratio')
  const [sortDir, setSortDir] = useState('desc')
  const [panelDate, setPanelDate]           = useState(null)
  const [panelLeaveDays, setPanelLeaveDays] = useState(null)
  const [selectedKeys, setSelectedKeys]     = useState(new Set())
  const [expandedGroups, setExpandedGroups] = useState(new Set())
  const [summaryOpen, setSummaryOpen]       = useState(false)

  const colourMap = useMemo(
    () => new Map(legend.map(({ daysOff, colour }) => [daysOff, colour])),
    [legend]
  )

  const { periods, renderItems } = useMemo(() => {
    const holidayDates = holidayFilter && holidayFilter.size > 0 ? [...holidayFilter] : null
    const filtered = [...allBestPeriods]
      .filter(p =>
        p.leaveDaysUsed <= leaveDays &&
        (!smartFilter || p.daysOff > leaveDays) &&
        (filterSet == null || filterSet.size === 0 || filterSet.has(p.daysOff)) &&
        (holidayDates == null || holidayDates.some(hDate => hDate >= p.startDate && hDate <= p.endDate))
      )
      .sort((a, b) => {
        const va = a[sortKey] ?? 0
        const vb = b[sortKey] ?? 0
        if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
        return sortDir === 'asc' ? va - vb : vb - va
      })
    return { periods: filtered, renderItems: buildRenderList(filtered) }
  }, [allBestPeriods, leaveDays, filterSet, smartFilter, holidayFilter, sortKey, sortDir])

  const selectedPeriods = useMemo(
    () => periods.filter(p => selectedKeys.has(`${p.startDate}-${p.leaveDaysUsed}`)),
    [periods, selectedKeys]
  )

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortKey(key); setSortDir('desc') }
  }

  function toggleSelect(key) {
    setSelectedKeys(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function toggleExpand(key) {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
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
        {/* Sticky segmented colour bar + selection summary button */}
        <div className={`sticky top-0 ${nested ? '' : 'md:top-[59px]'} z-20 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 md:rounded-xl md:rounded-b-none backdrop-blur-sm`}>
          <div className="flex items-center justify-end gap-2 px-3 py-2">
            {selectedKeys.size > 0 && (
              <button
                onClick={() => setSummaryOpen(true)}
                className="flex-shrink-0 px-2.5 py-1 rounded-full bg-sky-500 hover:bg-sky-400 text-white text-[11px] font-semibold transition-colors whitespace-nowrap"
              >
                Summary ({selectedKeys.size})
              </button>
            )}
          </div>
        </div>

        {/* Table — thead is sticky below the gradient bar */}
        <div className="border border-t-0 border-slate-200 dark:border-slate-700 md:rounded-xl md:rounded-t-none [overflow:clip]">
          <table className="w-full text-xs table-fixed">
            <colgroup>
              <col style={{ width: '8%' }} />
              {COLS.map(({ key, width }) => <col key={key} style={{ width }} />)}
            </colgroup>
            <thead className={`sticky top-[27px] ${nested ? '' : 'md:top-[86px]'} z-10 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700`}>
              <tr>
                <th className="px-2 py-2" aria-hidden="true" />
                {COLS.map(({ key, label, align }) => (
                  <th
                    key={key}
                    onClick={() => toggleSort(key)}
                    aria-label={label ? undefined : 'Increase ratio'}
                    className={`px-3 py-2 font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer whitespace-nowrap text-${align}`}
                  >
                    {label ?? <TrendingUpIcon className="w-3.5 h-3.5 inline-block" />}
                    <span className="ml-0.5 inline-block w-2.5 text-slate-400 dark:text-slate-500">
                      {sortKey === key ? (sortDir === 'desc' ? '↓' : '↑') : ''}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody onMouseLeave={() => onHoverPeriod?.(null)}>
              {renderItems.map((item, i) => {
                if (item.type === 'heading') {
                  return (
                    <tr key={`h-${i}`} onMouseEnter={() => onHoverPeriod?.(null)} className="bg-white dark:bg-transparent">
                      <td colSpan={6} className="px-3 pt-3 pb-1">
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
                    <tr key={`s-${i}`} onMouseEnter={() => onHoverPeriod?.(null)} className="bg-white dark:bg-transparent">
                      <td colSpan={6}>
                        <div className="mx-3 h-px bg-slate-200 dark:bg-slate-700" />
                      </td>
                    </tr>
                  )
                }

                const { period, group } = item
                const { startDate, leaveDaysUsed } = period
                const highlight = startDate === firstPeriod.startDate && leaveDaysUsed === firstPeriod.leaveDaysUsed

                if (group) {
                  const groupKey = `g-${group[0].startDate}-${group[group.length - 1].startDate}-${leaveDaysUsed}`
                  if (!expandedGroups.has(groupKey)) {
                    return (
                      <GroupRow
                        key={groupKey}
                        group={group}
                        groupKey={groupKey}
                        onToggleExpand={toggleExpand}
                        colourMap={colourMap}
                        onHoverClear={() => onHoverPeriod?.(null)}
                      />
                    )
                  }
                  return (
                    <Fragment key={groupKey}>
                      <GroupCollapseRow groupKey={groupKey} onToggleExpand={toggleExpand} onHoverClear={() => onHoverPeriod?.(null)} />
                      {group.map(p => (
                        <PeriodRow
                          key={`${p.startDate}-${p.leaveDaysUsed}`}
                          period={p}
                          selected={selectedKeys.has(`${p.startDate}-${p.leaveDaysUsed}`)}
                          onToggleSelect={toggleSelect}
                          onOpen={openPanel}
                          colourMap={colourMap}
                          highlight={p.startDate === firstPeriod.startDate && p.leaveDaysUsed === firstPeriod.leaveDaysUsed}
                          onHover={onHoverPeriod}
                        />
                      ))}
                    </Fragment>
                  )
                }

                return (
                  <PeriodRow
                    key={`${startDate}-${leaveDaysUsed}`}
                    period={period}
                    selected={selectedKeys.has(`${startDate}-${leaveDaysUsed}`)}
                    onToggleSelect={toggleSelect}
                    onOpen={openPanel}
                    colourMap={colourMap}
                    highlight={highlight}
                    onHover={onHoverPeriod}
                  />
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

      {summaryOpen && selectedPeriods.length > 0 && (
        <LeaveSummaryModal
          periods={selectedPeriods}
          onClose={() => setSummaryOpen(false)}
        />
      )}
    </>
  )
}
