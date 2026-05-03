import { Sparkles } from 'lucide-react';
import { useI18n } from '@/i18n/useI18n';

/**
 * Slim "Jumu'ah Mubarak" ribbon shown directly under the TopBar on Fridays.
 * Static, non-dismissible — it's a positive marker, not a notification.
 */
export function JumuahRibbon() {
  const { t } = useI18n();
  return (
    <div
      className="flex items-center justify-center gap-2 border-b border-primary/30 px-4 py-1.5 text-xs"
      style={{
        backgroundImage:
          'linear-gradient(90deg, hsl(33 60% 55% / 0.12) 0%, hsl(33 60% 55% / 0.22) 50%, hsl(33 60% 55% / 0.12) 100%)',
      }}
      role="status"
    >
      <Sparkles className="h-3 w-3 text-primary" />
      <span className="font-display text-base text-foreground/90">
        {t('jumuah.ribbon.greeting')}
      </span>
      <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {t('jumuah.ribbon.tagline')}
      </span>
    </div>
  );
}
