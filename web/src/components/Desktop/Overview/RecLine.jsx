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
 *      holidays · 🏝️ one holiday / one long break · 📈 holiday breaks (where they
 *      join next, or "N of M leave days used"). No Use N: REC on the row points the way.
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
    // The break that joins them: the top long break, or the holiday break using exactly these leave days.
    const joinBrk = planner.aim === 'long' ? options[0] : options.filter(o => o.leaveDays === leave).sort((a, b) => b.daysOff - a.daysOff)[0]
    const when = brk => (brk ? <>: {fmtShortRange(brk.startDate, brk.endDate)}, {brk.daysOff} days off</> : '')
    const marks = map?.marks
    const unpicked = planner.pickedLeave ? leave - planner.pickedLeave : 0
    if (marks?.[leave - 1] === 'pad' && leave < planner.minLeave) {
      // Not enough for a proper break here: e.g. Easter with 2 days left.
      icon = '🗓️'
      text = <><b>{leave} leave day{leave === 1 ? '' : 's'} can't make a proper break here</b> (you need {planner.minLeave}). Use {leave === 1 ? 'it' : 'them'} on the Calendar instead.</>
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
    } else if (planner.aim === 'long') {
      icon = '🏝️'
      if (!map?.holidays) {
        icon = '🗓️'
        text = <><b>No public holidays in these months</b>, so every week is the same. Pick the week that suits you.</>
      } else if (map.holidays === 1) {
        text = <><b>Longest breaks.</b> Only one holiday here, so there's nothing to join. Pick one.</>
      } else if (map.allJoin) {
        tone = 'done'
        icon = '✓'
        text = <><b>One break around {joins[joins.length - 1].names.join(' + ')}</b>{when(options[0])}. Longest first; pick one.</>
      } else {
        text = <><b>One long break</b> with your {leave} leave day{leave === 1 ? '' : 's'}. Longest first; pick one.</>
      }
    } else if (planner.pickedLeave) {
      // Holiday breaks don't have to use all your leave: the rest goes on the Calendar.
      text = <><b>{planner.pickedLeave} of {leave} leave days used.</b>{unpicked > 0 ? <> Use the other {unpicked} on the Calendar.</> : ''}</>
      toCalendar = unpicked > 0
    } else if (map?.allJoin && firstJoin && leave < firstJoin.leave) {
      text = <><b>Holiday breaks</b>, best value first. Tick the ones you want. At {firstJoin.leave} leave days {firstJoin.names.join(' + ')} join.</>
    } else if (map?.allJoin) {
      text = <><b>Holiday breaks</b>, best value first. Tick the ones you want.</>
    } else {
      text = <><b>Holiday breaks</b>, best value first: your holidays are too far apart to join. Tick the ones you want.</>
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
