import * as path from 'node:path';
import * as http from 'node:http';
import { app } from 'electron';

/**
 * Start the NestJS server in-process. In dev, we expect the server to be
 * running already via npm run dev:server. In packaged builds, we require()
 * the compiled server/main.js from extraResources.
 */
export async function startNestServer(port: number): Promise<void> {
  const isPackaged = app.isPackaged;
  if (isPackaged) {
    process.env.PORT = String(port);
    const serverEntry = path.join(process.resourcesPath, 'server', 'main.js');
    const mod = require(serverEntry);
    if (typeof mod.bootstrap === 'function') {
      await mod.bootstrap(port);
    }
  }
  await waitForServer(port);
}

export function waitForServer(port: number, retries = 240, intervalMs = 250): Promise<void> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      const req = http.get(`http://127.0.0.1:${port}/api/health`, (res) => {
        if (res.statusCode === 200) return resolve();
        retry();
      });
      req.on('error', retry);
      req.setTimeout(2000, () => { req.destroy(); retry(); });
    };
    const retry = () => {
      if (++attempts >= retries) return reject(new Error('Server not ready'));
      setTimeout(check, intervalMs);
    };
    check();
  });
}
