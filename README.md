# IMPI - Immobilienpreisindex

A data enrichment tool for Swiss real estate price index processing. IMPI normalizes, validates, and geo-matches property transaction data, producing enriched output files for further analysis.

## Features

- **Geographic matching** -- match property addresses against a Swiss geo database (municipalities, streets, postal codes)
- **Address normalization** -- normalize street names (Swiss/German conventions) and city names (including French prefixes)
- **Data validation** -- verify CSV input structure, encoding, and field consistency
- **Batch processing** -- process large CSV datasets via the desktop app or standalone CLI
- **K-factor analysis** -- optional K-factor testing for statistical validation
- **XML logging** -- structured processing logs in XML format
- **Desktop application** -- Electron app with Angular frontend for interactive use
- **Multilingual UI** -- German, English, French, and Italian interface translations
- **Python geo-database generator** -- standalone, stdlib-only Python 3.11 port of the geo database builder for environments without Node.js (`src/python/`)

## Architecture

```
+-------------------+     +-------------------+
|   Angular 20 UI   |     |   CLI (impi-cli)  |
|  src/apps/angular  |     |     src/cli       |
+--------+----------+     +--------+----------+
         |                          |
         v                          v
+--------+--------------------------+----------+
|               Electron Shell                  |
|               src/electron                    |
+--------+-------------------------------------+
         |
         v
+--------+-------------------------------------+
|               impilib                         |
|  file I/O, validation, geo matching, logging  |
+--------+----------+-----------+--------------+
         |          |           |
         v          v           v
  normalize-   normalize-   generate-impi-
   street        city       geo-database
         |          |           |
         v          v           v
+--------+----------+-----------+--------------+
|            normalize-common                   |
|      string utilities, base normalizer        |
+-----------------------------------------------+
```

The Angular frontend communicates with the Electron main process via IPC channels. The CLI bypasses Electron entirely and calls impilib directly.

## Prerequisites

- **Node.js** >= 20 (22.19.0 LTS recommended; pinned in `.nvmrc` / `.node-version`)
- **pnpm** 10+ (enforced via `only-allow` preinstall hook) -- used by all packages
- **Python** 3.11 (optional) -- only for the standalone geo-database generator in `src/python/`
- **Nix** (optional): run `nix develop` for a fully provisioned environment

On Nix/Wayland systems, set `ELECTRON_OZONE_PLATFORM_HINT=x11` for native file dialogs.

## Quick Start

```bash
# 1. Install all workspace dependencies
cd src
pnpm install

# 2. Build libraries (topological order), Angular, and Electron
pnpm run build
pnpm run build:angular
pnpm run build:electron

# 3. Launch the desktop app
cd electron
pnpm run start
```

## Development

The recommended development workflow uses the Angular dev server for hot reload.

### Start the Angular dev server

```bash
cd src/apps/angular
pnpm run start
# Serves on http://localhost:4200
```

### Start Electron in dev mode

In a separate terminal:

```bash
cd src/electron
pnpm run tsc && pnpm run copyPreload
IMPI_DEV=1 ELECTRON_OZONE_PLATFORM_HINT=x11 npx electron --no-sandbox ./app
```

When `IMPI_DEV=1` is set, Electron loads the UI from `http://localhost:4200`. Angular changes auto-reload without restarting Electron. If you change Electron main-process code, re-run `pnpm run tsc` and restart Electron.

Renderer console logs are forwarded to stdout as `[RENDERER:LEVEL]`.

## Project Structure

```
impi/
  flake.nix                          # Nix dev environment
  src/
    libs/                            # pnpm workspace (5 library packages)
      pnpm-workspace.yaml
      tsconfig.base.json             # shared strict TypeScript config
      normalize-common/              # string utils, base normalizer
      normalize-street/              # street name normalization
      normalize-city/                # city/municipality normalization
      impilib/                       # core processing library
      generate-impi-geo-database/    # geo database builder (CSV to SQLite)
    apps/
      angular/                       # Angular 20 frontend
    electron/                        # Electron desktop app shell
    cli/                             # standalone CLI for batch processing
    python/                          # stdlib-only Python 3.11 geo database generator
  scripts/                           # dev/release helpers (bump-version, DB parity check, test harnesses)
```

## Libraries

All library packages live in `src/libs/` and share a pnpm workspace.

| Package | Description |
|---------|-------------|
| `normalize-common` | Foundation package with string utilities and the base normalizer class |
| `normalize-street` | Street name normalization following Swiss and German conventions |
| `normalize-city` | City and municipality normalization, including French prefix handling |
| `impilib` | Main processing library: file I/O, CSV validation, geographic matching, XML logging |
| `generate-impi-geo-database` | CLI tool and library to build a SQLite geo database from CSV source data |

### Dependency relationships

`normalize-street`, `normalize-city`, `impilib`, and `generate-impi-geo-database` all depend on `normalize-common`. Additionally, `impilib` and `generate-impi-geo-database` depend on both `normalize-street` and `normalize-city`.

## Building

### Libraries

```bash
cd src/libs
pnpm install
pnpm run build       # build all packages in topological order
pnpm run clean       # remove dist/ from all packages
```

Build a single package:

```bash
pnpm --filter normalize-street run build
```

### Angular frontend

```bash
cd src/apps/angular
pnpm install
pnpm run build       # production build to dist/angular/
```

### Electron desktop app

```bash
cd src/electron
pnpm run build       # clean + compile + copy assets + create build package.json
pnpm run release     # build + package with electron-builder (produces AppImage)
```

### CLI

```bash
cd src/cli
pnpm run build       # compile to dist/

# Run directly
node dist/index.js --db geodb.db --csv input.csv --out ./output
```

### Python geo-database generator

A standalone, dependency-free Python 3.11 port of `generate-impi-geo-database` for
environments without Node.js. Produces a database logically identical to the Node
tool's output (verified with `scripts/verify-db-parity.py`). See `src/python/README.md`.

```bash
python3 src/python/generate_impi_db.py -g geo.db -q 1.0.0 -f 01.01.2025 -t 31.12.2025 \
    -s CENTER_STREET.csv -c CENTER_PLZ.csv -b BUILDINGS.csv -a ALTERNATIVE_ZIPCODES.csv
```

#### CLI Options

| Flag | Alias | Description | Default |
|------|-------|-------------|---------|
| `--dbfile` | `--db` | Geo database file (required) | |
| `--inputcsvfile` | `--csv` | Input CSV file (required) | |
| `--outputdir` | `--out` | Output directory | `.` |
| `--csvencoding` | `--enc` | CSV encoding | `utf8` |
| `--csvseparator` | `--sep` | CSV separator | `;` |
| `--sedexsenderid` | `--sed` | Sedex sender ID | `""` |
| `--kfactor` | `--kf` | Run K-factor test | `false` |
| `--mappingfile` | `--mf` | Mapping file | `mapping.json` |
| `--loglevel` | `-l` | Log level | `error` |

## Testing

### Libraries

```bash
cd src/libs
pnpm run test        # run all tests across all packages (Mocha + Chai)
pnpm run lint        # lint all packages
```

Tests use Mocha 10 with Chai 5, executed via `ts-node/esm`. Test files follow the `*.spec.ts` naming convention. Code coverage is available via nyc.

Some impilib tests depend on external CSV data in a `Data/` directory and skip gracefully when it is absent.

### Angular

```bash
cd src/apps/angular
pnpm run test        # Karma + Jasmine
pnpm run lint        # ESLint + Prettier
```

## License

ISC
