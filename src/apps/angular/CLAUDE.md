# CLAUDE.md — src/apps/angular/

Angular 20 frontend. Separate pnpm workspace (not part of the libs workspace).

## Commands

```bash
pnpm run start    # ng serve (dev server on http://localhost:4200)
pnpm run build    # ng build → dist/angular/
pnpm run test     # ng test (Karma + Jasmine)
pnpm run lint     # ng lint (ESLint + Prettier)
```

## Module Structure

- **AppModule** — root module, provides `ElectronService`, `ObMasterLayoutConfig`, settings/help dialogs
- **AnonymizerModule** — lazy-loaded at `#/anonymizer`, the main 3-card processing workflow
- **ResultViewerModule** — lazy-loaded at `#/result-viewer`, chart visualizations of results
- Routing uses `useHash: true` for Electron `file://` compatibility

## Key Dependencies

- `@oblique/oblique` — Swiss federal design system (styles Material form fields automatically)
- `@angular/material` — form fields, dialogs, tabs, cards
- `angular-oauth2-oidc` — OAuth2/OIDC authentication
- `@ngx-translate/core` — i18n (translations in `src/assets/i18n/{de,en,fr,it}.json`)
- `chart.js` — pie/bar charts in result-viewer
- `moment` — date formatting

## Oblique Configuration (AppModule)

- `locale.disabled: false` — language switcher enabled in header
- `layout.hasMainNavigation: false` — nav bar hidden
- `showAccessibilityTitle: false` — accessibility link hidden (CSS fallback in styles.scss)
- `homePageRoute: '/anonymizer'` — default route
- Default language: German (`de`)

## Electron ↔ Angular Communication

- `ElectronIpcService` — uses `window.electron.ipcRenderer` (exposed by preload script)
- `ElectronMockService` — used in browser dev mode (localStorage + HTML5 File API)
- Auto-detection via `window.electron` presence
- Types for result-viewer are plain TS interfaces (not imported from impilib to avoid native deps in bundle)
