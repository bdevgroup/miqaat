import { Button } from '@/components/ui/button';
import { Download, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { useUpdater } from '@/hooks/useUpdater';
import { useI18n } from '@/i18n/useI18n';
import { cn } from '@/lib/cn';

const RELEASES_URL = 'https://github.com/bdevgroup/miqaat/releases/latest';

/**
 * Renders a thin banner above the TopBar when an update is available or
 * downloaded. Invisible otherwise. Only mounts in Electron.
 *
 * Why every state offers a "Download from GitHub" escape hatch:
 *   electron-updater's auto-install path needs a code-signed binary on
 *   both Windows and macOS — Apple's installer refuses to swap a
 *   running .app bundle that isn't signed by the same Developer ID,
 *   and Windows SmartScreen blocks unsigned installers. Until we have
 *   a Developer cert, the auto-update flow gets stuck on
 *   "Update available" with no way forward. The fallback button
 *   takes the user to the GitHub release page where they can grab
 *   the matching DMG/zip and install manually with the documented
 *   xattr/SmartScreen workaround.
 *
 *   When code signing lands, the auto-install path will work and
 *   the fallback becomes purely a redundant option.
 */
export function UpdateBanner() {
  const { supported, status, installUpdate } = useUpdater();
  const { t } = useI18n();

  if (!supported) return null;
  if (status.kind === 'idle' || status.kind === 'checking' || status.kind === 'not-available') {
    return null;
  }

  const base = 'flex items-center justify-between gap-3 border-b px-6 py-1.5 text-sm';

  const openReleases = () => {
    window.electronAPI?.openExternal(RELEASES_URL);
  };

  if (status.kind === 'error') {
    // Surface as "available with manual fallback" — the user already
    // saw the version exists; just give them a way to get it.
    return (
      <div className={cn(base, 'bg-accent/40 text-accent-foreground')}>
        <div className="flex items-center gap-2">
          <Download className="h-3.5 w-3.5" />
          <span>{t('update.available')}</span>
        </div>
        <Button size="sm" variant="outline" onClick={openReleases}>
          <ExternalLink className="h-3.5 w-3.5" />
          {t('update.download')}
        </Button>
      </div>
    );
  }

  if (status.kind === 'available') {
    return (
      <div className={cn(base, 'bg-accent/40 text-accent-foreground')}>
        <div className="flex items-center gap-2">
          <Download className="h-3.5 w-3.5" />
          <span>{t('update.available')} (v{status.version})</span>
        </div>
        <Button size="sm" variant="outline" onClick={openReleases}>
          <ExternalLink className="h-3.5 w-3.5" />
          {t('update.download')}
        </Button>
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
        <div className="flex items-center gap-3">
          <div className="h-1 w-24 overflow-hidden rounded-full bg-secondary md:w-40">
            <div
              className="h-full bg-primary transition-[width]"
              style={{ width: `${status.percent}%` }}
            />
          </div>
          <Button size="sm" variant="outline" onClick={openReleases}>
            <ExternalLink className="h-3.5 w-3.5" />
            {t('update.download')}
          </Button>
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
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={openReleases}>
            <ExternalLink className="h-3.5 w-3.5" />
            {t('update.download')}
          </Button>
          <Button size="sm" onClick={() => installUpdate()}>
            {t('update.install')}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
