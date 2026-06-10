# CLAUDE.md — src/cli/

Standalone CLI for IMPI batch processing. No Electron dependency.

## Commands

```bash
pnpm install
pnpm run build            # tsc → dist/
node dist/index.js --help # show usage
```

## Usage

```bash
impi --db geodb.db --csv input.csv --out ./output [options]
```

### Options

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

## Key Differences from Electron CLI

- Uses `picocolors` instead of `colors` (deprecated)
- Uses `console.error` instead of `electron-log`
- Reads version from `package.json` instead of `app.getVersion()`
- `fs.existsSync` instead of deprecated `fs.exists`
- ESM throughout (yargs v17 + ora v8)

## Packaging

```bash
npx @yao-pkg/pkg . --targets node22-linux-x64,node22-win-x64
```
