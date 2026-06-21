import { useState, useRef } from 'react'

const STEP_PX = 28

export function LeaveDayRoller({ value, min, max, onChange }) {
  const [direction, setDirection] = useState(null)
  const touchStartX = useRef(null)
  const touchStartValue = useRef(null)

  function go(delta) {
    const next = value + delta
    if (next < min || next > max) return
    setDirection(delta > 0 ? 'right' : 'left')
    onChange(next)
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX
    touchStartValue.current = value
  }

  function handleTouchMove(e) {
    if (touchStartX.current === null) return
    const dx = touchStartX.current - e.touches[0].clientX
    const steps = Math.round(dx / STEP_PX)
    const next = Math.max(min, Math.min(max, touchStartValue.current + steps))
    if (next !== value) {
      setDirection(next > value ? 'right' : 'left')
      onChange(next)
    }
  }

  function handleTouchEnd() {
    touchStartX.current = null
    touchStartValue.current = null
  }

  const animClass = direction === 'right' ? 'roll-in-right' : direction === 'left' ? 'roll-in-left' : ''

  return (
    <div
      className="flex-1 flex items-center justify-center gap-4 h-14 overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button
        onClick={() => go(-1)}
        disabled={value <= min}
        className="w-10 text-center text-xl font-semibold tabular-nums text-slate-400 dark:text-slate-500 opacity-35 disabled:opacity-0 transition-opacity"
        aria-label="Decrease"
      >
        {value > min ? value - 1 : ''}
      </button>

      <span
        key={value}
        className={`w-10 text-center text-4xl font-bold tabular-nums text-slate-900 dark:text-slate-100 ${animClass}`}
        onAnimationEnd={() => setDirection(null)}
      >
        {value}
      </span>

      <button
        onClick={() => go(1)}
        disabled={value >= max}
        className="w-10 text-center text-xl font-semibold tabular-nums text-slate-400 dark:text-slate-500 opacity-35 disabled:opacity-0 transition-opacity"
        aria-label="Increase"
      >
        {value < max ? value + 1 : ''}
      </button>
    </div>
  )
}
