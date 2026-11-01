// The guided tour's steps. Each target matches a data-tour attribute on the
// control to spotlight; phones say "tap" and mention the bottom-panel toggle.
export function tourSteps(phone) {
  const act = phone ? 'Tap' : 'Click'
  return [
    {
      target: 'leave',
      title: 'Set your leave days',
      text: 'Choose how many leave days you want to spend on one break.',
    },
    {
      target: 'colours',
      title: 'Colours show days off',
      text: phone
        ? 'Each colour is how many days off in a row you get if leave starts that day. Tap a number to show only those dates, or switch to Value × for days off per leave day.'
        : 'Each colour is how many days off in a row you get if leave starts that day. Click a number to show only those dates, or switch to Value × for days off per leave day.',
    },
    {
      target: 'calendar',
      title: `${act} a date`,
      text: 'See the whole break, other start dates that give the same, and what each day is. Warmer colours mean longer breaks.',
    },
    {
      target: 'breaks',
      title: 'Save your breaks',
      text: phone
        ? 'Breaks you add are kept here: leave → days off. Overlapping breaks combine into one, and you can add them all to your calendar.'
        : 'Breaks you add are kept in Summary. Overlapping breaks combine into one, and you can add them all to your calendar.',
    },
    {
      target: 'help',
      title: 'Help any time',
      text: `${act} ? for How it works, or to take this tour again.`,
    },
  ]
}
