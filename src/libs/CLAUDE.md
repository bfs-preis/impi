# CLAUDE.md — src/libs/

pnpm workspace containing 5 library packages that form the core logic of IMPI.

## Build & Test

```bash
pnpm install              # install all workspace deps
pnpm run build            # build all libs (topological order)
pnpm run test             # test all libs (115 tests)
pnpm run clean            # remove dist/ from all libs
pnpm run lint             # lint all libs
```

Per-package: `pnpm --filter normalize-street run build`

## TypeScript

Strict base config at `tsconfig.base.json` — all strict flags enabled including `exactOptionalPropertyTypes`. Individual libs extend this. impilib relaxes `noImplicitAny` for legacy code.

## Test Framework

Mocha 10 + Chai 5, run via `ts-node/esm` loader. Test files are `*.spec.ts`. Coverage via nyc.

## Notes

- `node-stream-zip` replaces deprecated `unzip` package (Node 22 compatible)
- sqlite3 native module must be built: `onlyBuiltDependencies` in `pnpm-workspace.yaml`
- impilib tests with external CSV data skip gracefully when `Data/` directory is absent
