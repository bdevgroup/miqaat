import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import type { Response } from 'express';
import { CustomRecitersService } from './custom-reciters.service';

// Multer's File type sits under the Express namespace via @types/multer.
type MulterFile = Express.Multer.File;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB cap

const ALLOWED_MIME = new Set([
  'audio/mpeg',          // .mp3
  'audio/mp3',           // some browsers
  'audio/mp4',           // .m4a
  'audio/x-m4a',
  'audio/aac',
  'audio/ogg',
  'application/ogg',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
]);

/**
 * Magic-byte sniffer. Reads the first 12 bytes of an uploaded file and
 * confirms it matches one of our supported audio container signatures.
 * Trusting the browser's `audio/mpeg` MIME header alone would let a `.exe`
 * renamed to `.mp3` slip through and sit in the user's custom-athans dir.
 * Returns null if the file isn't recognisable audio.
 */
function detectAudioFormat(filePath: string): 'mp3' | 'ogg' | 'wav' | 'mp4' | null {
  let fd: number | null = null;
  try {
    fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(12);
    fs.readSync(fd, buf, 0, 12, 0);

    // ID3v2 tag (most modern MP3s start with this)
    if (buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) return 'mp3';
    // Raw MPEG audio frame sync — first 11 bits all set
    if (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0) return 'mp3';
    // OggS container (Vorbis/Opus)
    if (buf[0] === 0x4f && buf[1] === 0x67 && buf[2] === 0x67 && buf[3] === 0x53) return 'ogg';
    // RIFF...WAVE
    if (
      buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x41 && buf[10] === 0x56 && buf[11] === 0x45
    ) return 'wav';
    // ftyp box at offset 4 → MP4 / M4A
    if (buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) return 'mp4';
    return null;
  } catch {
    return null;
  } finally {
    if (fd !== null) try { fs.closeSync(fd); } catch { /* ignore */ }
  }
}

/** Map a MIME type to a sensible filename extension. */
function extFor(mime: string): string {
  if (mime.startsWith('audio/mp')) return mime.includes('mp4') || mime.includes('m4a') ? '.m4a' : '.mp3';
  if (mime.startsWith('audio/aac')) return '.m4a';
  if (mime.includes('ogg')) return '.ogg';
  if (mime.includes('wav') || mime.includes('wave')) return '.wav';
  return '.mp3';
}

/**
 * Multer disk-storage factory. We need the destination resolved at request
 * time (not module-load time) because `CustomRecitersService.getDir()`
 * depends on `process.env.DB_PATH` which the Electron host injects right
 * before NestJS boots.
 */
function multerStorage(svc: CustomRecitersService) {
  return diskStorage({
    destination: (_req, _file, cb) => cb(null, svc.getDir()),
    filename: (_req, file, cb) => {
      const ext = extFor(file.mimetype);
      // Random 8-byte token + ext — collision probability is negligible
      // and we don't leak the user's original filename to disk.
      const token = crypto.randomBytes(8).toString('hex');
      cb(null, `${token}${ext}`);
    },
  });
}

@Controller('custom-reciters')
export class CustomRecitersController {
  constructor(private readonly svc: CustomRecitersService) {}

  @Get()
  list() {
    return this.svc.list();
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      // We can't reach `this` here (decorator metadata is evaluated before
      // instantiation), so storage is attached lazily via a closure on a
      // module-scoped svc reference. See CustomRecitersModule's onInit.
      storage: ((): unknown => {
        // Multer accepts a function that returns the storage engine via
        // its config; but FileInterceptor requires the options synchronously.
        // We stash a reference at module init time (see module file).
        return diskStorage({
          destination: (_req, _file, cb) => cb(null, deferredStorageDir()),
          filename: (_req, file, cb) => {
            const ext = extFor(file.mimetype);
            const token = crypto.randomBytes(8).toString('hex');
            cb(null, `${token}${ext}`);
          },
        });
      })() as never,
      limits: { fileSize: MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME.has(file.mimetype.toLowerCase())) {
          return cb(
            new BadRequestException(
              `Unsupported audio type: ${file.mimetype}. Use MP3, M4A, OGG, or WAV.`,
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  upload(
    @UploadedFile() file: MulterFile | undefined,
    @Body('name') name: string | undefined,
    @Body('durationMs') durationMs: string | undefined,
  ) {
    if (!file) {
      throw new BadRequestException(
        'No file uploaded — expected multipart/form-data with field "file".',
      );
    }
    // Magic-byte sniff — defence in depth on top of the MIME allowlist.
    // If the file isn't recognisable audio, delete it and refuse the upload.
    const written = path.join(this.svc.getDir(), file.filename);
    const fmt = detectAudioFormat(written);
    if (!fmt) {
      try { fs.unlinkSync(written); } catch { /* best effort */ }
      throw new BadRequestException(
        'File contents are not a recognisable audio format (MP3, M4A, OGG, WAV).',
      );
    }
    return this.svc.create({
      name: name ?? path.parse(file.originalname).name,
      filename: file.filename,
      sizeBytes: file.size,
      durationMs: durationMs ? Number(durationMs) : null,
    });
  }

  @Patch(':id')
  rename(
    @Param('id', ParseIntPipe) id: number,
    @Body('name') name: string,
  ) {
    if (!name || !name.trim()) {
      throw new BadRequestException('name required');
    }
    return this.svc.rename(id, name);
  }

  @Patch(':id/duration')
  setDuration(
    @Param('id', ParseIntPipe) id: number,
    @Body('durationMs') durationMs: number,
  ) {
    if (!Number.isFinite(durationMs) || durationMs < 0) {
      throw new BadRequestException('durationMs must be a non-negative number');
    }
    return this.svc.setDuration(id, durationMs);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    this.svc.remove(id);
    return { ok: true };
  }

  /**
   * Stream the audio bytes. The renderer uses this URL as the `src` of the
   * global <audio> element, so it MUST handle range requests (the audio
   * element seeks via Range headers). Express + a `pipe`-based stream
   * doesn't natively respect Range, so we handle it manually.
   */
  @Get(':id/audio')
  stream(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const row = this.svc.get(id);
    const filePath = this.svc.filePath(row);
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('Audio file missing on disk');
    }
    const stat = fs.statSync(filePath);
    const total = stat.size;
    const range = res.req.headers.range;
    const mimeFromExt =
      filePath.endsWith('.mp3') ? 'audio/mpeg'
      : filePath.endsWith('.m4a') ? 'audio/mp4'
      : filePath.endsWith('.ogg') ? 'audio/ogg'
      : filePath.endsWith('.wav') ? 'audio/wav'
      : 'application/octet-stream';

    if (range) {
      // Parse "bytes=START-END"
      const m = /bytes=(\d+)-(\d*)/.exec(range);
      if (!m) {
        res.status(416).set('Content-Range', `bytes */${total}`).end();
        return;
      }
      const start = Number(m[1]);
      const end = m[2] ? Number(m[2]) : total - 1;
      if (start >= total || end >= total) {
        res.status(416).set('Content-Range', `bytes */${total}`).end();
        return;
      }
      res.status(206).set({
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(end - start + 1),
        'Content-Type': mimeFromExt,
        'Cache-Control': 'no-store',
      });
      fs.createReadStream(filePath, { start, end }).pipe(res);
      return;
    }

    res.status(200).set({
      'Content-Length': String(total),
      'Content-Type': mimeFromExt,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(filePath).pipe(res);
  }
}

/** Module-level holder for the Multer destination directory. The decorator
 *  options are evaluated at metadata-collection time (before DI), so we
 *  defer the actual directory resolution to the function below — which the
 *  module bootstrap populates. */
let _deferredDir: string | null = null;
export function setDeferredStorageDir(dir: string): void {
  _deferredDir = dir;
}
function deferredStorageDir(): string {
  if (!_deferredDir) {
    throw new Error('Multer dir not initialised — call setDeferredStorageDir() in bootstrap');
  }
  return _deferredDir;
}
