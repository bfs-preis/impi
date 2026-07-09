#!/usr/bin/env node
// Single source of truth for the project version: src/package.json.
// This script stamps that version into every other place it appears.
//
// Usage:
//   node scripts/bump-version.mjs <version>          bump all files
//   node scripts/bump-version.mjs <version> --tag    bump + git commit + git tag v<version>
//   node scripts/bump-version.mjs --check            verify all files match src/package.json
//
// From the src/ workspace: `pnpm run bump 2.0.0-rc.2` or `pnpm run release 2.0.0-rc.2`.

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

// The authoritative version lives in the first entry; all others are stamped.
const PACKAGE_JSONS = [
    'src/package.json',
    'src/electron/package.json',
    'src/cli/package.json',
    'src/libs/package.json',
    'src/libs/normalize-common/package.json',
    'src/libs/normalize-street/package.json',
    'src/libs/normalize-city/package.json',
    'src/libs/impilib/package.json',
    'src/libs/generate-impi-geo-database/package.json',
];

// Hardcoded version strings in shipped source files (no package.json at runtime).
const SOURCE_STAMPS = [
    {
        file: 'src/libs/generate-impi-geo-database/src/generate-impi-db-cli.ts',
        pattern: /(\.version\(')[^']+('\))/,
    },
    {
        file: 'src/python/generate_impi_db.py',
        pattern: /(^VERSION = ")[^"]+("$)/m,
    },
];

const VERSION_RE = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;
const PKG_VERSION_RE = /("version":\s*")[^"]+(")/;

function read(path) {
    return readFileSync(join(repoRoot, path), 'utf8');
}

function packageVersion(path) {
    return JSON.parse(read(path)).version;
}

function check() {
    const want = packageVersion(PACKAGE_JSONS[0]);
    const drift = [];
    for (const path of PACKAGE_JSONS.slice(1)) {
        const got = packageVersion(path);
        if (got !== want) drift.push(`${path}: ${got}`);
    }
    for (const { file, pattern } of SOURCE_STAMPS) {
        const match = read(file).match(pattern);
        if (!match) {
            drift.push(`${file}: version string not found`);
            continue;
        }
        const value = match[0].slice(match[1].length, match[0].length - match[2].length);
        if (value !== want) drift.push(`${file}: ${value}`);
    }
    if (drift.length) {
        console.error(`Version drift (src/package.json says ${want}):`);
        for (const line of drift) console.error(`  ${line}`);
        process.exit(1);
    }
    console.log(`All versions in sync: ${want}`);
}

function bump(version, tag) {
    if (!VERSION_RE.test(version)) {
        console.error(`Invalid version: ${version} (expected e.g. 2.0.0 or 2.0.0-rc.2)`);
        process.exit(1);
    }

    const touched = [];
    for (const path of PACKAGE_JSONS) {
        const src = read(path);
        const out = src.replace(PKG_VERSION_RE, `$1${version}$2`);
        if (out !== src) {
            writeFileSync(join(repoRoot, path), out);
            touched.push(path);
        }
    }
    for (const { file, pattern } of SOURCE_STAMPS) {
        const src = read(file);
        if (!pattern.test(src)) {
            console.error(`${file}: version string not found — pattern out of date?`);
            process.exit(1);
        }
        const out = src.replace(pattern, `$1${version}$2`);
        if (out !== src) {
            writeFileSync(join(repoRoot, file), out);
            touched.push(file);
        }
    }

    console.log(`Stamped ${version} into:`);
    for (const path of touched) console.log(`  ${path}`);
    if (!touched.length) console.log('  (nothing — already at that version)');

    if (!tag) return;

    const git = (...args) => execFileSync('git', args, { cwd: repoRoot, stdio: 'inherit' });
    const gitOut = (...args) =>
        execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8' }).trim();

    if (gitOut('tag', '--list', `v${version}`)) {
        console.error(`Tag v${version} already exists`);
        process.exit(1);
    }
    const files = [...PACKAGE_JSONS, ...SOURCE_STAMPS.map((s) => s.file)];
    git('add', '--', ...files);
    git('commit', '-m', `release: v${version}`);
    git('tag', `v${version}`);
    console.log(`\nCommitted and tagged v${version}. To trigger the release build:`);
    console.log(`  git push && git push origin v${version}`);
}

const args = process.argv.slice(2);
const tag = args.includes('--tag');
const checkMode = args.includes('--check');
const version = args.find((a) => !a.startsWith('--'));

if (checkMode) {
    check();
} else if (version) {
    bump(version, tag);
} else {
    console.error('Usage: bump-version.mjs <version> [--tag] | --check');
    process.exit(1);
}
