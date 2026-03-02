# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fontastic is an Electron + Angular desktop application for font management. It scans, catalogs, previews, and activates/deactivates fonts on macOS, Windows, and Linux.

## Common Commands

```bash
# Development (runs Angular dev server + Electron concurrently)
npm start

# Build
npm run build:dev          # Development build
npm run build:prod         # Production build

# Run packaged locally (build + launch Electron)
npm run electron:local

# Package for distribution (outputs to release/)
npm run electron:build

# Tests
npm test                   # Vitest (single run)
npm run test:watch         # Vitest (watch mode)
npm run e2e                # Playwright e2e tests

# Lint
npm run lint               # ESLint via Angular CLI
```

There is no single-test filter via npm scripts. Use Vitest's CLI directly:
```bash
npx ng test --watch=false -- --testPathPattern="component-name"
```

## Architecture

### Two-Process Model

| Process | Directory | Module System | Compiled via |
|---------|-----------|---------------|--------------|
| Electron main | `app/` | CommonJS | `tsconfig.serve.json` |
| Angular renderer | `src/` | ES Modules | `@angular/build:application` (esbuild/Vite) |

Each process has its own `package.json` with separate dependencies.

### Electron Main Process (`app/`)

Entry point: `app/main.ts` → instantiates `Application` which initializes five managers in order:

1. **SystemManager** — OS detection, path resolution (userData, cache, database, fonts)
2. **ConfigManager** — persistent user/database config via electron-store
3. **ConnectionManager** — TypeORM DataSource management (SQLite default, MySQL optional)
4. **FontManager** — font scanning (FontFinder), activation, system dialogs
5. **MessageHandler** — registers all IPC channel handlers

IPC channels are defined as constants in `app/config/channel.ts` (~75 channels organized by domain).

### Angular Renderer (`src/`)

- **NgModule pattern** — all components use `standalone: false`
- **Routing** — hash-based (`useHash: true`), feature routes wrapped via `LayoutService.childRoutes()` shell pattern
- **State management** — BehaviorSubject-based reactive state in services (no NgRx/Redux)
- **i18n** — @ngx-translate with HTTP loader, default language 'en'

**Module structure:**
- `CoreModule` — shell only; services are `providedIn: 'root'`
- `SharedModule` — reusable components (Modal, Alert, Paginator, etc.), directives, pipes
- `LayoutModule` — app shell (Header, Footer, Navigation, Aside)
- `MainModule` — primary feature (Grid, Preview, Toolbar, Inspect)
- `SettingsModule` — settings pages (Theme, General, System, Database, Logs)
- `WaterfallModule` — waterfall font display

### Database

TypeORM + SQLite with four entities in `app/database/entity/`:
- **Collection** — font groups/folders (nested set model with left_id/right_id)
- **Store** — font file records with full OpenType metadata
- **User** — user accounts
- **Logger** — application log entries

Custom repositories in `app/database/repository/`.

### IPC Communication Flow

```
Renderer: ElectronService → MessageService → ipcRenderer.send()
    ↕
Main: MessageHandler → ConnectionManager / FontManager / ConfigManager
```

### Font Processing Pipeline

User selects files/folders → `FontManager` → `FontFinder` walks directories → `opentype.js` parses font files → `FontObject` extracts metadata → TypeORM persists to SQLite.

Supported formats: TTF, OTF, WOFF, WOFF2, TTC, dfont (defined in `app/config/mimes.ts`).

## Critical Build Rules

### Entity Import Restriction

**Entity imports from `@main/database/entity/*` MUST use `import type` in renderer code.** TypeORM decorators trigger Node.js dependencies that cause esbuild failures at build time.

```typescript
// CORRECT — in renderer code
import type { Store } from '@main/database/entity/Store';

// WRONG — will break the build
import { Store } from '@main/database/entity/Store';
```

Config, enum, and type imports from `@main/config/*`, `@main/enums/*`, `@main/types/*` work normally (no Node.js dependencies).

### Path Aliases

| Alias | Maps to |
|-------|---------|
| `@app/*` | `src/app/*` |
| `@env/*` | `src/environments/*` |
| `@main/*` | `app/*` (Electron main process) |

### Build Output

Angular builds to `dist/browser/`. The electron-builder config and Electron production mode both reference this path.

## Theming

7 themes available, switched via `body[data-theme="<name>"]` CSS attribute. Theme state persisted through electron-store and managed by `PresentationService`.

Theme SCSS files are in `src/styles/themes/`. SCSS tooling (variables, mixins, functions) is in `src/styles/tools/`.

**Known Sass deprecations:** The project uses `@import` (deprecated in Dart Sass 3.0) and `lighten()` global function. These will eventually need migration to `@use`/`@forward` and `color.adjust()`/`color.scale()`.

## Formatting

- 2-space indentation, UTF-8, single quotes for TypeScript
- Final newline, trim trailing whitespace (except Markdown)
