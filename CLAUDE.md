# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IMPI (Immobilienpreisindex) is a data enrichment tool for Swiss real estate price index processing. It consists of TypeScript libraries for data normalization, geographic matching, and validation, an Angular frontend, and an Electron desktop app that ties them together.

## Authoring Conventions

- Never mention Claude, Anthropic, or any AI assistant anywhere — not in source code, comments, commit messages, PR descriptions, or documentation. Do not add `Co-Authored-By` trailers or "Generated with" lines referencing AI tools.
- If such a mention is found anywhere in the repo, remove it.

## Repository Layout

- `src/libs/` — pnpm workspace with 5 library packages (the core logic)
- `src/apps/angular/` — Angular 20 frontend (separate pnpm workspace)
- `src/electron/` — Electron desktop app shell (depends on impilib)
- `src/cli/` — Standalone CLI for batch processing (depends on impilib)
- `flake.nix` — Nix dev environment (Node.js 22, pnpm, Electron deps)

## Library Dependency Graph

```
normalize-common          ← foundation: string utils, base normalizer
├── normalize-street      ← street name normalization (Swiss/German conventions)
├── normalize-city        ← city/municipality normalization (incl. French prefixes)
├── impilib               ← main processing: file I/O, validation, geo matching, XML logging
└── generate-impi-geo-database  ← CLI + lib to build SQLite geo DB from CSV
```

`impilib` and `generate-impi-geo-database` also depend on `normalize-street` and `normalize-city`.

## Tooling Requirements

- Node.js ≥20 (22.19.0 LTS recommended, pinned in `.nvmrc`/`.node-version`)
- pnpm 10+ (enforced via `only-allow` preinstall hook)
- All packages (libs, Angular, Electron, CLI) use pnpm via a unified workspace at `src/`
- Nix users: `nix develop` for full environment
- `ELECTRON_OZONE_PLATFORM_HINT=x11` needed on Nix/Wayland for native file dialogs

## CI/CD

GitHub Actions workflows in `.github/workflows/`:

- **`ci.yml`** — runs on push/PR to `develop` and `master`. Builds all libs, runs tests, builds Angular, Electron, and CLI.
- **`release.yml`** — runs on `v*` tags or manual dispatch. Tests first, then builds in parallel:
  - **Electron** (Linux + Windows) — published as draft GitHub Release via electron-builder
  - **CLI** binaries (Linux + Windows) — packaged with `@yao-pkg/pkg`, uploaded to the same release

### Release Process

1. Bump `version` in `src/package.json`, `src/electron/package.json`, and `src/cli/package.json`
2. Commit and tag: `git tag v<version>`
3. Push tag: `git push origin v<version>`
4. CI runs tests → builds Electron installers (AppImage, deb, rpm, pacman, tar.gz, NSIS exe) + CLI binaries
5. Review and publish the draft release on GitHub
