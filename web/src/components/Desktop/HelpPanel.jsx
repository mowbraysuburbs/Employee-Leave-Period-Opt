import { useEffect } from 'react'
import { HowItWorks } from '../Help/HowItWorks'

/**
 * Desktop How it works: a panel on the right over a dimmed page. Escape, the
 * close button or a click outside closes it.
 */
export function HelpPanel({ onClose, onReplay }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50">
      <div aria-hidden="true" onClick={onClose} className="absolute inset-0 bg-slate-900/45" />
      <section role="dialog" aria-label="How it works" className="absolute right-6 top-[76px] bottom-6 w-[420px] max-w-[calc(100vw-48px)] bg-white rounded-[20px] shadow-2xl flex flex-col">
        <div className="shrink-0 px-[18px] py-3 border-b border-slate-100 flex items-center">
          <h2 className="flex-1 m-0 text-[19px] font-extrabold">How it works</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-[13px] font-bold">✕</button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-[18px] py-4">
          <HowItWorks onReplay={onReplay} />
        </div>
      </section>
    </div>
  )
}
