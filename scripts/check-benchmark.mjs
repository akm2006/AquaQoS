import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { Interface } from 'ethers';

// Signatures from pinned SafeERC20 and AquaQoSVault; ethers supplies Panic decoding.
const errors = new Interface(['error InsufficientCapacity(uint256 available,uint256 required)',
  'error SafeTransferFromFailed()']);
const systems = ['A', 'B', 'C', 'C100'];
const names = ['lowContention', 'concentratedOverload', 'adversarialOrder', 'replenishment'];
const outcomes = ['success', 'quote_rejection', 'guard_rejection', 'settlement_failure'];
const canonical = a => ({ actionIndex: a.actionIndex, type: a.type, strategy: a.strategy,
  aToB: a.aToB, token: a.token, amount: String(a.amount) });
const sum = (items, field) => items.reduce((n, a) => n + BigInt(a[field]), 0n);
const min = (a, b) => a < b ? a : b;
const max = (a, b) => a > b ? a : b;

export function checkBenchmark(report) {
  assert.equal(report.kind, 'local-a-b-c-benchmark-v2');
  assert.equal(report.dirty, false, 'benchmark evidence must come from a clean commit');
  assert.match(report.sourceCommit, /^[a-f0-9]{40}$/);
  assert.equal(report.runs.length, 8, 'two sizes x four policies');
  assert.deepEqual(Object.keys(report.demandTrace).sort(), ['2', '4']);
  const runMap = new Map(report.runs.map(r => [`${r.count}/${r.system}`, r]));
  assert.equal(runMap.size, 8, 'unique system/count pairs');
  for (const count of [2, 4]) for (const system of systems) {
    const run = runMap.get(`${count}/${system}`);
    assert.ok(run, `${system}/${count} missing`);
    const guarded = system === 'C' || system === 'C100';
    const virtual = system === 'A' ? 10_000n / BigInt(count) : 10_000n;
    const guarantee = system === 'B' ? 0n : 10_000n / ((system === 'C' ? 2n : 1n) * BigInt(count));
    assert.equal(BigInt(run.policy.backing), 10_000n);
    assert.equal(BigInt(run.policy.virtualDepth), virtual);
    assert.equal(BigInt(run.policy.guarantee), guarantee);
    assert.deepEqual(run.scenarios.map(s => s.name).sort(), [...names].sort());
    for (const scenario of run.scenarios) {
      const label = `${system}/${count}/${scenario.name}`;
      const expected = report.demandTrace[count][scenario.name].map((a, actionIndex) => ({ ...a, actionIndex }));
      assert.ok(expected.length > 0);
      const actions = [...scenario.attempts, ...scenario.actions].sort((a, b) => a.actionIndex - b.actionIndex);
      assert.deepEqual(actions.map(canonical), expected.map(canonical), `${label} exact trace`);
      assert.ok(scenario.attempts.every(a => a.type === 'swap'));
      assert.ok(scenario.actions.every(a => a.type === 'push'));
      assert.equal(scenario.initialState.maker, run.policy.maker);
      assert.equal(scenario.initialState.tokens.length, 2);
      for (const token of scenario.initialState.tokens) {
        assert.equal(BigInt(token.balance), 10_000n);
        assert.equal(BigInt(token.allowance), (1n << 256n) - 1n);
        assert.equal(BigInt(token.takerBalance), 1_000_000n);
        assert.equal(BigInt(token.routerBalance), 0n);
        assert.equal(BigInt(token.aquaBalance), 0n);
        assert.deepEqual(token.virtual.map(BigInt), Array(count).fill(virtual));
      }
      let previous = scenario.initialState;
      for (const action of actions) {
        assert.deepEqual(action.before, previous, `${label} state continuity`);
        assert.equal(action.gasUsed, Number(BigInt(action.receipt.gasUsed)));
        assert.ok(action.gasUsed > 0);
        assert.match(action.receipt.transactionHash, /^0x[a-f0-9]{64}$/i);
        assert.equal(action.tx.from.toLowerCase(), run.policy.taker.toLowerCase());
        assert.equal(action.tx.to.toLowerCase(), (action.type === 'push' ? run.addresses.aqua : run.addresses.router).toLowerCase());
        assert.equal(action.receipt.from.toLowerCase(), action.tx.from.toLowerCase());
        assert.equal(action.receipt.to.toLowerCase(), action.tx.to.toLowerCase());
        const after = structuredClone(action.before);
        const amount = BigInt(action.amount);
        const move = (index, delta) => {
          const token = after.tokens[index];
          token.balance = String(BigInt(token.balance) + delta);
          token.takerBalance = String(BigInt(token.takerBalance) - delta);
          token.virtual[action.strategy] = String(BigInt(token.virtual[action.strategy]) + delta);
        };
        if (action.type === 'push') {
          assert.equal(action.receipt.status, '0x1');
          move(action.token, amount);
        } else {
          assert.ok(outcomes.includes(action.outcome));
          assert.equal(action.status, action.receipt.status);
          const out = action.aToB ? 1 : 0, input = 1 - out;
          const availableVirtual = BigInt(action.before.tokens[out].virtual[action.strategy]);
          const expectedInput = availableVirtual > amount ?
            (amount * BigInt(action.before.tokens[input].virtual[action.strategy]) + availableVirtual - amount - 1n) / (availableVirtual - amount) : null;
          if (action.quoteInput !== null) assert.equal(BigInt(action.quoteInput), expectedInput, 'XYC quote');
          if (action.outcome === 'success') {
            assert.equal(action.status, '0x1');
            assert.notEqual(expectedInput, null);
            assert.equal(action.quoteError, null);
            assert.equal(BigInt(action.quoteInput), expectedInput);
            assert.equal(BigInt(action.expectedInput), expectedInput);
            move(out, -amount);
            move(input, expectedInput);
            assert.equal(action.protectedCapacityViolation, false);
          } else {
            assert.equal(action.status, '0x0');
            const parsed = errors.parseError(action.trace.data);
            assert.ok(parsed, 'known error bytes');
            assert.equal(action.trace.name, parsed.name, 'error label matches bytes');
            assert.deepEqual(action.trace.args, parsed.args.toArray().map(String));
            if (action.outcome === 'guard_rejection') {
              assert.ok(guarded);
              assert.equal(parsed.name, 'InsufficientCapacity');
              assert.ok(parsed.args[0] < parsed.args[1]);
            } else if (action.outcome === 'settlement_failure') {
              assert.equal(system, 'B');
              assert.equal(parsed.name, 'SafeTransferFromFailed');
              assert.notEqual(action.quoteInput, null);
              assert.ok(BigInt(action.before.tokens[out].balance) < amount, 'maker inventory shortage');
              assert.ok(BigInt(action.before.tokens[out].allowance) >= amount);
              assert.ok(BigInt(action.before.tokens[input].takerBalance) >= expectedInput, 'taker funded');
            } else {
              assert.equal(parsed.name, 'Panic');
              assert.ok([17n, 18n].includes(parsed.args[0]), 'arithmetic overflow/division by zero');
              assert.ok(availableVirtual <= amount, 'insufficient virtual output');
              assert.equal(action.quoteError.data, action.trace.data);
            }
          }
        }
        assert.deepEqual(action.after, after, `${label} complete recorded transfer/sibling/rollback state`);
        for (const token of after.tokens) {
          assert.ok([token.balance, token.takerBalance, ...token.virtual].every(v => BigInt(v) >= 0n));
          if (guarded) {
            const required = token.virtual.reduce((n, v) => n + min(guarantee, max(BigInt(v) - (10_000n - guarantee), 0n)), 0n);
            assert.ok(BigInt(token.balance) >= required, 'protected backing');
            assert.ok(BigInt(token.allowance) >= BigInt(count) * guarantee, 'allowance floor');
          }
        }
        previous = action.after;
      }
      assert.deepEqual(scenario.finalState, previous, `${label} final state`);
      const swaps = scenario.attempts, m = scenario.metrics;
      const offered = sum(swaps, 'amount'), successful = sum(swaps.filter(a => a.outcome === 'success'), 'amount');
      assert.equal(BigInt(scenario.offeredVolume), offered);
      assert.equal(BigInt(m.attemptedOutput), offered);
      for (const [i, key] of ['successfulOutput', 'quoteRejectedOutput', 'guardRejectedOutput', 'settlementFailedOutput'].entries()) {
        assert.equal(BigInt(m[key]), sum(swaps.filter(a => a.outcome === outcomes[i]), 'amount'));
      }
      assert.equal(m.quoteCount, swaps.filter(a => a.quoteInput !== null).length);
      assert.equal(BigInt(m.quoteInputTotal), sum(swaps.filter(a => a.quoteInput !== null), 'quoteInput'));
      assert.equal(m.guaranteeViolations, 0);
      assert.equal(m.successRatio, Number(successful) / Number(offered || 1n));
      assert.equal(m.grossOutputTurnover, Number(successful) / Number(20_000n + sum(scenario.actions, 'amount')));
      assert.equal(m.virtualBackingRatio, Number(virtual * BigInt(count)) / 10_000);
      assert.equal(BigInt(m.advertisedVirtualDepth), 2n * virtual * BigInt(count));
      assert.deepEqual(m.gasByOutcome, Object.fromEntries([...new Set(swaps.map(a => a.outcome))].map(k => [k, swaps.filter(a => a.outcome === k).map(a => a.gasUsed)])));
      assert.equal(m.initialUnreservedBacking, guarded ? String(2n * (10_000n - BigInt(count) * guarantee)) : null);
      const burst = guarded ? scenario.finalState.tokens.reduce((n, t) => n + t.virtual.reduce((v, x) => v + max(10_000n - BigInt(x) - guarantee, 0n), 0n), 0n) : 0n;
      assert.equal(BigInt(m.netBurstOutstanding), burst);
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = JSON.parse(readFileSync(new URL('../benchmarks/raw/a-b-c-v1.json', import.meta.url)));
  const required = ['contracts/AquaQoSRouter.sol', 'contracts/AquaQoSVault.sol', 'hardhat.config.ts',
    'benchmarks/run-a-b-c.mjs', 'scripts/check-benchmark.mjs', 'sources.lock.json', 'package.json',
    'pnpm-lock.yaml', 'docs/BENCHMARK_METHODOLOGY.md'];
  assert.deepEqual(Object.keys(report.sourceHashes).sort(), required.sort());
  for (const [path, expected] of Object.entries(report.sourceHashes)) {
    assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'), expected, path);
  }
  checkBenchmark(report);
  console.log('32 local fixtures checked: provenance hashes, traces, recorded state transitions, error bytes, capacity and metrics.');
}
