#!/usr/bin/env node
/**
 * One-shot version bump for the whole monorepo.
 *
 *   node scripts/bump-version.mjs patch         # 1.0.0 → 1.0.1
 *   node scripts/bump-version.mjs minor         # 1.0.1 → 1.1.0
 *   node scripts/bump-version.mjs major         # 1.1.0 → 2.0.0
 *   node scripts/bump-version.mjs 1.2.3         # explicit
 *   node scripts/bump-version.mjs patch --push  # ...also push the tag
 *
 * What it does, in order:
 *   1. Aborts if the working tree is dirty (would otherwise sweep
 *      unrelated WIP into the release commit).
 *   2. Bumps version in root + electron + server + client package.json.
 *   3. Refreshes package-lock.json so workspace cross-refs stay in sync.
 *   4. Stages, commits as `chore: release vX.Y.Z`, tags `vX.Y.Z`.
 *   5. With --push: pushes branch + tag, which triggers
 *      .github/workflows/release.yml to build + publish.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// All four package.jsons that carry the same version. If you add a
// workspace, append it here.
const PKGS = [
  'package.json',
  'electron/package.json',
  'server/package.json',
  'client/package.json',
];

const args = process.argv.slice(2);
const bump = args.find((a) => !a.startsWith('--'));
const push = args.includes('--push');

if (!bump) {
  console.error('Usage: bump-version.mjs <patch|minor|major|x.y.z> [--push]');
  process.exit(1);
}

const status = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf8' });
if (status.trim()) {
  console.error('Working tree is dirty — commit or stash first:\n');
  console.error(status);
  process.exit(1);
}

function nextVersion(current, kind) {
  if (/^\d+\.\d+\.\d+/.test(kind)) return kind;
  const parts = current.split(/[.\-]/).slice(0, 3).map(Number);
  const [maj, min, pat] = parts;
  if (kind === 'patch') return `${maj}.${min}.${pat + 1}`;
  if (kind === 'minor') return `${maj}.${min + 1}.0`;
  if (kind === 'major') return `${maj + 1}.0.0`;
  throw new Error(`Unknown bump kind: ${kind}`);
}

const rootPkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
const next = nextVersion(rootPkg.version, bump);

console.log(`Bumping ${rootPkg.version} → ${next}\n`);

for (const p of PKGS) {
  const path = resolve(ROOT, p);
  const pkg = JSON.parse(readFileSync(path, 'utf8'));
  pkg.version = next;
  writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`  ${p}`);
}

console.log('\nRefreshing package-lock.json…');
execSync('npm install --package-lock-only --no-audit --no-fund', {
  cwd: ROOT,
  stdio: 'inherit',
});

const filesToStage = [...PKGS, 'package-lock.json'].join(' ');
execSync(`git add ${filesToStage}`, { cwd: ROOT, stdio: 'inherit' });
execSync(`git commit -m "chore: release v${next}"`, { cwd: ROOT, stdio: 'inherit' });
execSync(`git tag v${next}`, { cwd: ROOT, stdio: 'inherit' });

console.log(`\nTagged v${next}.`);

if (push) {
  console.log('Pushing branch + tag…\n');
  execSync('git push --follow-tags', { cwd: ROOT, stdio: 'inherit' });
  console.log(
    `\nReleased v${next}. Watch the build: https://github.com/bdevgroup/miqaat/actions`,
  );
} else {
  console.log('Next: git push --follow-tags  (or rerun with --push)');
}
