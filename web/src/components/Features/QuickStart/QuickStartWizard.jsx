import { useMemo, useState } from 'react'
import { StepBudget } from './StepBudget'
import { StepWindow } from './StepWindow'
import { StepDistribution } from './StepDistribution'
import { StepFocus } from './StepFocus'
import { StepSummary } from './StepSummary'
import { resolveWindowPreset, selectContinuousTop3, selectScattered } from '../../../utils/quickStart'
import { PUBLIC_HOLIDAYS } from '../../../data/publicHolidays'

const STEP_ORDER = ['budget', 'window', 'distribution', 'focus']

export function QuickStartWizard({ cache, todayStr, datasetEnd, onComplete, onClose }) {
  const [step, setStep] = useState('budget')
  const [, setHistory] = useState([])
  const [budget, setBudget] = useState(8)
  const [windowRange, setWindowRange] = useState(null)
  const [summaryPicks, setSummaryPicks] = useState([])
  const [summaryFallback, setSummaryFallback] = useState(false)

  function goto(next) {
    setHistory((h) => [...h, step])
    setStep(next)
  }
  function back() {
    setHistory((h) => {
      if (h.length === 0) { onClose(); return h }
      setStep(h[h.length - 1])
      return h.slice(0, -1)
    })
  }

  function handleWindowChoose(preset, fromMonth, toMonth) {
    const [start, end] = resolveWindowPreset(preset, todayStr, datasetEnd, fromMonth, toMonth)
    setWindowRange([start, end])
    if (preset === 'biggest') {
      const { picks, focusFallback } = selectContinuousTop3({ cache, startDate: start, endDate: end, budget, focusDates: new Set() })
      setSummaryPicks(picks)
      setSummaryFallback(focusFallback)
      goto('summary')
    } else {
      goto('distribution')
    }
  }

  function handleDistributionChoose(mode) {
    if (mode === 'scattered') {
      const [start, end] = windowRange
      const { picks } = selectScattered({ cache, startDate: start, endDate: end, budget })
      onComplete(picks, 'edit', budget)
    } else {
      goto('focus')
    }
  }

  function handleFocusNext(focusDates) {
    const [start, end] = windowRange
    const { picks, focusFallback } = selectContinuousTop3({ cache, startDate: start, endDate: end, budget, focusDates })
    setSummaryPicks(picks)
    setSummaryFallback(focusFallback)
    goto('summary')
  }

  const holidaysInWindow = useMemo(() => {
    if (!windowRange) return []
    const [start, end] = windowRange
    return Object.values(PUBLIC_HOLIDAYS).flat()
      .filter((h) => h.date >= start && h.date <= end)
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [windowRange])

  const dotIndex = STEP_ORDER.indexOf(step)

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm mx-4 mb-4 md:mb-0 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[90vh] overflow-y-auto">
        {dotIndex !== -1 && (
          <div className="flex gap-1.5 px-6 pt-6 pb-2">
            {STEP_ORDER.map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${i <= dotIndex ? 'bg-sky-500' : 'bg-slate-200 dark:bg-slate-600'}`}
              />
            ))}
          </div>
        )}

        {step === 'budget' && (
          <StepBudget value={budget} onChange={setBudget} onNext={() => goto('window')} onSkip={onClose} />
        )}
        {step === 'window' && (
          <StepWindow todayStr={todayStr} datasetEnd={datasetEnd} onChoose={handleWindowChoose} onBack={back} onSkip={onClose} />
        )}
        {step === 'distribution' && (
          <StepDistribution onChoose={handleDistributionChoose} onBack={back} onSkip={onClose} />
        )}
        {step === 'focus' && (
          <StepFocus holidays={holidaysInWindow} onNext={handleFocusNext} onBack={back} onSkip={onClose} />
        )}
        {step === 'summary' && (
          <StepSummary
            picks={summaryPicks}
            focusFallback={summaryFallback}
            onEdit={(period) => period && onComplete([period], 'edit', budget)}
            onAccept={(period) => period && onComplete([period], 'accept', budget)}
          />
        )}
      </div>
    </div>
  )
}
