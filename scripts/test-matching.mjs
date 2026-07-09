#!/usr/bin/env node
// Compare the matching output of the impi-cli against the expected results
// encoded in a BFS "Testfaelle_Matching" file.
//
// The Testfaelle file holds the standard input columns (1-21) plus three
// expected-result columns: `match` (numeric matching type), `matchingtype`
// (human description) and `Zusatzbedingung`. The `match` column is the
// ground truth and maps directly to MatchingTypeEnum:
//   0 PointMatching | 1 CenterStreetMatching | 2 CenterCommunitiesMatching
//   3 NoMatching    | 4 NoMatchingWithError  | 5 EGIDMatching
//
// Usage:
//   node test-matching.mjs <cli.cjs> <geo.db> <Testfaelle.csv> <encoding> <workDir>

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync, readdirSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [, , cliPath, dbPath, testFile, encoding = 'utf8'] = process.argv;
if (!cliPath || !dbPath || !testFile) {
    console.error('Usage: test-matching.mjs <cli.cjs> <geo.db> <Testfaelle.csv> [encoding]');
    process.exit(2);
}

const SEP = ';';
const ENUM_NAMES = ['PointMatching', 'CenterStreetMatching', 'CenterCommunitiesMatching',
    'NoMatching', 'NoMatchingWithError', 'EGIDMatching'];

// --- Read the Testfaelle file ------------------------------------------------
const raw = readFileSync(testFile, encoding === 'windows1252' ? 'latin1' : 'utf8');
const lines = raw.split(/\r?\n/).filter((l) => l.length > 0);
const header = lines[0].split(SEP);
const matchIdx = header.findIndex((h) => h.trim().toLowerCase() === 'match');
if (matchIdx === -1) { console.error('No `match` column in test file'); process.exit(2); }
const inputCols = matchIdx; // columns 0..matchIdx-1 are the standard input columns

const rows = lines.slice(1).map((l) => l.split(SEP));

// --- Build the CLI input file (standard columns + empty egid) ----------------
const work = mkdtempSync(join(tmpdir(), 'impi-match-'));
const inputCsv = join(work, 'input.csv');
const inHeader = header.slice(0, inputCols).concat('egid').join(SEP);
const inLines = rows.map((r) => r.slice(0, inputCols).concat('').join(SEP));
writeFileSync(inputCsv, [inHeader, ...inLines].join('\n') + '\n',
    encoding === 'windows1252' ? 'latin1' : 'utf8');

const expected = rows.map((r) => Number((r[matchIdx] || '').trim()));

// --- Run the CLI -------------------------------------------------------------
const outDir = join(work, 'out');
mkdirSync(outDir, { recursive: true });
execFileSync('node', [cliPath, '--db', dbPath, '--csv', inputCsv, '--out', outDir,
    '--enc', encoding, '--sep', SEP, '-l', 'error'], { stdio: ['ignore', 'ignore', 'inherit'] });

const zipName = readdirSync(outDir).find((f) => f.startsWith('data_') && f.endsWith('.zip'));
if (!zipName) { console.error('CLI produced no output ZIP'); process.exit(1); }

// --- Read the output CSV from the ZIP ----------------------------------------
const exDir = join(work, 'extracted');
mkdirSync(exDir, { recursive: true });
execFileSync('unzip', ['-o', join(outDir, zipName), '-d', exDir], { stdio: 'ignore' });
const outCsvName = readdirSync(exDir).find((f) => f.startsWith('data_') && f.endsWith('.csv'));
const outCsv = readFileSync(join(exDir, outCsvName), 'utf8');

const outLines = outCsv.split(/\r?\n/).filter((l) => l.length > 0);
const outHeader = outLines[0].split(SEP);
const mtIdx = outHeader.findIndex((h) => h.trim().toLowerCase() === 'matchingtype');
const actual = outLines.slice(1).map((l) => Number(l.split(SEP)[mtIdx]));

// --- Compare -----------------------------------------------------------------
if (actual.length !== expected.length) {
    console.error(`Row count mismatch: expected ${expected.length}, got ${actual.length}`);
}
const n = Math.min(actual.length, expected.length);
let pass = 0;
const fails = [];
for (let i = 0; i < n; i++) {
    if (actual[i] === expected[i]) pass++;
    else fails.push({ row: i + 2, street: rows[i].slice(0, 6).join(';'),
        exp: expected[i], expName: ENUM_NAMES[expected[i]] ?? '?',
        got: actual[i], gotName: ENUM_NAMES[actual[i]] ?? '?' });
}

console.log(`\nMatching test: ${testFile.split('/').pop()}`);
console.log(`  Rows compared: ${n}`);
console.log(`  Passed:        ${pass}`);
console.log(`  Failed:        ${fails.length}`);
if (fails.length) {
    console.log('\n  Mismatches (row | input | expected -> got):');
    for (const f of fails.slice(0, 40)) {
        console.log(`    line ${f.row} | ${f.street} | ${f.exp} ${f.expName} -> ${f.got} ${f.gotName}`);
    }
    if (fails.length > 40) console.log(`    ... and ${fails.length - 40} more`);
}
process.exit(fails.length === 0 && actual.length === expected.length ? 0 : 1);
