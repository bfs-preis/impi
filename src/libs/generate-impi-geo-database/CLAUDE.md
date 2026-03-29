# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this directory.

## Overview

CLI tool and library for generating an SQLite3 geographic database from CSV files. Used to build the IMPI geo database with municipality/geographic data.

Depends on `normalize-common`, `normalize-street`, `normalize-city`.

## Key Exports

- `generateImpiDb()` — main function to generate the geo database
- CLI binary: `generate-impi-db`

## Build

```bash
pnpm run build    # tsc
pnpm run clean    # rimraf dist
```

No tests in this package.

## TypeScript

Unlike other libs, this uses **CommonJS** (`module: commonjs`, target ES2016) instead of ESM.
