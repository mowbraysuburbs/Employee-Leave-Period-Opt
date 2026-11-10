// Colours per leave period: a soft fade from the theme colour to white (white
// turns navy in dark mode, and the 100 shades are swapped too, so text stays readable).
export const PERIOD_THEMES = {
  custom: 'bg-white border-dashed border-slate-400',
  next: 'bg-linear-to-br from-pink-100 to-white',
  xmas: 'bg-linear-to-br from-red-100 to-white',
  easter: 'bg-linear-to-br from-purple-100 to-white',
  school: 'bg-linear-to-br from-sky-100 to-white',
  year: 'bg-linear-to-br from-indigo-100 to-white',
}

// The same colours for the settings strip above the results (fades left to right).
export const STRIP_THEMES = {
  custom: 'bg-slate-50',
  next: 'bg-linear-to-r from-pink-100 to-white',
  xmas: 'bg-linear-to-r from-red-100 to-white',
  easter: 'bg-linear-to-r from-purple-100 to-white',
  school: 'bg-linear-to-r from-sky-100 to-white',
  year: 'bg-linear-to-r from-indigo-100 to-white',
}

// Short names under the period icons (phone strip, folded desktop column).
export const PERIOD_SHORT = { custom: 'Custom', next: 'Up next', xmas: 'Christmas', easter: 'Easter', school: 'School' }

// What each period is for, in plain words (on its step 1 card).
export const CARD_DESCRIPTIONS = {
  next: 'Stretch the next public holiday into a long weekend, or more.',
  xmas: 'Join Reconciliation, Christmas and New Year into one long year-end break.',
  easter: 'Turn the Easter weekend and Human Rights Day into one long break.',
  school: "Take leave while the kids are off school, so you're home together.",
  year: 'Plan next year early: every holiday, and the leave that joins them.',
}

// What each leave period covers, in a few words (beside the plan's title).
export const PERIOD_DESCRIPTIONS = {
  next: 'The next public holiday',
  xmas: 'Day of Reconciliation, Christmas & New Year',
  easter: 'Human Rights Day, Good Friday & Family Day',
  school: 'The next school holidays in your province',
  year: 'Plan next year ahead',
}
