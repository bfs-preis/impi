# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this directory.

## Overview

Shared normalization utilities and base normalizer framework. Foundation library with no workspace dependencies.

## Key Exports

- `globalReplace()`, `translate()`, `validateStringInput()` — string manipulation
- `BaseNormalizer`, `NormalizationConfig`, `NormalizationRule` — normalizer framework
- `createReplacementRules()`, `applyRules()` — rule helpers

## Build

```bash
pnpm run build    # tsc
pnpm run clean    # rimraf dist
```

No tests in this package.
