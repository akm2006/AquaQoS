// Local EVM only. No RPC URLs, keys, wallet funding or public deployment.
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { artifacts, network } from 'hardhat';
import { Interface, MaxUint256, keccak256 } from 'ethers';

const hashFile = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const packageVersion = name => JSON.parse(readFileSync(`node_modules/${name}/package.json`, 'utf8')).version;
const git = (...args) => execFileSync('git', ['-c', `safe.directory=${process.cwd().replaceAll('\\', '/')}`, ...args], { encoding: 'utf8' }).trim();
const report = {
  kind: 'local-transaction-validation-and-gas-v1',
  sourceCommit: git('rev-parse', 'HEAD'), dirty: git('status', '--porcelain') !== '',
  node: process.version,
  pnpm: execFileSync(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', ['--version'], { encoding: 'utf8' }).trim(),
  hardhat: packageVersion('hardhat'), ethers: packageVersion('ethers'), solc: '0.8.30',
  evm: 'cancun', optimizerRuns: 700, viaIR: true,
  sourceHashes: Object.fromEntries(['contracts/AquaQoSRouter.sol', 'contracts/AquaQoSVault.sol',
    'scripts/check-transactions.mjs', 'test/AquaQoS.t.sol', 'hardhat.config.ts', 'package.json', 'pnpm-lock.yaml'].map(p => [p, hashFile(p)])),
  pins: JSON.parse(readFileSync('sources.lock.json', 'utf8')),
  scenarios: [],
};

// Pinned TakerTraitsLib.build: ten empty uint16 slice indexes, then flags.
// 0x20 taker-first, 0x40 transferFrom + Aqua.push, 0x80 A-to-B; exact-out.
const traits = aToB => '0x' + '00'.repeat(20) + (aToB ? '00e0' : '0060');

async function fixture(count, backing, guarantee) {
  const connection = await network.create({ network: 'default', override: {
    hardfork: 'cancun', initialDate: '2026-09-06T00:00:00Z', throwOnTransactionFailures: false,
  } });
  const rpc = (method, params = []) => connection.provider.request({ method, params });
  const [owner, taker] = await rpc('eth_accounts');
  const log = { count, backing, guarantee, deployments: [], transactions: [] };
  report.scenarios.push(log);
  async function send(label, to, data, from = owner, success = true, retain = false) {
    const tx = { from, data, gas: '0xf00000', ...(to ? { to } : {}) };
    const transactionHash = await rpc('eth_sendTransaction', [tx]);
    const receipt = await rpc('eth_getTransactionReceipt', [transactionHash]);
    assert.equal(receipt.status, success ? '0x1' : '0x0', label);
    if (retain) log.transactions.push({ label, tx, receipt });
    return receipt;
  }
  async function deploy(name, args = []) {
    const artifact = await artifacts.readArtifact(name);
    const abi = new Interface(artifact.abi);
    const receipt = await send(`deploy ${name}`, null, artifact.bytecode + abi.encodeDeploy(args).slice(2));
    const build = JSON.parse(readFileSync(await artifacts.getBuildInfoPath(artifact.buildInfoId), 'utf8'));
    assert.equal(build.solcVersion, report.solc);
    assert.equal(build.input.settings.evmVersion, report.evm);
    assert.equal(build.input.settings.optimizer.runs, report.optimizerRuns);
    assert.equal(build.input.settings.viaIR, report.viaIR);
    const code = await rpc('eth_getCode', [receipt.contractAddress, 'latest']);
    log.deployments.push({ name, address: receipt.contractAddress, transactionHash: receipt.transactionHash,
      runtimeHash: keccak256(code), runtimeBytes: (code.length - 2) / 2,
      buildInfoId: artifact.buildInfoId, solcLongVersion: build.solcLongVersion });
    return { address: receipt.contractAddress, abi };
  }
  const read = async (c, method, args = []) => c.abi.decodeFunctionResult(method,
    await rpc('eth_call', [{ to: c.address, data: c.abi.encodeFunctionData(method, args), from: taker }, 'latest']));
  const write = (c, method, args = [], from = owner, success = true, retain = false, label = method) =>
    send(label, c.address, c.abi.encodeFunctionData(method, args), from, success, retain);
  const aqua = await deploy('Aqua');
  const router = await deploy('AquaQoSRouter', [aqua.address, owner]);
  const tokens = [await deploy('TokenMock', ['Token A', 'A']), await deploy('TokenMock', ['Token B', 'B'])]
    .sort((a, b) => a.address.toLowerCase().localeCompare(b.address.toLowerCase()));
  const vault = await deploy('AquaQoSVault', [aqua.address, router.address, ...tokens.map(t => t.address), owner]);
  for (const token of tokens) {
    await write(token, 'mint', [vault.address, backing]);
    await write(token, 'mint', [taker, 1000000]);
    await write(token, 'approve', [router.address, MaxUint256], taker);
    await write(token, 'approve', [aqua.address, MaxUint256], taker);
  }
  const orders = [], hashes = [];
  for (let salt = 1; salt <= count; salt++) {
    await write(vault, 'createStrategy', [salt, backing, backing, guarantee, guarantee]);
    const [o] = await read(vault, 'order', [salt]);
    const order = [o.maker, o.traits, o.data];
    orders.push(order);
    hashes.push((await read(router, 'hash', [order]))[0]);
  }
  await write(vault, 'activate');
  log.addresses = { aqua: aqua.address, router: router.address, vault: vault.address, tokens: tokens.map(t => t.address), owner, taker };
  async function state() {
    const result = [];
    for (const token of tokens) {
      const [balance] = await read(token, 'balanceOf', [vault.address]);
      const [allowance] = await read(token, 'allowance', [vault.address, aqua.address]);
      const [takerBalance] = await read(token, 'balanceOf', [taker]);
      const virtual = [], reserved = [];
      let remaining = 0n;
      for (const hash of hashes) {
        const [v, marker] = await read(aqua, 'rawBalances', [vault.address, router.address, hash, token.address]);
        assert.equal(marker, 2n);
        const [r] = await read(vault, 'reservation', [hash, token.address]);
        assert.equal(r, 0n, 'reservation must clear between top-level transactions');
        const s = await read(vault, 'strategies', [hash]);
        const index = token === tokens[0] ? 0 : 1;
        const available = v > s[index + 2] ? v - s[index + 2] : 0n;
        remaining += available < s[index] ? available : s[index];
        virtual.push(v); reserved.push(r);
      }
      assert.ok(balance >= remaining && allowance >= remaining, 'settled entitlement backing');
      result.push({ balance, allowance, takerBalance, virtual, reserved, remaining });
    }
    return result;
  }
  async function swap(index, amount, aToB = true, success = true, label = 'swap', failureArgs) {
    const before = await state();
    const receipt = await write(router, 'swap', [orders[index], amount, traits(aToB)], taker, success, true, label);
    const after = await state();
    Object.assign(log.transactions.at(-1), { before, after });
    if (!success) {
      assert.deepEqual(after, before, 'failed transaction rollback');
      const trace = await rpc('debug_traceTransaction', [receipt.transactionHash,
        { disableMemory: true, disableStack: true, disableStorage: true }]);
      const data = trace.returnValue.startsWith('0x') ? trace.returnValue : '0x' + trace.returnValue;
      const error = vault.abi.parseError(data);
      assert.equal(error.name, 'InsufficientCapacity', 'reject for capacity, not another settlement error');
      assert.deepEqual(error.args.toArray(), failureArgs, 'capacity error arguments match independent expectation');
      log.transactions.at(-1).failure = { returnData: data, name: error.name, args: error.args.toArray(),
        traceGas: trace.gas, traceFailed: trace.failed };
    }
    else {
      const out = aToB ? 1 : 0;
      const input = 1 - out;
      const d = BigInt(amount);
      const denominator = before[out].virtual[index] - d;
      const expectedInput = (d * before[input].virtual[index] + denominator - 1n) / denominator;
      assert.equal(after[input].balance - before[input].balance, expectedInput);
      assert.equal(before[input].takerBalance - after[input].takerBalance, expectedInput);
      assert.equal(before[out].balance - after[out].balance, BigInt(amount));
      assert.equal(after[out].takerBalance - before[out].takerBalance, BigInt(amount));
      for (let i = 0; i < hashes.length; i++) {
        assert.equal(after[input].virtual[i] - before[input].virtual[i], i === index ? expectedInput : 0n);
        assert.equal(before[out].virtual[i] - after[out].virtual[i], i === index ? d : 0n);
      }
      log.transactions.at(-1).expectedInput = expectedInput;
      const reservations = receipt.logs.filter(l => l.address.toLowerCase() === vault.address.toLowerCase())
        .map(l => vault.abi.parseLog(l)).filter(l => l?.name === 'CapacityReserved');
      assert.equal(reservations.length, 1);
      assert.equal(reservations[0].args.hash, hashes[index]);
      assert.equal(reservations[0].args.token.toLowerCase(), tokens[out].address.toLowerCase());
      assert.equal(reservations[0].args.debit, d);
    }
    return receipt;
  }
  return { connection, rpc, log, read, write, aqua, router, vault, tokens, owner, taker, orders, hashes, state, swap };
}

const f = await fixture(2, 1000, 500);
try {
  f.log.name = 'separate-transactions';
  const quote = await f.read(f.router, 'quote', [f.orders[0], 500, traits(true)]);
  assert.equal(quote[0], 1000n);
  await f.swap(0, 500, true, true, 'first guarantee');
  await f.swap(1, 501, true, false, 'unsafe sibling rejection', [500n, 501n]);
  await f.swap(1, 500, true, true, 'sibling guarantee in fresh transaction');
  await f.write(f.aqua, 'push', [f.vault.address, f.router.address, f.hashes[0], f.tokens[1].address, 500], f.taker, true, true, 'direct replenishment');
  assert.equal((await f.state())[1].remaining, 500n);
  await f.swap(0, 500, true, true, 'restored guarantee');
  // A reverse swap replenishes the previously depleted output token through settlement.
  await f.swap(0, 100, false, true, 'reverse replenishment');
  assert.ok((await f.state())[1].remaining > 0n);
  await f.write(f.vault, 'pause', [], f.owner, true, true, 'pause after completed swaps');
  await f.write(f.vault, 'dockAll', [], f.owner, true, true);
  const [remaining] = await f.read(f.tokens[0], 'balanceOf', [f.vault.address]);
  await f.write(f.vault, 'withdraw', [f.tokens[0].address, f.owner, remaining], f.owner, true, true);
  assert.equal((await f.read(f.tokens[0], 'balanceOf', [f.vault.address]))[0], 0n);
} finally { await f.connection.close(); }

for (const count of [1, 2, 4, 8]) {
  const g = await fixture(count, 10000, 10000 / count);
  try {
    g.log.name = 'group-size-gas';
    await g.swap(0, 100, true, true, 'first output 100');
    await g.swap(0, 100, true, true, 'second output 100');
  } finally { await g.connection.close(); }
}

// Stateful validation, not comparative market workloads. Hold the model separately
// from contract getters and replay every attempted fill in its own transaction.
for (const [count, seed] of [[2, 1], [4, 42], [8, 0xc0ffee]]) {
  const backing = 10000n, guarantee = backing / BigInt(2 * count);
  const s = await fixture(count, Number(backing), Number(guarantee));
  try {
    s.log.name = 'seeded-trading'; s.log.seed = seed;
    const virtual = [Array(count).fill(backing), Array(count).fill(backing)];
    const real = [backing, backing], takerBalances = [1000000n, 1000000n];
    const baseline = backing - guarantee;
    const remaining = v => v <= baseline ? 0n : (v - baseline < guarantee ? v - baseline : guarantee);
    const minimum = (a, b) => a < b ? a : b;
    let randomState = seed >>> 0;
    const random = () => {
      randomState ^= randomState << 13; randomState ^= randomState >>> 17; randomState ^= randomState << 5;
      return randomState >>> 0;
    };
    async function checkModel() {
      const actual = await s.state();
      for (let token = 0; token < 2; token++) {
        assert.deepEqual(actual[token].virtual, virtual[token], 'independent virtual ledger');
        assert.equal(actual[token].balance, real[token]);
        assert.equal(actual[token].takerBalance, takerBalances[token]);
        assert.equal(actual[token].remaining, virtual[token].reduce((sum, v) => sum + remaining(v), 0n));
        assert.equal(actual[token].allowance, MaxUint256, 'supported mock preserves infinite approval');
      }
    }
    let accepted = 0, rejected = 0;
    for (let step = 0; step < 64; step++) {
      const index = random() % count;
      // Alternate concentrated-output stretches with mixed directions.
      const out = step % 16 < 8 ? 1 : random() % 2;
      const input = 1 - out;
      if (step % 7 === 0 || virtual[out][index] <= 1n) {
        const deposit = 500n;
        const before = await s.state();
        await s.write(s.aqua, 'push', [s.vault.address, s.router.address, s.hashes[index], s.tokens[out].address, deposit],
          s.taker, true, true, `seed ${seed} step ${step} replenish`);
        virtual[out][index] += deposit; real[out] += deposit; takerBalances[out] -= deposit;
        await checkModel();
        Object.assign(s.log.transactions.at(-1), { before, after: await s.state() });
      }
      let debit = BigInt(1 + random() % 2500);
      if (step === 0) debit = real[out] - BigInt(count - 1) * guarantee + 1n;
      if (step === 1) debit = 1n; // Ensure the same sequence exercises admission as well as rejection.
      debit = minimum(debit, virtual[out][index] - 1n);
      const affordable = takerBalances[input] * virtual[out][index] / (virtual[input][index] + takerBalances[input]);
      debit = minimum(debit, affordable);
      assert.ok(debit > 0n, 'sequence must remain priced and funded');
      const cost = (debit * virtual[input][index] + virtual[out][index] - debit - 1n) / (virtual[out][index] - debit);
      const required = debit + virtual[out].reduce((sum, v, i) => sum + remaining(v - (i === index ? debit : 0n)), 0n);
      const shouldPass = real[out] >= required;
      await s.swap(index, debit, out === 1, shouldPass, `seed ${seed} step ${step}`,
        shouldPass ? undefined : [real[out], required]);
      if (shouldPass) {
        accepted++;
        virtual[out][index] -= debit; virtual[input][index] += cost;
        real[out] -= debit; real[input] += cost;
        takerBalances[out] += debit; takerBalances[input] -= cost;
      } else rejected++;
      await checkModel();
    }
    assert.ok(accepted > 0 && rejected > 0, 'each seed must cover both outcomes');
    s.log.outcomes = { accepted, rejected, attempted: 64 };
    console.log(`Stateful seed ${seed}, ${count} strategies: ${accepted} accepted, ${rejected} rejected; model matched every step`);
  } finally { await s.connection.close(); }
}
const output = new URL('../benchmarks/raw/transactions-v1.json', import.meta.url);
mkdirSync(new URL('../benchmarks/raw/', import.meta.url), { recursive: true });
writeFileSync(output, JSON.stringify(report, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2) + '\n');
console.log('Separate-transaction assertions passed. Raw receipts and states: benchmarks/raw/transactions-v1.json');
for (const scenario of report.scenarios.filter(s => s.name === 'group-size-gas')) {
  console.log(`${scenario.count} strategies: ${scenario.transactions.map(t => Number(BigInt(t.receipt.gasUsed))).join(', ')} gas (first, second fill)`);
}
