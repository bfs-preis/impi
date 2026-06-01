/**
 * Installs production dependencies into electron/app/node_modules
 * for electron-builder packaging.
 *
 * Resolves workspace packages and their transitive npm deps from
 * the pnpm-managed node_modules. Handles version conflicts by
 * nesting deps inside the package that needs a specific version.
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

// Track top-level copied packages: name -> realPath
const topLevel = new Map();

function findPackage(name, parentRealPath) {
    if (parentRealPath) {
        const sibling = join(dirname(parentRealPath), name);
        if (existsSync(sibling)) return realpathSync(sibling);
    }
    const hoisted = join(pnpmNodeModules, name);
    if (existsSync(hoisted)) return realpathSync(hoisted);
    const root = join(srcDir, 'node_modules', name);
    if (existsSync(root)) return realpathSync(root);
    if (existsSync(pnpmDir)) {
        const prefix = name.startsWith('@') ? name.replace('/', '+') : name;
        for (const entry of readdirSync(pnpmDir)) {
            if (entry.startsWith(prefix + '@')) {
                const c = join(pnpmDir, entry, 'node_modules', name);
                if (existsSync(c)) return realpathSync(c);
            }
        }
    }
    return null;
}

function doCopy(realSrc, destDir) {
    cpSync(realSrc, destDir, {
        recursive: true,
        filter: (s) => {
            const rel = s.slice(realSrc.length);
            return !rel.includes('node_modules') && !rel.endsWith('.tsbuildinfo');
        }
    });
}

/**
 * Copy a package and all its deps. If a dep version conflicts with
 * an already-copied top-level version, nest it inside the parent.
 */
function copyTree(name, parentRealPath, parentCopiedDir, depth) {
    if (depth > 20) return;

    const realSrc = findPackage(name, parentRealPath);
    if (!realSrc) {
        if (depth === 0) console.warn(`  WARNING: ${name} not found`);
        return;
    }

    // Check if already at top level with same real path
    if (topLevel.has(name)) {
        if (topLevel.get(name) === realSrc) return; // same version, skip
        // Different version needed — nest inside the parent package
        const nestedNM = join(parentCopiedDir, 'node_modules');
        const nestedDir = join(nestedNM, name);
        if (existsSync(nestedDir)) return;
        mkdirSync(nestedNM, { recursive: true });
        doCopy(realSrc, nestedDir);
        resolveDeps(nestedDir, realSrc, depth + 1);
        return;
    }

    // First time seeing this package — copy to top level
    const dest = join(appNodeModules, name);
    topLevel.set(name, realSrc);
    if (depth === 0) console.log(`  ${name}`);
    doCopy(realSrc, dest);

    resolveDeps(dest, realSrc, depth + 1);
}

function resolveDeps(pkgDir, parentRealPath, depth) {
    const pkgJsonPath = join(pkgDir, 'package.json');
    if (!existsSync(pkgJsonPath)) return;
    const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
    for (const dep of Object.keys(pkg.dependencies || {})) {
        copyTree(dep, parentRealPath, pkgDir, depth);
    }
}

function readPkg(p) { return JSON.parse(readFileSync(p, 'utf8')); }

// 1. Workspace packages
console.log('Copying workspace packages...');
for (const pkg of ['impilib', 'normalize-common', 'normalize-street', 'normalize-city']) {
    copyTree(pkg, null, null, 0);
}

// 2. App direct deps
const appPkg = readPkg(appPkgPath);
console.log('Copying app dependencies...');
for (const dep of Object.keys(appPkg.dependencies || {})) {
    copyTree(dep, null, null, 0);
}

// 3. impilib's npm deps
const impilibPkg = readPkg(join(srcDir, 'libs', 'impilib', 'package.json'));
console.log('Copying impilib dependencies...');
for (const [dep, ver] of Object.entries(impilibPkg.dependencies || {})) {
    if (typeof ver === 'string' && !ver.startsWith('workspace:')) {
        copyTree(dep, null, null, 0);
    }
}

console.log(`Done. Copied ${topLevel.size} top-level packages.`);
