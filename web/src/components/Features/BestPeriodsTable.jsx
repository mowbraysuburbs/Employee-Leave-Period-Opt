import { Fragment, useMemo, useState, useEffect } from 'react'
import { LeavePeriodPanel } from '../Calendar/LeavePeriodPanel'
import { PUBLIC_HOLIDAYS } from '../../data/publicHolidays'
import { addDays, fmtRangeNice, fmtGroupRangeNice } from '../../utils/dateFormat'

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

// A flat list, no headings, no leaveDaysUsed sub-grouping — just the exact
// order `periods` is already in, with adjacent identical runs collapsed.
// Used whenever the user has explicitly picked a sort: the holiday-window
// grouping (and its own internal leaveDaysUsed bucketing) is a curation aid
// for the default ratio-sorted browsing view, and both of those groupings
// re-order rows in ways that break any OTHER column's requested order —
// e.g. sorting by Days Off ascending would otherwise still jump back down
// every time a new leaveDaysUsed sub-group or holiday window starts.
function buildFlatRenderList(periods) {
  const items = []
  for (const run of collapseConsecutiveRuns(periods)) {
    items.push({ type: 'row', period: run[0], group: run.length > 1 ? run : null })
  }
  return items
}

// Slices a built render list down to one page's worth of ROWS (a clustered/
// collapsed run counts as a single row, matching what's actually on screen —
// not the raw period count underneath it). Carries the nearest preceding
// heading along so a page that starts mid-window still shows which holiday
// window its rows belong to, even if that heading was already shown on the
// previous page.
function paginateRenderItems(items, page, pageSize) {
  const startRow = (page - 1) * pageSize
  const endRow = startRow + pageSize

  let rowIndex = 0
  let firstRowItemIdx = -1
  let lastRowItemIdx = -1
  for (let i = 0; i < items.length; i++) {
    if (items[i].type !== 'row') continue
    if (rowIndex === startRow) firstRowItemIdx = i
    if (rowIndex === endRow - 1) lastRowItemIdx = i
    rowIndex++
  }
  if (firstRowItemIdx === -1) return []
  if (lastRowItemIdx === -1) lastRowItemIdx = items.length - 1

  let headingIdx = -1
  for (let i = firstRowItemIdx - 1; i >= 0; i--) {
    if (items[i].type === 'heading') { headingIdx = i; break }
  }

  const slice = items.slice(firstRowItemIdx, lastRowItemIdx + 1)
  return headingIdx === -1 ? slice : [items[headingIdx], ...slice]
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

// Days gained = days off beyond what you actually spent — 0 means you just
// broke even, higher means a better deal. Colour scales across a 0-10 range.
function getGainedColour(gained) {
  if (gained == null) return '#e2e8f0'
  return interpolate(Math.max(0, Math.min(1, gained / 10)))
}

function getUsedColour(used) {
  return interpolate(Math.max(0, Math.min(1, 1 - (used - 1) / 9)))
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
  { key: 'leaveDaysUsed', label: 'Days Used',   align: 'center', width: '20%' },
  { key: 'daysGained',    label: 'Days Gained', align: 'center', width: '20%' },
  { key: 'startDate',     label: 'Total Leave', align: 'left',   width: '60%' },
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
function PeriodRow({ period, selected, onToggleSelect, onOpen, highlight, onHover }) {
  const { startDate, endDate, daysOff, leaveDaysUsed } = period
  const daysGained = daysOff - leaveDaysUsed
  const [startLabel, endLabel] = fmtRangeNice(startDate, endDate)
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
      <td className="px-3 py-2 text-center">
        <ValuePill colour={getUsedColour(leaveDaysUsed)}>{leaveDaysUsed}</ValuePill>
      </td>
      <td className="px-3 py-2 text-center">
        <ValuePill colour={getGainedColour(daysGained)}>{daysGained}</ValuePill>
      </td>
      <td className="px-3 py-2 text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">{startLabel} – {endLabel}</td>
    </tr>
  )
}

// A collapsed run of adjacent same-result periods. Shows a layers icon +
// count instead of a checkbox — tap it to expand into individual PeriodRows.
function GroupRow({ group, groupKey, onToggleExpand, onHoverClear }) {
  const { daysOff, leaveDaysUsed } = group[0]
  const daysGained = daysOff - leaveDaysUsed
  const { startLabel, endLabel } = fmtGroupRangeNice(group)

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
      <td className="px-3 py-2 text-center">
        <ValuePill colour={getUsedColour(leaveDaysUsed)}>{leaveDaysUsed}</ValuePill>
      </td>
      <td className="px-3 py-2 text-center">
        <ValuePill colour={getGainedColour(daysGained)}>{daysGained}</ValuePill>
      </td>
      <td className="pl-5 pr-3 py-2 text-slate-700 dark:text-slate-300 tabular-nums whitespace-nowrap">{startLabel} – {endLabel}</td>
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
      <td colSpan={4} className="py-1">
        <div className="flex justify-center">
          <ChevronDownIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 rotate-180" />
        </div>
      </td>
    </tr>
  )
}

export function BestPeriodsTable({ allBestPeriods, leaveDays, filterSet, smartFilter, holidayFilter, nested = false, onHoverPeriod, selectedKeys, onToggleSelect, onPageDatesChange }) {
  const [sortKey, setSortKey] = useState('ratio')
  const [sortDir, setSortDir] = useState('desc')
  const [panelDate, setPanelDate]           = useState(null)
  const [panelLeaveDays, setPanelLeaveDays] = useState(null)
  const [expandedGroups, setExpandedGroups] = useState(new Set())

  const periods = useMemo(() => {
    const holidayDates = holidayFilter && holidayFilter.size > 0 ? [...holidayFilter] : null
    return [...allBestPeriods]
      .filter(p =>
        p.leaveDaysUsed <= leaveDays &&
        (!smartFilter || p.daysOff > leaveDays) &&
        (filterSet == null || filterSet.size === 0 || filterSet.has(p.daysOff)) &&
        (holidayDates == null || holidayDates.some(hDate => hDate >= p.startDate && hDate <= p.endDate))
      )
      .sort((a, b) => {
        const val = p => sortKey === 'daysGained' ? p.daysOff - p.leaveDaysUsed : p[sortKey] ?? 0
        const va = val(a)
        const vb = val(b)
        if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
        return sortDir === 'asc' ? va - vb : vb - va
      })
  }, [allBestPeriods, leaveDays, filterSet, smartFilter, holidayFilter, sortKey, sortDir])

  const isDefaultSort = sortKey === 'ratio' && sortDir === 'desc'
  const allRenderItems = useMemo(
    () => isDefaultSort ? buildRenderList(periods) : buildFlatRenderList(periods),
    [periods, isDefaultSort]
  )
  const totalRows = useMemo(
    () => allRenderItems.reduce((n, item) => n + (item.type === 'row' ? 1 : 0), 0),
    [allRenderItems]
  )

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))

  // Jump back to page 1 whenever the filtered/sorted result set — or the page
  // size itself — changes, otherwise you could be stranded on a page that no
  // longer exists.
  useEffect(() => { setPage(1) }, [periods, pageSize])

  const renderItems = useMemo(
    () => paginateRenderItems(allRenderItems, page, pageSize),
    [allRenderItems, page, pageSize]
  )

  // Tell the calendar which periods are on the current page — a clustered/
  // collapsed row still reports every date underneath it, since those are
  // still "on this page," just visually folded into one row. Report `null`
  // on unmount so the calendar goes back to showing everything once the
  // table isn't in view to page through.
  useEffect(() => {
    if (!onPageDatesChange) return
    const pagePeriods = []
    for (const item of renderItems) {
      if (item.type !== 'row') continue
      if (item.group) pagePeriods.push(...item.group)
      else pagePeriods.push(item.period)
    }
    onPageDatesChange(pagePeriods)
    return () => onPageDatesChange(null)
  }, [renderItems, onPageDatesChange])

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortKey(key); setSortDir('desc') }
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

  // The "top pick" highlight is scoped to whatever's on the current page —
  // not the globally best period, which might not even be visible here.
  const firstPeriod = renderItems.find(item => item.type === 'row')?.period

  return (
    <>
      <div className="flex flex-col">
        {totalRows > 5 && (
          <div className="flex items-center justify-center gap-4 pb-3">
            {totalPages > 1 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex-shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold leading-none flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >‹</button>
                <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex-shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold leading-none flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >›</button>
              </div>
            )}
            <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              Per page
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-lg pl-2 pr-6 py-1 border border-slate-200 dark:border-slate-600 focus:outline-none focus:border-sky-500"
              >
                {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
        )}
        {/* Table — thead is the topmost sticky element now that the summary bar is gone */}
        <div className="border border-slate-200 dark:border-slate-700 [overflow:clip]">
          <table className="w-full text-xs table-fixed">
            <colgroup>
              <col style={{ width: '8%' }} />
              {COLS.map(({ key, width }) => <col key={key} style={{ width }} />)}
            </colgroup>
            <thead className={`sticky top-0 ${nested ? '' : 'md:top-[59px]'} z-10 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700`}>
              <tr>
                <th className="px-2 py-2" aria-hidden="true" />
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
            <tbody onMouseLeave={() => onHoverPeriod?.(null)}>
              {renderItems.map((item, i) => {
                if (item.type === 'heading') {
                  return (
                    <tr key={`h-${i}`} onMouseEnter={() => onHoverPeriod?.(null)} className="bg-white dark:bg-transparent">
                      <td colSpan={4} className="px-3 pt-3 pb-1">
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
                      <td colSpan={4}>
                        <div className="mx-3 h-px bg-slate-200 dark:bg-slate-700" />
                      </td>
                    </tr>
                  )
                }

                const { period, group } = item
                const { startDate, leaveDaysUsed } = period
                const highlight = firstPeriod != null && startDate === firstPeriod.startDate && leaveDaysUsed === firstPeriod.leaveDaysUsed

                if (group) {
                  const groupKey = `g-${group[0].startDate}-${group[group.length - 1].startDate}-${leaveDaysUsed}`
                  if (!expandedGroups.has(groupKey)) {
                    return (
                      <GroupRow
                        key={groupKey}
                        group={group}
                        groupKey={groupKey}
                        onToggleExpand={toggleExpand}
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
                          onToggleSelect={onToggleSelect}
                          onOpen={openPanel}
                          highlight={firstPeriod != null && p.startDate === firstPeriod.startDate && p.leaveDaysUsed === firstPeriod.leaveDaysUsed}
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
                    onToggleSelect={onToggleSelect}
                    onOpen={openPanel}
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
    </>
  )
}
