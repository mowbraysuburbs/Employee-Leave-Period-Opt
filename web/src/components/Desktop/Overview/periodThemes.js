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
