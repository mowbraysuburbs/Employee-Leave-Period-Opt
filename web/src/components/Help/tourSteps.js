// The guided tour's steps. `target` matches a data-tour attribute (or `date`
// a calendar day); `enter` acts out the clicks so the right panel is open.
//
// actions: { reset, showDate, showSummary } from the app; demoDate is a good
// date in the first month to tap for the example.
export function tourSteps(phone, demoDate, { reset, showDate, showSummary }) {
  const act = phone ? 'Tap' : 'Click'
  return [
    {
      target: 'leave',
      enter: reset,
      title: 'Set your leave days',
      text: 'Choose how many leave days you want to spend on one break.',
    },
    {
      target: 'colours',
      enter: reset,
      title: 'Colours show days off',
      text: `Each colour is how many days off in a row you get if leave starts that day. ${act} a number to show only those dates, or switch to Value × for days off per leave day.`,
    },
    {
      date: demoDate,
      target: 'calendar',
      enter: showDate,
      title: `${act} a date`,
      text: 'Its whole break lights up, with the details: other start dates that give the same, and what each day is.',
    },
    {
      target: 'add',
      enter: showDate,
      title: 'Add it to your plan',
      text: 'Press + Add to my breaks to keep it. If it overlaps a break you saved, you can combine them.',
    },
    {
      target: 'export',
      enter: showSummary,
      title: phone ? 'My breaks' : 'Summary',
      text: "Once you add breaks, they're listed here with your totals. Export them all to your calendar (Apple, Outlook or Google) with this button.",
    },
    {
      target: 'help',
      enter: reset,
      title: 'Help any time',
      text: `${act} ? for How it works, or to take this tour again.`,
    },
  ]
}
