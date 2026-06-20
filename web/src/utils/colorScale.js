// Gradient stops: red/orange (low) → yellow → lime → cyan → blue (high)
// Wide hue range ensures visually distinct colours even in dark mode
const STOPS = [
  [248,  113, 113],  // red-400   (low)
  [251,  146,  60],  // orange-400
  [250,  204,  21],  // yellow-400
  [163,  230,  53],  // lime-400
  [ 34,  197,  94],  // green-500
  [ 45,  212, 191],  // teal-400
  [ 56,  189, 248],  // sky-400
  [ 99,  102, 241],  // indigo-500 (high)
]

function interpolate(t) {
  const pos = Math.max(0, Math.min(1, t)) * (STOPS.length - 1)
  const lo = Math.floor(pos)
  const hi = Math.min(lo + 1, STOPS.length - 1)
  const f  = pos - lo
  const [r, g, b] = [0, 1, 2].map(i => Math.round(STOPS[lo][i] + (STOPS[hi][i] - STOPS[lo][i]) * f))
  return `rgb(${r},${g},${b})`
}

/**
 * Maps a daysOff count to a gradient colour, stretched across the actual visible range.
 * min → yellow (low end), max → cyan (high end).
 * Pass the actual min/max from the current score set for maximum colour separation.
 */
export function getColourForDaysOff(daysOff, min = 1, max = 14) {
  if (daysOff <= 0) return null
  if (min === max) return interpolate(0.5)
  return interpolate((daysOff - min) / (max - min))
}

export function getTextContrast() {
  return 'dark' // all gradient colours are light enough for dark text
}

/**
 * Returns a legend array — one entry per distinct days-off value found in scores.
 * Colours are spread across the full gradient from the actual min to max values.
 */
export function buildLegend(scores) {
  const seen = new Set()
  for (const { daysOff } of scores) if (daysOff > 0) seen.add(daysOff)
  const values = [...seen].sort((a, b) => a - b)
  if (!values.length) return []
  const min = values[0]
  const max = values[values.length - 1]
  return values.map((daysOff) => ({
    daysOff,
    colour: getColourForDaysOff(daysOff, min, max),
    label: `${daysOff} day${daysOff === 1 ? '' : 's'} off`,
  }))
}
