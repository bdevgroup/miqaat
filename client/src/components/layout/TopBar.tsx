import { LogoMark } from '@/components/brand/LogoMark';
import { LocationPicker } from '@/components/location/LocationPicker';
import { ThemeToggle } from './ThemeToggle';
import { CompactToggle } from './CompactToggle';
import { WidgetToggle } from './WidgetToggle';
import { SettingsDialog } from '@/components/settings/SettingsDialog';
import { NotificationsDialog } from '@/components/notifications/NotificationsDialog';
import { useI18n } from '@/i18n/useI18n';
import type { AppSettings } from '@/types';

export function TopBar({ settings }: { settings: AppSettings }) {
  const { t, lang } = useI18n();
  const isArabic = lang === 'ar';

  return (
    <header className="flex items-center justify-between gap-4 border-b bg-background/80 px-6 py-3 backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        <LogoMark variant="chrome" size={32} />
        {/* Tagline — language-aware typography. EN/FR get the small
            uppercase/wide-tracking chrome label. AR gets a Quranic verse
            (4:103) typeset in Amiri italic with a small attribution after.
            Arabic NEVER takes uppercase or positive letter-spacing — the
            latter breaks cursive joining outright — so we branch the
            className entirely. */}
        {isArabic ? (
          <span className="flex min-w-0 items-baseline gap-2 truncate">
            <span
              className="truncate text-sm leading-none text-foreground/80"
              style={{ fontFamily: 'var(--font-display-arabic)' }}
            >
              {t('app.tagline')}
            </span>
            <span className="hidden text-[10px] text-muted-foreground/70 md:inline">
              {t('app.tagline.attribution')}
            </span>
          </span>
        ) : (
          <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {t('app.tagline')}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span data-tour="location"><LocationPicker /></span>
        <NotificationsDialog settings={settings} />
        <CompactToggle settings={settings} />
        <WidgetToggle />
        <ThemeToggle />
        <span data-tour="settings"><SettingsDialog settings={settings} /></span>
      </div>
    </header>
  );
}
