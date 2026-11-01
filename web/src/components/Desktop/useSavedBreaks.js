import { useState, useEffect } from 'react'
import { breakKey, mergeOverlapping } from '../../utils/breaks'

const STORAGE_KEY = 'stretchmyleave.desktopBreaks'

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    const valid = Array.isArray(parsed) ? parsed.filter(s => s && typeof s.startDate === 'string' && s.leaveDays > 0) : []
    // Lists saved before overlaps were combined on add may still overlap.
    return mergeOverlapping(valid)
  } catch {
    return []
  }
}

/**
 * The user's saved breaks as [{ startDate, leaveDays }] in the order they
 * were added, remembered in localStorage so a refresh doesn't lose them.
 */
export function useSavedBreaks() {
  const [saved, setSaved] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    } catch { /* storage unavailable — picks just won't persist */ }
  }, [saved])

  function add(entry) {
    setSaved(prev => (prev.some(s => breakKey(s) === breakKey(entry)) ? prev : [...prev, entry]))
  }

  function remove(entry) {
    setSaved(prev => prev.filter(s => breakKey(s) !== breakKey(entry)))
  }

  // Swaps in a whole new list, for changes that combine or replace breaks.
  function replaceAll(next) {
    setSaved(next)
  }

  return { saved, add, remove, replaceAll }
}
