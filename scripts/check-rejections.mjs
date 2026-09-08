import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { Interface } from 'ethers';
import { checkBenchmark } from './check-benchmark.mjs';

const key = r => `${r.system}/${r.count}/${r.scenario}/${r.actionIndex}`;
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const sum = rows => rows.reduce((n, r) => n + BigInt(r.amount), 0n);
const swapInterface = new Interface(['function swap((address maker,uint256 traits,bytes data) order,uint256 amount,bytes takerTraitsAndData)']);
const deploymentFields = ['name', 'address', 'buildInfoId', 'solcLongVersion'];

function expectedDeployments(input, run) {
  const reference = input.runs.find(candidate => candidate.system === 'A' && candidate.count === run.count);
  assert.ok(reference, 'unguarded deployment reference');
  const find = (name, address) => reference.deployments.find(d => d.name === name && d.address.toLowerCase() === address.toLowerCase());
  return [find('Aqua', run.addresses.aqua), find('AquaSwapVMRouter', run.addresses.router),
    ...run.addresses.tokens.map(address => find('TokenMock', address))].map(d => {
      assert.ok(d, 'clean benchmark deployment identity');
      return Object.fromEntries([...deploymentFields, 'runtimeHash'].map(field => [field, d[field]]));
    });
}

function checkReplayIdentity(record, input, run, action) {
  const expected = expectedDeployments(input, run);
  assert.equal(record.deployments.length, expected.length, 'replay deployment count');
  for (const [actual, clean] of record.deployments.map((d, i) => [d, expected[i]])) {
    assert.deepEqual(Object.fromEntries(deploymentFields.map(field => [field, actual[field]])),
      Object.fromEntries(deploymentFields.map(field => [field, clean[field]])), 'replay deployment identity');
    if (actual.name !== 'AquaSwapVMRouter') assert.equal(actual.runtimeHash, clean.runtimeHash, 'replay executable identity');
    assert.match(actual.runtimeHash, /^0x[a-f0-9]{64}$/i, 'runtime hash');
  }
  assert.equal(record.tx.to.toLowerCase(), run.addresses.router.toLowerCase(), 'replay target');
  assert.equal(record.tx.from.toLowerCase(), run.policy.taker.toLowerCase(), 'replay sender');
  assert.equal(record.receipt.to.toLowerCase(), record.tx.to.toLowerCase(), 'receipt target');
  assert.equal(record.receipt.from.toLowerCase(), record.tx.from.toLowerCase(), 'receipt sender');
  const decoded = swapInterface.decodeFunctionData('swap', record.tx.data);
  const order = decoded[0];
  assert.equal(order.maker.toLowerCase(), record.deployments[0].receipt.from.toLowerCase(), 'order maker');
  assert.equal(order.traits, (1n << 254n) | (0x0028002800280028n << 160n), 'order traits');
  const tokens = run.addresses.tokens.map(address => address.slice(2).toLowerCase());
  const expectedData = `0x${tokens[0]}${tokens[1]}50000208${BigInt(action.strategy + 1).toString(16).padStart(16, '0')}`;
  assert.equal(order.data.toLowerCase(), expectedData, 'order program and salt');
  assert.equal(decoded[1], BigInt(action.amount), 'calldata amount');
  assert.equal(decoded[2].toLowerCase(), `0x${'00'.repeat(20)}${action.aToB ? '00e0' : '0060'}`, 'taker direction');
}

export function checkRejections(report, input) {
  checkBenchmark(input);
  assert.equal(report.kind, 'local-rejection-replay-v1');
  assert.equal(report.dirty, false);
  assert.match(report.sourceCommit, /^[a-f0-9]{40}$/);
  assert.equal(report.inputSourceCommit, input.sourceCommit);
  const routerRuntimeHash = report.records[0]?.deployments.find(d => d.name === 'AquaSwapVMRouter')?.runtimeHash;
  assert.match(routerRuntimeHash ?? '', /^0x[a-f0-9]{64}$/i, 'replay router runtime hash');
  const expected = new Map();
  for (const run of input.runs.filter(r => ['C', 'C100'].includes(r.system))) {
    const low = run.scenarios.find(s => s.name === 'lowContention');
    for (const aToB of [true, false]) {
      const action = low.attempts.find(a => a.outcome === 'success' && a.aToB === aToB);
      assert.ok(action);
      expected.set(key({ ...run, scenario: low.name, actionIndex: action.actionIndex }), { run, action, control: true });
    }
    for (const scenario of run.scenarios) for (const action of scenario.attempts.filter(a => a.outcome === 'guard_rejection')) {
      expected.set(key({ ...run, scenario: scenario.name, actionIndex: action.actionIndex }), { run, action, control: false });
    }
  }
  assert.equal(report.records.length, expected.size, 'complete candidate/control set');
  const seen = new Set();
  for (const r of report.records) {
    assert.ok(!seen.has(key(r)), 'duplicate candidate');
    seen.add(key(r));
    const source = expected.get(key(r));
    assert.ok(source, 'known source action');
    const { run, action, control } = source;
    assert.equal(r.control, control);
    for (const field of ['amount', 'strategy', 'aToB']) assert.equal(r[field], action[field]);
    checkReplayIdentity(r, input, run, action);
    assert.equal(r.deployments.find(d => d.name === 'AquaSwapVMRouter').runtimeHash, routerRuntimeHash,
      'replay router runtime consistency');
    assert.deepEqual(r.before, action.before.tokens, 'recreated original state');
    assert.equal(r.guarantee, run.policy.guarantee);
    const g = BigInt(r.guarantee), baseline = 10_000n - g;
    assert.equal(BigInt(r.baseline), baseline);
    const out = r.aToB ? 1 : 0, inp = 1 - out, amount = BigInt(r.amount);
    const depth = BigInt(r.before[out].virtual[r.strategy]);
    assert.ok(depth > amount);
    const inputAmount = (amount * BigInt(r.before[inp].virtual[r.strategy]) + depth - amount - 1n) / (depth - amount);
    assert.equal(BigInt(r.quoteInput), inputAmount);
    assert.ok(BigInt(r.before[inp].takerBalance) >= inputAmount);
    const after = structuredClone(r.before);
    if (r.receipt.status === '0x1') {
      assert.equal(r.error, null);
      for (const [i, delta] of [[out, -amount], [inp, inputAmount]]) {
        after[i].balance = String(BigInt(after[i].balance) + delta);
        after[i].takerBalance = String(BigInt(after[i].takerBalance) - delta);
        after[i].virtual[r.strategy] = String(BigInt(after[i].virtual[r.strategy]) + delta);
      }
    } else {
      assert.equal(r.receipt.status, '0x0');
      assert.equal(r.error.data, new Interface(['error SafeTransferFromFailed()']).encodeErrorResult('SafeTransferFromFailed'));
      assert.equal(r.error.name, 'SafeTransferFromFailed');
      assert.ok(BigInt(r.before[out].balance) < amount);
      assert.ok(BigInt(r.before[out].allowance) >= amount);
    }
    assert.deepEqual(r.after, after, 'all recorded transfers/siblings or rollback');
    const protection = after.map(t => {
      let required = 0n;
      for (const v of t.virtual) {
        const available = BigInt(v) - baseline;
        required += available < 0n ? 0n : available < g ? available : g;
      }
      const floor = BigInt(r.count) * g;
      return { required: String(required), allowanceFloor: String(floor), preserved:
        BigInt(t.balance) >= required && BigInt(t.allowance) >= required && BigInt(t.allowance) >= floor };
    });
    assert.deepEqual(r.protection, protection);
    const classification = r.receipt.status === '0x0' ? 'settlement_failure' : protection.every(t => t.preserved) ? 'safe_fill' : 'capacity_breach';
    assert.equal(r.outcome, classification, 'outcome independently recomputed');
    if (control) {
      assert.equal(classification, 'safe_fill');
      assert.deepEqual(r.after, action.after.tokens);
    }
  }
  const rejected = report.records.filter(r => !r.control);
  assert.deepEqual(report.summary, { rejectedAttempts: rejected.length, rejectedOutput: String(sum(rejected)),
    controls: report.records.length - rejected.length,
    outcomes: Object.fromEntries(['safe_fill', 'capacity_breach', 'settlement_failure'].map(k => {
      const rows = rejected.filter(r => r.outcome === k);
      return [k, { attempts: rows.length, output: String(sum(rows)) }];
    })) });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = JSON.parse(readFileSync('benchmarks/raw/rejections-v1.json'));
  assert.equal(report.inputPath, 'benchmarks/raw/a-b-c-v1.json');
  const input = JSON.parse(readFileSync(report.inputPath));
  assert.equal(hash(report.inputPath), report.inputHash);
  const required = ['benchmarks/replay-rejections.mjs', 'scripts/check-rejections.mjs', 'docs/REJECTION_REPLAY.md',
    'hardhat.config.ts', 'pnpm-lock.yaml', 'sources.lock.json'];
  assert.deepEqual(Object.keys(report.sourceHashes).sort(), required.sort());
  for (const [path, value] of Object.entries({ ...input.sourceHashes, ...report.sourceHashes })) assert.equal(hash(path), value, path);
  checkRejections(report, input);
  console.log('Rejection replay: complete source coverage, state transitions, error bytes, capacity and denominators passed.');
  if (process.argv.includes('--self-test')) {
    const corruptions = [
      r => { r.records.pop(); },
      r => { r.records[1] = structuredClone(r.records[0]); },
      r => { r.records[0].before[0].balance = '999'; },
      r => { r.records[0].after[0].balance = '999'; },
      r => { r.records.find(x => !x.control).outcome = 'safe_fill'; },
      r => { r.records.find(x => x.outcome === 'settlement_failure').error.data = '0xdeadbeef'; },
      r => { r.records.find(x => x.outcome === 'capacity_breach').protection.forEach(t => { t.preserved = true; }); },
      r => { r.summary.rejectedAttempts++; },
      r => { r.records[0].baseline = '0'; },
      r => { r.records[0].tx.data = `${r.records[0].tx.data.slice(0, -2)}01`; },
      r => { r.records[0].deployments.pop(); },
      r => { r.records[0].deployments[0].runtimeHash = `0x${'00'.repeat(32)}`; },
    ];
    for (const mutate of corruptions) {
      const changed = structuredClone(report);
      mutate(changed);
      assert.throws(() => checkRejections(changed, input));
    }
    console.log(`${corruptions.length} deliberately corrupted reports rejected; valid report passed first.`);
  }
}
