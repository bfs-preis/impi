# CLAUDE.md — src/electron/

Electron desktop app shell for IMPI. Depends on `impilib` (linked via `file:../libs/impilib/`).

## Commands

```bash
npm run start     # build + launch in debug mode
npm run build     # clean + tsc + copy assets + create build package.json
npm run release   # build + electron-builder (produces AppImage)
npm run tsc       # compile TypeScript only
```

Uses npm (not pnpm) — standalone project, not part of the pnpm workspace.

## Development Workflow

Start Angular dev server first (`cd src/apps/angular && pnpm run start`), then:

```bash
npm run tsc && npm run copyPreload && npm run copyBackground
IMPI_DEV=1 ELECTRON_OZONE_PLATFORM_HINT=x11 npx electron --no-sandbox ./app
```

- `IMPI_DEV=1` loads from `http://localhost:4200` (hot reload)
- Renderer console logs forwarded to stdout as `[RENDERER:LEVEL]`
- Angular changes auto-reload without restarting Electron

## Architecture

### Preload Script

`src/preload.cjs` (CommonJS, not ESM) uses `contextBridge` to expose `window.electron.ipcRenderer` with `send`, `once`, `on` methods. Must be `.cjs` because Electron preload runs in CommonJS context while the rest of the app is ESM.

### IPC Channels

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `select-file` / `select-file-response` | renderer → main → renderer | Native file open dialog |
| `select-directory` / `select-directory-response` | renderer → main → renderer | Native directory picker |
| `verify db` / `verify db response` | renderer → main → renderer | Validate geo database |
| `verify csv` / `verify csv response` | renderer → main → renderer | Validate CSV input |
| `verify path` / `verify path response` | renderer → main → renderer | Validate output directory |
| `set-setting` | renderer → main | Persist app settings |
| `checkkfactor` / `checkkfactor response` | renderer → main → renderer | K-factor check |
| `background-start` / `background-response` | main → background → main | File processing |

### Window Configuration

- Main window: 1200x800, resizable, preload + contextIsolation
- Background window: hidden, nodeIntegration (runs impilib processing)
- Result window: created on-demand after processing completes

### CLI Mode

`electron ./app cli --db file.db --csv input.csv` runs headless processing via `src/cmd-line/`.
