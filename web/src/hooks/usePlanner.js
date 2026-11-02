import { useState, useMemo } from 'react'
import { buildBreak } from '../utils/breaks'
import { MAX_LEAVE, planPeriods, planAllChoices, workdaysIn, schoolHolidaysIn, equalStartsWithin, monthsIn } from '../utils/planner'
import { addDays } from '../utils/dateFormat'


/**
 * The Overview planner's settings and results: which leave period, how many
 * leave days and breaks, months to avoid or include, and which result rows
 * are ticked. Shared by the desktop and phone Overview.
 *
 * Args: { today, province }
 */
export function usePlanner({ today, province }) {
  const periods = useMemo(() => planPeriods({ today, provinceCode: province }), [today, province])
  const [periodId, setPeriodId] = useState('next')
  const [custom, setCustom] = useState({ from: addDays(today, 1), to: addDays(today, 28) })
  const [leave, setLeave] = useState(MAX_LEAVE)
  // Break choice per period, so each keeps its own default until changed.
  const [breakChoice, setBreakChoice] = useState({})
  // 'YYYY-MM' → 'avoid' | 'include'.
  const [monthMarks, setMonthMarks] = useState({})
  const [matchSchool, setMatchSchool] = useState(false)
  // Start dates swapped by the user: original start → chosen start.
  const [swaps, setSwaps] = useState({})
  const [unticked, setUnticked] = useState([])

  const period = periodId === 'custom'
    ? { id: 'custom', kind: 'custom', title: 'Custom', subtitle: 'Your own dates', defaultBreaks: 3, ...custom }
    : periods.find(p => p.id === periodId) ?? periods[0]

  // Never more than 10, and never more than the workdays in the period.
  const maxLeave = Math.max(1, Math.min(MAX_LEAVE, workdaysIn(period.from, period.to)))
  const leaveUsed = Math.min(leave, maxLeave)

  const schoolSpans = useMemo(
    () => (period.id === 'custom' ? schoolHolidaysIn(province, period.from, period.to) : []),
    [period.id, period.from, period.to, province],
  )
  const periodMonths = useMemo(() => monthsIn(period.from, period.to), [period.from, period.to])
  const avoidMonths = useMemo(() => new Set(periodMonths.filter(m => monthMarks[m] === 'avoid')), [periodMonths, monthMarks])
  const includeMonths = useMemo(() => new Set(periodMonths.filter(m => monthMarks[m] === 'include')), [periodMonths, monthMarks])
  const within = useMemo(() => (matchSchool && schoolSpans.length ? schoolSpans : null), [matchSchool, schoolSpans])

  const choices = useMemo(
    () => planAllChoices({ from: period.from, to: period.to, leave: leaveUsed, avoidMonths, includeMonths, within }),
    [period.from, period.to, leaveUsed, avoidMonths, includeMonths, within],
  )

  // The chosen break count, stepped down to the largest one that changes the plan.
  // null means "as many as possible", so check for a saved choice rather than using ??.
  const wanted = period.id in breakChoice ? breakChoice[period.id] : period.defaultBreaks
  let chosenIndex = choices.findIndex(c => c.choice === wanted)
  if (chosenIndex < 0) chosenIndex = choices.length - 1
  while (chosenIndex > 0 && choices[chosenIndex].same) chosenIndex--
  const chosen = choices[chosenIndex]

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
    selectPeriod: reset(setPeriodId),
    custom,
    setCustom: reset(setCustom),
    leave: leaveUsed,
    maxLeave,
    setLeave: reset(n => setLeave(Math.max(1, Math.min(n, maxLeave)))),
    choices,
    breakChoice: chosen.choice,
    setBreakChoice: reset(choice => setBreakChoice(prev => ({ ...prev, [period.id]: choice }))),
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
