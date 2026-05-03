# Contributing to Miqāt

Thanks for considering a contribution. This is a small, focused codebase
maintained by one person + AI pair-programming, so the bar is *clarity
of intent* over feature volume — well-scoped issues and PRs that match
the existing style are most likely to land.

## Quick links

- Open issues are at [github.com/bdevgroup/miqaat/issues](https://github.com/bdevgroup/miqaat/issues)
- App changelog: [CHANGELOG.md](CHANGELOG.md)
- Roadmap: [ROADMAP.md](ROADMAP.md)
- Architecture overview: [README.md](README.md#architecture)

## Setting up the dev environment

```bash
git clone https://github.com/bdevgroup/miqaat.git
cd miqaat
npm install
npm run fetch:audio   # downloads bundled Athan MP3s into client/public/audio/
npm run dev           # starts NestJS :3001 + Vite :5173 + Electron
```

**Requirements**: Node 22 LTS, npm 10. Windows 10/11 for full Electron testing
(the renderer + server work on macOS/Linux, but the packaging flow is
Windows-only right now).

## What kinds of contributions are welcome

| Type                  | Status |
| --------------------- | ------ |
| Bug reports           | Yes — please include the diagnostic snapshot from Settings → Diagnostics |
| Feature requests      | Yes — describe the user problem, not just the proposed solution |
| Translations          | Yes — add to [`client/src/i18n/dict.ts`](client/src/i18n/dict.ts) |
| Documentation fixes   | Yes — small typos all the way to architecture rewrites |
| Code refactors        | Yes if they reduce complexity / fix real issues; less so if pure style |
| New calculation methods | Yes — Aladhan parity tests gate accuracy |
| Performance fixes     | Yes, if measured (include a before/after) |
| New reciter MP3s      | Out of scope here — users upload their own via Settings |

## Translations

The translation dict is one TS file with all locales side-by-side:

```ts
'ui.next': { en: 'Next prayer', fr: 'Prochaine prière', ar: 'الصلاة التالية' },
```

To add a new locale:
1. Add the language code to the `lang` union in [`client/src/i18n/types.ts`](client/src/i18n/types.ts).
2. Add a translation for *every* key in [`client/src/i18n/dict.ts`](client/src/i18n/dict.ts).
   - Missing keys fall back to English silently — easy to ship half-translated by accident.
3. If the locale is RTL (e.g. `ar`, `ur`, `he`), check that `dir="rtl"` and Amiri-class typography render correctly across components.
4. Test by switching language in the bottom bar.

## Branch + commit conventions

- Branch from `main`. Branch names: `feat/short-name`, `fix/short-name`, `docs/short-name`.
- Commit message format (loose [Conventional Commits](https://www.conventionalcommits.org/)):
  - `feat: add Maliki madhab toggle`
  - `fix: cache stays canonical when Aladhan refresh fails`
  - `docs: clarify auto-updater publish step`
  - `i18n: add Turkish locale`
  - `chore: bump electron to 35`
- Squash on merge — keep the main-branch history readable.

## Code style

- TypeScript strict; no `any` without a comment explaining why.
- Tailwind 4 for the renderer + landing — use brand tokens (`var(--color-amber)` etc.) instead of raw hex.
- SQL: raw via `better-sqlite3` prepared statements only — never string concatenation.
- React: keep hooks at the top of the component, before any conditional return — one of the bugs we shipped was caused by a hook called after `return null`.
- Comments: explain *why*, not *what*. The code shows the what.

## Tests

```bash
npm test           # offline tests
npm run test:online # adds 250-case Aladhan parity sweep (requires network)
npm run lint       # ESLint across server + client
npm run build      # full build of server + client + electron (TS-only, no packaging)
```

CI runs `lint`, `test`, `build` on every PR. Online tests are skipped in CI.

## PR process

1. Fork → branch → commit → push to your fork.
2. Open a PR against `main`. Fill out the PR template — it asks for a screenshot if the change is visual.
3. CI must be green. If it's not, fix it before requesting review (the maintainer won't review red PRs).
4. Reviews are usually within 3–5 days. Smaller PRs land faster.
5. The maintainer (or you, if granted access) does the squash-merge.

## AI-assisted contributions

This codebase was substantially pair-programmed with [Claude](https://claude.com/claude-code) — see [README acknowledgments](README.md#acknowledgments). PRs that use AI assistance are explicitly welcome. Please:
- Read what the AI generated; don't paste output you haven't understood.
- Test the change locally end-to-end before opening the PR.
- Disclose AI assistance in the PR description (one line is fine — "drafted with Claude" or similar).

## Releasing (maintainer-only)

```bash
npm run release         # builds, signs nothing yet (TODO: code signing), publishes to GitHub Releases
```

See [docs/auto-updater.md](docs/auto-updater.md) for the full release workflow including the publish-target setup and what the `electron-updater` clients consume.

## Code of conduct

Be kind, on-topic, and assume good intent. Heated disagreements about technical decisions are fine; personal attacks aren't. The maintainer reserves the right to lock issues / block users that consistently break this.

## License

By contributing, you agree your contributions will be licensed under the [MIT License](LICENSE).
