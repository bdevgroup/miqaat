#!/usr/bin/env node
/**
 * Generate the Miqāt brand icon set from `client/public/favicon.svg`.
 *
 * Output (placed in `electron/resources/`):
 *   - icon.ico      — 256×256 single-size ICO for the Windows installer +
 *                     packaged executable
 *   - icon.png      — 512×512 PNG for macOS / generic platforms
 *   - tray-32.png   — pixel-perfect 32×32 PNG for the system tray
 *
 * Why these exact sizes:
 *   - electron-builder picks `icon.ico` (Windows) and `icon.png` (mac/linux)
 *     for the packaged app + installer. 256×256 is the canonical single-size
 *     ICO; multi-size ICOs render blurry on Win10's task switcher.
 *   - The tray icon must be EXACTLY 32×32 — Electron's runtime resize is
 *     blurry on high-DPI Windows displays, so we ship the pre-sized asset.
 *
 * Re-run any time `favicon.svg` changes:
 *   npm run generate:icons
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SVG_PATH = join(ROOT, 'client', 'public', 'favicon.svg');
const OUT_DIR = join(ROOT, 'electron', 'resources');

async function main() {
  const svg = await readFile(SVG_PATH);
  await mkdir(OUT_DIR, { recursive: true });

  // 256×256 PNG → wrap into a single-size .ico
  const png256 = await sharp(svg, { density: 384 })
    .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const icoBuf = await pngToIco(png256);
  await writeFile(join(OUT_DIR, 'icon.ico'), icoBuf);
  console.log(`✓ icon.ico  (256×256, ${icoBuf.length.toLocaleString()} bytes)`);

  // 512×512 PNG for macOS / generic
  await sharp(svg, { density: 768 })
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(OUT_DIR, 'icon.png'));
  console.log(`✓ icon.png  (512×512)`);

  // Pixel-perfect 32×32 for the system tray
  await sharp(svg, { density: 96 })
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(OUT_DIR, 'tray-32.png'));
  console.log(`✓ tray-32.png  (32×32)`);

  console.log(`\nAll icons written to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
