import { HELP_STEPS } from './helpSteps'

const heading = 'm-0 text-[13px] font-extrabold text-slate-900 uppercase tracking-wide'

/**
 * The How it works guide: the idea, the four steps, the two colour modes,
 * tips, and a button to replay the walkthrough. Shown in a bottom sheet on
 * phones and a side panel on desktop.
 *
 * Props: phone (bool, picks the device-specific tip), onReplay
 */
export function HowItWorks({ phone = false, onReplay }) {
  const tips = [
    'Overview has ready-made plans (Up next, Christmas, Easter…) based on 10 leave days.',
    'Tap the days-off chips to show only those dates.',
    phone ? 'Settings (⚙): make the calendar Compact, or switch to Dark.' : 'Use the moon button for dark mode.',
    'Your breaks are saved on this device.',
  ]

  return (
    <div className="flex flex-col gap-4 text-sm leading-relaxed text-slate-700">
      <p className="m-0 px-3.5 py-3 rounded-2xl bg-sky-50 text-sky-800">
        <strong>The idea:</strong> take leave next to weekends and public holidays, and a few leave days turn into a much longer break.
      </p>

      <section className="flex flex-col gap-2.5">
        <h3 className={heading}>4 steps</h3>
        <ol className="m-0 p-0 list-none flex flex-col gap-2.5">
          {HELP_STEPS.map((s, i) => (
            <li key={s.title} className="grid grid-cols-[28px_1fr] gap-2.5 items-start">
              <span aria-hidden="true" className="w-7 h-7 rounded-full bg-sky-700 text-white flex items-center justify-center text-[13px] font-extrabold">{i + 1}</span>
              <div><strong className="text-slate-900">{s.title}</strong><br />{s.text}</div>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-2">
        <h3 className={heading}>Two ways to colour</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="px-3 py-2.5 border border-slate-200 rounded-xl">
            <strong className="text-slate-900">Total days</strong><br /><span className="text-[13px]">How many days off in a row you get.</span>
          </div>
          <div className="px-3 py-2.5 border border-slate-200 rounded-xl">
            <strong className="text-slate-900">Value ×</strong><br /><span className="text-[13px]">Days off for each leave day. 2× = double.</span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className={heading}>Tips</h3>
        <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
          {tips.map(t => (
            <li key={t} className="flex gap-2"><span aria-hidden="true" className="text-sky-700 font-extrabold">•</span><span>{t}</span></li>
          ))}
        </ul>
      </section>

      <button type="button" onClick={onReplay} className="h-11 rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-900">
        ▶ Show the walkthrough again
      </button>
    </div>
  )
}
