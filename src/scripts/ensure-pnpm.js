#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

const REQUIRED_PNPM_VERSION = '8.0.0';
const RECOMMENDED_PNPM_VERSION = '8.15.1';

/**
 * Check if pnpm is available globally
 */
function isPnpmAvailable() {
  try {
    const version = execSync('pnpm --version', { encoding: 'utf8', stdio: 'pipe' }).trim();
    console.log(`✅ pnpm found: v${version}`);

    // Check if version meets requirements
    if (compareVersions(version, REQUIRED_PNPM_VERSION) >= 0) {
      if (compareVersions(version, RECOMMENDED_PNPM_VERSION) < 0) {
        console.log(`⚠️  Consider upgrading to pnpm v${RECOMMENDED_PNPM_VERSION} for best compatibility`);
      }
      return true;
    } else {
      console.log(`❌ pnpm version ${version} is below required ${REQUIRED_PNPM_VERSION}`);
      return false;
    }
  } catch (error) {
    console.log('❌ pnpm not found globally');
    return false;
  }
}

/**
 * Compare semantic versions
 */
function compareVersions(a, b) {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;

    if (aPart > bPart) return 1;
    if (aPart < bPart) return -1;
  }
  return 0;
}

/**
 * Check if corepack is available
 */
function isCorpackAvailable() {
  try {
    execSync('corepack --version', { encoding: 'utf8', stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Install pnpm using corepack
 */
function installWithCorepack() {
  console.log('📦 Installing pnpm using corepack...');
  try {
    execSync('corepack enable', { stdio: 'inherit' });
    execSync(`corepack prepare pnpm@${RECOMMENDED_PNPM_VERSION} --activate`, { stdio: 'inherit' });
    console.log('✅ pnpm installed successfully with corepack');
    return true;
  } catch (error) {
    console.log('❌ Failed to install with corepack:', error.message);
    return false;
  }
}

/**
 * Install pnpm using npm
 */
function installWithNpm() {
  console.log('📦 Installing pnpm using npm...');
  try {
    execSync(`npm install -g pnpm@${RECOMMENDED_PNPM_VERSION}`, { stdio: 'inherit' });
    console.log('✅ pnpm installed successfully with npm');
    return true;
  } catch (error) {
    console.log('❌ Failed to install with npm:', error.message);
    return false;
  }
}

/**
 * Install pnpm using the best available method
 */
function installPnpm() {
  console.log('🚀 Installing pnpm...');

  // Try corepack first (recommended for Node 16.9+)
  if (isCorpackAvailable()) {
    if (installWithCorepack()) {
      return true;
    }
  }

  // Fallback to npm
  if (installWithNpm()) {
    return true;
  }

  console.log('❌ Failed to install pnpm automatically');
  console.log('Please install pnpm manually:');
  console.log('  npm install -g pnpm');
  console.log('  or visit: https://pnpm.io/installation');

  return false;
}

/**
 * Verify Node.js version
 */
function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

  console.log(`Node.js version: ${nodeVersion}`);

  if (majorVersion < 20) {
    console.log('⚠️  Warning: Node.js 20+ recommended for best compatibility');
    console.log('   Current project requires Node.js >= 20.0.0');
    console.log('   Latest LTS: 22.19.0');
  } else if (majorVersion < 22) {
    console.log('✅ Node.js version is compatible');
    console.log('💡 Consider upgrading to Node.js 22.19.0 LTS for latest features');
  } else {
    console.log('✅ Node.js version is up to date');
  }
}

/**
 * Main function
 */
function main() {
  console.log('🔧 Checking pnpm installation...\n');

  // Check Node.js version
  checkNodeVersion();
  console.log('');

  // Check if pnpm is available
  if (isPnpmAvailable()) {
    console.log('✅ pnpm is ready to use!\n');

    // Check if we're in the right directory
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (existsSync(packageJsonPath)) {
      console.log('💡 Next steps:');
      console.log('   pnpm install    # Install dependencies');
      console.log('   pnpm run build  # Build all packages');
      console.log('   pnpm run test   # Run tests');
    }

    process.exit(0);
  }

  // Try to install pnpm
  if (installPnpm()) {
    console.log('\n✅ pnpm setup complete!');
    console.log('💡 You can now run: pnpm install');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  isPnpmAvailable,
  installPnpm,
  checkNodeVersion
};