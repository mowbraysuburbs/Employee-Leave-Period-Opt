import { useEffect, useRef, useState } from 'react'
import { fmtRange } from '../../utils/dateFormat'
import { buildIcsMulti } from '../../utils/ics'

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function downloadIcsMulti(periods) {
  const ics = buildIcsMulti(periods)
  downloadBlob(new Blob([ics], { type: 'text/calendar;charset=utf-8' }), 'leave-plan.ics')
}

function buildShareText(periods) {
  const lines = periods.map(p => {
    const [startLabel, endLabel] = fmtRange(p.startDate, p.endDate)
    return `${startLabel}–${endLabel}: ${p.leaveDaysUsed} leave day${p.leaveDaysUsed !== 1 ? 's' : ''} → ${p.daysOff} days off`
  })
  return `My leave plan:\n${lines.join('\n')}`
}

const IMG_WIDTH = 640
const ROW_HEIGHT = 56
const HEADER_HEIGHT = 100
const FONT = 'system-ui, -apple-system, sans-serif'

function drawSummaryImage(periods) {
  const canvas = document.createElement('canvas')
  canvas.width = IMG_WIDTH
  canvas.height = HEADER_HEIGHT + periods.length * ROW_HEIGHT + 32
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2)

  ctx.fillStyle = '#0f172a'
  ctx.font = `bold 24px ${FONT}`
  ctx.fillText('My Leave Plan', 24, 40)

  ctx.fillStyle = '#64748b'
  ctx.font = `13px ${FONT}`
  ctx.fillText(`${periods.length} period${periods.length !== 1 ? 's' : ''} selected`, 24, 62)

  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(24, HEADER_HEIGHT - 16)
  ctx.lineTo(canvas.width - 24, HEADER_HEIGHT - 16)
  ctx.stroke()

  periods.forEach((p, i) => {
    const y = HEADER_HEIGHT + i * ROW_HEIGHT
    const [startLabel, endLabel] = fmtRange(p.startDate, p.endDate)

    ctx.textAlign = 'left'
    ctx.fillStyle = '#1e293b'
    ctx.font = `600 15px ${FONT}`
    ctx.fillText(`${startLabel} – ${endLabel}`, 24, y + 24)

    ctx.fillStyle = '#64748b'
    ctx.font = `12px ${FONT}`
    ctx.fillText(`${p.leaveDaysUsed} leave day${p.leaveDaysUsed !== 1 ? 's' : ''} used`, 24, y + 42)

    ctx.textAlign = 'right'
    ctx.fillStyle = '#0284c7'
    ctx.font = `700 20px ${FONT}`
    ctx.fillText(String(p.daysOff), canvas.width - 24, y + 30)
    ctx.fillStyle = '#64748b'
    ctx.font = `11px ${FONT}`
    ctx.fillText('days off', canvas.width - 24, y + 44)

    if (i < periods.length - 1) {
      ctx.strokeStyle = '#f1f5f9'
      ctx.beginPath()
      ctx.moveTo(24, y + ROW_HEIGHT - 4)
      ctx.lineTo(canvas.width - 24, y + ROW_HEIGHT - 4)
      ctx.stroke()
    }
  })

  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
}

async function shareOrDownloadBlob(blob, filename, mimeType, shareTitle) {
  const file = new File([blob], filename, { type: mimeType })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: shareTitle })
      return
    } catch {
      // user cancelled the share sheet — fall back to a plain download
    }
  }
  downloadBlob(blob, filename)
}

export function LeaveSummaryModal({ periods, onClose }) {
  const [copied, setCopied] = useState(false)
  const openedAt = useRef(0)
  useEffect(() => { openedAt.current = Date.now() }, [])

  async function handleShareText() {
    const text = buildShareText(periods)
    if (navigator.share) {
      try {
        await navigator.share({ text })
        return
      } catch {
        // user cancelled — fall back to clipboard
      }
    }
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleShareImage() {
    const blob = await drawSummaryImage(periods)
    await shareOrDownloadBlob(blob, 'leave-plan.png', 'image/png', 'My Leave Plan')
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      onClick={() => { if (Date.now() - openedAt.current > 800) onClose() }}
    >
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      <div
        className="relative z-50 w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex-shrink-0 relative px-5 pt-5 pb-3 text-center border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-lg leading-none"
          >×</button>

          <p className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-100">
            My Leave Plan
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {periods.length} period{periods.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-2">
          {periods.map(p => {
            const [startLabel, endLabel] = fmtRange(p.startDate, p.endDate)
            return (
              <div
                key={`${p.startDate}-${p.leaveDaysUsed}`}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/40"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 tabular-nums">
                    {startLabel} – {endLabel}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {p.leaveDaysUsed} leave day{p.leaveDaysUsed !== 1 ? 's' : ''} used
                  </p>
                </div>
                <span className="text-sm font-bold text-sky-600 dark:text-sky-400 tabular-nums whitespace-nowrap">
                  {p.daysOff} off
                </span>
              </div>
            )
          })}
        </div>

        <div className="flex-shrink-0 px-5 py-4 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-2">
          <button
            onClick={() => downloadIcsMulti(periods)}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-semibold transition-colors"
          >
            Add all to calendar (.ics)
          </button>
          <button
            onClick={handleShareText}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-colors"
          >
            {copied ? 'Copied!' : 'Share as text'}
          </button>
          <button
            onClick={handleShareImage}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-colors"
          >
            Share as image
          </button>
        </div>
      </div>
    </div>
  )
}
