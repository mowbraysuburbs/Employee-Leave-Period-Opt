import { useState } from 'react'

const STORAGE_KEY = 'stretchmyleave.welcomeSeen'

function seenBefore() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * The welcome walkthrough shows once, on a first visit; "Show the walkthrough
 * again" in How it works brings it back.
 */
export function useWelcome() {
  const [showWelcome, setShowWelcome] = useState(() => !seenBefore())

  function closeWelcome() {
    setShowWelcome(false)
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch { /* storage unavailable — it may show again next visit */ }
  }

  return { showWelcome, closeWelcome, replayWelcome: () => setShowWelcome(true) }
}
