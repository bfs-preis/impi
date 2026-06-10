# IMPI Libraries

This directory contains the modular libraries for the IMPI (Immobilienpreisindex) system.

## Package Manager

This project uses **pnpm** for package management, which provides:
- Faster installations
- Better disk space efficiency
- Stricter dependency resolution
- Built-in workspace support

## Quick Start

```bash
# Install pnpm globally (if not already installed)
npm install -g pnpm

# Install all dependencies
pnpm install

# Build all packages
pnpm run build

# Run all tests
pnpm run test
```

## Package Structure

```
src/libs/
├── normalize-common/     # Shared normalization utilities
├── normalize-street/     # Street name normalization
├── normalize-city/       # City name normalization
├── impi-types/          # TypeScript type definitions
├── impilib/             # Main processing library
└── generate-impi-geo-database/  # Geographic database generation
```

## Available Commands

### Workspace Commands (run from `/src/libs/`)
- `pnpm run build` - Build all packages
- `pnpm run test` - Test all packages
- `pnpm run clean` - Clean all build outputs
- `pnpm run lint` - Lint all TypeScript files
- `pnpm run lint:fix` - Fix linting issues
- `pnpm run typecheck` - Type check without emitting
- `pnpm run build:all` - Clean and build everything
- `pnpm run test:all` - Build and test everything

### Package-Specific Commands
```bash
# Build specific package
pnpm --filter normalize-street run build

# Test specific package
pnpm --filter impilib run test

# Add dependency to specific package
pnpm --filter normalize-common add dayjs

# Add dev dependency to specific package
pnpm --filter impilib add -D @types/node
```

## Dependencies

### Inter-package Dependencies
- `impilib` depends on `normalize-street`, `normalize-city`, `normalize-common`
- `normalize-street` depends on `normalize-common`
- `normalize-city` depends on `normalize-common`
- `impi-types` is standalone

### External Dependencies
All packages use modern, updated versions:
- TypeScript 5.3.3
- Latest Node.js types (@types/node@^22.10.0)
- Updated testing frameworks (Mocha 10.x, Chai 4.3.x)
- Modern build tools

## Development Workflow

1. **Make changes** to any package
2. **Build** with `pnpm run build` (or specific package)
3. **Test** with `pnpm run test`
4. **Lint** with `pnpm run lint`
5. **Type check** with `pnpm run typecheck`

## Key Features

- ✅ **Modern TypeScript** (5.3.3) with strict checking
- ✅ **Shared utilities** in `normalize-common`
- ✅ **No prototype pollution** - safe string operations
- ✅ **Consistent tooling** - ESLint, shared tsconfig
- ✅ **Fast builds** - pnpm workspace optimization
- ✅ **Type safety** - full TypeScript coverage

## Troubleshooting

### pnpm not found
```bash
npm install -g pnpm
```

### Build errors
```bash
# Clean and rebuild
pnpm run clean
pnpm run build
```

### Dependency issues
```bash
# Remove node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

See [UPGRADE_GUIDE.md](./UPGRADE_GUIDE.md) for migration details and breaking changes.