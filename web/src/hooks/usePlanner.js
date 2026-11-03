import { useState, useMemo } from 'react'
import { buildBreak } from '../utils/breaks'
import { MAX_LEAVE, GOAL_BREAKS, planPeriods, planLeave, planAllChoices, planGoals, summarise, workdaysIn, schoolHolidaysIn, equalStartsWithin, monthsIn } from '../utils/planner'
import { addDays } from '../utils/dateFormat'


/**
 * The Overview planner's settings and results: which leave period, how many
 * leave days and breaks, months to avoid or include, and which result rows
 * are ticked. Shared by the desktop and phone Overview.
 *
 * Args: { today, province, leaveLimit, onLeaveLimitChange } – the same leave
 * limit as the calendar caps the planner's leave days
 */
export function usePlanner({ today, province, leaveLimit = MAX_LEAVE, onLeaveLimitChange = () => {} }) {
  const periods = useMemo(() => planPeriods({ today, provinceCode: province }), [today, province])
  const [periodId, setPeriodId] = useState('next')
  const [custom, setCustom] = useState({ from: addDays(today, 1), to: addDays(today, 28) })
  const [leave, setLeave] = useState(MAX_LEAVE)
  // "What matters most?" ('max' | 'mix' | 'long'), shared by every period.
  const [goalWanted, setGoalWanted] = useState('mix')
  // 'YYYY-MM' → 'avoid' | 'include'.
  const [monthMarks, setMonthMarks] = useState({})
  const [matchSchool, setMatchSchool] = useState(false)
  // Start dates swapped by the user: original start → chosen start.
  const [swaps, setSwaps] = useState({})
  const [unticked, setUnticked] = useState([])

  const period = periodId === 'custom'
    ? { id: 'custom', kind: 'custom', title: 'Custom dates', subtitle: 'Your own dates', ...custom }
    : periods.find(p => p.id === periodId) ?? periods[0]

  // Never more than your leave limit (10 at most), or the workdays in the period.
  const maxLeave = Math.max(1, Math.min(leaveLimit, workdaysIn(period.from, period.to)))
  const leaveUsed = Math.min(leave, maxLeave)

  // School holidays inside the period, for "Plan around school holidays" (any period).
  const schoolSpans = useMemo(() => schoolHolidaysIn(province, period.from, period.to), [period.from, period.to, province])
  const periodMonths = useMemo(() => monthsIn(period.from, period.to), [period.from, period.to])
  const avoidMonths = useMemo(() => new Set(periodMonths.filter(m => monthMarks[m] === 'avoid')), [periodMonths, monthMarks])
  const includeMonths = useMemo(() => new Set(periodMonths.filter(m => monthMarks[m] === 'include')), [periodMonths, monthMarks])
  const within = useMemo(() => (matchSchool && schoolSpans.length ? schoolSpans : null), [matchSchool, schoolSpans])

  const choices = useMemo(
    () => planAllChoices({ from: period.from, to: period.to, leave: leaveUsed, avoidMonths, includeMonths, within }),
    [period.from, period.to, leaveUsed, avoidMonths, includeMonths, within],
  )

  // The goal's plan for this period. A period too short to split simply gives
  // the same plan for every goal, and that's fine: the choice still applies to the others.
  const goals = useMemo(() => planGoals(choices), [choices])
  const chosen = goals[goalWanted]

  // Each period card's quick summary: its plan with the current leave days, goal,
  // months and school-holiday setting (a period too short to split shows its one break).
  const cardStats = useMemo(() => {
    const stats = {}
    for (const p of periods) {
      const spans = matchSchool ? schoolHolidaysIn(province, p.from, p.to) : []
      stats[p.id] = summarise(planLeave({
        from: p.from, to: p.to, leave: Math.min(leave, leaveLimit), maxBreaks: GOAL_BREAKS[goalWanted],
        avoidMonths, includeMonths, within: spans.length ? spans : null,
      }))
    }
    return stats
  }, [periods, leave, leaveLimit, goalWanted, avoidMonths, includeMonths, matchSchool, province])

  // Apply any start-date swaps (only to equal options, so the totals stay the same).
  const breaks = useMemo(() => chosen.breaks.map(b => {
    const to = swaps[b.startDate]
    return to ? buildBreak(to, b.leaveDays) : b
  }), [chosen, swaps])
  const original = chosen.breaks
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
    }
  }

  return {
    periods,
    period,
    // A whole year (2027) has room for many breaks, so it starts on Maximise.
    selectPeriod: reset(id => {
      setPeriodId(id)
      if (id === 'year') setGoalWanted('max')
    }),
    custom,
    setCustom: reset(setCustom),
    // Any period's dates changed by hand: it becomes Custom with those dates.
    changeDates: reset(dates => { setCustom(dates); setPeriodId('custom') }),
    leave: leaveUsed,
    leaveLimit,
    setLeaveLimit: onLeaveLimitChange,
    maxLeave,
    setLeave: reset(n => setLeave(Math.max(1, Math.min(n, maxLeave)))),
    // The Overview's "Days off limit": sets your limit and plans with all of it.
    setLimitAndLeave: reset(n => { onLeaveLimitChange(n); setLeave(n) }),
    goals,
    goal: goalWanted,
    setGoal: reset(setGoalWanted),
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
