import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getAutoLaunch: (): Promise<boolean> => ipcRenderer.invoke('app:get-auto-launch'),
  setAutoLaunch: (enabled: boolean): Promise<boolean> =>
    ipcRenderer.invoke('app:set-auto-launch', enabled),
  toggleWidget: (): Promise<boolean> => ipcRenderer.invoke('widget:toggle'),
  openExternal: (url: string): Promise<{ ok: boolean; reason?: string }> =>
    ipcRenderer.invoke('app:open-external', url),

  // Auto-updater
  getUpdateStatus: () => ipcRenderer.invoke('update:get-status'),
  checkForUpdates: () => ipcRenderer.invoke('update:check'),
  installUpdate: () => ipcRenderer.invoke('update:install'),
  onUpdateStatus: (cb: (status: unknown) => void) => {
    const handler = (_e: unknown, status: unknown) => cb(status);
    ipcRenderer.on('update:status', handler);
    return () => ipcRenderer.removeListener('update:status', handler);
  },

  // Logging — renderer forwards console output to main's electron-log so
  // the packaged app produces a single debuggable log file.
  log: (level: 'debug' | 'info' | 'warn' | 'error', args: unknown[]): Promise<boolean> =>
    ipcRenderer.invoke('log:write', level, args),
  openLogsFolder: (): Promise<boolean> => ipcRenderer.invoke('log:open-folder'),
  getLogPath: (): Promise<string> => ipcRenderer.invoke('log:get-path'),

  // Tell main to recompute prayer-time timers. Renderer calls this after a
  // settings mutation success so the next athan firing uses fresh values.
  refreshAthanSchedule: (): Promise<boolean> =>
    ipcRenderer.invoke('athan:refresh-schedule'),
  // The popup window subscribes here so the main process can tell it
  // "another athan is starting, reload".
  onAthanUpdate: (cb: (payload: unknown) => void) => {
    const handler = (_e: unknown, payload: unknown) => cb(payload);
    ipcRenderer.on('athan:update', handler);
    return () => ipcRenderer.removeListener('athan:update', handler);
  },

  isElectron: () => true,
});
