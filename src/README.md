# IMPI Source Code

This directory contains the complete source code for the IMPI (Immobilienpreisindex) system.

## 🚀 Quick Start

### Automatic Setup (Recommended)

**Unix/Linux/macOS:**
```bash
cd src
./scripts/setup.sh
```

**Windows:**
```cmd
cd src
scripts\setup.bat
```

**Cross-platform (using Node.js):**
```bash
cd src
npm run setup
```

### Manual Setup

1. **Ensure Node.js 20+ is installed**
   ```bash
   node --version  # Should be v20.0.0 or higher (v22.19.0 LTS recommended)
   ```

2. **Check/Install pnpm**
   ```bash
   npm run check-pnpm  # Checks and installs pnpm if needed
   ```

3. **Install dependencies**
   ```bash
   pnpm install
   ```

4. **Build and test**
   ```bash
   pnpm run build
   pnpm run test
   ```

## 📁 Project Structure

```
src/
├── libs/                 # Library packages (see libs/README.md)
│   ├── normalize-common/ # Shared normalization utilities
│   ├── normalize-street/ # Street name normalization
│   ├── normalize-city/   # City name normalization
│   ├── impi-types/      # TypeScript type definitions
│   ├── impilib/         # Main processing library
│   └── generate-impi-geo-database/  # Geographic database generation
├── scripts/             # Setup and utility scripts
│   ├── ensure-pnpm.js   # pnpm installation checker
│   ├── setup.sh         # Unix setup script
│   └── setup.bat        # Windows setup script
├── .nvmrc              # Node.js version + pnpm config
├── .node-version       # Node.js version (for nodenv/fnm)
├── .pnpmrc             # pnpm configuration
└── package.json        # Workspace configuration
```

## 🛠️ Development Commands

### Workspace Commands (run from `/src/`)
```bash
# Setup and installation
npm run setup           # Complete project setup
npm run check-pnpm      # Check/install pnpm only
pnpm install            # Install all dependencies

# Building and testing
pnpm run build          # Build all packages
pnpm run test           # Test all packages
pnpm run clean          # Clean all build outputs
pnpm run dev            # Build + test everything

# Code quality
pnpm run lint           # Lint all packages
pnpm run typecheck      # Type check without emitting

# Libraries specific
pnpm run libs:install   # Install libs dependencies
pnpm run libs:build     # Build libs packages
pnpm run libs:test      # Test libs packages
```

### Package-Specific Commands
```bash
# Work with specific packages
pnpm --filter normalize-street run build
pnpm --filter impilib run test
pnpm --filter normalize-common add lodash
```

## 🔧 Configuration

### Node.js Version Management

The project requires Node.js 20+ and uses multiple version specification methods:

- **`.nvmrc`** - For nvm users: `nvm use` (specifies v22.19.0 LTS)
- **`.node-version`** - For nodenv/fnm users (auto-detected)
- **`package.json engines`** - Enforces minimum versions (>=20.0.0)
- **`volta` in package.json** - For Volta users (auto-switching to v22.19.0)

### pnpm Configuration

- **`.pnpmrc`** - Project-wide pnpm settings
- **`packageManager` in package.json** - Specifies exact pnpm version
- **`preinstall` script** - Enforces pnpm usage (via only-allow-pnpm)

## 🔍 Troubleshooting

### pnpm not found
```bash
# Install pnpm globally
npm install -g pnpm

# Or use our setup script
npm run check-pnpm
```

### Node.js version issues
```bash
# Using nvm
nvm use

# Using volta (auto-switches)
cd src

# Manual check
node --version  # Should be 20.0.0+ (22.19.0 LTS recommended)
```

### Build errors
```bash
# Clean and rebuild everything
pnpm run clean
pnpm install
pnpm run build
```

### Permission errors (Linux/macOS)
```bash
# Make scripts executable
chmod +x scripts/*.sh scripts/*.js
```

### Windows script execution
```cmd
# If execution policy blocks scripts
powershell -ExecutionPolicy Bypass -File scripts\setup.bat
```

## 🧪 Testing

The project uses a comprehensive testing setup:

- **Unit tests** in each package (`*.spec.ts` files)
- **Integration tests** in impilib
- **Type checking** via TypeScript
- **Linting** via ESLint

```bash
# Run all tests
pnpm run test

# Test specific package
pnpm --filter impilib run test

# Test with coverage (if configured)
pnpm --filter impilib run test:coverage
```

## 📦 Package Management

### Adding Dependencies

```bash
# Add to specific package
pnpm --filter normalize-common add dayjs

# Add dev dependency
pnpm --filter impilib add -D @types/jest

# Add to workspace root
pnpm add -w typescript
```

### Updating Dependencies

```bash
# Update all packages
pnpm update

# Update specific package dependencies
pnpm --filter impilib update

# Interactive update
pnpm update --interactive
```

## 🔗 Related Documentation

- [Library Documentation](./libs/README.md) - Detailed libs information
- [Upgrade Guide](./libs/UPGRADE_GUIDE.md) - Migration and changes
- [pnpm Documentation](https://pnpm.io/) - Package manager reference

## 🤝 Contributing

1. Fork the repository
2. Run the setup: `npm run setup`
3. Make your changes
4. Test: `pnpm run test`
5. Lint: `pnpm run lint`
6. Submit a pull request

## 📄 License

[Specify your license here]