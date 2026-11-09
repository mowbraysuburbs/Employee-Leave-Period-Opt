import { MAX_LEAVE, aroundLabel } from '../../../utils/planner'
import { fmtShortRange } from '../../../utils/dateFormat'

const TONES = {
  tip: 'bg-sky-50 text-sky-950',
  done: 'bg-green-50 text-green-900',
  info: 'bg-slate-100 text-slate-700',
}

/**
 * The line under the plan's title (always there):
 *   💡 below the recommended leave days: "Recommended: N leave days", a reason
 *      tag (best bang for buck / joins holidays / covers the school holiday),
 *      that break, and a "Use N" button
 *   ✓  on the recommended days: the same tag; above them: the one break you have
 *   📈 no recommendation (next year): it plans for the best multiplier
 *   Custom, Easter and Christmas (list periods): about the number you're on:
 *      ✓ "N leave days join A + B: dates, days off" on a join number · 🗓️ no
 *      holidays · 🏝️ one holiday, or both sections (long break or holiday breaks) ·
 *      📈 holiday breaks (where they join next, or "N of M leave days used"). No Use N: REC on the row points the way.
 *      A number that adds nothing says so; too little leave for a proper break, or
 *      leave left over after your picks, offers "Use on the Calendar →".
 *
 * Props: planner – usePlanner() result; onUseRest – open the Calendar with the
 *   leave that's left (holidays filter off); phone – smaller text
 */
export function RecLine({ planner, onUseRest, phone = false }) {
  const { rec, long, breaks, leave } = planner
  let tone = 'info'
  let icon = '📈'
  let text = <>Plans for the <b>best multiplier</b>: short breaks around each holiday.</>
  let use = null
  // A second kind of button: send the leave you can't use here to the Calendar.
  let toCalendar = false
  const tag = rec && <span className="inline-block mx-0.5 px-1.5 rounded-md bg-amber-100 text-amber-900 text-[0.92em] font-bold whitespace-nowrap">{rec.reason}</span>

  if (planner.listMode) {
    // Custom, Easter and Christmas: the line is about the number you're on.
    const map = planner.customMap
    const joins = map?.joins ?? []
    const joinHere = joins.find(j => j.leave === leave)
    const firstJoin = joins[0]
    const { options } = planner
    // The break that joins them: the best one using exactly these leave days (either section).
    const joinBrk = options.filter(o => o.leaveDays === leave).sort((a, b) => b.daysOff - a.daysOff)[0]
    const { long: hasLong, holiday: hasHoliday } = planner.sections
    const when = brk => (brk ? <>: {fmtShortRange(brk.startDate, brk.endDate)}, {brk.daysOff} days off</> : '')
    const marks = map?.marks
    const unpicked = planner.pickedLeave ? leave - planner.pickedLeave : 0
    if (marks?.[leave - 1] === 'pad' && leave < planner.minLeave) {
      // Not enough for a proper break here: e.g. Easter with 2 days left.
      icon = '🗓️'
      text = <><b>{leave} leave day{leave === 1 ? '' : 's'} can't make a proper break here</b> (you need {planner.minLeave}). Use {leave === 1 ? 'it' : 'them'} on the Calendar instead.</>
      toCalendar = true
    } else if (marks?.[leave - 1] === 'pad' && !marks.some((m, i) => i >= leave && m !== 'pad')) {
      // Past the best value (the last join, or one holiday's proper break): capped.
      // Say what the best is, and send the rest to the Calendar.
      const best = marks.slice(0, leave - 1).findLastIndex(m => m !== 'pad') + 1
      const bestJoin = joins.find(j => j.leave === best)
      const bestBrk = options.filter(o => o.leaveDays === best).sort((a, b) => b.daysOff - a.daysOff)[0]
      tone = 'done'
      icon = '✓'
      text = <><b>{best} leave day{best === 1 ? '' : 's'} {bestJoin ? `join ${bestJoin.names.join(' + ')}` : 'make the best break here'}</b>{when(bestBrk)}. That's the most these holidays give; use your other {leave - best} on the Calendar.</>
      toCalendar = true
    } else if (marks?.[leave - 1] === 'pad') {
      // Your number adds nothing: point to the useful ones next to it.
      const below = marks.slice(0, leave - 1).findLastIndex(m => m !== 'pad') + 1
      const above = marks.findIndex((m, i) => i >= leave && m !== 'pad') + 1
      icon = '💡'
      tone = 'tip'
      text = <><b>{leave} leave days add nothing new here</b>: {[below, above].filter(Boolean).join(' or ')} gets more from the holidays.</>
    } else if (joinHere) {
      tone = 'done'
      icon = '✓'
      text = <><b>{leave} leave days join {joinHere.names.join(' + ')}</b>{when(joinBrk)}.</>
    } else if (planner.pickedLeave) {
      // Holiday breaks don't have to use all your leave: the rest goes on the Calendar.
      text = <><b>{planner.pickedLeave} of {leave} leave days used.</b>{unpicked > 0 ? <> Use the other {unpicked} on the Calendar.</> : ''}</>
      toCalendar = unpicked > 0
    } else if (!map?.holidays) {
      icon = '🗓️'
      text = <><b>No public holidays in these months</b>, so every week is the same. Pick the week that suits you.</>
    } else if (map.holidays === 1) {
      icon = '🏝️'
      text = <><b>Longest breaks.</b> Only one holiday here, so there's nothing to join. Pick one.</>
    } else if (hasLong && hasHoliday) {
      icon = '🏝️'
      text = <><b>One long break</b> or <b>holiday breaks</b>: take all your leave in one go, or tick holiday breaks that fit.</>
    } else if (map.allJoin && firstJoin && leave < firstJoin.leave) {
      text = <><b>Holiday breaks</b>, best value first. Tick the ones you want. At {firstJoin.leave} leave days {firstJoin.names.join(' + ')} join.</>
    } else {
      text = <><b>Holiday breaks</b>, best value first. Tick the ones you want.</>
    }
  } else if (rec && long) {
    const around = breaks[0] && aroundLabel(breaks[0])
    tone = 'done'
    icon = '✓'
    text = leave === rec.leave
      ? <>Recommended: <b>{rec.leave} leave days</b> {tag}{around ? <> · {around}</> : ''}.</>
      : <>One break{around ? <> around <b>{around}</b></> : ''}.</>
  } else if (rec) {
    const { brk } = rec
    const around = aroundLabel(brk)
    // Use N sets your limit so the plan gets N on top of what your Summary already uses.
    const target = planner.leaveLimit - planner.leaveLeft + rec.leave
    tone = 'tip'
    icon = '💡'
    text = <>Recommended: <b>{rec.leave} leave days</b> {tag} · {around ? `${around}, ` : ''}{fmtShortRange(brk.startDate, brk.endDate)}, {brk.daysOff} days off.</>
    if (target <= MAX_LEAVE) use = () => planner.setLimitAndLeave(target)
    else text = <>{text} You have {planner.leaveLeft} left.</>
  }

  return (
    <p role="status" className={`m-0 flex items-center gap-2 rounded-xl ${phone ? 'px-2.5 py-1.5 text-[11.5px]' : 'px-3 py-2 text-[12.5px]'} ${TONES[tone]}`}>
      <span aria-hidden="true">{icon}</span>
      <span className="flex-1 min-w-0">{text}</span>
      {use && (
        <button type="button" onClick={use} className="shrink-0 h-7 px-2.5 rounded-lg bg-sky-700 text-white text-[12px] font-bold whitespace-nowrap">
          Use {rec.leave}
        </button>
      )}
      {toCalendar && onUseRest && (
        <button type="button" onClick={onUseRest} className="shrink-0 h-7 px-2.5 rounded-lg bg-white border border-sky-300 text-sky-800 text-[12px] font-bold whitespace-nowrap">
          Use on the Calendar →
        </button>
      )}
    </p>
  )
}
