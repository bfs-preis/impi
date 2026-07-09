#!/usr/bin/env node
// Compare the validation output of the impi-cli against the expected results
// encoded in a BFS "Testfaelle_Validierung" file.
//
// The Testfaelle file holds the standard input columns (1-21) plus three
// expected-result columns: `ValidationNr` (the rule Id that must fire),
// `Fehlertyp` (human description) and `Bemerkung`.
//
// The CLI emits `validationflags` as a bitmask: bit `Id` is set when rule
// `Id` was violated (flags |= 2^Id). A row passes the test when the bit for
// its expected ValidationNr is set.
//
// Usage:
//   node test-validation.mjs <cli.cjs|index.js> <geo.db> <Testfaelle.csv> [encoding]

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync, readdirSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [, , cliPath, dbPath, testFile, encoding = 'utf8'] = process.argv;
if (!cliPath || !dbPath || !testFile) {
    console.error('Usage: test-validation.mjs <cli> <geo.db> <Testfaelle.csv> [encoding]');
    process.exit(2);
}

const SEP = ';';
const enc = encoding === 'windows1252' ? 'latin1' : 'utf8';

// --- Read the Testfaelle file ------------------------------------------------
const raw = readFileSync(testFile, enc);
const lines = raw.split(/\r?\n/).filter((l) => l.length > 0);
const header = lines[0].split(SEP);
const nrIdx = header.findIndex((h) => h.trim().toLowerCase() === 'validationnr');
const typeIdx = header.findIndex((h) => h.trim().toLowerCase() === 'fehlertyp');
if (nrIdx === -1) { console.error('No `ValidationNr` column in test file'); process.exit(2); }
const inputCols = nrIdx; // columns 0..nrIdx-1 are the standard input columns

const rows = lines.slice(1).map((l) => l.split(SEP));

// --- Build the CLI input file (standard columns + empty egid) ----------------
const work = mkdtempSync(join(tmpdir(), 'impi-val-'));
const inputCsv = join(work, 'input.csv');
const inHeader = header.slice(0, inputCols).concat('egid').join(SEP);
const inLines = rows.map((r) => r.slice(0, inputCols).concat('').join(SEP));
writeFileSync(inputCsv, [inHeader, ...inLines].join('\n') + '\n', enc);

const expectedNr = rows.map((r) => Number((r[nrIdx] || '').trim()));
const expectedType = rows.map((r) => (r[typeIdx] || '').trim());

// --- Run the CLI -------------------------------------------------------------
const outDir = join(work, 'out');
mkdirSync(outDir, { recursive: true });
execFileSync('node', [cliPath, '--db', dbPath, '--csv', inputCsv, '--out', outDir,
    '--enc', encoding, '--sep', SEP, '-l', 'error'], { stdio: ['ignore', 'ignore', 'inherit'] });

const zipName = readdirSync(outDir).find((f) => f.startsWith('data_') && f.endsWith('.zip'));
if (!zipName) { console.error('CLI produced no output ZIP'); process.exit(1); }

const exDir = join(work, 'extracted');
mkdirSync(exDir, { recursive: true });
execFileSync('unzip', ['-o', join(outDir, zipName), '-d', exDir], { stdio: 'ignore' });
const outCsvName = readdirSync(exDir).find((f) => f.startsWith('data_') && f.endsWith('.csv'));
const outCsv = readFileSync(join(exDir, outCsvName), 'utf8');

const outLines = outCsv.split(/\r?\n/).filter((l) => l.length > 0);
const outHeader = outLines[0].split(SEP);
const flagIdx = outHeader.findIndex((h) => h.trim().toLowerCase() === 'validationflags');
const flags = outLines.slice(1).map((l) => {
    const v = (l.split(SEP)[flagIdx] || '0').trim();
    try { return BigInt(v || '0'); } catch { return 0n; }
});

// Decode a bitmask into the list of set rule Ids.
const setBits = (mask) => {
    const ids = [];
    for (let i = 0; i < 64 && mask > 0n; i++) {
        if ((mask >> BigInt(i)) & 1n) ids.push(i);
    }
    return ids;
};

// --- Compare -----------------------------------------------------------------
if (flags.length !== expectedNr.length) {
    console.error(`Row count mismatch: expected ${expectedNr.length}, got ${flags.length}`);
}
const n = Math.min(flags.length, expectedNr.length);
let pass = 0;
const fails = [];
for (let i = 0; i < n; i++) {
    const want = expectedNr[i];
    const hit = (flags[i] >> BigInt(want)) & 1n;
    if (hit === 1n) pass++;
    else fails.push({ row: i + 2, nr: want, type: expectedType[i], got: setBits(flags[i]) });
}

console.log(`\nValidation test: ${testFile.split('/').pop()}`);
console.log(`  Rows compared: ${n}`);
console.log(`  Passed:        ${pass}`);
console.log(`  Failed:        ${fails.length}`);
if (fails.length) {
    console.log('\n  Mismatches (row | expected rule | violated rules in output):');
    for (const f of fails.slice(0, 60)) {
        console.log(`    line ${f.row} | rule ${f.nr} "${f.type}" | got rules [${f.got.join(',')}]`);
    }
    if (fails.length > 60) console.log(`    ... and ${fails.length - 60} more`);
}
process.exit(fails.length === 0 && flags.length === expectedNr.length ? 0 : 1);
