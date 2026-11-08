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
 *   Custom: which list and why: 🗓️ no holidays (every week the same) · 🏝️ one
 *      holiday / one long break · ✓ the holidays join · 📈 holiday breaks, then
 *      "N of M leave days used. Want more? Add breaks on the Calendar." 
 *
 * Props: planner – usePlanner() result; phone – smaller text
 */
export function RecLine({ planner, phone = false }) {
  const { rec, long, breaks, leave } = planner
  let tone = 'info'
  let icon = '📈'
  let text = <>Plans for the <b>best multiplier</b>: short breaks around each holiday.</>
  let use = null
  const tag = rec && <span className="inline-block mx-0.5 px-1.5 rounded-md bg-amber-100 text-amber-900 text-[0.92em] font-bold whitespace-nowrap">{rec.reason}</span>

  if (planner.isCustom) {
    const map = planner.customMap
    const lastJoin = map?.joins[map.joins.length - 1]
    if (planner.aim === 'long') {
      icon = '🏝️'
      if (!map?.holidays) {
        icon = '🗓️'
        text = <><b>No public holidays in these months</b>, so every week is the same. Pick the week that suits you.</>
      } else if (map.holidays === 1) {
        text = <><b>Longest breaks.</b> Only one holiday here, so there's nothing to join. Pick one.</>
      } else if (map.allJoin) {
        tone = 'done'
        icon = '✓'
        text = <><b>{lastJoin.names.join(' + ')}</b> join into one break. Longest first; pick one.</>
      } else {
        text = <><b>One long break</b> with your {leave} leave day{leave === 1 ? '' : 's'}. Longest first; pick one.</>
      }
    } else if (planner.pickedLeave) {
      // Holiday breaks don't have to use all your leave.
      text = <><b>{planner.pickedLeave} of {leave} leave days used.</b> Want more? Add breaks on the Calendar.</>
    } else if (map?.allJoin) {
      text = <><b>Holiday breaks</b>, best value first. Tick the ones you want. With {lastJoin.leave} leave days they join into one break.</>
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
    </p>
  )
}
