// Categorical colour palette — each index maps to a visually distinct colour.
// Based on the Okabe-Ito colourblind-safe palette, extended with additional hues.
// These are used to colour heatmap cells by total days off.
const PALETTE = [
  null,       // 0  — no background (blank cell)
  '#38bdf8', // 1  — sky blue
  '#34d399', // 2  — emerald
  '#a3e635', // 3  — lime
  '#facc15', // 4  — yellow
  '#fb923c', // 5  — orange
  '#f87171', // 6  — red
  '#e879f9', // 7  — fuchsia
  '#c084fc', // 8  — violet
  '#818cf8', // 9  — indigo
  '#22d3ee', // 10 — cyan
  '#2dd4bf', // 11 — teal
  '#4ade80', // 12 — green
  '#fbbf24', // 13 — amber
  '#f472b6', // 14 — pink
]

// Text colours that contrast well against each palette colour
// "dark" = use dark text on this background, "light" = use white text
const CONTRAST = [
  'light', // slate
  'dark',  // sky blue
  'dark',  // emerald
  'dark',  // lime
  'dark',  // yellow
  'dark',  // orange
  'dark',  // red
  'dark',  // fuchsia
  'dark',  // violet
  'light', // indigo
  'dark',  // cyan
  'dark',  // teal
  'dark',  // green
  'dark',  // amber
  'dark',  // pink
]

/**
 * Returns the hex colour for a given number of days off.
 * Values above the palette length wrap around with reduced opacity.
 */
// Returns a hex colour string, or null for 0 days off (blank cell)
export function getColourForDaysOff(daysOff) {
  if (daysOff <= 0) return null
  if (daysOff < PALETTE.length) return PALETTE[daysOff]
  return PALETTE[(daysOff % (PALETTE.length - 1)) + 1]
}

/**
 * Returns "dark" or "light" to indicate which text colour contrasts best
 * against the background returned by getColourForDaysOff.
 */
export function getTextContrast(daysOff) {
  if (daysOff <= 0) return CONTRAST[0]
  if (daysOff < CONTRAST.length) return CONTRAST[daysOff]
  return CONTRAST[(daysOff % (CONTRAST.length - 1)) + 1]
}

/**
 * Returns a legend array — one entry per distinct days-off value found in scores.
 * Used to render the colour key below the heatmap.
 *
 * Example output:
 *   [{ daysOff: 3, colour: "#34d399", label: "3 days off" }, ...]
 */
export function buildLegend(scores) {
  const seen = new Set()
  for (const { daysOff } of scores) seen.add(daysOff)

  return [...seen]
    .sort((a, b) => a - b)
    .filter((daysOff) => daysOff > 0)
    .map((daysOff) => ({
      daysOff,
      colour: getColourForDaysOff(daysOff),
      label: `${daysOff} day${daysOff === 1 ? '' : 's'} off`,
    }))
}
