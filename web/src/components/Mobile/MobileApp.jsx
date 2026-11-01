import { useState } from 'react'
import { MobileTabBar } from './MobileTabBar'
import { MobileCalendar } from './MobileCalendar'
import { BottomPanel } from './BottomPanel'
import { BottomSheet } from './BottomSheet'
import { FiltersSheet } from './FiltersSheet'
import { SettingsSheet } from './SettingsSheet'
import { HelpButton } from '../Help/HelpButton'
import { HowItWorks } from '../Help/HowItWorks'
import { GuidedTour } from '../Help/GuidedTour'
import { tourSteps } from '../Help/tourSteps'
import { useSettings } from '../../hooks/useSettings'
import { useWelcome } from '../../hooks/useWelcome'
import { CalendarKey } from '../Desktop/CalendarKey'
import { BreakDetailPanel } from '../Desktop/BreakDetailPanel'
import { MyBreaksPanel } from '../Desktop/MyBreaksPanel'
import { PreviewBanner } from '../Desktop/PreviewBanner'
import { MobileOverview } from './MobileOverview'
import { EventsComingSoon } from '../Desktop/EventsComingSoon'
import { HolidaysList } from '../Features/HolidaysList'
import { useLeavePlanner, MAX_LEAVE, ALLOWANCE } from '../../hooks/useLeavePlanner'
import { summariseBreaks } from '../../utils/breaks'

/**
 * The phone layout. Same planning logic as the desktop (useLeavePlanner);
 * the controls sit in a bottom panel and Details, Filters and My breaks open
 * as sheets from the bottom.
 */
export function MobileApp() {
  const p = useLeavePlanner()
  const [page, setPage] = useState('calendar')
  const settings = useSettings()
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
        {calendarPage && <CalendarKey />}
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
      </header>

      {page === 'overview' ? (
        <MobileOverview
          plans={p.plans}
          selectedPlan={p.selectedPlan}
          onSelect={p.setSelectedPlanId}
          ticked={p.ticked}
          onToggle={p.toggleTick}
          onToggleAll={p.toggleAllTicks}
          isSaved={p.isSaved}
          onAdd={p.addBreaks}
          onExport={p.exportBreaks}
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
            previewStarts={p.previewOnly ? p.previewDays.starts : null}
            schoolDates={p.schoolDates}
            daysOffFilter={p.activeDaysOff}
            compact={settings.calendarSize === 'compact'}
            selectedBreak={sheet === 'day' ? p.detailBreak : null}
            onDayClick={handleDayClick}
          />
          <BottomPanel
            colourBy={p.colourBy}
            onColourByChange={p.setColourBy}
            legend={p.legend}
            filterable={p.colourBy === 'daysOff' && !p.picksOnly}
            daysOffFilter={p.daysOffFilter}
            onToggleDaysOff={p.toggleDaysOff}
            onClearDaysOff={p.clearDaysOff}
            leaveDays={p.leaveDays}
            maxLeave={MAX_LEAVE}
            onLeaveDaysChange={p.changeLeaveDays}
            savedCount={p.saved.length}
            savedDaysOff={summariseBreaks(p.savedBreaks).daysOff}
            savedLeave={summariseBreaks(p.savedBreaks).leaveUsed}
            onOpenFilters={() => setSheet('filters')}
            onOpenSummary={() => setSheet('summary')}
            activeCount={p.activeFilters.length}
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
          <BreakDetailPanel
            brk={p.detailBreak}
            nextBreak={p.nextBreak}
            bestNote={p.bestNote}
            label={p.previewLabel}
            equalStarts={p.equalStarts}
            onPickStart={startDate => p.openBreak({ startDate, leaveDays: p.detailBreak.leaveDays })}
            isSaved={p.isSaved(p.detailBreak)}
            onAdd={p.addDetailBreak}
            onRemove={() => p.removeBreak(p.detailBreak)}
            overlaps={p.overlaps}
            combined={p.combined}
            onReplace={p.replaceOverlaps}
            leaveLeft={p.leaveLeft}
            allowance={ALLOWANCE}
          />
        </BottomSheet>
      )}

      {sheet === 'filters' && <FiltersSheet c={p.controls} onClose={closeSheet} />}

      {sheet === 'help' && (
        <BottomSheet label="How it works" title="How it works" backdrop onClose={closeSheet}>
          <HowItWorks phone onReplay={() => { setSheet(null); setPage('calendar'); replayWelcome() }} />
        </BottomSheet>
      )}

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
            allowance={ALLOWANCE}
            justAddedKey={p.justAddedKey}
            onOpen={b => { p.openBreak(b); setPage('calendar'); setSheet('day') }}
            onRemove={p.removeBreak}
            onDismissAdded={() => p.setJustAddedKey(null)}
            mineOnly={p.picksOnly}
            onMineOnlyChange={p.setPicksOnly}
          />
        </BottomSheet>
      )}
    </div>
  )
}
