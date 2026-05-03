import { BrowserWindow, app, screen } from 'electron';
import * as path from 'node:path';
import log from 'electron-log/main';

export interface AthanPopupOpts {
  prayer: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  /** ISO timestamp (UTC) of the prayer time. Used to drive audio + elapsed timer. */
  iso: string;
  /** Reciter id ('makkah' | 'madina' | … | 'custom:<n>'). Empty = use settings default. */
  reciterId?: string;
  /** Play dua-after-athan when athan ends. */
  playDuaAfter?: boolean;
  apiUrl: string;
  devURL?: string;
  prodIndex?: string;
}

let popup: BrowserWindow | null = null;

/**
 * Spawns a small always-on-top window that plays the athan and then becomes
 * an "elapsed since prayer" counter. Owns its own audio so it works even
 * when the main window is hidden in the tray (which would otherwise have
 * Chromium throttling its renderer's setInterval and missing the firing).
 */
export function openAthanPopup(opts: AthanPopupOpts): void {
  if (popup && !popup.isDestroyed()) {
    popup.show();
    popup.focus();
    popup.webContents.send('athan:update', opts);
    return;
  }

  const display = screen.getPrimaryDisplay();
  const { width: screenW, height: screenH } = display.workAreaSize;
  const w = 380;
  const h = 220;

  popup = new BrowserWindow({
    width: w,
    height: h,
    x: screenW - w - 24,
    y: screenH - h - 24,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    skipTaskbar: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    show: false,
    backgroundColor: '#00000000',
    title: 'Miqāt — Athan',
    icon: app.isPackaged
      ? path.join(app.getAppPath(), 'resources', process.platform === 'win32' ? 'icon.ico' : 'icon.png')
      : undefined,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: path.join(__dirname, 'preload.js'),
      // Athan audio is exactly the case Chromium's autoplay policy was
      // designed to block — programmatic play with no user gesture. We
      // need it to fire regardless.
      autoplayPolicy: 'no-user-gesture-required',
      // Without this, when the main window is hidden in the tray and the
      // popup itself is the active window, Windows can still throttle the
      // popup's timers because Chromium does so per-process. Off entirely
      // for this short-lived window.
      backgroundThrottling: false,
    },
  });

  const params = new URLSearchParams({
    mode: 'athan-popup',
    prayer: opts.prayer,
    iso: opts.iso,
    reciterId: opts.reciterId ?? '',
    playDuaAfter: opts.playDuaAfter ? '1' : '0',
  });

  const url = opts.devURL
    ? `${opts.devURL}/?${params.toString()}`
    : `file://${opts.prodIndex}?${params.toString()}`;

  log.info(`[athan-popup] opening for ${opts.prayer} (${opts.iso})`);

  popup.loadURL(url).catch((err) => {
    log.error(`[athan-popup] loadURL failed: ${(err as Error).message}`);
  });

  popup.webContents.on('did-finish-load', () => {
    popup?.webContents.executeJavaScript(
      `window.__API_URL__ = "${opts.apiUrl}";`,
    ).catch(() => {});
  });

  popup.once('ready-to-show', () => {
    popup?.show();
  });

  popup.on('closed', () => { popup = null; });
}

export function closeAthanPopup(): void {
  if (popup && !popup.isDestroyed()) popup.close();
  popup = null;
}
