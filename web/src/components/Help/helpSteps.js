// How it works: planning on the Overview, then exploring on the Calendar.
export const PLAN_STEPS = [
  { title: 'Pick a leave period', text: 'Up next, Christmas, Easter, school holidays, the next few months, or your own Start and End dates. Each shows what it covers and its best plan.' },
  { title: 'Set your days off limit', text: 'How many leave days you want to spend (up to 10). It is shared with the Calendar.' },
  { title: 'Choose your aim', text: 'Maximise = most days off per leave day · Mix = 2 or 3 proper holidays · Longest = one long break. Breaks are always at least a working week apart.' },
  { title: 'Add to summary', text: "Untick any breaks you don't want, then add the rest. A ▾ on a start date means it can start on another day for the same days off." },
]

export const EXPLORE_STEPS = [
  { title: 'Colours show days off', text: 'Each date shows how many days off in a row you get if your leave starts that day (or the multiplier).' },
  { title: 'Tap a date', text: 'Its whole break lights up, with the details and other start dates that give the same.' },
  { title: 'Add it to your summary', text: 'Overlapping breaks combine into one.' },
]

// The desktop Calendar, which has more on screen than the phone.
export const EXPLORE_STEPS_DESKTOP = [
  { title: 'Set your leave days', text: 'In the Leave days card: click a block for the leave days on one break. The dropdown is your limit; Snap to days left uses what is left after your Summary.' },
  { title: 'Read the colours', text: 'Each date is coloured by the days off you get if leave starts then (or the multiplier). Hover a date for its stats; click a colour number to show only those dates.' },
  { title: 'Click a date', text: 'Its whole break lights up and opens in Details, with other start dates that give the same.' },
  { title: 'Add to summary', text: 'Saved breaks become rectangles with white numbers. Overlapping breaks can be combined.' },
]
