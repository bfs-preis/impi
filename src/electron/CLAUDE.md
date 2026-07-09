# CLAUDE.md — src/electron/

Electron desktop app shell for IMPI. Depends on `impilib` (linked via pnpm workspace protocol).

## Commands

```bash
pnpm run start     # build + launch in debug mode
pnpm run build     # clean + tsc + copy assets + create build package.json
pnpm run release   # build + electron-builder (produces AppImage)
pnpm run tsc       # compile TypeScript only
```

Part of the root pnpm workspace at `src/`.

## Development Workflow

Start Angular dev server first (`cd src/apps/angular && pnpm run start`), then, from `src/electron`:

```bash
pnpm run tsc && pnpm run copyPreload
IMPI_DEV=1 ELECTRON_OZONE_PLATFORM_HINT=x11 npx electron --no-sandbox ./app
```

- `IMPI_DEV=1` loads from `http://localhost:4200` (hot reload)
- Renderer console logs forwarded to stdout as `[RENDERER:LEVEL]`
- Angular changes auto-reload without restarting Electron

## Architecture

### Preload Script

`src/preload.cjs` (CommonJS, not ESM) uses `contextBridge` to expose `window.electron.ipcRenderer` with `send`, `once`, `on` methods, plus `window.electron.appVersion` (fetched synchronously from the main process via the `get-app-version` channel). Must be `.cjs` because Electron preload runs in CommonJS context while the rest of the app is ESM.

### IPC Channels

| Channel | Direction | Purpose |
|---------|-----------|---------|
| `get-app-version` | renderer → main (sync) | App version for the help dialog, fetched by the preload at load time |
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
- File processing runs in an Electron `utilityProcess` (spawned on `background-start`, killable via `background-cancel`) — no hidden background window
- Result window: created on-demand after processing completes

### CLI Mode

`electron ./app cli --db file.db --csv input.csv` runs headless processing via `src/cmd-line/`.
