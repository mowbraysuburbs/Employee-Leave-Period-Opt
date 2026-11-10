import { useState, useMemo } from 'react'
import { buildBreak, breakKey } from '../utils/breaks'
import { MAX_LEAVE, planPeriods, planLeave, recommendedLeave, breaksFor, workdaysIn, schoolHolidaysIn, equalStartsWithin, monthsIn, customMonths, monthsPeriod, customOptions, pickBlocker, overlaps, customLeaveMap, listSections } from '../utils/planner'


/**
 * The Overview planner's settings and results: which leave period, how many
 * leave days and breaks, months to avoid or include, and which result rows
 * are ticked. Shared by the desktop and phone Overview.
 *
 * Args: { today, lastDate, province, leaveLimit, onLeaveLimitChange, saved } – the same
 * leave limit as the calendar; saved = the Summary ([{ startDate, leaveDays }]);
 * lastDate = the last day Custom months can reach.
 *
 * Custom (and Easter, Christmas) is different: whole months (From / To), and a
 * list in two sections, One long break and Holiday breaks (listSections), where
 * nothing is picked until you pick it; the leave numbers follow customLeaveMap. Its
 * `breaks` are your picks, so Details, the tiles and Add work as for any period.
 * The planner uses what's left: the limit minus the Summary, not counting the
 * breaks this plan added itself (so adding them doesn't re-plan the list).
 */
// Themed periods that work like Custom (a list to pick from, MIN / JOINS on the numbers).
// Next year spans several seasons: a plain number row and both sections.
const LIST_KINDS = new Set(['easter', 'xmas', 'year'])

export function usePlanner({ today, lastDate, province, leaveLimit = MAX_LEAVE, onLeaveLimitChange = () => {}, saved = [] }) {
  const periods = useMemo(() => planPeriods({ today, provinceCode: province }), [today, province])
  const [periodId, setPeriodId] = useState('next')
  // Custom: 'YYYY-MM' months, starting with the first one that has enough workdays, three months long.
  const monthChoices = useMemo(() => customMonths(today, lastDate ?? `${Number(today.slice(0, 4)) + 2}-01-31`), [today, lastDate])
  const [custom, setCustom] = useState(() => ({ fromMonth: monthChoices[0], toMonth: monthChoices[Math.min(2, monthChoices.length - 1)] }))
  // List periods: your picks (from either section).
  const [picks, setPicks] = useState([])
  // Custom options moved to an equal start date: option key → chosen start.
  const [optionSwaps, setOptionSwaps] = useState({})
  const [leave, setLeave] = useState(MAX_LEAVE)
  // 'YYYY-MM' → 'avoid' | 'include'.
  const [monthMarks, setMonthMarks] = useState({})
  const [matchSchool, setMatchSchool] = useState(false)
  // Start dates swapped by the user: original start → chosen start.
  const [swaps, setSwaps] = useState({})
  const [unticked, setUnticked] = useState([])
  // Breaks added from this plan (breakKey); cleared when any setting changes.
  const [addedKeys, setAddedKeys] = useState([])

  const isCustom = periodId === 'custom'
  const period = isCustom
    ? { id: 'custom', kind: 'custom', title: 'Custom dates', subtitle: 'Your own months', ...monthsPeriod(custom.fromMonth, custom.toMonth, today) }
    : periods.find(p => p.id === periodId) ?? periods[0]
  // Custom, Easter and Christmas show a list to pick from (see customLeaveMap);
  // nothing is ticked until you pick.
  const listMode = isCustom || LIST_KINDS.has(period.kind)

  // What's left to plan with: the limit minus the Summary (not counting this plan's own adds).
  const leaveLeft = Math.max(0, leaveLimit - saved.filter(s => !addedKeys.includes(breakKey(s))).reduce((t, s) => t + s.leaveDays, 0))
  // You can pick any number up to 10 (or the workdays in the period), even past what's left:
  // the leave card shows it in amber and Add to summary waits until the ticked breaks fit.
  const maxLeave = Math.max(1, Math.min(MAX_LEAVE, workdaysIn(period.from, period.to)))
  const leaveUsed = Math.min(leave, maxLeave)
  // For the leave card: everything in the Summary, and what's really left (this plan's adds included).
  const leaveInSummary = saved.reduce((t, s) => t + s.leaveDays, 0)
  const leaveLeftNow = Math.max(0, leaveLimit - leaveInSummary)
  const workdays = workdaysIn(period.from, period.to)

  // School holidays inside the period, for "Plan around school holidays" (any period).
  const schoolSpans = useMemo(() => schoolHolidaysIn(province, period.from, period.to), [period.from, period.to, province])
  const periodMonths = useMemo(() => monthsIn(period.from, period.to), [period.from, period.to])
  const avoidMonths = useMemo(() => new Set(periodMonths.filter(m => monthMarks[m] === 'avoid')), [periodMonths, monthMarks])
  const includeMonths = useMemo(() => new Set(periodMonths.filter(m => monthMarks[m] === 'include')), [periodMonths, monthMarks])
  const within = useMemo(() => (matchSchool && schoolSpans.length ? schoolSpans : null), [matchSchool, schoolSpans])

  // Each period's recommended leave days (REC): the days for its one long break.
  const recs = useMemo(() => Object.fromEntries(periods.map(p => [p.id, recommendedLeave(p)])), [periods])
  const rec = period.id === 'custom' ? null : recs[period.id]

  // No aim to pick: with the recommended days or more, one long break; with
  // fewer (or no REC, like next year), the best multiplier.
  const plan = useMemo(
    () => (leaveUsed && !listMode ? planLeave({ from: period.from, to: period.to, leave: leaveUsed, maxBreaks: breaksFor(rec, leaveUsed), avoidMonths, includeMonths, within }) : []),
    [listMode, period.from, period.to, leaveUsed, rec, avoidMonths, includeMonths, within],
  )

  // Custom: what each leave number does here, and which list these leave days get.
  const customMap = useMemo(() => (listMode ? customLeaveMap(period.from, period.to) : null), [listMode, period.from, period.to])
  // Which sections the list shows: One long break and / or Holiday breaks.
  const sections = useMemo(() => listSections(customMap), [customMap])

  // Custom's options, best first (nothing picked for you).
  const baseOptions = useMemo(
    () => {
      if (!listMode || !leaveUsed) return []
      const args = { from: period.from, to: period.to, leave: leaveUsed, avoidMonths, includeMonths, within }
      const long = sections.long ? customOptions({ ...args, aim: 'long', limit: 5 }) : []
      const keys = new Set(long.map(breakKey))
      // A holiday break that uses all your leave is a long break: it shows once, up there.
      const holiday = sections.holiday ? customOptions({ ...args, aim: 'max' }).filter(o => !keys.has(breakKey(o))) : []
      return [...long.map(o => ({ ...o, section: 'long' })), ...holiday.map(o => ({ ...o, section: 'holiday' }))]
    },
    [listMode, period.from, period.to, leaveUsed, sections, avoidMonths, includeMonths, within],
  )
  // Each option as shown (moved if you picked another equal start), with `key`
  // (the original start, so it stays the same row) and `starts` (equal start dates).
  const options = useMemo(() => baseOptions.map(o => {
    const key = breakKey(o)
    const starts = equalStartsWithin(o, period.from, period.to, 7)
    const moved = optionSwaps[key]
    return { ...(moved ? buildBreak(moved, o.leaveDays) : o), key, starts }
  }), [baseOptions, optionSwaps, period.from, period.to])
  // Your picks (nothing is ticked for you).
  const current = picks
  const isPicked = option => current.some(p => breakKey(p) === breakKey(option))
  const picked = useMemo(() => [...current].sort((a, b) => (a.startDate < b.startDate ? -1 : 1)), [current])

  // Apply any start-date swaps (only to equal options, so the totals stay the same).
  // (Custom: the breaks are your picks, with no swaps.)
  const swapped = useMemo(() => plan.map(b => {
    const to = swaps[b.startDate]
    return to ? buildBreak(to, b.leaveDays) : b
  }), [plan, swaps])
  const breaks = listMode ? picked : swapped
  const original = plan
  const startOptions = useMemo(
    () => (listMode ? options.map(o => o.starts) : original.map(b => equalStartsWithin(b, period.from, period.to))),
    [listMode, options, original, period.from, period.to],
  )
  const ticked = new Set(breaks.map(b => b.startDate).filter(d => listMode || !unticked.includes(d)))

  // Changing any setting starts the ticks and swaps afresh.
  function reset(update) {
    return (...args) => {
      update(...args)
      setSwaps({})
      setUnticked([])
      setAddedKeys([])
      setPicks([])
      setOptionSwaps({})
    }
  }

  return {
    periods,
    period,
    selectPeriod: reset(setPeriodId),
    // Custom: move an option to an equal start date (a picked one moves with it).
    // A picked option only offers starts that don't overlap your other picks.
    startChoicesFor: option => (isPicked(option)
      ? option.starts.filter(s => !current.some(p => p.key !== option.key && overlaps(p, s)))
      : option.starts),
    swapOptionStart: (option, startDate) => {
      setOptionSwaps(prev => ({ ...prev, [option.key]: startDate }))
      if (isPicked(option)) {
        const moved = { ...buildBreak(startDate, option.leaveDays), key: option.key, starts: option.starts }
        setPicks(current.map(p => (p.key === option.key ? moved : p)))
      }
    },
    // Custom months: the choices, the range, and a change (which also picks Custom).
    monthChoices,
    custom,
    changeMonths: reset(range => { setCustom(range); setPeriodId('custom') }),
    isCustom,
    listMode,
    // List periods: which sections show ({ long, holiday }) and the leave-number map (marks + tags).
    sections,
    customMap,
    // Custom's JOINS tags and greyed numbers for the number row (no greys while you've chosen One long break).
    limitMarks: customMap?.marks ? { joins: customMap.joins, marks: customMap.marks } : {},
    // The first leave number that makes a proper break here (fewer = nothing new; use the Calendar).
    minLeave: customMap?.minLeave ?? 1,
    options,
    // Why an option can't be picked (holiday breaks), or null: { near: brk } or { leave: true }.
    blockerFor: option => (isPicked(option) ? null : pickBlocker(option, current, leaveUsed)),
    isPicked,
    // One long break: pick one (again to clear); holiday breaks: tick on / off if it fits.
    togglePick: option => {
      const same = p => breakKey(p) === breakKey(option)
      if (current.some(same)) setPicks(current.filter(p => !same(p)))
      else setPicks(pickBlocker(option, current, leaveUsed) ? current : [...current, option])
    },
    pickedLeave: current.reduce((t, p) => t + p.leaveDays, 0),
    // What the Overview's calendar shows: list periods show every option's dates
    // (faint unless ticked); other periods show the plan, keyed by start date.
    calendarBreaks: listMode
      ? { breaks: options, ticked: new Set(picked.map(breakKey)), keyOf: breakKey }
      : { breaks, ticked },
    leave: leaveUsed,
    leaveLimit,
    leaveLeft,
    leaveLeftNow,
    leaveInSummary,
    workdays,
    setLeaveLimit: onLeaveLimitChange,
    // Call when the ticked breaks are added to the Summary, so the plan stays put.
    markAdded: list => setAddedKeys(keys => [...keys, ...list.map(breakKey)]),
    maxLeave,
    // The leave card's blocks: this plan's leave days (any number, even past what's left; the limit stays).
    setLeave: reset(n => setLeave(Math.max(1, Math.min(n, maxLeave)))),
    // "Use N" on Up next / School holidays: raises your limit if needed and plans with N.
    setLimitAndLeave: reset(n => { onLeaveLimitChange(n); setLeave(n) }),
    // The recommended leave days ({ leave, brk, whole } or null), and whether
    // the plan is that one long break (else the best multiplier).
    rec,
    recs,
    long: breaksFor(rec, leaveUsed) === 1,
    periodMonths,
    monthMarks,
    // Tap order: none → avoid → include → none.
    cycleMonth: reset(m => setMonthMarks(prev => {
      const next = { ...prev }
      if (!prev[m]) next[m] = 'avoid'
      else if (prev[m] === 'avoid') next[m] = 'include'
      else delete next[m]
      return next
    })),
    clearMonths: reset(() => setMonthMarks({})),
    schoolSpans,
    matchSchool,
    setMatchSchool: reset(setMatchSchool),
    moreCount: avoidMonths.size + includeMonths.size + (within ? 1 : 0),
    breaks,
    startOptions,
    swapStart: (index, startDate) => {
      const from = original[index].startDate
      setSwaps(prev => ({ ...prev, [from]: startDate === from ? undefined : startDate }))
      setUnticked(prev => prev.filter(d => d !== breaks[index].startDate))
    },
    ticked,
    toggleTick: startDate => setUnticked(prev => (prev.includes(startDate) ? prev.filter(d => d !== startDate) : [...prev, startDate])),
  }
}
