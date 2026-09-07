// Local EVM comparative benchmark. No RPC URLs, keys, wallet funding or public deployment.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { artifacts, network } from 'hardhat';
import { AbiCoder, Interface, MaxUint256, keccak256, ZeroAddress } from 'ethers';

const coder = AbiCoder.defaultAbiCoder();
const orderType = 'tuple(address maker,uint256 traits,bytes data)';
const hashFile = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const packageVersion = name => JSON.parse(readFileSync(`node_modules/${name}/package.json`, 'utf8')).version;
const git = (...args) => execFileSync('git', ['-c', `safe.directory=${process.cwd().replaceAll('\\', '/')}`, ...args], { encoding: 'utf8' }).trim();
const pnpm = process.env.npm_config_user_agent?.match(/(?:^|\s)pnpm\/([^\s]+)/)?.[1] ?? 'unknown';
const backing = 10_000n;
const takerFunding = 1_000_000n;
const gasLimit = '0xf00000';

const report = {
  kind: 'local-a-b-c-benchmark-v2',
  sourceCommit: git('rev-parse', 'HEAD'),
  dirty: git('status', '--porcelain') !== '',
  node: process.version, pnpm, hardhat: packageVersion('hardhat'), ethers: packageVersion('ethers'), solc: '0.8.30',
  evm: 'cancun', optimizerRuns: 700, viaIR: true,
  pins: JSON.parse(readFileSync('sources.lock.json', 'utf8')),
  sourceHashes: Object.fromEntries([
    'contracts/AquaQoSRouter.sol', 'contracts/AquaQoSVault.sol', 'hardhat.config.ts',
    'benchmarks/run-a-b-c.mjs', 'scripts/check-benchmark.mjs', 'sources.lock.json',
    'package.json', 'pnpm-lock.yaml', 'docs/BENCHMARK_METHODOLOGY.md',
  ].map(p => [p, hashFile(p)])),
  demandTrace: {}, runs: [], limitations: [
    'Local TokenMock pair and pinned XYC exact-output programs only.',
    'Two and four strategy groups; no mainnet or economic-value claim.',
    'Conservative depth is shallower, so quote input/slippage is reported separately.',
  ],
};

const traits = aToB => '0x' + '00'.repeat(20) + (aToB ? '00e0' : '0060');
const extractData = error => {
  const direct = error?.data ?? error?.error?.data ?? error?.cause?.data;
  if (typeof direct === 'string' && direct.startsWith('0x')) return direct;
  const match = String(error).match(/0x[0-9a-fA-F]{8,}/);
  return match?.[0] ?? '0x';
};
const parseError = (interfaces, data) => {
  for (const iface of interfaces) {
    if (!data || data.length < 10) continue;
    try {
      const parsed = iface.parseError(data);
      if (parsed) return { name: parsed.name, args: parsed.args.toArray().map(String), data };
    } catch { /* try the next ABI */ }
  }
  return { name: data.length >= 10 ? data.slice(0, 10) : 'Unknown', args: [], data };
};
const orderData = (maker, tokenA, tokenB, salt) => {
  const indexes = 0x0028002800280028n;
  const makerTraits = (1n << 254n) | (indexes << 160n);
  const program = `0x50000208${BigInt(salt).toString(16).padStart(16, '0')}`;
  const data = `0x${tokenA.slice(2)}${tokenB.slice(2)}${program.slice(2)}`;
  const order = [maker, makerTraits, data];
  return { order, encoded: coder.encode([orderType], [order]) };
};

function xorshift32(seed) {
  let value = seed >>> 0;
  return () => {
    value ^= value << 13; value ^= value >>> 17; value ^= value << 5;
    return value >>> 0;
  };
}

function makeDemandTrace(count, seed) {
  const random = xorshift32(seed);
  const per = Number(backing / BigInt(count));
  const low = [];
  for (let i = 0; i < 8; i++) low.push({
    type: 'swap', strategy: random() % count, aToB: (random() & 1) === 1,
    amount: Math.max(1, Math.floor(per / 10) + (random() % Math.max(1, Math.floor(per / 20)))),
  });
  const overloadAmount = Math.max(1, Math.floor(per * 0.6));
  const concentrated = [];
  const overloadSteps = Math.ceil(Number(backing) / overloadAmount) + 2;
  for (let i = 0; i < overloadSteps; i++) concentrated.push({
    type: 'swap', strategy: i < 2 ? 0 : i % count, aToB: true, amount: overloadAmount,
  });
  const replenishAmount = Math.max(1, Math.floor(per / 2));
  const replenishment = [
    { type: 'swap', strategy: 0, aToB: true, amount: replenishAmount },
    { type: 'swap', strategy: Math.min(1, count - 1), aToB: true, amount: replenishAmount },
    { type: 'push', strategy: 0, token: 1, amount: replenishAmount },
    { type: 'swap', strategy: Math.min(1, count - 1), aToB: true, amount: replenishAmount },
    { type: 'swap', strategy: 0, aToB: true, amount: replenishAmount },
  ];
  const adversarialOrder = [...concentrated].reverse();
  return { seed, count, lowContention: low, concentratedOverload: concentrated, adversarialOrder, replenishment };
}

async function runSystemScenario(system, count, trace, name, actions) {
  const guarded = system === 'C' || system === 'C100';
  const connection = await network.create({ network: 'default', override: {
    hardfork: 'cancun', initialDate: '2026-09-07T00:00:00Z', throwOnTransactionFailures: false,
  } });
  const rpc = (method, params = []) => connection.provider.request({ method, params });
  const [owner, taker] = await rpc('eth_accounts');
  const systemLog = { system, count, seed: trace.seed, setupGas: 0, scenarios: [] };
  const deployed = [];
  const interfaces = [];
  const setup = async (name, args = []) => {
    const artifact = await artifacts.readArtifact(name);
    const build = JSON.parse(readFileSync(await artifacts.getBuildInfoPath(artifact.buildInfoId), 'utf8'));
    assert.equal(build.solcVersion, report.solc);
    assert.equal(build.input.settings.evmVersion, report.evm);
    assert.equal(build.input.settings.optimizer.runs, report.optimizerRuns);
    assert.equal(build.input.settings.optimizer.enabled, true);
    assert.equal(build.input.settings.viaIR, report.viaIR);
    const iface = new Interface(artifact.abi);
    const data = artifact.bytecode + iface.encodeDeploy(args).slice(2);
    const hash = await rpc('eth_sendTransaction', [{ from: owner, data, gas: gasLimit }]);
    const receipt = await rpc('eth_getTransactionReceipt', [hash]);
    assert.equal(receipt.status, '0x1', `deploy ${name}`);
    systemLog.setupGas += Number(BigInt(receipt.gasUsed));
    const address = receipt.contractAddress;
    const code = await rpc('eth_getCode', [address, 'latest']);
    const contract = { address, name, buildInfoId: artifact.buildInfoId,
      solcLongVersion: build.solcLongVersion, transactionHash: receipt.transactionHash,
      runtimeHash: keccak256(code), runtimeBytes: (code.length - 2) / 2, abi: iface };
    deployed.push(contract); interfaces.push(iface);
    return contract;
  };
  const aqua = await setup('Aqua');
  const router = guarded
    ? await setup('AquaQoSRouter', [aqua.address, owner])
    : await setup('AquaSwapVMRouter', [aqua.address, ZeroAddress, owner, 'AquaQoS benchmark', '0.1']);
  const tokenA0 = await setup('TokenMock', ['Token A', 'A']);
  const tokenB0 = await setup('TokenMock', ['Token B', 'B']);
  const tokens = [tokenA0, tokenB0].sort((a, b) => a.address.toLowerCase().localeCompare(b.address.toLowerCase()));
  const vault = guarded
    ? await setup('AquaQoSVault', [aqua.address, router.address, tokens[0].address, tokens[1].address, owner])
    : null;
  const maker = vault?.address ?? owner;
  const call = async (contract, method, args = [], from = taker) => {
    const data = contract.abi.encodeFunctionData(method, args);
    return contract.abi.decodeFunctionResult(method, await rpc('eth_call', [{ to: contract.address, data, from }, 'latest']));
  };
  const send = async (contract, method, args = [], from = owner, setupTx = true) => {
    const data = contract.abi.encodeFunctionData(method, args);
    const txHash = await rpc('eth_sendTransaction', [{ from, to: contract.address, data, gas: gasLimit }]);
    const receipt = await rpc('eth_getTransactionReceipt', [txHash]);
    if (setupTx) systemLog.setupGas += Number(BigInt(receipt.gasUsed));
    assert.equal(receipt.status, '0x1', `${system} setup ${method}`);
    return { receipt, tx: { from, to: contract.address, data, gas: gasLimit } };
  };
  for (const token of tokens) {
    await send(token, 'mint', [maker, backing]);
    await send(token, 'mint', [taker, takerFunding]);
    await send(token, 'approve', [aqua.address, MaxUint256], taker);
    await send(token, 'approve', [router.address, MaxUint256], taker);
    if (!vault) await send(token, 'approve', [aqua.address, MaxUint256], owner);
  }

  const virtual = system === 'A' ? backing / BigInt(count) : backing;
  const guarantee = system === 'B' ? 0n : backing / ((system === 'C' ? 2n : 1n) * BigInt(count));
  systemLog.policy = { backing, virtualDepth: virtual, guarantee, maker, owner, taker };
  systemLog.addresses = { aqua: aqua.address, router: router.address, vault: vault?.address ?? null, tokens: tokens.map(t => t.address) };
  const orders = [], hashes = [];
  if (vault) {
    for (let salt = 1; salt <= count; salt++) {
      await send(vault, 'createStrategy', [salt, backing, backing, guarantee, guarantee]);
      const [order] = await call(vault, 'order', [salt]);
      orders.push([order.maker, order.traits, order.data]);
      hashes.push((await call(router, 'hash', [orders.at(-1)]))[0]);
    }
    await send(vault, 'activate');
  } else {
    for (let salt = 1; salt <= count; salt++) {
      const { order, encoded } = orderData(owner, tokens[0].address, tokens[1].address, salt);
      await send(aqua, 'ship', [router.address, encoded, tokens.map(t => t.address), [virtual, virtual]]);
      orders.push(order);
      hashes.push((await call(router, 'hash', [order]))[0]);
    }
  }

  const snapshot = async () => {
    const result = { maker, tokens: [] };
    for (const token of tokens) {
      const [balance] = await call(token, 'balanceOf', [maker]);
      const [allowance] = await call(token, 'allowance', [maker, aqua.address]);
      const [takerBalance] = await call(token, 'balanceOf', [taker]);
      const [routerBalance] = await call(token, 'balanceOf', [router.address]);
      const [aquaBalance] = await call(token, 'balanceOf', [aqua.address]);
      const balances = [];
      for (const hash of hashes) balances.push((await call(aqua, 'rawBalances', [maker, router.address, hash, token.address]))[0]);
      result.tokens.push({ balance, allowance, takerBalance, routerBalance, aquaBalance, virtual: balances });
    }
    return result;
  };
  const classify = (parsed, quoteError) => {
    if (guarded && parsed.name === 'InsufficientCapacity') return 'guard_rejection';
    if (parsed.name === 'SafeTransferFromFailed') return 'settlement_failure';
    if (quoteError?.data === parsed.data && parsed.name === 'Panic') return 'quote_rejection';
    return 'other_revert';
  };
  const protectedCapacityViolation = state => {
    if (!guarded) return false;
    for (let tokenIndex = 0; tokenIndex < 2; tokenIndex++) {
      const baseline = backing - guarantee;
      const required = state.tokens[tokenIndex].virtual.reduce((sum, value) => {
        const available = value > baseline ? value - baseline : 0n;
        return sum + (available < guarantee ? available : guarantee);
      }, 0n);
      if (state.tokens[tokenIndex].balance < required || state.tokens[tokenIndex].allowance < required) return true;
      if (state.tokens[tokenIndex].allowance < BigInt(count) * guarantee) return true;
    }
    return false;
  };
  const attempt = async (scenario, actionIndex, action) => {
    if (action.type === 'push') {
      const before = await snapshot();
      const { receipt, tx } = await send(aqua, 'push', [maker, router.address, hashes[action.strategy], tokens[action.token].address, action.amount], taker, false);
      const after = await snapshot();
      assert.equal(after.tokens[action.token].balance - before.tokens[action.token].balance, BigInt(action.amount));
      assert.equal(after.tokens[action.token].virtual[action.strategy] - before.tokens[action.token].virtual[action.strategy], BigInt(action.amount));
      assert.equal(protectedCapacityViolation(after), false, 'push capacity');
      scenario.actions.push({ actionIndex, type: 'push', ...action, before, after, tx, receipt, gasUsed: Number(BigInt(receipt.gasUsed)) });
      return;
    }
    const amount = BigInt(action.amount);
    const order = orders[action.strategy];
    const before = await snapshot();
    let quoteInput = null, quoteError = null;
    try { quoteInput = (await call(router, 'quote', [order, amount, traits(action.aToB)]))[0]; }
    catch (error) { quoteError = parseError(interfaces, extractData(error)); }
    const data = router.abi.encodeFunctionData('swap', [order, amount, traits(action.aToB)]);
    const txHash = await rpc('eth_sendTransaction', [{ from: taker, to: router.address, data, gas: gasLimit }]);
    const receipt = await rpc('eth_getTransactionReceipt', [txHash]);
    const after = await snapshot();
    const record = { actionIndex, type: 'swap', strategy: action.strategy, aToB: action.aToB, amount, quoteInput,
      quoteError, status: receipt.status, gasUsed: Number(BigInt(receipt.gasUsed)), before, after,
      tx: { from: taker, to: router.address, data, gas: gasLimit }, receipt };
    if (receipt.status === '0x1') {
      assert.ok(quoteInput !== null, 'successful swap needs a quote');
      const out = action.aToB ? 1 : 0, input = 1 - out;
      const expectedInput = (amount * before.tokens[input].virtual[action.strategy]
        + before.tokens[out].virtual[action.strategy] - amount - 1n)
        / (before.tokens[out].virtual[action.strategy] - amount);
      assert.equal(quoteInput, expectedInput, 'quote input');
      assert.equal(before.tokens[out].balance - after.tokens[out].balance, amount, 'maker output delta');
      assert.equal(after.tokens[input].balance - before.tokens[input].balance, expectedInput, 'maker input delta');
      assert.equal(after.tokens[out].takerBalance - before.tokens[out].takerBalance, amount, 'taker output delta');
      assert.equal(after.tokens[input].takerBalance - before.tokens[input].takerBalance, -expectedInput, 'taker input delta');
      assert.equal(before.tokens[out].virtual[action.strategy] - after.tokens[out].virtual[action.strategy], amount, 'virtual output delta');
      assert.equal(after.tokens[input].virtual[action.strategy] - before.tokens[input].virtual[action.strategy], expectedInput, 'virtual input delta');
      record.outcome = 'success';
      record.expectedInput = expectedInput;
      record.protectedCapacityViolation = protectedCapacityViolation(after);
      assert.equal(record.protectedCapacityViolation, false, 'fill capacity');
    } else {
      assert.deepEqual(after, before, 'failed swap must roll back state');
      const trace = await rpc('debug_traceTransaction', [txHash, { disableMemory: true, disableStack: true, disableStorage: true }]);
      const parsed = parseError(interfaces, trace.returnValue.startsWith('0x') ? trace.returnValue : `0x${trace.returnValue}`);
      record.trace = { ...parsed, gas: trace.gas, failed: trace.failed };
      record.outcome = classify(parsed, quoteError);
      assert.notEqual(record.outcome, 'other_revert', `${system} unexpected revert ${parsed.name}`);
    }
    scenario.attempts.push(record);
  };

  const initialState = await snapshot();
  const scenario = { name, seed: trace.seed, offeredVolume: 0n, initialState, attempts: [], actions: [], metrics: {} };
  for (let i = 0; i < actions.length; i++) {
    if (actions[i].type === 'swap') scenario.offeredVolume += BigInt(actions[i].amount);
    await attempt(scenario, i, actions[i]);
  }
  scenario.finalState = await snapshot();
  const swaps = scenario.attempts.filter(a => a.type === 'swap');
  const sum = key => swaps.filter(a => a.outcome === key).reduce((n, a) => n + BigInt(a.amount), 0n);
  const successfulOutput = sum('success');
  const offeredOutput = scenario.offeredVolume;
  const deposits = scenario.actions.reduce((sum, action) => sum + BigInt(action.amount), 0n);
  const initialUnreservedBacking = guarded ? 2n * (backing - BigInt(count) * guarantee) : null;
  const burstUsed = guarded ? scenario.finalState.tokens.reduce((sum, token) => sum + token.virtual.reduce((inner, value) => {
    const consumed = backing - value;
    const used = consumed > guarantee ? consumed - guarantee : 0n;
    return inner + used;
  }, 0n), 0n) : 0n;
  scenario.metrics = {
    attemptedOutput: scenario.offeredVolume,
    successfulOutput,
    quoteRejectedOutput: sum('quote_rejection'),
    guardRejectedOutput: sum('guard_rejection'),
    settlementFailedOutput: sum('settlement_failure'),
    successRatio: Number(successfulOutput) / Number(offeredOutput || 1n),
    virtualBackingRatio: Number(virtual * BigInt(count)) / Number(backing),
    advertisedVirtualDepth: 2n * virtual * BigInt(count),
    grossOutputTurnover: Number(successfulOutput) / Number(2n * backing + deposits),
    quoteCount: swaps.filter(a => a.quoteInput !== null).length,
    quoteInputTotal: swaps.filter(a => a.quoteInput !== null).reduce((n, a) => n + BigInt(a.quoteInput), 0n),
    gasByOutcome: Object.fromEntries([...new Set(swaps.map(a => a.outcome))].map(k => [k, swaps.filter(a => a.outcome === k).map(a => a.gasUsed)])),
    guaranteeViolations: swaps.filter(a => a.protectedCapacityViolation).length,
    netBurstOutstanding: burstUsed, initialUnreservedBacking,
    setupGas: systemLog.setupGas,
  };
  systemLog.scenarios = [scenario];
  systemLog.deployments = deployed.map(({ abi, ...contract }) => ({ ...contract, scenario: name }));
  await connection.close();
  return systemLog;
}

async function runSystem(system, count, trace) {
  const entries = Object.entries({
    lowContention: trace.lowContention,
    concentratedOverload: trace.concentratedOverload,
    adversarialOrder: trace.adversarialOrder,
    replenishment: trace.replenishment,
  });
  const runs = [];
  for (const [name, actions] of entries) runs.push(await runSystemScenario(system, count, trace, name, actions));
  return {
    system, count, seed: trace.seed,
    setupGas: runs.reduce((sum, run) => sum + run.setupGas, 0),
    policy: runs[0].policy,
    addresses: runs[0].addresses,
    deployments: runs.flatMap(run => run.deployments ?? []),
    scenarios: runs.flatMap(run => run.scenarios),
  };
}

for (const count of [2, 4]) {
  const trace = makeDemandTrace(count, count === 2 ? 0xa201 : 0xa401);
  report.demandTrace[count] = trace;
  for (const system of ['A', 'B', 'C', 'C100']) report.runs.push(await runSystem(system, count, trace));
}

for (const run of report.runs) {
  for (const scenario of run.scenarios) console.log(`${run.system}/${run.count}/${scenario.name}: ${scenario.metrics.successfulOutput}/${scenario.metrics.attemptedOutput} output, ${scenario.metrics.guardRejectedOutput} guard-rejected, ${scenario.metrics.settlementFailedOutput} settlement-failed`);
}
writeFileSync(new URL('./raw/a-b-c-v1.json', import.meta.url), `${JSON.stringify(report, (_, value) => typeof value === 'bigint' ? value.toString() : value, 2)}\n`);
