import { addDays } from './dateFormat'

// Google's "dates" param end is exclusive for all-day events, so a leave
// period ending 25 Dec needs an end of 26 Dec to actually cover the 25th.
export function googleCalendarUrl({ title, startDate, endDate }) {
  const compact = (d) => d.replace(/-/g, '')
  const endExclusive = addDays(endDate, 1)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${compact(startDate)}/${compact(endExclusive)}`,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

// events: [{ title, startDate, endDate }, ...] — one VEVENT per entry, so a
// scattered plan's separate breaks become separate calendar entries in one file.
export function buildIcs(events) {
  const compact = (d) => d.replace(/-/g, '')
  const now = new Date()
  const stamp = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}T${String(now.getUTCHours()).padStart(2, '0')}${String(now.getUTCMinutes()).padStart(2, '0')}${String(now.getUTCSeconds()).padStart(2, '0')}Z`

  const vevents = events.flatMap(({ title, startDate, endDate }) => {
    const endExclusive = addDays(endDate, 1)
    return [
      'BEGIN:VEVENT',
      `UID:${startDate}-${endDate}@stretchmyleave`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compact(startDate)}`,
      `DTEND;VALUE=DATE:${compact(endExclusive)}`,
      `SUMMARY:${title}`,
      'END:VEVENT',
    ]
  })

  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//StretchMyLeave//EN', ...vevents, 'END:VCALENDAR'].join('\r\n')
}

export function downloadIcs(icsContent, filename) {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
