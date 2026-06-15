import { createRequire } from 'module';
import * as path from 'path';

// Resolve a base path for `createRequire` that works in every runtime:
//  - ESM (tsc output, ts-node tests): `import.meta.url` is set.
//  - esbuild CJS bundle / pkg executable: esbuild shims `import.meta` to `{}`,
//    so `import.meta.url` is undefined and we fall back to `__filename`, which
//    CJS (and pkg's snapshot) always provide.
const metaUrl: string | undefined =
    typeof import.meta !== 'undefined' ? import.meta.url : undefined;
const nativeRequire = createRequire(metaUrl ?? __filename);

/**
 * Load a native (compiled) dependency at runtime.
 *
 * A native addon (`.node`) can never live inside a JS bundle or a pkg
 * single-file executable — it must be a real file on disk. When this code runs
 * inside a pkg executable (`process.pkg` is set) the bundled JS lives in a
 * virtual snapshot, so a plain `require('better-sqlite3')` resolves against the
 * snapshot and fails. In that case we resolve the module from `node_modules`
 * shipped next to the executable, anchored to `process.execPath` so it works
 * regardless of the current working directory.
 */
export function loadNativeModule(name: string): unknown {
    const proc = process as NodeJS.Process & { pkg?: unknown };
    if (proc.pkg) {
        return nativeRequire(path.join(path.dirname(process.execPath), 'node_modules', name));
    }
    return nativeRequire(name);
}
