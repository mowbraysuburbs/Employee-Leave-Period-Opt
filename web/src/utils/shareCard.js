// Draws the Strava-style "days off" share card to an offscreen canvas and
// returns it as a PNG Blob. Pure canvas work, no React — the caller passes
// already-formatted strings so this file doesn't need to know date formats.
export function renderShareCard({ daysOff, leaveDaysUsed, rangeLabel, monthLabel }) {
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1080
  const ctx = canvas.getContext('2d')

  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  grad.addColorStop(0, '#0ea5e9')
  grad.addColorStop(1, '#0369a1')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  ctx.beginPath()
  ctx.arc(canvas.width - 60, 60, 260, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.beginPath()
  ctx.arc(-40, canvas.height + 20, 220, 0, Math.PI * 2)
  ctx.fill()

  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = '800 34px -apple-system, "Segoe UI", sans-serif'
  ctx.fillText('STRETCHMYLEAVE', 80, 130)

  ctx.textAlign = 'right'
  ctx.fillText(monthLabel, canvas.width - 80, 130)
  ctx.textAlign = 'left'

  ctx.fillStyle = '#ffffff'
  ctx.font = '800 320px -apple-system, "Segoe UI", sans-serif'
  ctx.fillText(String(daysOff), 76, 520)

  ctx.font = '700 46px -apple-system, "Segoe UI", sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.fillText('days off', 80, 590)

  ctx.font = '600 40px -apple-system, "Segoe UI", sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.fillText(`using just ${leaveDaysUsed} leave day${leaveDaysUsed === 1 ? '' : 's'}`, 80, 650)

  ctx.strokeStyle = 'rgba(255,255,255,0.28)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(80, 760)
  ctx.lineTo(canvas.width - 80, 760)
  ctx.stroke()

  ctx.font = '700 42px -apple-system, "Segoe UI", sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(rangeLabel, 80, 840)

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

// Tries the native share sheet with the image attached; falls back to a
// plain download if Web Share (or file sharing specifically) isn't
// available, or if the user's platform rejects the file for some reason.
export async function shareOrDownload(blob, filename, { title, text } = {}) {
  const file = new File([blob], filename, { type: blob.type })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title, text })
      return 'shared'
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled'
      // fall through to download for any other failure
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return 'downloaded'
}
