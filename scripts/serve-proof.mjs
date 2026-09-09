import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const contentTypes = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.md': 'text/plain; charset=utf-8' };
const server = createServer(async (req, res) => {
  const requestPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
  const relativePath = requestPath === '/' || requestPath === '/proof/' ? 'proof/index.html' : requestPath.slice(1);
  const target = resolve(root, relativePath);
  if (relative(root, target).startsWith('..')) { res.writeHead(403); res.end('forbidden'); return; }
  try {
    const body = await readFile(target);
    res.writeHead(200, { 'content-type': contentTypes[extname(target)] ?? 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end('not found'); }
});
const port = Number(process.env.AQUAQOS_PROOF_PORT ?? 4173);
server.listen(port, '127.0.0.1', () => console.log(`AquaQoS proof: http://127.0.0.1:${port}/proof/`));
