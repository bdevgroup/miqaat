# Electron resources

Place the following binary assets here before running `npm run package`:

- `icon.ico` — 256×256 single-size ICO (Windows app icon)
- `icon.png` — 512×512 PNG (macOS/Linux icon)
- `tray-32.png` — exactly 32×32 PNG (Windows tray). Do not use a larger image and rely on resize — Electron renders it blurry.
- `audio/athan-makkah.mp3` — shipped reciter fallback
- `audio/dua-after-athan.mp3` — optional dua played after Athan when enabled in settings

See `/docs/desktop-builds.md` for packaging details.
