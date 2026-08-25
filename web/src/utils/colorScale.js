// A fixed, categorical palette — each days-off value gets one permanent
// colour (Tailwind's own named hues, shade 500), not a colour interpolated
// between whatever min/max happens to be in scope. This means a given value
// always renders the same way everywhere (calendar dots, table pills,
// filter chips), no matter what's currently filtered or paginated.
const PALETTE = [
  '#6366f1', // 1  indigo-500
  '#3b82f6', // 2  blue-500
  '#0ea5e9', // 3  sky-500
  '#06b6d4', // 4  cyan-500
  '#14b8a6', // 5  teal-500
  '#10b981', // 6  emerald-500
  '#22c55e', // 7  green-500
  '#84cc16', // 8  lime-500
  '#eab308', // 9  yellow-500
  '#f59e0b', // 10 amber-500
  '#f97316', // 11 orange-500
  '#ef4444', // 12 red-500
  '#f43f5e', // 13 rose-500
  '#ec4899', // 14 pink-500
  '#d946ef', // 15 fuchsia-500
  '#a855f7', // 16 purple-500
  '#8b5cf6', // 17 violet-500
]

/**
 * Maps a daysOff count to its fixed colour. Values beyond the palette's
 * length clamp to the last (most extreme) colour rather than repeating an
 * earlier hue.
 */
export function getColourForDaysOff(daysOff) {
  if (daysOff <= 0) return null
  const index = Math.min(daysOff, PALETTE.length) - 1
  return PALETTE[index]
}
