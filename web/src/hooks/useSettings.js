import { useState, useEffect } from 'react'

const STORAGE_KEY = 'stretchmyleave.settings'
const DEFAULTS = { theme: 'light', calendarSize: 'large' }

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return {
      theme: parsed.theme === 'dark' ? 'dark' : DEFAULTS.theme,
      calendarSize: parsed.calendarSize === 'compact' ? 'compact' : DEFAULTS.calendarSize,
    }
  } catch {
    return DEFAULTS
  }
}

/**
 * Appearance settings remembered on this device: theme ('light' | 'dark')
 * and the phone calendar size ('large' | 'compact'). Dark mode works by
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
  }
}
