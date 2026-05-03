import 'reflect-metadata';
import { app, BrowserWindow, dialog, ipcMain, session, shell } from 'electron';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { installResolveShim } from './resolve-shim';
import { findFreePort } from './port-scanner';
import { startNestServer } from './server-runner';
import { createTray, destroyTray } from './tray';
import { toggleWidget, closeWidget } from './widget-window';
import { initAutoUpdater } from './auto-updater';
import { initLogger } from './log';
import { refreshAthanSchedule, type SchedulerCtx } from './athan-scheduler';

const APP_SLUG = 'miqaat';
const APP_USER_MODEL_ID = 'com.developbettersolutions.miqaat';

// Legacy path from the pre-rebrand (com.noos.mothern-athan). If the user is
// upgrading from that version, we move their DB + settings across once.
const LEGACY_APP_SLUG = 'mothern-athan';
const LEGACY_PRODUCT_NAME = 'Mothern Athan';

let mainWindow: BrowserWindow | null = null;
let serverPort = 0;

const isDev = !app.isPackaged;

async function bootstrap(): Promise<void> {
  app.setAppUserModelId(APP_USER_MODEL_ID);

  // DB lives in userData so it survives app updates
  const userDataPath = app.getPath('userData');
  if (!fs.existsSync(userDataPath)) fs.mkdirSync(userDataPath, { recursive: true });

  // Logger first — captures stdout/stderr from the in-process server too.
  initLogger();

  const dbPath = path.join(userDataPath, `${APP_SLUG}.db`);
  migrateLegacyDb(dbPath);
  process.env.DB_PATH = dbPath;

  // Install resolve shim before requiring the bundled server
  installResolveShim(app.getAppPath());

  if (isDev) {
    serverPort = Number(process.env.PORT ?? 3001);
    // In dev the server is started by `npm run dev:server`; we just wait.
  } else {
    const free = await findFreePort(3001, 3010);
    if (!free) {
      dialog.showErrorBox(
        'Port Unavailable',
        'No port between 3001 and 3010 is available. Please close other apps using these ports.',
      );
      app.quit();
      return;
    }
    serverPort = free;
  }

  try {
    await startNestServer(serverPort);
  } catch (err) {
    dialog.showErrorBox('Server failed to start', String(err));
    app.quit();
    return;
  }

  registerIpcHandlers();
  installTileHeaderInterceptor();
  await createMainWindow();
  const tray = createTray(
    () => mainWindow,
    () =>
      toggleWidget({
        devURL: isDev ? 'http://localhost:5173' : undefined,
        prodIndex: isDev ? undefined : path.join(process.resourcesPath, 'client', 'index.html'),
        apiUrl: `http://127.0.0.1:${serverPort}`,
      }),
  );
  (app as any)._hasTray = !!tray;

  initAutoUpdater(() => mainWindow);

  // Athan auto-popup. Schedules a setTimeout per upcoming prayer in the
  // main process, so it fires regardless of whether the main window is
  // visible/throttled. The window will pop up at prayer time, play the
  // athan, then become an "elapsed since prayer" counter.
  const schedulerCtx: SchedulerCtx = {
    apiUrl: `http://127.0.0.1:${serverPort}`,
    port: serverPort,
    devURL: isDev ? 'http://localhost:5173' : undefined,
    prodIndex: isDev ? undefined : path.join(process.resourcesPath, 'client', 'index.html'),
  };
  void refreshAthanSchedule(schedulerCtx);
  ipcMain.handle('athan:refresh-schedule', () => {
    void refreshAthanSchedule(schedulerCtx);
    return true;
  });
}

/**
 * One-time migration: if the user ran the old "Mothern Athan" build, copy
 * the SQLite file from its legacy userData path into the new Miqāt location.
 * Idempotent — skips if new DB already exists or legacy DB is missing.
 */
function migrateLegacyDb(newDbPath: string): void {
  if (fs.existsSync(newDbPath)) return;

  // Electron's app.getPath('userData') is productName-derived. The legacy
  // productName was "Mothern Athan". Back out the current userData path to
  // its parent (AppData/Roaming on Windows, Library/Application Support on
  // macOS), then probe the legacy folder name.
  const userDataParent = path.dirname(app.getPath('userData'));
  const legacyDir = path.join(userDataParent, LEGACY_PRODUCT_NAME);
  const legacyDb = path.join(legacyDir, `${LEGACY_APP_SLUG}.db`);

  if (!fs.existsSync(legacyDb)) return;

  try {
    fs.copyFileSync(legacyDb, newDbPath);
    // Bring along WAL + shm files if they exist (active connection state).
    for (const ext of ['-wal', '-shm']) {
      const src = legacyDb + ext;
      if (fs.existsSync(src)) fs.copyFileSync(src, newDbPath + ext);
    }
    console.log(`[migrate] copied legacy DB ${legacyDb} → ${newDbPath}`);
  } catch (err) {
    console.warn(`[migrate] legacy DB copy failed: ${(err as Error).message}`);
  }
}

/**
 * OSM's tile usage policy requires a valid User-Agent identifying the app
 * and a Referer header. Packaged Electron loads from `file://` so no Referer
 * gets sent automatically — tile servers respond 403. Inject both for
 * tile.openstreetmap.org (and the load-balanced subdomains) only, so we don't
 * pollute every other request.
 */
function installTileHeaderInterceptor(): void {
  const ua = `Miqaat/${app.getVersion()} (https://miqaaat.com; contact@miqaaat.com)`;
  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ['https://*.tile.openstreetmap.org/*', 'https://tile.openstreetmap.org/*'] },
    (details, cb) => {
      const headers = { ...details.requestHeaders };
      headers['User-Agent'] = ua;
      headers['Referer'] = 'https://miqaaat.com/';
      cb({ requestHeaders: headers });
    },
  );
}

/**
 * Allowlist of (host) and schemes the renderer is permitted to open via
 * `app:open-external`. Without this, an XSS in the renderer could redirect
 * the user to an arbitrary phishing page through `shell.openExternal`.
 *
 * Add new entries deliberately — every domain here is a place a malicious
 * page can send the user one click away from the official Miqāt experience.
 */
const EXTERNAL_HOST_ALLOWLIST = new Set<string>([
  'miqaaat.com',
  'www.miqaaat.com',
  'updates.miqaaat.com',
  'github.com',         // public repo + releases
  'develop-better-solutions.com',  // publisher
  'paypal.me',          // support/donations
  'quran.com',          // Quran reading link
  'qurango.net',        // radio
  'aladhan.com',        // referenced in docs / about
]);

function isExternalUrlAllowed(raw: string): boolean {
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > 2000) return false;
  // mailto:/tel: don't have a useful host — just accept the scheme.
  if (/^(mailto:|tel:)/i.test(raw)) return true;
  let parsed: URL;
  try { parsed = new URL(raw); } catch { return false; }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
  // Match host exactly OR any subdomain of an allowlisted host.
  const host = parsed.hostname.toLowerCase();
  for (const allowed of EXTERNAL_HOST_ALLOWLIST) {
    if (host === allowed || host.endsWith('.' + allowed)) return true;
  }
  return false;
}

function registerIpcHandlers(): void {
  ipcMain.handle('app:get-auto-launch', () => {
    return app.getLoginItemSettings().openAtLogin;
  });
  ipcMain.handle('app:set-auto-launch', (_e, enabled: boolean) => {
    app.setLoginItemSettings({
      openAtLogin: Boolean(enabled),
      path: process.execPath,
      args: [],
    });
    return app.getLoginItemSettings().openAtLogin;
  });
  ipcMain.handle('widget:toggle', () => {
    toggleWidget({
      devURL: isDev ? 'http://localhost:5173' : undefined,
      prodIndex: isDev ? undefined : path.join(process.resourcesPath, 'client', 'index.html'),
      apiUrl: `http://127.0.0.1:${serverPort}`,
    });
    return true;
  });
  ipcMain.handle('app:open-external', (_e, url: string) => {
    if (!isExternalUrlAllowed(url)) {
      return { ok: false, reason: 'URL not in allowlist' };
    }
    shell.openExternal(url).catch(() => {});
    return { ok: true };
  });
}

async function createMainWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    show: false,
    backgroundColor: '#0e0d0b',
    title: 'Miqāt',
    icon: isDev
      ? undefined
      : path.join(app.getAppPath(), 'resources', process.platform === 'win32' ? 'icon.ico' : 'icon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: path.join(__dirname, 'preload.js'),
      // Chromium blocks audio.play() without a user gesture by default. For
      // an Athan app we need scheduled playback the user didn't click for.
      autoplayPolicy: 'no-user-gesture-required',
    },
  });

  mainWindow.removeMenu();

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.executeJavaScript(
      `window.__API_URL__ = "http://127.0.0.1:${serverPort}";`,
    );
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('close', (e) => {
    // Hide to tray instead of quitting on close — only if tray exists
    if (!(app as any)._isQuitting && (app as any)._hasTray) {
      e.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  if (isDev) {
    await mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    const indexHtml = path.join(process.resourcesPath, 'client', 'index.html');
    await mainWindow.loadFile(indexHtml);
  }
}

app.whenReady().then(bootstrap).catch((err) => {
  dialog.showErrorBox('Fatal startup error', String(err));
  app.quit();
});

app.on('window-all-closed', () => {
  // Keep app alive in tray if present; otherwise quit (except macOS)
  if ((app as any)._hasTray) return;
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => { (app as any)._isQuitting = true; closeWidget(); });
app.on('will-quit', () => { destroyTray(); });

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow().catch(console.error);
  } else {
    mainWindow.show();
  }
});
