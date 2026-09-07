import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { checkBenchmark } from './check-benchmark.mjs';

const report = JSON.parse(readFileSync(new URL('../benchmarks/raw/a-b-c-v1.json', import.meta.url)));
test('retained evidence passes', () => checkBenchmark(report));
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
};
for (const [name, mutate] of Object.entries(mutations)) test(`rejects ${name}`, () => {
  const changed = structuredClone(report);
  mutate(changed);
  assert.throws(() => checkBenchmark(changed));
});
