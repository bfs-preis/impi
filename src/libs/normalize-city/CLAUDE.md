# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this directory.

## Overview

City/municipality name normalization for Swiss addresses. Handles accents, umlauts, punctuation, and French prefixes ("de la", "de l'", "du", etc.).

Depends on `normalize-common`.

## Key Exports

- `normalizeCity()` — normalize a city name

## Build & Test

```bash
pnpm run build    # tsc
pnpm run test     # mocha via ts-node/esm, tests in src/**/*.spec.ts
pnpm run clean    # rimraf dist
```
