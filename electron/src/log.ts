import { app, ipcMain, shell } from 'electron';
import log from 'electron-log/main';
import * as path from 'node:path';

/**
 * Centralised logging. Every output channel (electron main, preloaded
 * renderer, in-process NestJS server, captured stdout/stderr) routes through
 * here so the user gets one file they can attach to a bug report.
 *
 * File location: <userData>/logs/main.log (rotated at 5 MB).
 *
 * Levels are unified (debug/info/warn/error) and prefixed with a scope so
 * `[server]`, `[renderer]`, `[updater]` etc. are visible at a glance.
 */
export function initLogger(): void {
  const logsDir = path.join(app.getPath('userData'), 'logs');
  log.transports.file.resolvePathFn = () => path.join(logsDir, 'main.log');
  log.transports.file.level = 'info';
  log.transports.file.maxSize = 5 * 1024 * 1024; // 5 MB
  log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';

  // CRITICAL: keep electron-log from writing back to process.stdout. The
  // stdout/stderr capture below would catch those writes and re-feed them
  // into log.info, producing infinite recursion (a single message exploded
  // to 5 MB in <1 second on prior versions, OOM-crashing the renderer).
  // The original stdout is still preserved by patchProcessStreams below
  // (we call origWrite), so devtools/console output stays visible in dev.
  log.transports.console.level = false;

  // Capture raw stdout/stderr writes — Nest's ConsoleLogger writes directly
  // to process.stdout, not via console.log. Without this hook the server's
  // request logs would never reach the file. Recursion is bounded by the
  // _capturing flag below.
  patchProcessStreams();

  registerIpc();

  log.info('[main] logger initialized');
  log.info(`[main] log file: ${log.transports.file.getFile().path}`);
}

/**
 * Re-entrancy guard. If anything inside the electron-log call chain ever
 * writes back to stdout/stderr (a transport, a future plugin, a third-party
 * patch), we'll skip capturing it and break the recursion. Cheap to check.
 */
let _capturing = false;

function patchProcessStreams(): void {
  const wrap = (
    stream: NodeJS.WriteStream,
    level: 'info' | 'error',
    scope: string,
  ): void => {
    const origWrite = stream.write.bind(stream);
    stream.write = ((chunk: unknown, ...rest: unknown[]) => {
      if (!_capturing) {
        try {
          _capturing = true;
          const text =
            typeof chunk === 'string'
              ? chunk
              : Buffer.isBuffer(chunk)
                ? chunk.toString('utf8')
                : String(chunk);
          const trimmed = text.replace(/\n+$/, '');
          if (trimmed) log[level](scope, trimmed);
        } catch {
          /* swallow — never let logging break a write */
        } finally {
          _capturing = false;
        }
      }
      return origWrite(chunk as never, ...(rest as []));
    }) as NodeJS.WriteStream['write'];
  };
  wrap(process.stdout, 'info', '[server]');
  wrap(process.stderr, 'error', '[server]');
}

function registerIpc(): void {
  ipcMain.handle(
    'log:write',
    (
      _e,
      level: 'debug' | 'info' | 'warn' | 'error',
      args: unknown[],
    ) => {
      const fn = log[level] ?? log.info;
      fn('[renderer]', ...args);
      return true;
    },
  );
  ipcMain.handle('log:open-folder', async () => {
    const file = log.transports.file.getFile();
    await shell.showItemInFolder(file.path);
    return true;
  });
  ipcMain.handle('log:get-path', () => log.transports.file.getFile().path);
}
