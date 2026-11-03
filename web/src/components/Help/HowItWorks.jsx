import { PLAN_STEPS, EXPLORE_STEPS, EXPLORE_STEPS_DESKTOP } from './helpSteps'
import { BreakDiagram, OverviewDiagram, CalendarDiagram } from './HelpDiagrams'

const heading = 'm-0 text-[13px] font-extrabold text-slate-900 uppercase tracking-wide'

/**
 * The How it works guide: the idea, planning on the Overview, exploring on
 * the Calendar, the two colour modes, good-to-know tips, and a button to
 * replay the tour for the page you're on. Shown in a bottom sheet on
 * phones and a side panel on desktop.
 *
 * Props: phone (bool, picks the device-specific tip), onReplay
 */
export function HowItWorks({ phone = false, onReplay }) {
  const tips = [
    <><b>Days left:</b> your limit minus the leave in your Summary. Turn on <b>Snap to days left</b> and the calendar follows what you have left.</>,
    <><b>Summary:</b> your saved breaks and totals. Add them to Apple / iPhone (also Outlook) or Google Calendar from there.</>,
    <><b>Advanced options</b>: plan around school holidays, or avoid / include months. A number shows how many are on.</>,
    phone
      ? <>Filters (days off, public holidays, Selected only) are under the calendar. Settings (⚙): Compact calendar or Dark mode.</>
      : <>Filters: days off, public holidays (or All holidays), Selected only. Both side panels collapse to icons. The moon button switches to dark mode.</>,
    <>Your breaks are saved on this device. Holiday data runs to the end of 2028.</>,
  ]

  const steps = (title, list) => (
    <section className="flex flex-col gap-2.5">
      <h3 className={heading}>{title}</h3>
      <ol className="m-0 p-0 list-none flex flex-col gap-2.5">
        {list.map((s, i) => (
          <li key={s.title} className="grid grid-cols-[28px_1fr] gap-2.5 items-start">
            <span aria-hidden="true" className="w-7 h-7 rounded-full bg-sky-700 text-white flex items-center justify-center text-[13px] font-extrabold">{i + 1}</span>
            <div><strong className="text-slate-900">{s.title}</strong><br />{s.text}</div>
          </li>
        ))}
      </ol>
    </section>
  )

  return (
    <div className="flex flex-col gap-4 text-sm leading-relaxed text-slate-700">
      <p className="m-0 px-3.5 py-3 rounded-2xl bg-sky-50 text-sky-800">
        <strong>The idea:</strong> take leave next to weekends and public holidays, and a few leave days turn into a much longer break.
      </p>

      {!phone && <BreakDiagram />}
      {steps('Plan it (Overview)', PLAN_STEPS)}
      {!phone && <OverviewDiagram />}
      {steps('Explore it (Calendar)', phone ? EXPLORE_STEPS : EXPLORE_STEPS_DESKTOP)}
      {!phone && <CalendarDiagram />}

      <section className="flex flex-col gap-2">
        <h3 className={heading}>Two ways to colour</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="px-3 py-2.5 border border-slate-200 rounded-xl">
            <strong className="text-slate-900">Total days</strong><br /><span className="text-[13px]">Days off in a row.</span>
          </div>
          <div className="px-3 py-2.5 border border-slate-200 rounded-xl">
            <strong className="text-slate-900">Multiplier</strong><br /><span className="text-[13px]">Days off for each leave day. 2.00 = double.</span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className={heading}>Good to know</h3>
        <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
          {tips.map((t, i) => (
            <li key={i} className="flex gap-2"><span aria-hidden="true" className="text-sky-700 font-extrabold">•</span><span>{t}</span></li>
          ))}
        </ul>
      </section>

      <button type="button" onClick={onReplay} className="h-11 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900">
        ▶ Take the tour (for this page)
      </button>
    </div>
  )
}
