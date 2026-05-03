/**
 * Forward renderer console output and uncaught errors to Electron's main
 * process so everything ends up in one log file. No-op in dev (DevTools
 * console is enough) and in non-Electron browsers.
 *
 * Call once from main.tsx before React mounts.
 */
export function installLogBridge(): void {
  const api = window.electronAPI;
  if (!api?.log) return;

  // Re-entrancy guard: if anything inside the IPC path ever calls
  // console.* (e.g. a future error handler), we'd recurse forever.
  let sending = false;

  const send = (level: 'debug' | 'info' | 'warn' | 'error', args: unknown[]): void => {
    if (sending) return;
    try {
      sending = true;
      const safe = args.map((a) => {
        if (a instanceof Error) return `${a.name}: ${a.message}\n${a.stack ?? ''}`;
        if (typeof a === 'object' && a !== null) {
          try { return JSON.parse(JSON.stringify(a)); }
          catch { return String(a); }
        }
        return a;
      });
      void api.log(level, safe);
    } catch {
      /* never let logging break rendering */
    } finally {
      sending = false;
    }
  };

  const orig = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
    debug: console.debug.bind(console),
  };
  console.log   = (...a: unknown[]) => { orig.log(...a);   send('info', a); };
  console.info  = (...a: unknown[]) => { orig.info(...a);  send('info', a); };
  console.warn  = (...a: unknown[]) => { orig.warn(...a);  send('warn', a); };
  console.error = (...a: unknown[]) => { orig.error(...a); send('error', a); };
  console.debug = (...a: unknown[]) => { orig.debug(...a); send('debug', a); };

  window.addEventListener('error', (e) => {
    send('error', ['window.onerror:', e.message, e.filename, e.lineno, e.colno, e.error]);
  });
  window.addEventListener('unhandledrejection', (e) => {
    send('error', ['unhandledrejection:', e.reason]);
  });
}
