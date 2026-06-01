import { build } from 'esbuild';

await build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node22',
    format: 'cjs',
    outfile: 'dist/bundle.cjs',
    external: ['sqlite3', 'better-sqlite3'],
});
