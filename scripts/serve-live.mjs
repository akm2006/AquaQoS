import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';
import { createLiveSession, json } from './live-session.mjs';

const output = resolve(fileURLToPath(new URL('../web/out/', import.meta.url)));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.txt': 'text/plain', '.md': 'text/plain; charset=utf-8', '.ico': 'image/x-icon' };
export async function startLiveServer(port = 4174) {
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw Error('Invalid local port.');
  let session = null, revision = 0, busy = false;
  const token = randomUUID();
  const server = createServer(async (req, res) => {
    const origin = `http://127.0.0.1:${server.address().port}`;
    const reply = (status, value) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(json(value)); };
    try {
      // This process controls only its own in-memory chain. Reject rebinding and cross-origin writes.
      if (req.headers.host !== `127.0.0.1:${server.address().port}`) return reply(403, { error: 'Invalid local host.' });
      const url = new URL(req.url, origin);
      if (url.pathname.startsWith('/api/')) {
        if (req.headers.origin && req.headers.origin !== origin) return reply(403, { error: 'Local origin required.' });
        if (busy) return reply(409, { error: 'A local operation is in progress. Refresh shortly.' });
        if (req.method === 'GET' && url.pathname === '/api/state') {
          busy = true;
          try { return reply(200, { sessionToken: token, revision, state: session ? await session.snapshot() : null }); }
          finally { busy = false; }
        }
        if (req.method !== 'POST' || url.pathname !== '/api/action') return reply(404, { error: 'Unknown endpoint.' });
        if (req.headers.origin !== origin || req.headers['content-type'] !== 'application/json'
            || req.headers['x-aquaqos-session'] !== token) return reply(403, { error: 'Open the local app to start a session.' });
        let body = '';
        for await (const chunk of req) {
          body += chunk;
          if (Buffer.byteLength(body) > 2048) return reply(413, { error: 'Request too large.' });
        }
        const input = JSON.parse(body);
        if (!input || typeof input !== 'object' || Array.isArray(input)) return reply(400, { error: 'Invalid action.' });
        // Recheck after awaiting the body; a competing request may have committed meanwhile.
        if (busy || input.revision !== revision) return reply(409, { error: 'State changed. Refresh before another action.' });
        busy = true;
        try {
          if (input.operation === 'setup') {
            const next = await createLiveSession({ count: input.count, backing: input.backing, guarantee: input.guarantee });
            const previous = session; session = next; await previous?.close();
          } else {
            if (!session) throw Error('Create a local maker group first.');
            await session.action(input);
          }
          revision++;
          return reply(200, { sessionToken: token, revision, state: await session.snapshot() });
        } finally { busy = false; }
      }
      if (!['GET', 'HEAD'].includes(req.method)) return reply(405, { error: 'Method not allowed.' });
      const path = resolve(output, '.' + decodeURIComponent(url.pathname));
      if (!path.startsWith(output + sep) && path !== output) return reply(403, { error: 'Invalid path.' });
      let file = path;
      try { if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html'); }
      catch { return reply(404, { error: 'Page unavailable. Build the Next.js app first.' }); }
      const data = await readFile(file);
      res.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch (e) { if (!res.headersSent) reply(400, { error: e.message }); else res.end(); }
  });
  server.requestTimeout = 10000;
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  return { origin: `http://127.0.0.1:${server.address().port}`, async close() {
    await new Promise(resolve => server.close(resolve)); await session?.close();
  } };
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const app = await startLiveServer(Number(process.env.AQUAQOS_LIVE_PORT ?? 4174));
  console.log(`AquaQoS live local workspace: ${app.origin}/live/\nIsolated mock-token EVM; no wallet keys or remote RPC. Stop with Ctrl+C.`);
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => { await app.close(); process.exit(0); });
}
