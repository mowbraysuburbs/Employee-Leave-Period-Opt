import { useState, useEffect } from 'react'
import { StepPicture } from './StepPicture'
import { HELP_STEPS } from './helpSteps'

/**
 * Four cards explaining the app, shown on a first visit. On phones the card
 * sits at the bottom; on desktop it's centred. Escape or Skip closes it.
 *
 * Props: phone (bool), onClose
 */
export function WelcomeWalkthrough({ phone = false, onClose }) {
  const [step, setStep] = useState(0)
  const last = step === HELP_STEPS.length - 1

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[60]">
      <div aria-hidden="true" className="absolute inset-0 bg-slate-900/55" />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Welcome"
        className={[
          'absolute bg-white rounded-3xl shadow-2xl flex flex-col gap-4',
          phone ? 'left-3 right-3 bottom-4 p-[18px]' : 'left-1/2 top-1/2 w-[460px] -translate-x-1/2 -translate-y-1/2 p-[22px]',
        ].join(' ')}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-sky-700 tracking-wider">STEP {step + 1} OF {HELP_STEPS.length}</span>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-slate-500">Skip</button>
        </div>

        <StepPicture step={step} />

        <div>
          <h2 className="m-0 mb-1.5 text-[22px] font-extrabold tracking-tight">{HELP_STEPS[step].title}</h2>
          <p className="m-0 text-[15px] leading-relaxed text-slate-700">{HELP_STEPS[step].text}</p>
        </div>

        <div className="flex items-center justify-between">
          <div aria-hidden="true" className="flex gap-1.5">
            {HELP_STEPS.map((_, i) => (
              <span key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-[22px] bg-sky-700' : 'w-2 bg-slate-300'}`} />
            ))}
          </div>
          <div className="flex gap-2">
            {step > 0 && (
              <button type="button" onClick={() => setStep(step - 1)} className="h-11 px-4 rounded-full border border-slate-300 bg-white text-[15px] font-bold">
                Back
              </button>
            )}
            <button type="button" onClick={() => (last ? onClose() : setStep(step + 1))} className="h-11 px-[22px] rounded-full bg-sky-700 text-white text-[15px] font-bold">
              {last ? 'Start planning' : 'Next'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
