import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const report = JSON.parse(readFileSync(new URL('../benchmarks/raw/a-b-c-v1.json', import.meta.url)));
assert.equal(report.kind, 'local-a-b-c-benchmark-v1');
assert.equal(report.dirty, false, 'benchmark evidence must come from a clean commit');
assert.equal(report.runs.length, 6, 'two group sizes x three systems');

const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
for (const [path, expected] of Object.entries(report.sourceHashes)) assert.equal(hash(path), expected, path);

const canonical = action => ({ type: action.type, strategy: action.strategy, aToB: action.aToB,
  token: action.token, amount: action.amount });
const runMap = new Map(report.runs.map(run => [`${run.count}/${run.system}`, run]));
for (const [countText, trace] of Object.entries(report.demandTrace)) {
  const count = Number(countText);
  const traceActions = Object.values({ lowContention: trace.lowContention, concentratedOverload: trace.concentratedOverload, replenishment: trace.replenishment });
  for (const actions of traceActions) assert.ok(actions.length > 0);
  for (const system of ['A', 'B', 'C']) {
    const run = runMap.get(`${count}/${system}`);
    assert.ok(run, `${system}/${count} missing`);
    const expectedVirtual = system === 'A' ? 10_000n / BigInt(count) : 10_000n;
    const expectedGuarantee = system === 'C' ? 10_000n / (2n * BigInt(count)) : 10_000n / BigInt(count);
    assert.equal(BigInt(run.policy.virtualDepth), expectedVirtual);
    assert.equal(BigInt(run.policy.guarantee), expectedGuarantee);
    for (const scenario of run.scenarios) {
      const expected = trace[scenario.name];
      assert.deepEqual(scenario.actions.map(canonical), expected.filter(a => a.type === 'push').map(canonical));
      const swaps = scenario.attempts;
      const offered = expected.filter(a => a.type === 'swap').reduce((sum, action) => sum + BigInt(action.amount), 0n);
      assert.equal(BigInt(scenario.metrics.attemptedOutput), offered, `${system}/${count}/${scenario.name} denominator`);
      assert.equal(swaps.length, expected.filter(a => a.type === 'swap').length);
      for (let i = 0; i < swaps.length; i++) {
        assert.equal(swaps[i].strategy, expected.filter(a => a.type === 'swap')[i].strategy);
        assert.equal(swaps[i].amount, String(expected.filter(a => a.type === 'swap')[i].amount));
        assert.notEqual(swaps[i].outcome, 'other_revert');
      }
      for (const outcome of ['success', 'quote_rejection', 'guard_rejection', 'settlement_failure']) {
        const sum = swaps.filter(a => a.outcome === outcome).reduce((n, a) => n + BigInt(a.amount), 0n);
        const key = `${outcome === 'success' ? 'successful' : outcome === 'quote_rejection' ? 'quoteRejected' : outcome === 'guard_rejection' ? 'guardRejected' : 'settlementFailed'}Output`;
        assert.equal(BigInt(scenario.metrics[key]), sum, `${system}/${count}/${scenario.name}/${outcome}`);
      }
      assert.equal(scenario.metrics.quoteCount, swaps.filter(a => a.quoteInput !== null).length);
      assert.equal(BigInt(scenario.metrics.quoteInputTotal), swaps.filter(a => a.quoteInput !== null).reduce((n, a) => n + BigInt(a.quoteInput), 0n));
      assert.equal(scenario.metrics.guaranteeViolations, 0);
    }
  }
}

for (const count of [2, 4]) {
  const low = ['A', 'B', 'C'].map(system => runMap.get(`${count}/${system}`).scenarios.find(s => s.name === 'lowContention'));
  assert.ok(low.every(s => BigInt(s.metrics.successfulOutput) === BigInt(s.metrics.attemptedOutput)), `neutral ${count}`);
  assert.ok(runMap.get(`${count}/B`).scenarios.find(s => s.name === 'concentratedOverload').metrics.settlementFailedOutput > 0, `raw failure ${count}`);
  assert.ok(runMap.get(`${count}/C`).scenarios.find(s => s.name === 'concentratedOverload').metrics.guardRejectedOutput > 0, `guard rejection ${count}`);
}
console.log('A/B/C raw evidence independently recomputed: clean provenance, shared traces, outcomes and metrics match.');
