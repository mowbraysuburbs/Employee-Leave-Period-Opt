import { useState, useMemo } from 'react'
import { buildBreak, breakKey } from '../utils/breaks'
import { MAX_LEAVE, planPeriods, planLeave, recommendedLeave, breaksFor, summarise, workdaysIn, schoolHolidaysIn, equalStartsWithin, monthsIn } from '../utils/planner'
import { addDays } from '../utils/dateFormat'


/**
 * The Overview planner's settings and results: which leave period, how many
 * leave days and breaks, months to avoid or include, and which result rows
 * are ticked. Shared by the desktop and phone Overview.
 *
 * Args: { today, province, leaveLimit, onLeaveLimitChange, saved } – the same
 * leave limit as the calendar; saved = the Summary ([{ startDate, leaveDays }]).
 * The planner uses what's left: the limit minus the Summary, not counting the
 * breaks this plan added itself (so adding them doesn't re-plan the list).
 */
export function usePlanner({ today, province, leaveLimit = MAX_LEAVE, onLeaveLimitChange = () => {}, saved = [] }) {
  const periods = useMemo(() => planPeriods({ today, provinceCode: province }), [today, province])
  const [periodId, setPeriodId] = useState('next')
  const [custom, setCustom] = useState({ from: addDays(today, 1), to: addDays(today, 28) })
  const [leave, setLeave] = useState(MAX_LEAVE)
  // 'YYYY-MM' → 'avoid' | 'include'.
  const [monthMarks, setMonthMarks] = useState({})
  const [matchSchool, setMatchSchool] = useState(false)
  // Start dates swapped by the user: original start → chosen start.
  const [swaps, setSwaps] = useState({})
  const [unticked, setUnticked] = useState([])
  // Breaks added from this plan (breakKey); cleared when any setting changes.
  const [addedKeys, setAddedKeys] = useState([])

  const period = periodId === 'custom'
    ? { id: 'custom', kind: 'custom', title: 'Custom dates', subtitle: 'Your own dates', ...custom }
    : periods.find(p => p.id === periodId) ?? periods[0]

  // What's left to plan with: the limit minus the Summary (not counting this plan's own adds).
  const leaveLeft = Math.max(0, leaveLimit - saved.filter(s => !addedKeys.includes(breakKey(s))).reduce((t, s) => t + s.leaveDays, 0))
  // Never more than what's left (10 at most), or the workdays in the period; 0 = nothing to plan.
  const maxLeave = leaveLeft === 0 ? 0 : Math.max(1, Math.min(leaveLeft, workdaysIn(period.from, period.to)))
  const leaveUsed = Math.min(leave, maxLeave)

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
    () => (leaveUsed ? planLeave({ from: period.from, to: period.to, leave: leaveUsed, maxBreaks: breaksFor(rec, leaveUsed), avoidMonths, includeMonths, within }) : []),
    [period.from, period.to, leaveUsed, rec, avoidMonths, includeMonths, within],
  )

  // Each period card's quick summary: its plan with the current leave days,
  // months and school-holiday setting, by the same rule.
  const cardStats = useMemo(() => {
    const stats = {}
    for (const p of periods) {
      const spans = matchSchool ? schoolHolidaysIn(province, p.from, p.to) : []
      if (!leaveLeft) { stats[p.id] = summarise([]); continue }
      const n = Math.max(1, Math.min(leave, leaveLeft, workdaysIn(p.from, p.to)))
      stats[p.id] = summarise(planLeave({
        from: p.from, to: p.to, leave: n, maxBreaks: breaksFor(recs[p.id], n),
        avoidMonths, includeMonths, within: spans.length ? spans : null,
      }))
    }
    return stats
  }, [periods, recs, leave, leaveLeft, avoidMonths, includeMonths, matchSchool, province])

  // Apply any start-date swaps (only to equal options, so the totals stay the same).
  const breaks = useMemo(() => plan.map(b => {
    const to = swaps[b.startDate]
    return to ? buildBreak(to, b.leaveDays) : b
  }), [plan, swaps])
  const original = plan
  const startOptions = useMemo(
    () => original.map(b => equalStartsWithin(b, period.from, period.to)),
    [original, period.from, period.to],
  )
  const ticked = new Set(breaks.map(b => b.startDate).filter(d => !unticked.includes(d)))

  // Changing any setting starts the ticks and swaps afresh.
  function reset(update) {
    return (...args) => {
      update(...args)
      setSwaps({})
      setUnticked([])
      setAddedKeys([])
    }
  }

  return {
    periods,
    period,
    selectPeriod: reset(setPeriodId),
    custom,
    setCustom: reset(setCustom),
    // Any period's dates changed by hand: it becomes Custom with those dates.
    changeDates: reset(dates => { setCustom(dates); setPeriodId('custom') }),
    leave: leaveUsed,
    leaveLimit,
    leaveLeft,
    setLeaveLimit: onLeaveLimitChange,
    // Call when the ticked breaks are added to the Summary, so the plan stays put.
    markAdded: list => setAddedKeys(keys => [...keys, ...list.map(breakKey)]),
    maxLeave,
    setLeave: reset(n => setLeave(Math.max(1, Math.min(n, maxLeave)))),
    // The Overview's "Days off limit": sets your limit and plans with all of it.
    setLimitAndLeave: reset(n => { onLeaveLimitChange(n); setLeave(n) }),
    // The recommended leave days ({ leave, brk, whole } or null), and whether
    // the plan is that one long break (else the best multiplier).
    rec,
    recs,
    long: breaksFor(rec, leaveUsed) === 1,
    cardStats,
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
