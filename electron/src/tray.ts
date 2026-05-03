import { Tray, Menu, nativeImage, app, BrowserWindow, shell } from 'electron';
import log from 'electron-log/main';
import * as path from 'node:path';
import * as fs from 'node:fs';

let tray: Tray | null = null;

export function createTray(
  getMainWindow: () => BrowserWindow | null,
  onToggleWidget?: () => void,
): Tray | null {
  const iconPath = path.join(app.getAppPath(), 'resources', 'tray-32.png');
  // Graceful fallback: skip tray if icon isn't present yet (dev without assets)
  if (!fs.existsSync(iconPath)) {
    console.warn(`[tray] tray-32.png not found at ${iconPath} — skipping tray icon.`);
    return null;
  }
  const img = nativeImage.createFromPath(iconPath);
  tray = new Tray(img);

  const menu = Menu.buildFromTemplate([
    {
      label: 'Show Miqāt',
      click: () => {
        const w = getMainWindow();
        if (w) {
          if (w.isMinimized()) w.restore();
          w.show();
          w.focus();
        }
      },
    },
    {
      label: 'Hide',
      click: () => getMainWindow()?.hide(),
    },
    { type: 'separator' },
    {
      label: 'Toggle widget',
      click: () => onToggleWidget?.(),
      visible: !!onToggleWidget,
    },
    { type: 'separator' },
    {
      label: 'Open logs folder',
      click: () => {
        const file = log.transports.file.getFile().path;
        shell.showItemInFolder(file);
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Miqāt');
  tray.setContextMenu(menu);
  tray.on('click', () => {
    const w = getMainWindow();
    if (!w) return;
    if (w.isVisible()) w.hide();
    else { w.show(); w.focus(); }
  });

  return tray;
}

export function destroyTray(): void {
  tray?.destroy();
  tray = null;
}
