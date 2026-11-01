import { useState, useEffect, useLayoutEffect } from 'react'

const PAD = 6
const GAP = 12

// The first element with data-tour={target} that's actually on screen.
function findTarget(target) {
  return [...document.querySelectorAll(`[data-tour="${target}"]`)].find(el => el.getClientRects().length > 0) ?? null
}

/**
 * A guided tour over the real app: each step dims the page except one
 * control (found by its data-tour attribute) and explains it in a bubble
 * next to it. If a step's control isn't on screen the bubble is centred.
 *
 * Props:
 *   steps   – [{ target, title, text }]
 *   onClose – called on Skip, Escape or the last step's Done
 */
export function GuidedTour({ steps, onClose }) {
  const [index, setIndex] = useState(0)
  const [rect, setRect] = useState(null)
  const step = steps[index]
  const last = index === steps.length - 1

  // Measure the highlighted control now and whenever the page moves.
  useLayoutEffect(() => {
    findTarget(step.target)?.scrollIntoView({ block: 'nearest' })
    let frame = 0
    function measure() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setRect(findTarget(step.target)?.getBoundingClientRect() ?? null))
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [step.target])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Put the bubble below the control if there's room, otherwise above it.
  const vw = window.innerWidth
  const vh = window.innerHeight
  const width = Math.min(340, vw - 24)
  let bubble = { left: (vw - width) / 2, top: Math.max(12, vh / 2 - 120) }
  if (rect) {
    const below = vh - rect.bottom
    const left = Math.min(Math.max(12, rect.left + rect.width / 2 - width / 2), vw - width - 12)
    bubble = below > 230 || below > rect.top
      ? { left, top: Math.min(rect.bottom + PAD + GAP, vh - 230) }
      : { left, bottom: Math.min(vh - rect.top + PAD + GAP, vh - 230) }
  }

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Blocks the page while the tour is open; dims it when there's no spotlight. */}
      <div aria-hidden="true" className={`absolute inset-0 ${rect ? '' : 'bg-slate-900/60'}`} />
      {rect && (
        <div
          aria-hidden="true"
          className="fixed rounded-[14px] ring-2 ring-white/90 pointer-events-none transition-all duration-200"
          style={{
            left: rect.left - PAD,
            top: rect.top - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.62)',
          }}
        />
      )}

      <section
        role="dialog"
        aria-modal="true"
        aria-label="Tour"
        className="fixed bg-white rounded-2xl shadow-2xl p-4 flex flex-col gap-3"
        style={{ width, ...bubble }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-sky-700 tracking-wider">STEP {index + 1} OF {steps.length}</span>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-slate-500">Skip</button>
        </div>
        <div>
          <h2 className="m-0 mb-1 text-lg font-extrabold tracking-tight">{step.title}</h2>
          <p className="m-0 text-sm leading-relaxed text-slate-700">{step.text}</p>
        </div>
        <div className="flex items-center justify-between">
          <div aria-hidden="true" className="flex gap-1.5">
            {steps.map((_, i) => (
              <span key={i} className={`h-2 rounded-full transition-all ${i === index ? 'w-[18px] bg-sky-700' : 'w-2 bg-slate-300'}`} />
            ))}
          </div>
          <div className="flex gap-2">
            {index > 0 && (
              <button type="button" onClick={() => setIndex(index - 1)} className="h-10 px-4 rounded-full border border-slate-300 bg-white text-sm font-bold">
                Back
              </button>
            )}
            <button type="button" onClick={() => (last ? onClose() : setIndex(index + 1))} className="h-10 px-5 rounded-full bg-sky-700 text-white text-sm font-bold">
              {last ? 'Start planning' : 'Next'}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
