import Module from 'node:module';
import * as path from 'node:path';

/**
 * Patches Module._resolveFilename so that when a require() call from code
 * living in extraResources (e.g. server/main.js) can't resolve a module,
 * we retry with paths pointing at the electron package's own node_modules
 * (asar-packed, shared). This is the trick that lets us run NestJS in-process
 * without bundling server/node_modules (saves ~200MB).
 */
export function installResolveShim(appRoot: string): void {
  const orig = (Module as any)._resolveFilename as (
    request: string, parent: any, ...rest: any[]
  ) => string;

  const appModules = path.join(appRoot, 'node_modules');
  const unpackedRoot = appRoot.includes(`${path.sep}app.asar${path.sep}`)
    ? appRoot.replace(`${path.sep}app.asar${path.sep}`, `${path.sep}app.asar.unpacked${path.sep}`)
    : appRoot;
  const unpackedModules = path.join(unpackedRoot, 'node_modules');

  (Module as any)._resolveFilename = function (
    request: string,
    parent: any,
    ...rest: any[]
  ) {
    try {
      return orig.call(this, request, parent, ...rest);
    } catch (err) {
      try {
        return orig.call(
          this,
          request,
          { ...(parent || {}), paths: [appModules, unpackedModules] },
          ...rest,
        );
      } catch {
        throw err;
      }
    }
  };
}
