# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IMPI (Immobilienpreisindex) is a data enrichment tool for Swiss real estate price index processing. It consists of TypeScript libraries for data normalization, geographic matching, and validation, an Angular frontend, and an Electron desktop app that ties them together.

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
