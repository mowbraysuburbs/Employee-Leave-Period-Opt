// Colours per leave period: a soft fade from the theme colour to white (white
// turns navy in dark mode, and the 100 shades are swapped too, so text stays readable).
export const PERIOD_THEMES = {
  custom: 'bg-white border-dashed border-slate-400',
  next: 'bg-linear-to-br from-pink-100 to-white',
  xmas: 'bg-linear-to-br from-red-100 to-white',
  easter: 'bg-linear-to-br from-purple-100 to-white',
  school: 'bg-linear-to-br from-sky-100 to-white',
  three: 'bg-linear-to-br from-green-100 to-white',
  six: 'bg-linear-to-br from-teal-100 to-white',
  rest: 'bg-linear-to-br from-amber-100 to-white',
  year: 'bg-linear-to-br from-indigo-100 to-white',
}

// The same colours for the settings strip above the results (fades left to right).
export const STRIP_THEMES = {
  custom: 'bg-slate-50',
  next: 'bg-linear-to-r from-pink-100 to-white',
  xmas: 'bg-linear-to-r from-red-100 to-white',
  easter: 'bg-linear-to-r from-purple-100 to-white',
  school: 'bg-linear-to-r from-sky-100 to-white',
  three: 'bg-linear-to-r from-green-100 to-white',
  six: 'bg-linear-to-r from-teal-100 to-white',
  rest: 'bg-linear-to-r from-amber-100 to-white',
  year: 'bg-linear-to-r from-indigo-100 to-white',
}

// What each leave period means, in a few words.
export const PERIOD_DESCRIPTIONS = {
  custom: 'Choose your own first and last day',
  next: 'The next public holiday',
  xmas: 'Christmas, Day of Goodwill & New Year',
  easter: 'Human Rights Day, Good Friday & Family Day',
  school: 'The next school holidays in your province',
  three: 'Every holiday from today',
  six: 'Every holiday from today',
  rest: "What's left of this year",
  year: 'Plan next year ahead',
}
