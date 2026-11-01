import { useState } from 'react'
import { MobileTabBar } from './MobileTabBar'
import { MobileCalendar } from './MobileCalendar'
import { BottomPanel } from './BottomPanel'
import { BottomSheet } from './BottomSheet'
import { FiltersSheet } from './FiltersSheet'
import { CalendarKey } from '../Desktop/CalendarKey'
import { BreakDetailPanel } from '../Desktop/BreakDetailPanel'
import { MyBreaksPanel } from '../Desktop/MyBreaksPanel'
import { PreviewBanner } from '../Desktop/PreviewBanner'
import { OverviewPage } from '../Desktop/Overview/OverviewPage'
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
  // Which bottom sheet is open: 'day' | 'filters' | 'summary' | null.
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
        {calendarPage && <CalendarKey />}
      </header>

      {calendarPage ? (
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
            selectedBreak={sheet === 'day' ? p.detailBreak : null}
            onDayClick={handleDayClick}
          />
          <BottomPanel
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
            onOpenFilters={() => setSheet('filters')}
            onOpenSummary={() => setSheet('summary')}
          />
        </main>
      ) : (
        <main className="flex-1 min-h-0 overflow-y-auto px-3 py-4">
          {page === 'overview' && (
            <OverviewPage
              plans={p.plans}
              selectedPlan={p.selectedPlan}
              onSelect={p.setSelectedPlanId}
              period={p.period}
              ticked={p.ticked}
              onToggle={p.toggleTick}
              onToggleAll={p.toggleAllTicks}
              isSaved={p.isSaved}
              onAdd={p.addBreaks}
              onExport={p.exportBreaks}
              onView={viewOnCalendar}
              province={p.province}
              onProvinceChange={p.setProvince}
              eventsSelected={p.eventsSelected}
            />
          )}
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
