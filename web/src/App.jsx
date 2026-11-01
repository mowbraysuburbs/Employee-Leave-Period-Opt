import { useState, useEffect } from 'react'
import { DesktopApp } from './components/Desktop/DesktopApp'
import { MobileApp } from './components/Mobile/MobileApp'

// Desktop and mobile are genuinely different layouts, so we mount exactly one
// of the two content trees rather than CSS-hiding both. 640px (not 768) keeps
// a laptop window snapped to half the screen on the desktop layout; phones
// sit well below it. The height check keeps a phone turned sideways (wide but
// under ~450px tall) on the mobile layout.
const DESKTOP_QUERY = '(min-width: 640px) and (min-height: 500px)'

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(DESKTOP_QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY)
    const handler = (e) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

export default function App() {
  return useIsDesktop() ? <DesktopApp /> : <MobileApp />
}
