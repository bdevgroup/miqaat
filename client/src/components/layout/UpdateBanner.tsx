import { Button } from '@/components/ui/button';
import { Download, RefreshCw, AlertCircle } from 'lucide-react';
import { useUpdater } from '@/hooks/useUpdater';
import { useI18n } from '@/i18n/useI18n';
import { cn } from '@/lib/cn';

/**
 * Renders a thin banner above the TopBar when an update is available or
 * downloaded. Invisible otherwise. Only mounts in Electron.
 */
export function UpdateBanner() {
  const { supported, status, installUpdate } = useUpdater();
  const { t } = useI18n();

  if (!supported) return null;
  if (status.kind === 'idle' || status.kind === 'checking' || status.kind === 'not-available') {
    return null;
  }

  const base = 'flex items-center justify-between gap-3 border-b px-6 py-1.5 text-sm';

  if (status.kind === 'error') {
    // Don't surface update errors to the user unless we want to — silent in v1.
    return null;
  }

  if (status.kind === 'available') {
    return (
      <div className={cn(base, 'bg-accent/40 text-accent-foreground')}>
        <div className="flex items-center gap-2">
          <Download className="h-3.5 w-3.5" />
          <span>{t('update.available')} (v{status.version})</span>
        </div>
      </div>
    );
  }

  if (status.kind === 'downloading') {
    return (
      <div className={cn(base, 'bg-accent/40 text-accent-foreground')}>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          <span>{t('update.downloading')} — {status.percent.toFixed(0)}%</span>
        </div>
        <div className="h-1 flex-1 max-w-48 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-primary transition-[width]"
            style={{ width: `${status.percent}%` }}
          />
        </div>
      </div>
    );
  }

  if (status.kind === 'downloaded') {
    return (
      <div className={cn(base, 'bg-primary/10 text-foreground')}>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-primary" />
          <span>{t('update.ready')} (v{status.version})</span>
        </div>
        <Button size="sm" onClick={() => installUpdate()}>
          {t('update.install')}
        </Button>
      </div>
    );
  }

  return null;
}
