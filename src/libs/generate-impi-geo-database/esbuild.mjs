import { build } from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

await build({
    entryPoints: ['src/generate-impi-db-cli.ts'],
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'cjs',
    outfile: 'dist/bundle.cjs',
    external: ['better-sqlite3'],
    alias: {
        'normalize-common': resolve(__dirname, '../normalize-common/src/index.ts'),
        'normalize-street': resolve(__dirname, '../normalize-street/src/index.ts'),
        'normalize-city': resolve(__dirname, '../normalize-city/src/index.ts'),
    },
});
