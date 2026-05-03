import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { autoUpdater, UpdateInfo, ProgressInfo } from 'electron-updater';
import log from 'electron-log/main';

/**
 * Set to `true` ONLY once the build pipeline produces Authenticode-signed
 * `.exe`s and electron-builder publishes signature files. While `false`,
 * the updater notifies the user that a new version exists but never
 * downloads/installs — manual download from the public site is required,
 * eliminating the MITM-replaces-the-update attack vector.
 */
const SIGNED_BUILDS = false;
const DOWNLOAD_PAGE = 'https://miqaaat.com/download';

/**
 * electron-updater wiring.
 *
 * The publish endpoint is set in electron/package.json's build.publish config.
 * Until a real endpoint is configured, checks will fail gracefully (errors
 * are logged, not raised to the user) and the app keeps running normally.
 *
 * Flow:
 *   1. On app ready, init with silent-check every hour.
 *   2. When an update is found, download it in the background.
 *   3. When download completes, notify renderer via 'update:downloaded' IPC.
 *   4. UI (renderer) can call 'update:install' to quit + install.
 *   5. Manual check via 'update:check' IPC returns current status.
 */

export type UpdaterStatus =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'available'; version: string }
  | { kind: 'not-available' }
  | { kind: 'downloading'; percent: number; bytesPerSecond: number; transferred: number; total: number }
  | { kind: 'downloaded'; version: string }
  | { kind: 'error'; message: string };

let currentStatus: UpdaterStatus = { kind: 'idle' };
let getMainWindow: () => BrowserWindow | null = () => null;

function setStatus(next: UpdaterStatus): void {
  currentStatus = next;
  log.info(`[updater] status=${next.kind}`, 'args' in next ? next : '');
  const win = getMainWindow();
  if (win && !win.isDestroyed()) {
    win.webContents.send('update:status', next);
  }
}

export function initAutoUpdater(getWin: () => BrowserWindow | null): void {
  getMainWindow = getWin;

  // Route electron-updater logs through electron-log so they end up in a file.
  log.transports.file.level = 'info';
  (autoUpdater as unknown as { logger: unknown }).logger = log;

  // Notify-only mode while builds are unsigned. Downloading + installing
  // an unsigned update is exactly how a MITM ships malware — refuse.
  autoUpdater.autoDownload = SIGNED_BUILDS;
  autoUpdater.autoInstallOnAppQuit = SIGNED_BUILDS;

  autoUpdater.on('checking-for-update', () => setStatus({ kind: 'checking' }));
  autoUpdater.on('update-available', (info: UpdateInfo) =>
    setStatus({ kind: 'available', version: info.version }),
  );
  autoUpdater.on('update-not-available', () =>
    setStatus({ kind: 'not-available' }),
  );
  autoUpdater.on('download-progress', (p: ProgressInfo) =>
    setStatus({
      kind: 'downloading',
      percent: p.percent,
      bytesPerSecond: p.bytesPerSecond,
      transferred: p.transferred,
      total: p.total,
    }),
  );
  autoUpdater.on('update-downloaded', (info: UpdateInfo) =>
    setStatus({ kind: 'downloaded', version: info.version }),
  );
  autoUpdater.on('error', (err: Error) =>
    setStatus({ kind: 'error', message: err.message }),
  );

  registerIpc();

  // Skip in dev — electron-updater can't validate unsigned builds
  // and will spam errors on every boot.
  if (app.isPackaged) {
    void autoUpdater.checkForUpdates().catch((err) => {
      log.warn('[updater] initial check failed:', err?.message);
    });
    // Re-check every hour while running.
    setInterval(
      () => {
        void autoUpdater.checkForUpdates().catch((err) => {
          log.warn('[updater] periodic check failed:', err?.message);
        });
      },
      60 * 60 * 1000,
    );
  } else {
    log.info('[updater] dev build — skipping update checks');
  }
}

function registerIpc(): void {
  ipcMain.handle('update:get-status', () => currentStatus);
  ipcMain.handle('update:check', async () => {
    if (!app.isPackaged) {
      return { kind: 'error', message: 'Update checks disabled in dev builds.' } as UpdaterStatus;
    }
    try {
      const res = await autoUpdater.checkForUpdates();
      return currentStatus;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus({ kind: 'error', message });
      return currentStatus;
    }
  });
  ipcMain.handle('update:install', async () => {
    // While builds are unsigned, never invoke `quitAndInstall()` — instead,
    // open the download page so the user gets a fresh package over TLS
    // from the publisher. Once SIGNED_BUILDS flips true, restore the
    // confirm-and-install path below (commented for future reference).
    if (!SIGNED_BUILDS) {
      await shell.openExternal(DOWNLOAD_PAGE).catch(() => {});
      return { ok: false, reason: 'Manual download required (build not code-signed)' };
    }

    if (currentStatus.kind !== 'downloaded') {
      return { ok: false, reason: `Cannot install from state ${currentStatus.kind}` };
    }
    (app as any)._isQuitting = true;
    autoUpdater.quitAndInstall();
    return { ok: true };
  });
}
