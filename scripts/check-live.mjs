import assert from 'node:assert/strict';
import { request } from 'node:http';
import { startLiveServer } from './serve-live.mjs';

const app = await startLiveServer(0);
try {
  const read = async () => { const r = await fetch(app.origin + '/api/state'); assert.equal(r.status, 200); return r.json(); };
  let latest = await read();
  const post = (body, headers = {}) => fetch(app.origin + '/api/action', { method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: app.origin, 'X-AquaQoS-Session': latest.sessionToken, ...headers },
    body: JSON.stringify({ revision: latest.revision, ...body }) });
  const action = async body => { const r = await post(body); const value = await r.json(); assert.equal(r.status, 200, JSON.stringify(value)); latest = value; return value.state; };
  assert.equal((await post({ operation: 'setup' }, { Origin: 'https://example.com' })).status, 403);
  assert.equal((await post({ operation: 'setup' }, { 'X-AquaQoS-Session': 'wrong' })).status, 403);
  const rebound = await new Promise((resolve, reject) => {
    const req = request(app.origin + '/api/state', { headers: { Host: 'evil.test' } }, res => { res.resume(); resolve(res.statusCode); });
    req.on('error', reject); req.end();
  });
  assert.equal(rebound, 403);
  assert.equal((await post({ operation: 'setup', count: 9, backing: '10000', guarantee: '1000' })).status, 400);
  assert.equal((await post({ operation: 'setup', count: 2, backing: '10000', guarantee: '6000' })).status, 400);
  assert.equal((await post({ operation: 'setup', count: 2, backing: '1e4', guarantee: '1000' })).status, 400);
  let s = await action({ operation: 'setup', count: 2, backing: '10000', guarantee: '2500' });
  assert.equal(s.kind, 'aquaqos-live-local-v1'); assert.equal(s.paused, false);
  assert.equal(s.tokens[1].remaining, '5000'); assert.equal(s.deployments.length, 5);
  assert.equal((await post({ operation: 'pause', revision: latest.revision - 1 })).status, 409);
  const initial = structuredClone(s);
  for (let i = 0; i < 2; i++) {
    s = await action({ operation: 'quote', strategy: 0, token: 1, amount: '3000' });
    assert.equal(s.quote.error, null); const quoteId = s.quote.id;
    s = await action({ operation: 'swap', quoteId });
    assert.equal(s.history.at(-1).receipt.status, '0x1');
    assert.equal(s.history.at(-1).transfers.length, 3);
    assert.equal((await post({ operation: 'swap', quoteId })).status, 400, 'quote cannot be reused');
  }
  assert.equal(s.tokens[1].balance, '4000');
  s = await action({ operation: 'quote', strategy: 0, token: 1, amount: '3000' });
  assert.equal(s.quote.error.name, 'InsufficientCapacity');
  s = await action({ operation: 'swap', quoteId: s.quote.id });
  assert.equal(s.history.at(-1).receipt.status, '0x0');
  assert.equal(s.history.at(-1).transfers.length, 0);
  assert.equal(s.tokens[1].balance, '4000');
  s = await action({ operation: 'quote', strategy: 1, token: 1, amount: '2500' });
  s = await action({ operation: 'swap', quoteId: s.quote.id });
  assert.equal(s.tokens[1].balance, '1500');
  s = await action({ operation: 'push', strategy: 1, token: 1, amount: '2500' });
  assert.equal(s.tokens[1].remaining, '2500'); assert.equal(s.history.at(-1).transfers.length, 1);
  s = await action({ operation: 'quote', strategy: 1, token: 0, amount: '100' });
  assert.equal(s.quote.error, null); const oldQuote = s.quote.id;
  s = await action({ operation: 'swap', quoteId: oldQuote });
  assert.equal(s.history.at(-1).receipt.status, '0x1');
  assert.equal(s.history.at(-1).transfers.at(-1).token, 0);
  s = await action({ operation: 'withdraw', token: 1, amount: '1' });
  assert.equal(s.history.at(-1).error.name, 'GroupActive');
  s = await action({ operation: 'pause' }); assert.equal(s.paused, true); assert.equal(s.tokens[1].remaining, '0');
  assert.equal((await post({ operation: 'swap', quoteId: oldQuote })).status, 400);
  s = await action({ operation: 'guarantees', strategy: 0, guaranteeA: '0', guaranteeB: '0' });
  s = await action({ operation: 'activate' }); assert.equal(s.paused, false);
  s = await action({ operation: 'pause' });
  s = await action({ operation: 'dockAll' }); assert.ok(s.strategies.every(x => !x.active));
  const amount = s.tokens[1].balance;
  s = await action({ operation: 'withdraw', token: 1, amount });
  assert.equal(s.tokens[1].balance, '0'); assert.equal(s.tokens[1].ownerBalance, amount);
  assert.notEqual(s.tokens[0].balance, initial.tokens[0].balance);
  // Two tabs cannot both mutate the revision they observed.
  const attempts = await Promise.all([post({ operation: 'pause' }), post({ operation: 'pause' })]);
  assert.deepEqual(attempts.map(r => r.status).sort(), [200, 409]);
  latest = await read();
  s = await action({ operation: 'setup', count: 8, backing: '10000', guarantee: '1250' });
  assert.equal(s.strategies.length, 8); assert.equal(s.tokens[0].remaining, '10000');
  assert.equal(s.history.length, 0);
  s = await action({ operation: 'setup', count: 2, backing: '1000000000', guarantee: '0' });
  s = await action({ operation: 'push', strategy: 0, token: 1, amount: '1' });
  assert.equal(s.tokens[1].balance, '1000000001');
  for (let i = 1; i < 100; i++) s = await action({ operation: 'pause' });
  assert.equal(s.history.length, 100);
  assert.equal((await post({ operation: 'activate' })).status, 400, 'ordinary actions capped');
  s = await action({ operation: 'dockAll' });
  s = await action({ operation: 'withdraw', token: 1, amount: '1000000001' });
  assert.equal(s.tokens[1].balance, '0', 'full maker exit above trade input cap after history cap');
  console.log('Live local API passed: authenticated origin/session, bounded inputs, state revisions, actual fill/reject/reverse/push receipts, lifecycle/exit and eight strategies.');
} finally { await app.close(); }
