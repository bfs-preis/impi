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
- **pnpm** 10+ (enforced via `only-allow` preinstall hook) -- for libraries and Angular
- **npm** -- for the Electron shell and CLI
- **Nix** (optional): run `nix develop` for a fully provisioned environment

On Nix/Wayland systems, set `ELECTRON_OZONE_PLATFORM_HINT=x11` for native file dialogs.

## Quick Start

```bash
# 1. Install library dependencies
cd src/libs
pnpm install

# 2. Build all libraries (respects topological order)
pnpm run build

# 3. Install and build the Angular frontend
cd ../apps/angular
pnpm install
pnpm run build

# 4. Install and build the Electron app
cd ../../electron
npm install
npm run build

# 5. Launch the desktop app
npm run start
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
npm run tsc && npm run copyPreload && npm run copyBackground
IMPI_DEV=1 ELECTRON_OZONE_PLATFORM_HINT=x11 npx electron --no-sandbox ./app
```

When `IMPI_DEV=1` is set, Electron loads the UI from `http://localhost:4200`. Angular changes auto-reload without restarting Electron. If you change Electron main-process code, re-run `npm run tsc` and restart Electron.

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
      angular/                       # Angular 20 frontend (separate pnpm workspace)
    electron/                        # Electron desktop app shell
    cli/                             # standalone CLI for batch processing
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
npm install
npm run build        # clean + compile + copy assets + create build package.json
npm run release      # build + package with electron-builder (produces AppImage)
```

### CLI

```bash
cd src/cli
npm install
npm run build        # compile to dist/

# Run directly
node dist/index.js --db geodb.db --csv input.csv --out ./output

# Package as standalone binary
npm run package      # produces binaries for Linux and Windows (node22)
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
