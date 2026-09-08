// Isolated local EVMs; receipt gas is charged gas after refunds, not a universal upper bound.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { artifacts, network } from 'hardhat';
import { Interface, keccak256 } from 'ethers';

const fileHash = p => createHash('sha256').update(readFileSync(p)).digest('hex');
const git = (...args) => execFileSync('git', ['-c', `safe.directory=${process.cwd().replaceAll('\\', '/')}`, ...args], { encoding: 'utf8' }).trim();
const version = p => JSON.parse(readFileSync(`node_modules/${p}/package.json`)).version;
const report = {
  kind: 'local-eight-strategy-lifecycle-gas-v1',
  sourceCommit: git('rev-parse', 'HEAD'), dirty: git('status', '--porcelain') !== '',
  node: process.version, pnpm: process.env.npm_config_user_agent?.match(/pnpm\/([^\s]+)/)?.[1] ?? 'unknown',
  hardhat: version('hardhat'), ethers: version('ethers'),
  pins: JSON.parse(readFileSync('sources.lock.json')),
  sourceHashes: Object.fromEntries(['scripts/check-lifecycle-gas.mjs', 'docs/LIFECYCLE_GAS.md',
    'contracts/AquaQoSVault.sol', 'contracts/AquaQoSRouter.sol', 'hardhat.config.ts',
    'sources.lock.json', 'package.json', 'pnpm-lock.yaml'].map(p => [p, fileHash(p)])),
  fixtures: [], maxima: {},
};

async function run(initialGuarantee) {
  const connection = await network.create({ network: 'default', override: {
    hardfork: 'cancun', initialDate: '2026-09-08T00:00:00Z', throwOnTransactionFailures: false,
  } });
  try {
    const rpc = (method, params = []) => connection.provider.request({ method, params });
    const [owner, recipient] = await rpc('eth_accounts');
    const log = { initialGuarantee, deployments: [], transactions: [] };
    report.fixtures.push(log);
    const read = async (c, method, args = []) => c.abi.decodeFunctionResult(method,
      await rpc('eth_call', [{ from: owner, to: c.address, data: c.abi.encodeFunctionData(method, args) }, 'latest']));
    const send = async (label, to, data, expectedError, before, category) => {
      const tx = { from: owner, data, gas: '0xf00000', ...(to ? { to } : {}) };
      const hash = await rpc('eth_sendTransaction', [tx]);
      const receipt = await rpc('eth_getTransactionReceipt', [hash]);
      assert.equal(receipt.status, expectedError ? '0x0' : '0x1', label);
      const transaction = await rpc('eth_getTransactionByHash', [hash]);
      assert.equal(transaction.input, data);
      assert.equal(transaction.from.toLowerCase(), owner.toLowerCase());
      assert.equal(transaction.to?.toLowerCase(), to?.toLowerCase());
      const block = await rpc('eth_getBlockByHash', [receipt.blockHash, false]);
      assert.ok(BigInt(receipt.gasUsed) <= BigInt(tx.gas));
      assert.ok(BigInt(tx.gas) <= BigInt(block.gasLimit));
      const row = { label, category, tx, receipt, transaction, blockGasLimit: block.gasLimit, before };
      if (expectedError) {
        const trace = await rpc('debug_traceTransaction', [hash, { disableMemory: true, disableStack: true, disableStorage: true }]);
        const data = trace.returnValue.startsWith('0x') ? trace.returnValue : `0x${trace.returnValue}`;
        assert.equal(data, expectedError, `${label}: exact failure reason`);
        assert.equal(trace.failed, true);
        row.failure = { data, traceGas: trace.gas };
      }
      log.transactions.push(row);
      return row;
    };
    const deploy = async (name, args = []) => {
      const artifact = await artifacts.readArtifact(name), abi = new Interface(artifact.abi);
      const build = JSON.parse(readFileSync(await artifacts.getBuildInfoPath(artifact.buildInfoId)));
      assert.equal(build.solcVersion, '0.8.30');
      assert.equal(build.input.settings.evmVersion, 'cancun');
      assert.deepEqual(build.input.settings.optimizer, { enabled: true, runs: 700 });
      assert.equal(build.input.settings.viaIR, true);
      const row = await send(`deploy ${name}`, undefined, artifact.bytecode + abi.encodeDeploy(args).slice(2));
      const code = await rpc('eth_getCode', [row.receipt.contractAddress, 'latest']);
      log.deployments.push({ name, address: row.receipt.contractAddress, runtimeHash: keccak256(code),
        runtimeBytes: (code.length - 2) / 2, buildInfoId: artifact.buildInfoId,
        solcLongVersion: build.solcLongVersion, settings: build.input.settings });
      return { address: row.receipt.contractAddress, abi };
    };
    const aqua = await deploy('Aqua');
    const router = await deploy('AquaQoSRouter', [aqua.address, owner]);
    const tokens = [await deploy('TokenMock', ['Lifecycle A', 'A']), await deploy('TokenMock', ['Lifecycle B', 'B'])]
      .sort((a, b) => a.address.toLowerCase().localeCompare(b.address.toLowerCase()));
    const vault = await deploy('AquaQoSVault', [aqua.address, router.address, ...tokens.map(t => t.address), owner]);
    log.addresses = { aqua: aqua.address, router: router.address, vault: vault.address, owner, recipient, tokens: tokens.map(t => t.address) };
    const hashes = [];
    const state = async () => {
      const result = { paused: (await read(vault, 'paused'))[0], listedHashes: [], strategies: [], tokens: [] };
      for (let i = 0; i <= 8; i++) {
        let hash;
        try { [hash] = await read(vault, 'hashes', [i]); }
        catch (error) {
          // Hardhat's local eth_call may expose an empty revert payload for an
          // out-of-bounds public-array getter; either form is an array-bound stop.
          break;
        }
        assert.ok(i < 8, 'onchain group must remain bounded');
        result.listedHashes.push(hash);
      }
      for (const hash of hashes) {
        const values = await read(vault, 'strategies', [hash]);
        const virtual = [], reservations = [];
        for (const token of tokens) {
          virtual.push((await read(aqua, 'rawBalances', [vault.address, router.address, hash, token.address])).toArray());
          const [r] = await read(vault, 'reservation', [hash, token.address]);
          assert.equal(r, 0n); reservations.push(r);
        }
        result.strategies.push({ hash, values: values.toArray(), virtual, reservations });
      }
      for (const token of tokens) {
        const accounts = [];
        for (const address of [vault.address, owner, recipient, router.address, aqua.address]) {
          accounts.push({ address, balance: (await read(token, 'balanceOf', [address]))[0],
            allowance: (await read(token, 'allowance', [address, aqua.address]))[0] });
        }
        result.tokens.push(accounts);
      }
      return result;
    };
    const write = async (c, method, args = [], label = method, category, error) => {
      const before = await state();
      const row = await send(label, c.address, c.abi.encodeFunctionData(method, args), error, before, category);
      row.after = await state();
      if (error) assert.deepEqual(row.after, before, `${label}: complete observed rollback`);
      return row;
    };
    const invalid = vault.abi.encodeErrorResult('InvalidConfiguration');
    const insufficient = (available, required) => vault.abi.encodeErrorResult('InsufficientCapacity', [available, required]);
    const assertGroup = async (guarantee, baseline, paused) => {
      const s = await state();
      assert.equal(s.paused, paused);
      for (const [i, strategy] of s.strategies.entries()) {
        assert.deepEqual(strategy.values, [BigInt(guarantee), BigInt(guarantee), BigInt(baseline), BigInt(baseline), true]);
        assert.deepEqual(strategy.virtual, [[1000n, 2n], [1000n, 2n]]);
        assert.equal((await read(vault, 'hashes', [i]))[0], strategy.hash);
      }
      assert.equal(s.strategies.length, 8);
      await assert.rejects(read(vault, 'hashes', [8]));
      return s;
    };
    await write(tokens[0], 'mint', [vault.address, 8000]);
    await write(tokens[1], 'mint', [vault.address, 3999]);
    for (let salt = 1; salt <= 8; salt++) {
      const [order] = await read(vault, 'order', [salt]);
      const [hash] = await read(router, 'hash', [[order.maker, order.traits, order.data]]);
      hashes.push(hash); // Capture its pre-registration inactive state too.
      const row = await write(vault, 'createStrategy', [salt, 1000, 1000, initialGuarantee, initialGuarantee],
        `register ${salt}: initial g=${initialGuarantee}`, 'createStrategy');
      const events = row.receipt.logs.filter(l => l.address.toLowerCase() === vault.address.toLowerCase())
        .map(l => vault.abi.parseLog(l));
      assert.equal(events.length, 1); assert.equal(events[0].name, 'StrategyCreated');
      assert.equal(events[0].args.hash, hash);
    }
    await assertGroup(initialGuarantee, 1000 - initialGuarantee, true);
    await write(vault, 'createStrategy', [9, 1000, 1000, 500, 500], 'ninth registration rejected', 'rejection', invalid);
    await write(vault, 'activate', [], 'underfunded token B activation', 'rejection', insufficient(3999, 8 * initialGuarantee));
    const configure = async (g, label) => {
      for (const [i, hash] of hashes.entries()) await write(vault, 'setGuarantees', [hash, g, g], `${label}: strategy ${i + 1}`, 'setGuarantees');
    };
    if (initialGuarantee === 1000) {
      await configure(500, 'nonzero to nonzero guarantee');
      await write(vault, 'activate', [], 'token B failure after sixteen zero-to-nonzero baseline writes', 'rejection', insufficient(3999, 4000));
      await assertGroup(500, 0, true);
    }
    await write(tokens[1], 'mint', [vault.address, 4001]);
    await write(vault, 'activate', [], initialGuarantee === 1000 ? 'sixteen zero-to-nonzero baselines' : 'initial unchanged baselines', 'activate');
    await assertGroup(500, 500, false);
    await write(vault, 'pause', [], 'pause active group', 'pause');
    await write(vault, 'activate', [], 'sixteen unchanged baselines', 'activate');
    await write(vault, 'pause', [], 'pause before guarantee cycles', 'pause');
    for (const g of [0, 500, 1000]) {
      await configure(g, `guarantee cycle to ${g}`);
      await write(vault, 'activate', [], `baseline cycle to ${1000 - g}`, 'activate');
      await assertGroup(g, 1000 - g, false);
      await write(vault, 'pause', [], `pause after cycle ${g}`, 'pause');
    }
    await write(vault, 'withdraw', [tokens[0].address, recipient, 1], 'withdraw before docking rejected', 'rejection', invalid);
    const dock = await write(vault, 'dockAll', [], 'dock eight live strategies', 'dockAll');
    for (const s of dock.after.strategies) {
      assert.equal(s.values[4], false);
      assert.deepEqual(s.virtual, [[0n, 255n], [0n, 255n]]);
    }
    assert.deepEqual(dock.after.tokens, dock.before.tokens, 'docking does not transfer inventory');
    await assert.rejects(read(vault, 'hashes', [0]));
    await write(vault, 'dockAll', [], 'dock empty group', 'dockAll');
    for (const token of tokens) {
      for (const amount of [1, 7999]) {
        const row = await write(vault, 'withdraw', [token.address, recipient, amount],
          `withdraw ${amount === 1 ? 'partial to fresh' : 'remaining to existing'} recipient ${token.address}`, 'withdraw');
        const i = tokens.indexOf(token);
        assert.equal(row.before.tokens[i][0].balance - row.after.tokens[i][0].balance, BigInt(amount));
        assert.equal(row.after.tokens[i][2].balance - row.before.tokens[i][2].balance, BigInt(amount));
        assert.deepEqual(row.after.strategies, row.before.strategies);
      }
    }
    for (const row of log.transactions.filter(t => t.category)) {
      const gas = Number(BigInt(row.receipt.gasUsed));
      if (gas > (report.maxima[row.category]?.gasUsed ?? 0)) {
        report.maxima[row.category] = { gasUsed: gas, initialGuarantee, label: row.label, transactionHash: row.receipt.transactionHash };
      }
    }
  } finally { await connection.close(); }
}

await run(1000);
await run(500);
writeFileSync('benchmarks/raw/lifecycle-gas-v1.json', JSON.stringify(report, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2) + '\n');
console.log('Eight-strategy lifecycle assertions passed; receipt evidence: benchmarks/raw/lifecycle-gas-v1.json');
console.log(JSON.stringify(report.maxima, null, 2));
