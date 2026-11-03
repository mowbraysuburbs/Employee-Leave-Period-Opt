import { useState } from 'react'

const STORAGE_KEY = 'stretchmyleave.welcomeSeen'

function seenBefore(key) {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

/**
 * A tour that shows once, the first time; "Take the tour" in How it works
 * brings it back. `key` lets each page remember its own tour (the desktop has
 * one for the Overview and one for the Calendar).
 */
export function useWelcome(key = STORAGE_KEY) {
  const [showWelcome, setShowWelcome] = useState(() => !seenBefore(key))

  function closeWelcome() {
    setShowWelcome(false)
    try {
      localStorage.setItem(key, '1')
    } catch { /* storage unavailable — it may show again next visit */ }
  }

  return { showWelcome, closeWelcome, replayWelcome: () => setShowWelcome(true) }
}
