// The guided tour's steps. `target` matches a data-tour attribute (or `date`
// a calendar day); `enter` acts out the clicks so the right panel is open.
//
// actions: { reset, showDate, showSummary } from the app; demo is the example
// break to tap ({ startDate, endDate }) so its whole band can be spotlit.
export function tourSteps(phone, demo, { reset, showDate, showSummary }) {
  const act = phone ? 'Tap' : 'Click'
  return [
    {
      target: 'leave',
      enter: reset,
      title: 'Set your leave days',
      text: phone
        ? 'Swipe the numbers to choose how many leave days to spend on one break. Tap the limit to change it. "7 left" shows what is left: press and hold it to use exactly that many.'
        : 'Choose how many leave days you want to spend on one break.',
    },
    {
      target: 'colours',
      enter: reset,
      title: 'Colours show days off',
      text: phone
        ? 'Each colour is how many days off in a row you get if leave starts that day. Tap a colour to show only those dates, or Total days to switch to Multiplier. Tap Filters for quick filters, or hold it to remove them all.'
        : `Each colour is how many days off in a row you get if leave starts that day. ${act} a number to show only those dates, or switch to Multiplier for days off per leave day.`,
    },
    {
      date: demo?.startDate,
      until: demo?.endDate,
      target: 'calendar',
      enter: showDate,
      title: `${act} a date`,
      text: 'Its whole break lights up, with the details: other start dates that give the same, and what each day is.',
    },
    {
      target: 'add',
      enter: showDate,
      title: 'Add it to your plan',
      text: 'Press Add to summary to keep it. If it overlaps a break you saved, you can combine them.',
    },
    {
      target: 'export',
      enter: showSummary,
      title: phone ? 'My breaks' : 'Summary',
      text: "Once you add breaks, they're listed here with your totals. Add them to your calendar here: Apple / iPhone (also Outlook) or Google. Clear all starts over.",
    },
    {
      target: 'help',
      enter: reset,
      title: 'Help any time',
      text: `${act} ? for How it works, or to take this tour again.`,
    },
  ]
}

// The first-visit journey on the Overview: the planner's steps, the plan,
// adding it, then where to go next. Phones have the days off limit
// behind one settings button by the period slider. openPanel (desktop)
// opens a collapsed Details / Summary panel for its step.
export function plannerTourSteps(phone = false, { openPanel } = {}) {
  const act = phone ? 'Tap' : 'Click'
  const settings = phone
    ? [{
        target: 'settings',
        title: '2 · Days off limit',
        text: 'This button shows your days off limit. Tap it to change it (REC marks the recommended number), or for Advanced options (school holidays, months to avoid). A number on it shows how many advanced options are on. The plan uses what\'s left after your Summary.',
      }]
    : [
        {
          target: 'limit',
          title: '2 · Your days off limit',
          text: "How many leave days you want to spend (up to 10), with what's left after your Summary. REC marks the recommended number (best bang for buck, joins holidays, or covers the school holiday): with that many or more you get one break; with fewer, the best multiplier.",
        },
        {
          target: 'advanced',
          title: 'Advanced options',
          text: 'Plan around your school holidays, or avoid / include certain months. A number on the arrow shows how many are on.',
        },
      ]
  return [
    {
      target: 'period',
      title: '1 · Pick a leave period',
      text: phone
        ? 'Slide along and tap Christmas, Easter, school holidays, next year, or Custom to pick your own months and breaks. The plan updates straight away.'
        : 'Christmas, Easter, school holidays, next year, or Custom to pick your own months and breaks. The plan updates straight away.',
    },
    ...settings,
    {
      target: 'results',
      title: 'Your plan',
      text: "Each row is a break: when it starts and ends, the holiday it's built around, and how many days off you get. Untick any you don't want.",
    },
    {
      target: 'plan-add',
      title: 'Add it to your Summary',
      text: 'Keep the ticked breaks in your Summary. From there you can add them to Apple or Google Calendar.',
    },
    {
      target: phone ? 'summary' : 'panel',
      // Desktop: open the side panel if it's collapsed, so there's something to show.
      enter: openPanel,
      title: phone ? 'Your Summary' : 'Details and Summary',
      text: phone
        ? 'Your saved breaks, totals and leave left. The number shows how many breaks you have. Clear all starts over.'
        : 'Details shows the plan on a calendar. Summary lists the breaks you added, with your totals and leave left. Clear all starts over.',
    },
    {
      target: 'nav-calendar',
      title: 'Explore every day',
      text: `The Calendar colours every date by how many days off you would get if leave starts then. ${act} any day to see its break.`,
    },
    {
      target: 'help',
      title: 'Help any time',
      text: `${act} ? for How it works, or to take this tour again.`,
    },
  ]
}

// The desktop Calendar's first-visit tour: the left column top to bottom, a
// date and its break, adding it, the Details / Summary panel, then collapsing.
// demo is the example break ({ startDate, endDate }) to spotlight.
// actions: { reset, showDate, showSummary } from the app (reset also opens any
// collapsed column so the spotlight has something to show).
export function calendarTourSteps(demo, { reset, showDate, showSummary }) {
  return [
    {
      target: 'leave',
      enter: reset,
      title: 'Your leave days',
      text: 'The big number is the leave days for one break; click a block to change it. The dropdown is your leave limit, and Snap to days left uses exactly what is left after your Summary.',
    },
    {
      target: 'colours',
      enter: reset,
      title: 'Colours show days off',
      text: 'Each colour is how many days off in a row you get if leave starts that day. Click a number to show only those dates, or switch to Multiplier for days off per leave day.',
    },
    {
      target: 'dates',
      enter: reset,
      title: 'Which dates',
      text: 'The calendar shows these months. Change Start or End to look further ahead: up to the end of January after next year.',
    },
    {
      target: 'show',
      enter: reset,
      title: 'Show only…',
      text: 'Breaks with a public holiday (or All holidays), your Selected breaks, or school holidays for your province.',
    },
    {
      date: demo?.startDate,
      until: demo?.endDate,
      target: 'calendar',
      enter: showDate,
      title: 'Click a date',
      text: 'Hover any date for its stats. Click it and its whole break lights up, with the details on the right: other start dates that give the same, and what each day is.',
    },
    {
      target: 'add',
      enter: showDate,
      title: 'Add it to your Summary',
      text: 'Press Add to summary to keep it. If it overlaps a break you saved, you can combine them.',
    },
    {
      target: 'breaks',
      enter: showSummary,
      title: 'Details and Summary',
      text: 'Summary lists your saved breaks with totals and leave left. Add them to Apple / iPhone (also Outlook) or Google Calendar from there. Clear all starts over.',
    },
    {
      target: 'collapse',
      enter: reset,
      title: 'More room',
      text: 'Both side columns collapse to a slim strip of icons ("Collapse to icons"), and the icons still work.',
    },
    {
      target: 'help',
      enter: reset,
      title: 'Help any time',
      text: 'Click ? for How it works, or to take this tour again.',
    },
  ]
}
