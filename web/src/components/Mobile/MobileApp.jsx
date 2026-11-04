import { useState } from 'react'
import { MobileTabBar } from './MobileTabBar'
import { MobileCalendar } from './MobileCalendar'
import { BottomPanel } from './BottomPanel'
import { BottomSheet } from './BottomSheet'
import { FiltersSheet } from './FiltersSheet'
import { SettingsSheet } from './SettingsSheet'
import { HelpButton } from '../Help/HelpButton'
import { HelpSheet } from './HelpSheet'
import { GuidedTour } from '../Help/GuidedTour'
import { tourSteps, plannerTourSteps } from '../Help/tourSteps'
import { useSettings } from '../../hooks/useSettings'
import { useWelcome } from '../../hooks/useWelcome'
import { BreakDetailPanel } from '../Desktop/BreakDetailPanel'
import { BreakDetailHead } from '../Desktop/BreakDetailHead'
import { MyBreaksPanel } from '../Desktop/MyBreaksPanel'
import { PreviewBanner } from '../Desktop/PreviewBanner'
import { MobileOverview } from './MobileOverview'
import { EventsComingSoon } from '../Desktop/EventsComingSoon'
import { HolidaysList } from '../Features/HolidaysList'
import { useLeavePlanner } from '../../hooks/useLeavePlanner'

/**
 * The phone layout. Same planning logic as the desktop (useLeavePlanner);
 * the controls sit in a bottom panel and Details, Filters and My breaks open
 * as sheets from the bottom.
 */
export function MobileApp() {
  const settings = useSettings()
  const p = useLeavePlanner({ leaveLimit: settings.leaveTotal, onLeaveLimitChange: settings.setLeaveTotal })
  const [page, setPage] = useState('overview')
  const { showWelcome, closeWelcome, replayWelcome } = useWelcome()
  // Which bottom sheet is open: 'day' | 'filters' | 'summary' | 'settings' | 'help' | null.
  const [sheet, setSheet] = useState(null)
  const closeSheet = () => setSheet(null)
  const calendarPage = page === 'calendar'

  function handleDayClick(date) {
    p.selectDay(date)
    setSheet('day')
  }

  function changePage(next) {
    setSheet(null)
    setPage(next)
  }

  function viewOnCalendar(list) {
    p.openPreview(list)
    setPage('calendar')
    setSheet(null)
  }

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-slate-50 text-slate-900">
      <header className="shrink-0 h-14 px-4 bg-white border-b border-slate-200 flex items-center gap-2">
        <span className="text-lg font-extrabold tracking-tight">Stretch<span className="text-sky-700">My</span>Leave</span>
        <span className="flex-1" />
        <HelpButton onClick={() => setSheet('help')} />
        <button
          type="button"
          aria-label="Settings"
          onClick={() => setSheet('settings')}
          className="w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 inline-flex items-center justify-center"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
          </svg>
        </button>
        {/* Summary at the far right of the header, the same on every page (the Key is inside Help on phones). */}
        <button
          type="button"
          data-tour="summary"
          onClick={() => setSheet('summary')}
          aria-label={`Summary: ${p.saved.length} break${p.saved.length === 1 ? '' : 's'}`}
          className="relative h-9 px-3 rounded-full border border-sky-200 bg-sky-50 text-sky-800 inline-flex items-center gap-1.5 text-[13px] font-bold"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="7" width="16" height="13" rx="2" /><path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" /></svg>
          Summary
          {p.saved.length > 0 && <span aria-hidden="true" className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-sky-500 border-2 border-white text-white text-[10px] font-extrabold leading-[14px]">{p.saved.length}</span>}
        </button>
      </header>

      {page === 'overview' ? (
        <MobileOverview
          planner={p.planner}
          isSaved={p.isSaved}
          onAdd={p.addBreaks}
          onOpenSummary={() => setSheet('summary')}
          onView={viewOnCalendar}
          province={p.province}
          onProvinceChange={p.setProvince}
        />
      ) : calendarPage ? (
        <main className="flex-1 min-h-0 flex flex-col">
          {p.preview && (
            <div className="shrink-0 px-3 pt-2">
              <PreviewBanner title={p.preview.title} onBack={() => changePage('overview')} onClear={() => p.setPreview(null)} />
            </div>
          )}
          <MobileCalendar
            months={p.months}
            breaks={p.breaks}
            colourBy={p.colourBy}
            holidayFilter={p.holidayFilter}
            picksOnly={p.picksOnly}
            savedDayTypes={p.savedDayTypes}
            savedStarts={p.savedStarts}
            previewDayTypes={p.previewOnly ? p.previewDays.dayTypes : null}
            schoolDates={p.schoolDates}
            daysOffFilter={p.activeDaysOff}
            holidayView={p.holidayView}
            compact={settings.calendarSize === 'compact'}
            selectedBreak={sheet === 'day' ? p.detailBreak : null}
            onDayClick={handleDayClick}
          />
          <BottomPanel
            c={p.controls}
            filterable={p.colourBy === 'daysOff' && !p.picksOnly}
            activeCount={p.activeFilters.length}
            onOpenFilters={() => setSheet('filters')}
            onClearAll={p.clearAllFilters}
          />
        </main>
      ) : (
        <main className="flex-1 min-h-0 overflow-y-auto px-3 py-4">
          {page === 'holidays' && <HolidaysList months={p.months} showSchoolHolidays={false} provinceCode={p.province} />}
          {page === 'events' && <EventsComingSoon variant="page" />}
        </main>
      )}

      <MobileTabBar page={page} onPageChange={changePage} />

      {sheet === 'day' && p.detailBreak && (
        <BottomSheet label="Day details" onClose={closeSheet} maxHeight="max-h-[58dvh]">
          <div className="flex flex-col gap-4">
            <BreakDetailHead
              row
              brk={p.detailBreak}
              isSaved={p.isSaved(p.detailBreak)}
              onAdd={p.addDetailBreak}
              onRemove={() => p.removeBreak(p.detailBreak)}
              overlaps={p.overlaps}
              combined={p.combined}
              onReplace={p.replaceOverlaps}
            />
            <BreakDetailPanel
              brk={p.detailBreak}
              bestNote={p.bestNote}
              label={p.previewLabel}
              equalStarts={p.equalStarts}
              onPickStart={startDate => p.openBreak({ startDate, leaveDays: p.detailBreak.leaveDays })}
            />
          </div>
        </BottomSheet>
      )}

      {sheet === 'filters' && <FiltersSheet c={p.controls} activeCount={p.activeFilters.length} onClearAll={p.clearAllFilters} onClose={closeSheet} />}

      {sheet === 'help' && <HelpSheet onReplay={() => { setSheet(null); if (page !== 'calendar') setPage('overview'); replayWelcome() }} onClose={closeSheet} />}

      {/* The tour for the page you're on: the planner journey on the Overview, the calendar tour on the Calendar. */}
      {showWelcome && page === 'overview' && <GuidedTour steps={plannerTourSteps(true)} onClose={() => { closeWelcome(); setSheet(null) }} />}
      {showWelcome && calendarPage && (
        <GuidedTour
          steps={tourSteps(true, p.breaks[p.demoDate], {
            reset: () => setSheet(null),
            showDate: () => { p.selectDay(p.demoDate); setSheet('day') },
            showSummary: () => setSheet('summary'),
          })}
          onClose={() => { closeWelcome(); setSheet(null) }}
        />
      )}

      {sheet === 'settings' && (
        <SettingsSheet
          calendarSize={settings.calendarSize}
          onCalendarSizeChange={settings.setCalendarSize}
          theme={settings.theme}
          onThemeChange={settings.setTheme}
          onClose={closeSheet}
        />
      )}

      {sheet === 'summary' && (
        <BottomSheet label="My breaks" backdrop onClose={closeSheet}>
          <MyBreaksPanel
            breaks={p.savedBreaks}
            justAddedKey={p.justAddedKey}
            onOpen={b => { p.openBreak(b); setPage('calendar'); setSheet('day') }}
            onRemove={p.removeBreak}
            mineOnly={p.picksOnly}
            onMineOnlyChange={p.setPicksOnly}
          />
        </BottomSheet>
      )}
    </div>
  )
}
