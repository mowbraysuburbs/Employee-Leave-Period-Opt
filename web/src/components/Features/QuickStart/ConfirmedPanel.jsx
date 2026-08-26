import { useState } from 'react'
import { fmtRangeNice, fmtNice } from '../../../utils/dateFormat'
import { googleCalendarUrl, buildIcs, downloadIcs } from '../../../utils/calendarExport'
import { renderShareCard, shareOrDownload } from '../../../utils/shareCard'

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.09V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.94l3.66-2.85z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.06l3.66 2.85C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  )
}
function AppleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#0f172a">
      <path d="M16.365 1.43c0 1.14-.462 2.15-1.223 2.9-.83.82-2.14 1.45-3.223 1.36-.14-1.1.46-2.24 1.19-2.97.79-.8 2.17-1.4 3.256-1.29zM20.6 17.24c-.55 1.27-.82 1.84-1.53 2.96-.99 1.56-2.4 3.5-4.13 3.52-1.54.02-1.94-1-4.03-1s-2.53.98-4.05 1c-1.73.02-3.05-1.71-4.04-3.26C.4 16.94-.55 12.15 1.18 8.9c.86-1.6 2.4-2.61 4.06-2.63 1.5-.02 2.92 1.03 3.83 1.03.9 0 2.63-1.28 4.43-1.09.75.03 2.87.31 4.23 2.33-.11.07-2.52 1.5-2.5 4.44.03 3.5 3.05 4.66 3.08 4.68-.02.08-.5 1.74-1.7 3.58z" />
    </svg>
  )
}
function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

const SHORT_MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function ConfirmedPanel({ periods, onClose }) {
  const [syncedGoogle, setSyncedGoogle] = useState(false)
  const [syncedApple, setSyncedApple] = useState(false)

  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate))
  const earliest = sorted[0]
  const latest = sorted[sorted.length - 1]
  const totalDaysOff = periods.reduce((s, p) => s + p.daysOff, 0)
  const totalLeaveUsed = periods.reduce((s, p) => s + p.leaveDaysUsed, 0)

  const rangeLabel = periods.length === 1
    ? fmtRangeNice(earliest.startDate, earliest.endDate).join(' – ')
    : `${periods.length} breaks · ${fmtNice(earliest.startDate)} – ${fmtNice(latest.endDate)}`

  const [, mon, yr] = earliest.startDate.split('-')
  const monthLabel = `${SHORT_MONTH[+mon - 1]} '${yr.slice(2)}`

  const eventTitle = periods.length === 1 ? 'Leave' : 'Leave (StretchMyLeave)'

  function handleGoogle() {
    const url = googleCalendarUrl({ title: eventTitle, startDate: earliest.startDate, endDate: earliest.endDate })
    window.open(url, '_blank', 'noopener,noreferrer')
    setSyncedGoogle(true)
  }

  function handleApple() {
    const ics = buildIcs(periods.map((p) => ({ title: eventTitle, startDate: p.startDate, endDate: p.endDate })))
    downloadIcs(ics, `leave-${earliest.startDate}.ics`)
    setSyncedApple(true)
  }

  async function handleShare() {
    const blob = await renderShareCard({ daysOff: totalDaysOff, leaveDaysUsed: totalLeaveUsed, rangeLabel, monthLabel })
    await shareOrDownload(blob, 'my-leave-plan.png', {
      title: 'My leave plan',
      text: `${totalDaysOff} days off from ${totalLeaveUsed} leave days — planned with StretchMyLeave`,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm mx-4 mb-4 md:mb-0 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="px-7 pt-7 pb-2 flex flex-col items-center text-center gap-2.5">
          <div className="w-11 h-11 rounded-full bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center">
            <CheckIcon />
          </div>
          <h2 className="text-[21px] font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Your leave is planned</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{rangeLabel} &middot; {totalLeaveUsed} leave day{totalLeaveUsed === 1 ? '' : 's'} for {totalDaysOff} days off</p>
        </div>

        <div className="mx-7 mt-5 rounded-2xl p-5 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)' }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -left-5 w-28 h-28 rounded-full bg-white/5" />
          <div className="relative flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wide opacity-85">StretchMyLeave</span>
            <span className="text-xs font-bold opacity-85">{monthLabel}</span>
          </div>
          <div className="relative flex items-baseline gap-2 mt-4">
            <span className="text-5xl font-extrabold tracking-tight">{totalDaysOff}</span>
            <span className="text-sm font-bold opacity-90">days off</span>
          </div>
          <p className="relative text-sm font-semibold opacity-90 mt-1">using just {totalLeaveUsed} leave day{totalLeaveUsed === 1 ? '' : 's'}</p>
          <div className="relative flex items-center gap-2 mt-4 pt-3.5 border-t border-white/25">
            <span className="text-xs font-bold">{rangeLabel}</span>
          </div>
        </div>

        <div className="px-7 pt-4">
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-bold transition-colors"
          >
            Share your plan
          </button>
        </div>

        <div className="px-7 pt-4 flex flex-col gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Add to calendar</p>

          <button
            onClick={handleGoogle}
            className="flex items-center gap-3 text-left px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600"
          >
            <span className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 flex items-center justify-center flex-shrink-0">
              <GoogleIcon />
            </span>
            <span className="flex-1 text-sm font-bold text-slate-900 dark:text-slate-100">Google Calendar</span>
            {syncedGoogle && <span className="text-[10px] font-extrabold uppercase text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">Synced</span>}
          </button>

          <button
            onClick={handleApple}
            className="flex items-center gap-3 text-left px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600"
          >
            <span className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 flex items-center justify-center flex-shrink-0">
              <AppleIcon />
            </span>
            <span className="flex-1 text-sm font-bold text-slate-900 dark:text-slate-100">Apple Calendar</span>
            {syncedApple && <span className="text-[10px] font-extrabold uppercase text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">Synced</span>}
          </button>
        </div>

        <div className="px-7 pt-3 pb-6 flex justify-center">
          <button onClick={onClose} className="px-5 py-2 rounded-full text-slate-500 dark:text-slate-400 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            Back to plan
          </button>
        </div>
      </div>
    </div>
  )
}
