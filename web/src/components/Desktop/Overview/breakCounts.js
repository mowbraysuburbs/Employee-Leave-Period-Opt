// What a break uses, for the Overview's table columns.

/** The public holidays inside a break. */
export const holidaysIn = brk => brk.days.filter(d => d.type === 'public_holiday')

/** How many weekend days a break covers. */
export const weekendsIn = brk => brk.days.filter(d => d.type === 'weekend').length

/** Free days: everything off that isn't leave (weekends + public holidays). */
export const freeDaysIn = brk => brk.daysOff - brk.leaveDays
