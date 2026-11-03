import { useState } from 'react'
import { BottomSheet } from './BottomSheet'
import { KeyContent } from '../Desktop/KeyContent'
import { HowItWorks } from '../Help/HowItWorks'

/**
 * The phone's Help (?): the colour Key first, then How it works. The Key
 * lives here on phones so the header has room for Summary.
 *
 * Props: onReplay – take the tour; onClose
 */
export function HelpSheet({ onReplay, onClose }) {
  const [tab, setTab] = useState('key')
  const seg = on => `flex-1 py-2 rounded-lg text-[13px] font-bold ${on ? 'bg-white text-slate-900 shadow' : 'text-slate-600'}`
  return (
    <BottomSheet label="Help" title="Help" backdrop onClose={onClose}>
      <div className="flex flex-col gap-4 pb-3">
        <div role="tablist" aria-label="Help" className="flex p-[3px] gap-[3px] rounded-xl bg-slate-100">
          <button type="button" role="tab" aria-selected={tab === 'key'} onClick={() => setTab('key')} className={seg(tab === 'key')}>Key</button>
          <button type="button" role="tab" aria-selected={tab === 'how'} onClick={() => setTab('how')} className={seg(tab === 'how')}>How it works</button>
        </div>
        {tab === 'key' ? <div className="flex flex-col gap-3.5"><KeyContent /></div> : <HowItWorks phone onReplay={onReplay} />}
      </div>
    </BottomSheet>
  )
}
