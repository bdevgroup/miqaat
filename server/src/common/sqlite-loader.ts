import * as path from 'node:path';

export function loadBetterSqlite3(): any {
  try {
    return require('better-sqlite3');
  } catch (err) {
    // process.resourcesPath is only defined in Electron; guard with any-cast
    const resourcesPath = (process as unknown as { resourcesPath?: string }).resourcesPath;
    if (resourcesPath) {
      const unpacked = path.join(
        resourcesPath,
        'app.asar.unpacked',
        'node_modules',
        'better-sqlite3',
      );
      return require(unpacked);
    }
    throw err;
  }
}
