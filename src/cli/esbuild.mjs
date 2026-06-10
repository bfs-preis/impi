import { build } from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

await build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'cjs',
    outfile: 'dist/bundle.cjs',
    external: ['sqlite3', 'better-sqlite3'],
    alias: {
        'impilib': resolve(__dirname, '../libs/impilib/src/index.ts'),
        'normalize-common': resolve(__dirname, '../libs/normalize-common/src/index.ts'),
        'normalize-street': resolve(__dirname, '../libs/normalize-street/src/index.ts'),
        'normalize-city': resolve(__dirname, '../libs/normalize-city/src/index.ts'),
    },
});
