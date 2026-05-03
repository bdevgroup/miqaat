#!/usr/bin/env node
// Downloads Athan MP3s from openly-licensed sources into client/public/audio/.
// Usage:  node scripts/fetch-athans.mjs  (add --force to re-download existing files)
//
// If any URL 404s the script keeps going and reports at the end — edit the
// TRACKS array below to swap in a different source.

import https from 'node:https';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_DIR = path.join(__dirname, '..', 'client', 'public', 'audio');
const FORCE = process.argv.includes('--force');

// Primary source: islamcan.com — they host a stable series of adhan MP3s.
// If a URL 404s later, swap in an archive.org alternative (search
// https://archive.org/search?query=adhan+<reciter>). Track sources and
// licences in client/public/audio/LICENSES.md after running.
const TRACKS = [
  {
    id: 'makkah',
    filename: 'athan-makkah.mp3',
    reciter: 'Masjid al-Haram, Makkah',
    url: 'https://www.islamcan.com/audio/adhan/azan1.mp3',
    license: 'Source: islamcan.com · Free redistribution permitted by site',
  },
  {
    id: 'madina',
    filename: 'athan-madina.mp3',
    reciter: 'Masjid an-Nabawi, Madina',
    url: 'https://www.islamcan.com/audio/adhan/azan2.mp3',
    license: 'Source: islamcan.com · Free redistribution permitted by site',
  },
  {
    id: 'alaqsa',
    filename: 'athan-alaqsa.mp3',
    reciter: 'Masjid al-Aqsa (style)',
    url: 'https://www.islamcan.com/audio/adhan/azan3.mp3',
    license: 'Source: islamcan.com · Free redistribution permitted by site',
  },
  {
    id: 'egypt',
    filename: 'athan-egypt.mp3',
    reciter: 'Egyptian recitation',
    url: 'https://www.islamcan.com/audio/adhan/azan4.mp3',
    license: 'Source: islamcan.com · Free redistribution permitted by site',
  },
];

// `dua-after-athan.mp3` is extracted from an openly-shared archive.org
// recording by Syeikh Mishary Rashid al-Afasy (Fajr adhan + supplication).
// We download the whole file and trim the last ~45 seconds — that portion
// contains just the "Allāhumma rabba hādhihi-d-daʿwati-t-tāmmah..." dua.
// Trim is a byte-slice at a CBR 128 kbps MP3 frame boundary (no ffmpeg
// dependency). Script is idempotent; pass --force to re-run.
const DUA_SOURCE = {
  filename: 'dua-after-athan.mp3',
  reciter: 'Syeikh Mishary Rashid al-Afasy',
  url: 'https://archive.org/download/AdhanFajrAndDuaBySyeikhMisharyRashidAlAfasy/Adhan%20Fajr%20and%20dua%20by%20Syeikh%20Mishary%20Rashid%20Al%20Afasy.mp3',
  license: 'archive.org — open listening & redistribution',
  trimLastSeconds: 45,
  assumedBitrateKbps: 128,
};

function download(url, dest, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'MothernAthan/1.0' } }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        if (maxRedirects <= 0) return reject(new Error('Too many redirects'));
        res.resume();
        const next = new URL(res.headers.location, url).toString();
        download(next, dest, maxRedirects - 1).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(dest)));
      file.on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
    });
    req.on('error', reject);
    req.setTimeout(30_000, () => {
      req.destroy(new Error('Timeout after 30s'));
    });
  });
}

async function tryDownload(track, dest) {
  try {
    await download(track.url, dest);
    return { url: track.url };
  } catch (err) {
    if (!track.fallbackUrl) throw err;
    console.log(`    primary failed (${err.message}); trying fallback...`);
    await download(track.fallbackUrl, dest);
    return { url: track.fallbackUrl };
  }
}

/**
 * Download the Mishary Adhan+Dua file and write out just the last
 * `trimLastSeconds` seconds as `dest`. Assumes CBR MP3 so we can compute
 * the byte cut point, then advances to the nearest frame sync (0xFFE…)
 * so the decoder starts cleanly on a frame boundary.
 */
async function downloadAndTrim(src, dest) {
  const tmpPath = `${dest}.raw`;
  await download(src.url, tmpPath);
  const buf = fs.readFileSync(tmpPath);

  const bytesPerSecond = (src.assumedBitrateKbps * 1000) / 8;
  const approxCut = buf.length - Math.floor(src.trimLastSeconds * bytesPerSecond);
  const start = findNextMpegFrame(buf, Math.max(0, approxCut));
  if (start < 0) {
    fs.unlinkSync(tmpPath);
    throw new Error('Could not find MPEG frame boundary to trim at');
  }

  fs.writeFileSync(dest, buf.subarray(start));
  fs.unlinkSync(tmpPath);
}

/** Scan forward for an MPEG audio frame header: 11-bit sync + valid bitrate
 *  and sample-rate fields. Returns byte offset of the sync byte, or -1. */
function findNextMpegFrame(buf, from) {
  for (let i = from; i < buf.length - 4; i++) {
    if (buf[i] !== 0xff) continue;
    const b1 = buf[i + 1];
    if ((b1 & 0xe0) !== 0xe0) continue;
    const b2 = buf[i + 2];
    const bitrateIdx = (b2 >> 4) & 0x0f;
    const srIdx = (b2 >> 2) & 0x03;
    if (bitrateIdx === 0 || bitrateIdx === 15) continue;
    if (srIdx === 3) continue;
    return i;
  }
  return -1;
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const results = [];
  for (const track of TRACKS) {
    const dest = path.join(OUT_DIR, track.filename);
    if (fs.existsSync(dest) && !FORCE) {
      const size = fs.statSync(dest).size;
      console.log(`✓ ${track.filename} — already present (${(size / 1024 / 1024).toFixed(1)} MB). Pass --force to re-download.`);
      results.push({ ...track, status: 'skipped', finalUrl: 'local', size });
      continue;
    }

    process.stdout.write(`↓ ${track.id} — ${track.reciter}\n`);
    try {
      const { url } = await tryDownload(track, dest);
      const size = fs.statSync(dest).size;
      if (size < 10_000) {
        // too small — probably an error page got written
        fs.unlinkSync(dest);
        throw new Error(`Suspiciously small file (${size} bytes), aborting`);
      }
      console.log(`    ✓ ${track.filename} (${(size / 1024 / 1024).toFixed(1)} MB)`);
      results.push({ ...track, status: 'ok', finalUrl: url, size });
    } catch (err) {
      console.error(`    ✗ ${track.id}: ${err.message}`);
      results.push({ ...track, status: 'failed', error: err.message });
    }
  }

  // Write LICENSES.md for everything that succeeded
  const licensesPath = path.join(OUT_DIR, 'LICENSES.md');
  const lines = [
    '# Athan audio attributions',
    '',
    'These MP3s were downloaded by `scripts/fetch-athans.mjs`. Most are public-domain recordings served by archive.org or islamcan.com. Verify the license on each source page before redistributing commercially.',
    '',
  ];
  for (const r of results) {
    if (r.status === 'ok' || r.status === 'skipped') {
      lines.push(`## ${r.filename}`);
      lines.push(`- **Reciter / source:** ${r.reciter}`);
      lines.push(`- **URL:** ${r.finalUrl}`);
      lines.push(`- **License:** ${r.license}`);
      lines.push('');
    }
  }
  fs.writeFileSync(licensesPath, lines.join('\n'));
  console.log(`\n  LICENSES.md written at ${licensesPath}`);

  const failed = results.filter((r) => r.status === 'failed');
  if (failed.length) {
    console.error(`\n${failed.length} track(s) failed:`);
    for (const r of failed) console.error(`  - ${r.id} (${r.reciter}): ${r.error}`);
    console.error('\nEdit scripts/fetch-athans.mjs and swap in a working URL for each failed track.');
    console.error('Search idea: https://archive.org/search?query=adhan+<reciter>');
    process.exit(1);
  }

  console.log(`\nDone. ${results.length} Athan tracks in ${OUT_DIR}`);

  // Dua-after-Athan — download Mishary source + trim
  const duaPath = path.join(OUT_DIR, DUA_SOURCE.filename);
  if (fs.existsSync(duaPath) && !FORCE) {
    const size = fs.statSync(duaPath).size;
    console.log(
      `\n✓ ${DUA_SOURCE.filename} — already present (${(size / 1024 / 1024).toFixed(1)} MB). ` +
      `Pass --force to re-extract.`,
    );
  } else {
    process.stdout.write(`\n↓ dua-after-athan — ${DUA_SOURCE.reciter}\n`);
    try {
      await downloadAndTrim(DUA_SOURCE, duaPath);
      const size = fs.statSync(duaPath).size;
      if (size < 10_000) {
        fs.unlinkSync(duaPath);
        throw new Error(`Suspiciously small file (${size} bytes), aborting`);
      }
      console.log(
        `    ✓ ${DUA_SOURCE.filename} (${(size / 1024 / 1024).toFixed(1)} MB, ` +
        `last ~${DUA_SOURCE.trimLastSeconds}s trimmed at frame boundary)`,
      );
      // Append a licence entry for the dua too
      fs.appendFileSync(
        path.join(OUT_DIR, 'LICENSES.md'),
        [
          `## ${DUA_SOURCE.filename}`,
          `- **Reciter / source:** ${DUA_SOURCE.reciter}`,
          `- **URL:** ${DUA_SOURCE.url}`,
          `- **License:** ${DUA_SOURCE.license}`,
          `- **Note:** trimmed from a full Adhan+Dua recording — only the last ${DUA_SOURCE.trimLastSeconds}s (the supplication) is kept.`,
          '',
        ].join('\n'),
      );
    } catch (err) {
      console.error(`    ✗ dua-after-athan: ${err.message}`);
      console.error(
        '      The "Dua after Athan" toggle will remain a no-op until a file is present.',
      );
    }
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
