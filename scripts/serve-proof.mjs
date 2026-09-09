import { existsSync } from 'node:fs';
import { execFileSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const web = fileURLToPath(new URL('../web/', import.meta.url));
const next = fileURLToPath(new URL('../web/node_modules/next/dist/bin/next', import.meta.url));
if (!existsSync(next)) throw new Error('Install the frontend first: pnpm --dir web install --frozen-lockfile --ignore-scripts');
const port = Number(process.env.AQUAQOS_PROOF_PORT ?? 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid AQUAQOS_PROOF_PORT');
execFileSync(process.execPath, ['scripts/prepare-evidence.mjs'], { cwd: web, stdio: 'inherit' });
const child = spawn(process.execPath, [next, 'dev', '--hostname', '127.0.0.1', '--port', String(port)], { cwd: web, stdio: 'inherit' });
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 0; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
