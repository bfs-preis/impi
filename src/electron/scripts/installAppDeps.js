/**
 * Installs production dependencies into electron/app/node_modules
 * for electron-builder packaging.
 *
 * Resolves workspace packages and their transitive npm deps from
 * the pnpm-managed node_modules, copies them as flat directories
 * (no symlinks) so electron-builder can bundle them.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, realpathSync, readdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(__dirname, '..', '..');
const appNodeModules = resolve(__dirname, '..', 'app', 'node_modules');
const appPkgPath = resolve(__dirname, '..', 'app', 'package.json');
const pnpmDir = join(srcDir, 'node_modules', '.pnpm');
const pnpmNodeModules = join(pnpmDir, 'node_modules');

mkdirSync(appNodeModules, { recursive: true });

const copied = new Set();

function findInPnpmStore(name) {
    // 1. Check .pnpm/node_modules/<name> (hoisted/linked packages)
    const hoisted = join(pnpmNodeModules, name);
    if (existsSync(hoisted)) return realpathSync(hoisted);

    // 2. Check node_modules/<name> (root hoisted)
    const root = join(srcDir, 'node_modules', name);
    if (existsSync(root)) return realpathSync(root);

    // 3. Search .pnpm/<name>@*/node_modules/<name> (versioned store)
    if (existsSync(pnpmDir)) {
        const prefix = name.startsWith('@') ? name.replace('/', '+') : name;
        for (const entry of readdirSync(pnpmDir)) {
            if (entry.startsWith(prefix + '@')) {
                const candidate = join(pnpmDir, entry, 'node_modules', name);
                if (existsSync(candidate)) return realpathSync(candidate);
            }
        }
    }

    return null;
}

function copyDep(name) {
    if (copied.has(name)) return;
    copied.add(name);

    const realSrc = findInPnpmStore(name);
    if (!realSrc) {
        console.warn(`  WARNING: ${name} not found`);
        return;
    }

    const dest = join(appNodeModules, name);
    console.log(`  ${name}`);
    cpSync(realSrc, dest, {
        recursive: true,
        filter: (s) => {
            const rel = s.slice(realSrc.length);
            return !rel.includes('node_modules') && !rel.endsWith('.tsbuildinfo');
        }
    });
}

function readPkg(pkgPath) {
    return JSON.parse(readFileSync(pkgPath, 'utf8'));
}

// 1. Copy workspace packages
const workspacePackages = ['impilib', 'normalize-common', 'normalize-street', 'normalize-city'];
console.log('Copying workspace packages...');
for (const pkg of workspacePackages) {
    copyDep(pkg);
}

// 2. Copy app's direct npm dependencies (electron-log, yargs, etc.)
const appPkg = readPkg(appPkgPath);
console.log('Copying app dependencies...');
for (const dep of Object.keys(appPkg.dependencies || {})) {
    copyDep(dep);
}

// 3. Copy impilib's npm dependencies (sqlite3, archiver, etc.)
const impilibPkgPath = join(srcDir, 'libs', 'impilib', 'package.json');
const impilibPkg = readPkg(impilibPkgPath);
console.log('Copying impilib dependencies...');
for (const [dep, version] of Object.entries(impilibPkg.dependencies || {})) {
    if (typeof version === 'string' && !version.startsWith('workspace:')) {
        copyDep(dep);
    }
}

// 4. Recursively copy transitive dependencies
console.log('Copying transitive dependencies...');
let iterations = 0;
let newDeps = true;
while (newDeps && iterations < 15) {
    newDeps = false;
    iterations++;
    for (const name of [...copied]) {
        const pkgJsonPath = join(appNodeModules, name, 'package.json');
        if (!existsSync(pkgJsonPath)) continue;
        const pkg = readPkg(pkgJsonPath);
        for (const dep of Object.keys(pkg.dependencies || {})) {
            if (!copied.has(dep)) {
                copyDep(dep);
                newDeps = true;
            }
        }
    }
}

console.log(`Done. Copied ${copied.size} packages in ${iterations} iterations.`);
