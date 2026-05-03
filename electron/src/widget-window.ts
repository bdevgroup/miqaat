import { BrowserWindow, app, screen } from 'electron';
import * as path from 'node:path';

let widget: BrowserWindow | null = null;

export function getWidget(): BrowserWindow | null {
  return widget;
}

export function toggleWidget(args: { devURL?: string; prodIndex?: string; apiUrl: string }): void {
  if (widget && !widget.isDestroyed()) {
    if (widget.isVisible()) widget.hide();
    else { widget.show(); widget.focus(); }
    return;
  }
  createWidget(args);
}

export function createWidget(args: { devURL?: string; prodIndex?: string; apiUrl: string }): void {
  const display = screen.getPrimaryDisplay();
  const { width: sw } = display.workAreaSize;

  widget = new BrowserWindow({
    width: 320,
    height: 140,
    x: sw - 340,
    y: 20,
    frame: false,
    transparent: true,
    resizable: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  widget.setAlwaysOnTop(true, 'floating');
  widget.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  widget.webContents.on('did-finish-load', () => {
    widget?.webContents.executeJavaScript(
      `window.__API_URL__ = "${args.apiUrl}";`,
    );
  });

  if (args.devURL) {
    widget.loadURL(`${args.devURL}?mode=widget`);
  } else if (args.prodIndex) {
    widget.loadFile(args.prodIndex, { search: 'mode=widget' });
  }

  widget.on('closed', () => {
    widget = null;
  });
}

export function closeWidget(): void {
  if (widget && !widget.isDestroyed()) {
    widget.close();
    widget = null;
  }
}
