import { Button } from '@/components/ui/button';
import { DateConverter } from '@/components/date/DateConverter';
import { MonthlyCalendarDialog } from '@/components/calendar/MonthlyCalendarDialog';
import { SupportDialog } from '@/components/support/SupportDialog';
import { HelpDialog } from '@/components/help/HelpDialog';
import { LayoutSwitcher } from './LayoutSwitcher';
import { LanguageSelector } from './LanguageSelector';
import { BookOpen } from 'lucide-react';
import { useI18n } from '@/i18n/useI18n';
import type { AppSettings } from '@/types';

export function BottomBar({ settings }: { settings: AppSettings }) {
  const { t } = useI18n();
  return (
    <footer className="flex items-center justify-between gap-4 border-t bg-card/40 px-6 py-2">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="gap-2" asChild>
          <a href="https://quran.com" target="_blank" rel="noopener noreferrer">
            <BookOpen className="h-4 w-4" /> {t('ui.quran')}
          </a>
        </Button>
        <DateConverter />
        <span data-tour="monthly"><MonthlyCalendarDialog /></span>
        <SupportDialog />
        <HelpDialog />
      </div>
      <div className="flex items-center gap-3">
        <LayoutSwitcher settings={settings} />
        <LanguageSelector />
      </div>
    </footer>
  );
}
