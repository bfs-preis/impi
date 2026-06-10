# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this directory.

## Overview

Street name normalization for Swiss addresses. Handles accents, umlauts, street type abbreviations (strasse→str, platz→pl, weg→w, avenue→av, etc.), and special character removal.

Depends on `normalize-common`.

## Key Exports

- `normalizeStreet()` — normalize a street name
- `normalizeStreetNumber()` — normalize a street number

## Build & Test

```bash
pnpm run build    # tsc
pnpm run test     # mocha via ts-node/esm, tests in src/**/*.spec.ts
pnpm run clean    # rimraf dist
```
