// The three kinds of day inside a leave period, as returned in
// getLeaveRange().breakdown. Shared by the leave period popup and the
// calendar's "My leave" view so both always use the same colours.
export const DAY_TYPE_LEGEND = [
  { type: 'leave',          colour: '#38bdf8', label: 'Leave day' },
  { type: 'public_holiday', colour: '#fb923c', label: 'Public holiday' },
  { type: 'weekend',        colour: '#475569', label: 'Weekend' },
]

export const DAY_TYPE_COLOUR = Object.fromEntries(DAY_TYPE_LEGEND.map(l => [l.type, l.colour]))
