# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this directory.

## Overview

CLI tool and library for generating an SQLite3 geographic database from CSV files. Used to build the IMPI geo database with municipality/geographic data.

Depends on `normalize-common`, `normalize-street`, `normalize-city`.

## Key Exports

- `generate()` — main function to generate the geo database
- `checkDoubles()`, `checkKFactor()` — post-build sanity checks
- CLI binary: `generate-impi-db`

## Python Port

`src/python/generate_impi_db.py` is a stdlib-only Python 3.11 port of this tool with
verified-identical output (`scripts/verify-db-parity.py`). The normalization rules are
duplicated there — when changing any rule here (or in the normalize-* libs), update the
Python port and re-run the parity check.

## Build

```bash
pnpm run build    # tsc
pnpm run clean    # rimraf dist
```

No tests in this package.

## TypeScript

Unlike other libs, this uses **CommonJS** (`module: commonjs`, target ES2016) instead of ESM.
