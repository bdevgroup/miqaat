export {};

declare global {
  type UpdaterStatus =
    | { kind: 'idle' }
    | { kind: 'checking' }
    | { kind: 'available'; version: string }
    | { kind: 'not-available' }
    | { kind: 'downloading'; percent: number; bytesPerSecond: number; transferred: number; total: number }
    | { kind: 'downloaded'; version: string }
    | { kind: 'error'; message: string };

  interface Window {
    __API_URL__?: string;
    electronAPI?: {
      getAutoLaunch(): Promise<boolean>;
      setAutoLaunch(enabled: boolean): Promise<boolean>;
      toggleWidget(): Promise<boolean>;
      openExternal(url: string): Promise<{ ok: boolean; reason?: string }>;
      getUpdateStatus(): Promise<UpdaterStatus>;
      checkForUpdates(): Promise<UpdaterStatus>;
      installUpdate(): Promise<{ ok: boolean; reason?: string }>;
      onUpdateStatus(cb: (status: UpdaterStatus) => void): () => void;
      log(level: 'debug' | 'info' | 'warn' | 'error', args: unknown[]): Promise<boolean>;
      openLogsFolder(): Promise<boolean>;
      getLogPath(): Promise<string>;
      refreshAthanSchedule(): Promise<boolean>;
      onAthanUpdate(cb: (payload: unknown) => void): () => void;
      isElectron(): boolean;
    };
  }
}
