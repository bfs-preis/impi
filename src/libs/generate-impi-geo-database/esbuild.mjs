import { build } from 'esbuild';

await build({
    entryPoints: ['src/generate-impi-db-cli.ts'],
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'cjs',
    outfile: 'dist/bundle.cjs',
    external: ['better-sqlite3'],
});
