# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this directory.

## Overview

Main processing library. Handles file processing, validation rules checking, geographic database matching, and XML log file generation.

Depends on `normalize-common`, `normalize-street`, `normalize-city`.

## Key Exports

- `processFile()` — main entry point for processing input files
- `ValidationRules`, `IValidationRule` — validation framework
- `GeoDatabase`, `IDbInfo` — geographic database interfaces
- `MatchingTypeEnum` — matching type enumeration
- `ILogResult`, `ILogMeta`, `ILogViolation`, `ILogRow`, `ILogMatchingType` — result logging types

## Build & Test

```bash
pnpm run build    # tsc
pnpm run test     # mocha via ts-node/esm, tests in tests/**/*.spec.ts (99s timeout)
pnpm run clean    # rimraf dist
```

Tests are in `tests/` (not `src/`). Custom Chai BigInteger assertions in `tests/chaiExtension.ts`.

## TypeScript

Extends the base config but relaxes `noImplicitAny` and `noImplicitThis` to `false`.
