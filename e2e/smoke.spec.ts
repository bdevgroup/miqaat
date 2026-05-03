import {
  test,
  expect,
  _electron as electron,
  type ElectronApplication,
  type Page,
} from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as os from 'node:os';

const REPO_ROOT = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(REPO_ROOT, 'electron', 'dist-build');

/**
 * Locate the electron-builder --dir output. electron-builder names the
 * folder by platform: win-unpacked / mac / mac-arm64 / linux-unpacked.
 */
function findBinary(): string {
  const candidates = [
    path.join(BUILD_DIR, 'win-unpacked', 'Miqaat.exe'),
    path.join(BUILD_DIR, 'mac', 'Miqaat.app', 'Contents', 'MacOS', 'Miqaat'),
    path.join(BUILD_DIR, 'mac-arm64', 'Miqaat.app', 'Contents', 'MacOS', 'Miqaat'),
    path.join(BUILD_DIR, 'linux-unpacked', 'miqaat'),
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  throw new Error(
    `No packaged Miqāt binary found under ${BUILD_DIR}.\n` +
      `Run \`npm run test:e2e:setup\` first to produce the unpacked build.`,
  );
}

let app: ElectronApplication;
let page: Page;
const consoleMessages: Array<{ type: string; text: string }> = [];
let userDataDir: string;

test.describe.serial('Miqāt electron app boot', () => {
  test.beforeAll(async () => {
    userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'miqaat-e2e-'));
    const bin = findBinary();
    // Scrub env vars that would make Electron exit as a Node runtime instead
    // of starting the app — ELECTRON_RUN_AS_NODE often lingers after an
    // electron-builder native-rebuild step.
    const env = { ...process.env };
    delete env.ELECTRON_RUN_AS_NODE;
    delete env.ELECTRON_NO_ATTACH_CONSOLE;

    app = await electron.launch({
      executablePath: bin,
      // Isolate the app from the real user's data and settings.
      args: [`--user-data-dir=${userDataDir}`],
      env,
      timeout: 45_000,
    });
    page = await app.firstWindow({ timeout: 30_000 });
    page.on('console', (msg) => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
    });
    page.on('pageerror', (err) => {
      consoleMessages.push({ type: 'pageerror', text: err.message });
    });
    await page.waitForLoadState('domcontentloaded');

    // Fresh userData has no saved location, so the prayer grid renders an
    // empty state. Seed Casablanca + flip onboarded=true so the dashboard
    // and grid both render on reload.
    await page.waitForFunction(() => Boolean((window as { __API_URL__?: string }).__API_URL__), {
      timeout: 20_000,
    });
    await page.evaluate(async () => {
      const api = (window as { __API_URL__?: string }).__API_URL__!;
      await fetch(`${api}/api/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboarded: 'true' }),
      });
      await fetch(`${api}/api/locations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Casablanca',
          city: 'Casablanca',
          country: 'Morocco',
          lat: 33.5731,
          lng: -7.5898,
          timezone: 'Africa/Casablanca',
          makeCurrent: true,
        }),
      });
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
  });

  test.afterAll(async () => {
    try {
      await app?.close();
    } catch {
      /* ignore shutdown errors */
    }
    if (userDataDir) {
      try {
        fs.rmSync(userDataDir, { recursive: true, force: true });
      } catch {
        /* best effort */
      }
    }
  });

  test('main window is visible with Miqāt title', async () => {
    expect(app.windows().length).toBeGreaterThan(0);
    const title = await page.title();
    expect(title.toLowerCase()).toMatch(/miq/);
  });

  test('prayer grid renders all six prayers', async () => {
    const grid = page.getByTestId('prayer-grid');
    await expect(grid).toBeVisible({ timeout: 30_000 });
    const cards = page.locator('[data-prayer]');
    await expect(cards).toHaveCount(6, { timeout: 20_000 });
    for (const name of ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']) {
      await expect(page.locator(`[data-prayer="${name}"]`)).toBeVisible();
    }
  });

  test('brand logo initial state is wordmark', async () => {
    const logo = page.locator('[data-brand-state]').first();
    await expect(logo).toBeVisible({ timeout: 15_000 });
    await expect(logo).toHaveAttribute('data-brand-state', 'wordmark');
  });

  test('brand state machine rotates to sundial', async () => {
    // LogoMark rotates to the sundial face every ~20 s (ROTATE_EVERY_MS).
    test.slow();
    const logo = page.locator('[data-brand-state]').first();
    await expect
      .poll(async () => await logo.getAttribute('data-brand-state'), {
        timeout: 35_000,
        intervals: [2000, 2000, 2000, 2000],
      })
      .toBe('sundial');
  });

  test('no CSP violations in console', async () => {
    const cspErrors = consoleMessages.filter((m) =>
      /Refused to|Content Security Policy|violates the following directive/i.test(m.text),
    );
    expect(cspErrors, cspErrors.map((e) => `[${e.type}] ${e.text}`).join('\n')).toEqual([]);
  });

  test('no uncaught page errors in console', async () => {
    const pageErrors = consoleMessages.filter((m) => m.type === 'pageerror');
    expect(pageErrors, pageErrors.map((e) => e.text).join('\n')).toEqual([]);
  });

  test('window stays alive after tray-init branch', async () => {
    // Whether or not the tray icon file exists, the main window must remain
    // open. tray.ts has a graceful fallback that just logs a warning and
    // returns null; we verify the app survives either path.
    await page.waitForTimeout(500);
    expect(app.windows().length).toBeGreaterThan(0);
    const stillVisible = await page.evaluate(() => document.visibilityState);
    expect(['visible', 'hidden', 'prerender']).toContain(stillVisible);
  });
});
