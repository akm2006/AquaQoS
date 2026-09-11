import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
import { checkBenchmark, checkRecordedCommit, checkRecordedSource } from './check-benchmark.mjs';

const report = JSON.parse(readFileSync(new URL('../benchmarks/raw/a-b-c-v1.json', import.meta.url)));
test('retained evidence and recorded source pass', () => {
  checkRecordedSource(report);
  checkBenchmark(report);
});
test('rejects a changed recorded source hash', () => {
  const changed = structuredClone(report);
  changed.sourceHashes['package.json'] = '0'.repeat(64);
  assert.throws(() => checkRecordedSource(changed));
});
test('rejects non-commit, non-ancestor and changed-path source identities', () => {
  const git = (...args) => execFileSync('git', ['-c', `safe.directory=${process.cwd().replaceAll('\\', '/')}`, ...args], { encoding: 'utf8' }).trim();
  assert.throws(() => checkRecordedCommit('0'.repeat(40)));
  assert.throws(() => checkRecordedCommit(git('rev-parse', `${report.sourceCommit}^{tree}`)));
  assert.throws(() => checkRecordedCommit(git('rev-parse', 'HEAD'), report.sourceCommit));
  const extra = structuredClone(report);
  extra.sourceHashes['renamed-package.json'] = extra.sourceHashes['package.json'];
  assert.throws(() => checkRecordedSource(extra));
  const missing = structuredClone(report);
  delete missing.sourceHashes['package.json'];
  assert.throws(() => checkRecordedSource(missing));
});
const first = r => r.runs[0].scenarios[0].attempts[0];
const failed = r => r.runs.find(x => x.system === 'B').scenarios
  .flatMap(s => s.attempts).find(a => a.outcome === 'settlement_failure');
const mutations = {
  'dirty provenance': r => { r.dirty = true; },
  'missing policy': r => { r.runs.pop(); },
  'duplicate policy': r => { r.runs[1] = structuredClone(r.runs[0]); },
  'changed demand direction': r => { first(r).aToB = !first(r).aToB; },
  'wrong successful transfer': r => { first(r).after.tokens[0].balance = '999'; },
  'sibling mutation': r => { first(r).after.tokens[0].virtual[1 - first(r).strategy] = '999'; },
  'broken continuity': r => { first(r).before.tokens[0].balance = '999'; },
  'wrong final state': r => { r.runs[0].scenarios[0].finalState.tokens[0].balance = '999'; },
  'forged error label': r => { failed(r).trace.name = 'InsufficientCapacity'; },
  'forged error bytes': r => { failed(r).trace.data = '0xdeadbeef'; },
  'failed transaction changed state': r => { failed(r).after.tokens[0].balance = '999'; },
  'wrong receipt status': r => { first(r).receipt.status = '0x0'; },
  'wrong gas summary': r => { r.runs[0].scenarios[0].metrics.gasByOutcome.success[0]++; },
  'wrong volume': r => { r.runs[0].scenarios[0].metrics.successfulOutput = '0'; },
  'wrong guarantee policy': r => { r.runs.find(x => x.system === 'C100').policy.guarantee = '1'; },
  'hidden capacity violation flag': r => { r.runs.find(x => x.system === 'C').scenarios[0].attempts[0].protectedCapacityViolation = true; },
  'missing eight-strategy group': r => { r.runs = r.runs.filter(x => x.count !== 8); delete r.demandTrace[8]; },
  'altered eight-strategy seed': r => { r.demandTrace[8].seed++; },
  'eighth sibling mutation': r => { r.runs.find(x => x.count === 8 && x.system === 'C').scenarios[0].attempts[0].after.tokens[0].virtual[7] = '999'; },
  'missing balanced workload': r => { r.runs[0].scenarios = r.runs[0].scenarios.filter(s => s.name !== 'balancedRoundRobin'); },
  'altered shuffled permutation': r => { const s = r.runs[0].scenarios.find(x => x.name === 'shuffledPermutation'); if (s) s.attempts[0].amount = String(BigInt(s.attempts[0].amount) + 1n); },
};
for (const [name, mutate] of Object.entries(mutations)) test(`rejects ${name}`, () => {
  const changed = structuredClone(report);
  mutate(changed);
  assert.throws(() => checkBenchmark(changed));
});
