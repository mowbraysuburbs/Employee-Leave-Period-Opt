import { useEffect, useRef, useState } from 'react'

export const HOLD_MS = 500

/**
 * Press-and-hold for a button: onHold fires after HOLD_MS (with a small buzz
 * where supported); letting go earlier calls onTap instead. `holding` is true
 * while the finger is down, for drawing progress. Spread `handlers` on the button.
 */
export function useLongPress({ onHold, onTap }) {
  const [holding, setHolding] = useState(false)
  const timer = useRef(null)
  const fired = useRef(false)
  const down = useRef(false)

  useEffect(() => () => clearTimeout(timer.current), [])

  function start(e) {
    e.preventDefault()
    fired.current = false
    down.current = true
    setHolding(true)
    timer.current = setTimeout(() => {
      fired.current = true
      setHolding(false)
      navigator.vibrate?.(15)
      onHold()
    }, HOLD_MS)
  }
  function end(e) {
    clearTimeout(timer.current)
    // Only a real release on the button counts as a tap, not sliding off it.
    if (down.current && !fired.current && e.type === 'pointerup') onTap?.()
    down.current = false
    setHolding(false)
  }

  return {
    holding,
    handlers: {
      onPointerDown: start,
      onPointerUp: end,
      onPointerLeave: end,
      onPointerCancel: end,
      onContextMenu: e => e.preventDefault(),
    },
  }
}
