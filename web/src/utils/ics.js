import { addDays } from './dateFormat'

function icsDate(dateStr) {
  return dateStr.replace(/-/g, '')
}

function buildIcsEvent(startDate, endDate, daysOff, leaveDays) {
  const start = icsDate(startDate)
  const excEnd = icsDate(addDays(endDate, 1))
  const summary = `Leave – ${daysOff} days off`
  const desc = `${leaveDays} leave day${leaveDays !== 1 ? 's' : ''} used · ${daysOff} total days off`
  return [
    'BEGIN:VEVENT',
    `UID:leave-${start}-${leaveDays}@leaveplanner`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${excEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${desc}`,
    'END:VEVENT',
  ].join('\r\n')
}

export function buildIcs(startDate, endDate, daysOff, leaveDays) {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Leave Planner//EN',
    buildIcsEvent(startDate, endDate, daysOff, leaveDays),
    'END:VCALENDAR',
  ].join('\r\n')
}

export function buildIcsMulti(periods) {
  const events = periods.map(p => buildIcsEvent(p.startDate, p.endDate, p.daysOff, p.leaveDaysUsed))
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Leave Planner//EN',
    ...events,
    'END:VCALENDAR',
  ].join('\r\n')
}
