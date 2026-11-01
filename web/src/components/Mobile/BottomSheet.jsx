import { useEffect } from 'react'

/**
 * A panel that slides up from the bottom of the screen, with a handle and a
 * close button. Escape closes it too.
 *
 * Props:
 *   label     – accessible name for the sheet
 *   title     – optional heading shown next to the close button
 *   onClose
 *   backdrop  – dim the screen behind (tap to close); the day sheet leaves
 *               it off so the calendar above stays tappable
 *   maxHeight – Tailwind max-height class, e.g. 'max-h-[60dvh]'
 */
export function BottomSheet({ label, title, onClose, backdrop = false, maxHeight = 'max-h-[85dvh]', children }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <>
      {backdrop && <div aria-hidden="true" onClick={onClose} className="fixed inset-0 z-40 bg-slate-900/40" />}
      <section
        role="dialog"
        aria-label={label}
        className={`fixed inset-x-0 bottom-0 z-50 ${maxHeight} flex flex-col bg-white rounded-t-[22px] shadow-[0_-10px_30px_rgba(15,23,42,0.18)]`}
      >
        <div className="shrink-0 px-4 pt-2 flex flex-col gap-1">
          <span aria-hidden="true" className="self-center w-10 h-[5px] rounded-full bg-slate-300" />
          <div className="flex items-center gap-2 min-h-8">
            {title ? <h2 className="flex-1 m-0 text-lg font-extrabold">{title}</h2> : <span className="flex-1" />}
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-[13px] font-bold"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6">{children}</div>
      </section>
    </>
  )
}
