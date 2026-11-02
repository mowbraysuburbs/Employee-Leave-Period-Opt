import { useState, useEffect } from 'react'
import { MAX_LEAVE } from '../utils/planner'

const STORAGE_KEY = 'stretchmyleave.settings'
const DEFAULTS = { theme: 'light', calendarSize: 'compact', leaveTotal: MAX_LEAVE }

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return {
      theme: parsed.theme === 'dark' ? 'dark' : DEFAULTS.theme,
      calendarSize: parsed.calendarSize === 'large' ? 'large' : DEFAULTS.calendarSize,
      // Your leave limit: 1 to 10 (older saves of up to 21 come back as 10).
      leaveTotal: Number.isInteger(parsed.leaveTotal) && parsed.leaveTotal > 0 ? Math.min(parsed.leaveTotal, MAX_LEAVE) : DEFAULTS.leaveTotal,
    }
  } catch {
    return DEFAULTS
  }
}

/**
 * Settings remembered on this device: theme ('light' | 'dark'), the phone
 * calendar size ('large' | 'compact') and leaveTotal (the yearly leave days
 * the Summary counts down from). Dark mode works by
 * putting `.dark` on <html>, which swaps the palette in index.css.
 */
export function useSettings() {
  const [settings, setSettings] = useState(load)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark')
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch { /* storage unavailable — settings just won't persist */ }
  }, [settings])

  return {
    ...settings,
    setTheme: theme => setSettings(s => ({ ...s, theme })),
    setCalendarSize: calendarSize => setSettings(s => ({ ...s, calendarSize })),
    setLeaveTotal: leaveTotal => setSettings(s => ({ ...s, leaveTotal })),
  }
}
