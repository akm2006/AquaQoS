// Local reference replay only: no RPC secrets, public transactions or production bypass.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { artifacts, network } from 'hardhat';
import { AbiCoder, Interface, MaxUint256, ZeroAddress, keccak256 } from 'ethers';

execFileSync(process.execPath, ['scripts/check-benchmark.mjs'], { stdio: 'inherit' });
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const git = (...args) => execFileSync('git', ['-c', `safe.directory=${process.cwd().replaceAll('\\', '/')}`, ...args], { encoding: 'utf8' }).trim();
const inputPath = 'benchmarks/raw/a-b-c-v1.json';
const input = JSON.parse(readFileSync(inputPath));
const coder = AbiCoder.defaultAbiCoder();
const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const transferRows = receipt => (receipt.logs ?? []).filter(log => log.topics?.[0]?.toLowerCase() === transferTopic).map(log => ({
  token: log.address.toLowerCase(), from: `0x${log.topics[1].slice(-40)}`.toLowerCase(),
  to: `0x${log.topics[2].slice(-40)}`.toLowerCase(), amount: String(BigInt(log.data)),
}));
const expectedTransfers = (tokens, maker, taker, router, aToB, amount, quoteInput) => {
  const out = aToB ? 1 : 0, input = 1 - out;
  return [{ token: tokens[input].address.toLowerCase(), from: taker.toLowerCase(), to: router.toLowerCase(), amount: String(quoteInput) },
    { token: tokens[input].address.toLowerCase(), from: router.toLowerCase(), to: maker.toLowerCase(), amount: String(quoteInput) },
    { token: tokens[out].address.toLowerCase(), from: maker.toLowerCase(), to: taker.toLowerCase(), amount: String(amount) }];
};
const report = {
  kind: 'local-rejection-replay-v1', sourceCommit: git('rev-parse', 'HEAD'), dirty: git('status', '--porcelain') !== '',
  inputPath, inputHash: hash(inputPath), inputSourceCommit: input.sourceCommit,
  sourceHashes: Object.fromEntries(['benchmarks/replay-rejections.mjs', 'scripts/check-rejections.mjs', 'scripts/check-benchmark.mjs',
    'docs/BENCHMARK_METHODOLOGY.md', 'docs/REJECTION_REPLAY.md', 'hardhat.config.ts', 'pnpm-lock.yaml', 'sources.lock.json'].map(p => [p, hash(p)])),
  node: process.version, hardhat: input.hardhat, solc: input.solc, evm: input.evm,
  records: [], summary: {},
};
const shape = state => state.tokens.map(t => ({ ...t }));
const max = (a, b) => a > b ? a : b;
const min = (a, b) => a < b ? a : b;

async function replay(run, scenario, action, control) {
  const connection = await network.create({ network: 'default', override: {
    hardfork: 'cancun', initialDate: '2026-09-07T00:00:00Z', throwOnTransactionFailures: false,
  } });
  try {
    const rpc = (method, params = []) => connection.provider.request({ method, params });
    const [maker, taker] = await rpc('eth_accounts');
    const deployments = [];
    const send = async (tx, success = true) => {
      const txHash = await rpc('eth_sendTransaction', [{ ...tx, gas: '0xf00000' }]);
      const receipt = await rpc('eth_getTransactionReceipt', [txHash]);
      if (success) assert.equal(receipt.status, '0x1', 'fixture setup');
      return receipt;
    };
    const deploy = async (name, args = []) => {
      const a = await artifacts.readArtifact(name), abi = new Interface(a.abi);
      const build = JSON.parse(readFileSync(await artifacts.getBuildInfoPath(a.buildInfoId)));
      assert.equal(build.solcVersion, input.solc);
      assert.equal(build.input.settings.evmVersion, input.evm);
      assert.equal(build.input.settings.optimizer.enabled, true);
      assert.equal(build.input.settings.optimizer.runs, input.optimizerRuns);
      assert.equal(build.input.settings.viaIR, input.viaIR);
      const receipt = await send({ from: maker, data: a.bytecode + abi.encodeDeploy(args).slice(2) });
      const address = receipt.contractAddress;
      deployments.push({ name, address, buildInfoId: a.buildInfoId, solcLongVersion: build.solcLongVersion,
        runtimeHash: keccak256(await rpc('eth_getCode', [address, 'latest'])), receipt });
      return { address, abi };
    };
    const call = async (c, method, args) => c.abi.decodeFunctionResult(method,
      await rpc('eth_call', [{ from: taker, to: c.address, data: c.abi.encodeFunctionData(method, args) }, 'latest']));
    const write = (c, method, args, from = maker) => send({ from, to: c.address, data: c.abi.encodeFunctionData(method, args) });
    const aqua = await deploy('Aqua');
    const router = await deploy('AquaSwapVMRouter', [aqua.address, ZeroAddress, maker, 'AquaQoS replay', '0.1']);
    const tokens = [await deploy('TokenMock', ['Replay A', 'A']), await deploy('TokenMock', ['Replay B', 'B'])]
      .sort((a, b) => a.address.toLowerCase().localeCompare(b.address.toLowerCase()));
    for (const [i, token] of tokens.entries()) {
      const original = action.before.tokens[i];
      assert.equal(BigInt(original.allowance), MaxUint256, 'reference scope: max allowance');
      await write(token, 'mint', [maker, original.balance]);
      await write(token, 'mint', [taker, original.takerBalance]);
      await write(token, 'approve', [aqua.address, original.allowance]);
      await write(token, 'approve', [router.address, MaxUint256], taker);
      await write(token, 'approve', [aqua.address, MaxUint256], taker);
    }
    const orders = [], hashes = [];
    for (let i = 0; i < run.count; i++) {
      // Exact pinned maker layout from run-a-b-c; only maker/token identities differ.
      const traits = (1n << 254n) | (0x0028002800280028n << 160n);
      const data = `0x${tokens[0].address.slice(2)}${tokens[1].address.slice(2)}50000208${BigInt(i + 1).toString(16).padStart(16, '0')}`;
      const order = [maker, traits, data];
      const encoded = coder.encode(['tuple(address maker,uint256 traits,bytes data)'], [order]);
      await write(aqua, 'ship', [router.address, encoded, tokens.map(t => t.address), action.before.tokens.map(t => t.virtual[i])]);
      const [orderHash] = await call(router, 'hash', [order]);
      assert.equal(orderHash, keccak256(encoded));
      orders.push(order); hashes.push(orderHash);
    }
    const snapshot = async () => {
      const states = [];
      for (const token of tokens) {
        const read = async (c, method, args) => String((await call(c, method, args))[0]);
        const virtual = [];
        for (const h of hashes) {
          const [v, marker] = await call(aqua, 'rawBalances', [maker, router.address, h, token.address]);
          assert.equal(marker, 2n);
          virtual.push(String(v));
        }
        states.push({ balance: await read(token, 'balanceOf', [maker]), allowance: await read(token, 'allowance', [maker, aqua.address]),
          takerBalance: await read(token, 'balanceOf', [taker]), routerBalance: await read(token, 'balanceOf', [router.address]),
          aquaBalance: await read(token, 'balanceOf', [aqua.address]), virtual });
      }
      return states;
    };
    const before = await snapshot();
    assert.deepEqual(before, shape(action.before), 'recreated original state');
    const traits = '0x' + '00'.repeat(20) + (action.aToB ? '00e0' : '0060');
    const args = [orders[action.strategy], action.amount, traits];
    const [quoteInput] = await call(router, 'quote', args);
    const out = action.aToB ? 1 : 0, inp = 1 - out, amount = BigInt(action.amount);
    const depth = BigInt(before[out].virtual[action.strategy]);
    const expectedInput = (amount * BigInt(before[inp].virtual[action.strategy]) + depth - amount - 1n) / (depth - amount);
    assert.equal(quoteInput, expectedInput);
    assert.ok(BigInt(before[inp].takerBalance) >= quoteInput, 'taker funded');
    const tx = { from: taker, to: router.address, data: router.abi.encodeFunctionData('swap', args), gas: '0xf00000' };
    const receipt = await send(tx, false), after = await snapshot();
    let outcome, error = null;
    if (receipt.status === '0x0') {
      assert.deepEqual(transferRows(receipt), [], 'reverted reference swap has no Transfer logs');
      assert.deepEqual(after, before, 'failure rollback');
      const trace = await rpc('debug_traceTransaction', [receipt.transactionHash, { disableMemory: true, disableStack: true, disableStorage: true }]);
      const data = trace.returnValue.startsWith('0x') ? trace.returnValue : `0x${trace.returnValue}`;
      error = { data, name: new Interface(['error SafeTransferFromFailed()']).parseError(data)?.name };
      assert.equal(error.name, 'SafeTransferFromFailed');
      assert.ok(BigInt(before[out].balance) < amount, 'inventory-shortage failure');
      outcome = 'settlement_failure';
    } else {
      assert.equal(receipt.status, '0x1');
      assert.deepEqual(transferRows(receipt), expectedTransfers(tokens, maker, taker, router.address, action.aToB, amount, quoteInput),
        'fee-free reference swap Transfer logs');
      const expected = structuredClone(before);
      for (const [i, delta] of [[out, -amount], [inp, quoteInput]]) {
        expected[i].balance = String(BigInt(expected[i].balance) + delta);
        expected[i].takerBalance = String(BigInt(expected[i].takerBalance) - delta);
        expected[i].virtual[action.strategy] = String(BigInt(expected[i].virtual[action.strategy]) + delta);
      }
      assert.deepEqual(after, expected, 'all recorded transfer/sibling deltas');
    }
    const guarantee = BigInt(run.policy.guarantee), baseline = 10_000n - guarantee;
    const protection = after.map(token => {
      const required = token.virtual.reduce((sum, v) => sum + min(guarantee, max(BigInt(v) - baseline, 0n)), 0n);
      const allowanceFloor = BigInt(run.count) * guarantee;
      return { required: String(required), allowanceFloor: String(allowanceFloor),
        preserved: BigInt(token.balance) >= required && BigInt(token.allowance) >= max(required, allowanceFloor) };
    });
    if (!outcome) outcome = protection.every(t => t.preserved) ? 'safe_fill' : 'capacity_breach';
    if (control) {
      assert.equal(outcome, 'safe_fill', 'positive control');
      assert.deepEqual(after, shape(action.after), 'positive control matches original successful state');
    }
    return { system: run.system, count: run.count, scenario: scenario.name, actionIndex: action.actionIndex,
      control, amount: action.amount, strategy: action.strategy, aToB: action.aToB,
      guarantee: String(guarantee), baseline: String(baseline), quoteInput: String(quoteInput),
      before, after, protection, outcome, error, tx, receipt, deployments };
  } finally { await connection.close(); }
}

for (const run of input.runs.filter(r => ['C', 'C100'].includes(r.system))) {
  const controlScenario = run.scenarios.find(s => s.name === 'lowContention');
  for (const aToB of [true, false]) {
    const control = controlScenario.attempts.find(a => a.outcome === 'success' && a.aToB === aToB);
    assert.ok(control, 'positive control in each direction');
    report.records.push(await replay(run, controlScenario, control, true));
  }
  for (const scenario of run.scenarios) for (const action of scenario.attempts.filter(a => a.outcome === 'guard_rejection')) {
    report.records.push(await replay(run, scenario, action, false));
  }
}
const rejected = report.records.filter(r => !r.control);
report.summary = { rejectedAttempts: rejected.length, rejectedOutput: String(rejected.reduce((n, r) => n + BigInt(r.amount), 0n)),
  controls: report.records.length - rejected.length,
  outcomes: Object.fromEntries(['safe_fill', 'capacity_breach', 'settlement_failure'].map(k => {
    const rows = rejected.filter(r => r.outcome === k);
    return [k, { attempts: rows.length, output: String(rows.reduce((n, r) => n + BigInt(r.amount), 0n)) }];
  })) };
writeFileSync('benchmarks/raw/rejections-v1.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report.summary));
