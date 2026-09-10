// All writes go to an in-process EVM. The optional upstream RPC is read-only.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { artifacts, network } from 'hardhat';
import { AbiCoder, Interface, MaxUint256, ZeroAddress, keccak256, id } from 'ethers';

const fork = process.env.AQUAQOS_FORK === '1';
const pin = fork ? JSON.parse(readFileSync('deployments/ethereum-fork/pin.json', 'utf8')) : null;
const directory = fork ? 'deployments/ethereum-fork' : 'deployments/local-release';
mkdirSync(directory, { recursive: true });
const stringify = value => JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2) + '\n';
const sha = data => createHash('sha256').update(data).digest('hex');
const git = (...args) => execFileSync('git', ['-c', `safe.directory=${process.cwd().replaceAll('\\', '/')}`, ...args], { encoding: 'utf8' }).trim();
// Exclude only generated proof outputs; include untracked source and upstream pins.
const dirty = git('status', '--porcelain', '--', '.',
  ':(exclude)deployments/local-release/report.json', ':(exclude)deployments/local-release/*.json.gz',
  ':(exclude)deployments/ethereum-fork/report.json', ':(exclude)deployments/ethereum-fork/*.json.gz') !== '';
const report = { kind: fork ? 'ethereum-fork-release-v1' : 'local-release-traces-v1',
  sourceCommit: git('rev-parse', 'HEAD'), dirty,
  dirtyScope: 'Entire checkout except the two generated report.json and trace *.json.gz output sets.',
  node: process.version, hardhat: JSON.parse(readFileSync('node_modules/hardhat/package.json')).version,
  pins: JSON.parse(readFileSync('sources.lock.json')), fork: pin,
  sourceHashes: Object.fromEntries(['contracts/AquaQoSRouter.sol', 'contracts/AquaQoSVault.sol',
    'scripts/check-release.mjs', 'hardhat.config.ts', 'pnpm-lock.yaml'].map(p => [p, sha(readFileSync(p))])),
  scenarios: [], limitations: ['Local transactions only; hashes are not public Ethereum transactions.',
    'Two-strategy demonstration, fixed fee-free exact-output demand; not market pricing or a benchmark.',
    'Fork token funding uses local account impersonation and local native currency; no upstream writes.'] };
const tokenAbi = new Interface(['function balanceOf(address) view returns(uint256)',
  'function allowance(address,address) view returns(uint256)', 'function approve(address,uint256) returns(bool)',
  'function transfer(address,uint256) returns(bool)', 'function decimals() view returns(uint8)',
  'function deposit() payable', 'event Transfer(address indexed from,address indexed to,uint256 value)']);
const coder = AbiCoder.defaultAbiCoder();
const orderType = 'tuple(address maker,uint256 traits,bytes data)';
const traits = direction => '0x' + '00'.repeat(20) + (direction ? '00e0' : '0060');
const unit = 10n ** 15n; // 1,000 units = one token; both fork tokens have 18 decimals.
const backing = 1000n * unit;

for (const guarded of [false, true]) {
  const label = guarded ? 'guarded' : 'raw';
  console.log(`Starting ${fork ? 'Ethereum fork' : 'local'} ${label} scenario`);
  const connection = await network.create({ network: 'default', override: {
    chainId: 31337, hardfork: fork ? 'prague' : 'cancun', throwOnTransactionFailures: false,
    ...(fork ? { forking: { url: process.env.AQUAQOS_FORK_RPC ?? 'https://eth.drpc.org', blockNumber: pin.blockNumber } }
      : { initialDate: '2026-09-10T00:00:00Z' }),
  } });
  const rpc = (method, params = []) => connection.provider.request({ method, params });
  try {
    assert.equal(await rpc('eth_chainId'), '0x7a69');
    if (fork) {
      assert.equal((await rpc('eth_getBlockByNumber', [`0x${pin.blockNumber.toString(16)}`, false])).hash, pin.blockHash);
      // Historical fork-block eth_call uses upstream chain context. Mine a local block
      // before constructor simulation so EIP-712 chain-id immutables match deployment.
      await rpc('evm_mine');
    }
    const [owner, taker, funder] = await rpc('eth_accounts');
    const scenario = { label, owner, taker, deployments: [], transactions: [], actions: [] };
    report.scenarios.push(scenario);
    const send = async (name, to, data, from = owner, success = true, value) => {
      const tx = { from, data, gas: '0xf00000', ...(to ? { to } : {}), ...(value ? { value } : {}) };
      const hash = await rpc('eth_sendTransaction', [tx]);
      const receipt = await rpc('eth_getTransactionReceipt', [hash]);
      assert.equal(receipt.status, success ? '0x1' : '0x0', name);
      const block = await rpc('eth_getBlockByNumber', [receipt.blockNumber, false]);
      assert.equal(receipt.blockHash, block.hash);
      scenario.transactions.push({ name, tx, receipt, block: { number: block.number, hash: block.hash, timestamp: block.timestamp } });
      return receipt;
    };
    const deploy = async (name, args = []) => {
      const artifact = await artifacts.readArtifact(name);
      const abi = new Interface(artifact.abi);
      const data = artifact.bytecode + abi.encodeDeploy(args).slice(2);
      // Constructor simulation from identical pre-state returns the exact expected runtime,
      // including immutables and metadata. Compare it with the subsequently mined deployment.
      const expected = await rpc('eth_call', [{ from: owner, data, gas: '0xf00000' }, 'latest']);
      const receipt = await send(`deploy ${name}`, null, data);
      const runtime = await rpc('eth_getCode', [receipt.contractAddress, 'latest']);
      assert.equal(keccak256(runtime), keccak256(expected), `${name} full runtime authentication`);
      const build = JSON.parse(readFileSync(await artifacts.getBuildInfoPath(artifact.buildInfoId)));
      assert.equal(build.solcVersion, '0.8.30');
      assert.equal(build.input.settings.evmVersion, 'cancun');
      assert.equal(build.input.settings.optimizer.runs, 700);
      assert.equal(build.input.settings.viaIR, true);
      scenario.deployments.push({ name, address: receipt.contractAddress, constructorArgs: args,
        receipt, initcodeHash: keccak256(data), artifactBytecodeHash: keccak256(artifact.bytecode),
        runtime, runtimeHash: keccak256(runtime), expectedRuntimeHash: keccak256(expected),
        buildInfoId: artifact.buildInfoId, compiler: build.solcLongVersion,
        compilerInputHash: sha(JSON.stringify(build.input)) });
      return { address: receipt.contractAddress, abi };
    };
    const read = async (c, method, args = []) => c.abi.decodeFunctionResult(method,
      await rpc('eth_call', [{ from: taker, to: c.address, data: c.abi.encodeFunctionData(method, args) }, 'latest']));
    const write = (c, method, args = [], from = owner, success = true) =>
      send(method, c.address, c.abi.encodeFunctionData(method, args), from, success);
    const aqua = fork ? { address: pin.aqua.address, abi: new Interface((await artifacts.readArtifact('Aqua')).abi) } : await deploy('Aqua');
    if (fork) {
      const runtime = await rpc('eth_getCode', [aqua.address, 'latest']);
      assert.equal(keccak256(runtime), pin.aqua.runtimeHash, 'authenticated upstream Aqua');
      scenario.upstreamAqua = { address: aqua.address, runtimeHash: keccak256(runtime) };
    }
    const router = guarded ? await deploy('AquaQoSRouter', [aqua.address, owner])
      : await deploy('AquaSwapVMRouter', [aqua.address, ZeroAddress, owner, 'AquaQoS release reference', '0.1']);
    const tokens = fork ? pin.tokens.map(t => ({ ...t, abi: tokenAbi }))
      : [await deploy('TokenMock', ['Token A', 'A']), await deploy('TokenMock', ['Token B', 'B'])]
        .sort((a, b) => a.address.toLowerCase().localeCompare(b.address.toLowerCase()));
    const vault = guarded ? await deploy('AquaQoSVault', [aqua.address, router.address, tokens[0].address, tokens[1].address, owner]) : null;
    const maker = vault?.address ?? owner;
    scenario.addresses = { aqua: aqua.address, router: router.address, vault: vault?.address ?? null,
      maker, tokens: tokens.map(t => t.address) };
    if (fork) {
      scenario.tokenCode = [];
      for (const t of tokens) {
        assert.equal((await read(t, 'decimals'))[0], 18n);
        const runtime = await rpc('eth_getCode', [t.address, 'latest']);
        assert.notEqual(runtime, '0x');
        scenario.tokenCode.push({ address: t.address, runtimeHash: keccak256(runtime) });
      }
      // Only this isolated provider supports impersonation. No upstream send RPC exists here.
      await rpc('hardhat_impersonateAccount', [pin.daiFundingAccount]);
      await rpc('hardhat_setBalance', [pin.daiFundingAccount, '0x56bc75e2d63100000']);
      assert.ok((await read(tokens[0], 'balanceOf', [pin.daiFundingAccount]))[0] >= 30n * backing);
      await write(tokens[0], 'transfer', [funder, 30n * backing], pin.daiFundingAccount);
      await rpc('hardhat_stopImpersonatingAccount', [pin.daiFundingAccount]);
      await send('wrap local ETH', tokens[1].address, tokenAbi.encodeFunctionData('deposit'), funder, true, `0x${(30n * backing).toString(16)}`);
      for (const t of tokens) {
        await write(t, 'transfer', [taker, 20n * backing], funder);
        await write(t, 'transfer', [maker, backing], funder);
      }
    } else for (const t of tokens) {
      await write(t, 'mint', [maker, backing]);
      await write(t, 'mint', [taker, 20n * backing]);
    }
    for (const t of tokens) {
      await write(t, 'approve', [router.address, MaxUint256], taker);
      await write(t, 'approve', [aqua.address, MaxUint256], taker);
      if (!guarded) await write(t, 'approve', [aqua.address, MaxUint256]);
    }
    const orders = [], hashes = [];
    for (const salt of [1, 2]) {
      let order;
      if (guarded) {
        await write(vault, 'createStrategy', [salt, backing, backing, backing / 2n, backing / 2n]);
        const [o] = await read(vault, 'order', [salt]);
        order = [o.maker, o.traits, o.data];
      } else {
        const makerTraits = (1n << 254n) | (0x0028002800280028n << 160n);
        order = [maker, makerTraits, `0x${tokens[0].address.slice(2)}${tokens[1].address.slice(2)}50000208${BigInt(salt).toString(16).padStart(16, '0')}`];
        await write(aqua, 'ship', [router.address, coder.encode([orderType], [order]), tokens.map(t => t.address), [backing, backing]]);
      }
      orders.push(order);
      const [hash] = await read(router, 'hash', [order]);
      assert.equal(hash, keccak256(coder.encode([orderType], [order])));
      hashes.push(hash);
    }
    if (guarded) await write(vault, 'activate');
    scenario.orders = orders;
    scenario.hashes = hashes;
    const participants = [...new Set([maker, taker, router.address, aqua.address])];
    const state = async () => {
      const result = [];
      for (const t of tokens) {
        const accounts = [];
        for (const who of participants) accounts.push({ address: who,
          balance: (await read(t, 'balanceOf', [who]))[0],
          aquaAllowance: (await read(t, 'allowance', [who, aqua.address]))[0],
          routerAllowance: (await read(t, 'allowance', [who, router.address]))[0] });
        const virtual = [], reservations = [], remaining = [];
        for (const hash of hashes) {
          const [amount, marker] = await read(aqua, 'rawBalances', [maker, router.address, hash, t.address]);
          assert.equal(marker, 2n);
          virtual.push(amount);
          if (guarded) {
            const [reserved] = await read(vault, 'reservation', [hash, t.address]);
            assert.equal(reserved, 0n);
            reservations.push(reserved);
            const s = await read(vault, 'strategies', [hash]);
            const i = t === tokens[0] ? 0 : 1;
            const available = amount > s[i + 2] ? amount - s[i + 2] : 0n;
            remaining.push(available < s[i] ? available : s[i]);
          }
        }
        if (guarded) {
          const total = remaining.reduce((a, b) => a + b, 0n);
          assert.ok(accounts[0].balance >= total && accounts[0].aquaAllowance >= total);
        }
        result.push({ token: t.address, accounts, virtual, reservations, remaining });
      }
      return result;
    };
    const initial = await state();
    for (const t of initial) assert.equal(t.accounts[0].balance, backing);
    scenario.initial = initial;
    const swap = async (name, index, amount, success, direction = true, failureName) => {
      const before = await state();
      const outputIndex = direction ? 1 : 0, inputIndex = 1 - outputIndex;
      const debit = BigInt(amount) * unit;
      const expectedInput = (debit * before[inputIndex].virtual[index] + before[outputIndex].virtual[index] - debit - 1n)
        / (before[outputIndex].virtual[index] - debit);
      let quote;
      try {
        const q = await read(router, 'quote', [orders[index], debit, traits(direction)]);
        quote = { input: q[0], output: q[1] };
        assert.equal(q[0], expectedInput); assert.equal(q[1], debit);
      } catch (error) {
        if (!guarded || success) throw error;
        quote = { rejected: true };
      }
      const receipt = await send(name, router.address, router.abi.encodeFunctionData('swap', [orders[index], debit, traits(direction)]), taker, success);
      const after = await state();
      const trace = await rpc('debug_traceTransaction', [receipt.transactionHash,
        { disableMemory: true, disableStorage: true, disableStack: false }]);
      assert.equal(trace.failed, !success);
      const traceFile = `${label}-${scenario.actions.length}-${name.replaceAll(' ', '-')}.json.gz`;
      const bytes = gzipSync(stringify(trace), { level: 9 });
      writeFileSync(`${directory}/${traceFile}`, bytes);
      const action = { name, strategy: index, amount: debit, direction, quote, before, after, receipt,
        trace: { file: traceFile, sha256: sha(bytes), steps: trace.structLogs.length, gas: trace.gas,
          failed: trace.failed, returnValue: trace.returnValue }, expectedInput };
      scenario.actions.push(action);
      const transfers = receipt.logs.filter(l => l.topics[0] === id('Transfer(address,address,uint256)'))
        .map(l => { const p = tokenAbi.parseLog(l); return { token: l.address.toLowerCase(),
          from: p.args.from.toLowerCase(), to: p.args.to.toLowerCase(), amount: p.args.value }; });
      action.transfers = transfers;
      if (success) {
        assert.equal(before[outputIndex].accounts[0].balance - after[outputIndex].accounts[0].balance, debit);
        assert.equal(after[outputIndex].accounts[1].balance - before[outputIndex].accounts[1].balance, debit);
        assert.equal(after[inputIndex].accounts[0].balance - before[inputIndex].accounts[0].balance, expectedInput);
        assert.equal(before[inputIndex].accounts[1].balance - after[inputIndex].accounts[1].balance, expectedInput);
        for (let i = 0; i < 2; i++) {
          assert.equal(before[outputIndex].virtual[i] - after[outputIndex].virtual[i], i === index ? debit : 0n);
          assert.equal(after[inputIndex].virtual[i] - before[inputIndex].virtual[i], i === index ? expectedInput : 0n);
        }
        assert.deepEqual(transfers, [
          { token: tokens[inputIndex].address.toLowerCase(), from: taker.toLowerCase(), to: router.address.toLowerCase(), amount: expectedInput },
          { token: tokens[inputIndex].address.toLowerCase(), from: router.address.toLowerCase(), to: maker.toLowerCase(), amount: expectedInput },
          { token: tokens[outputIndex].address.toLowerCase(), from: maker.toLowerCase(), to: taker.toLowerCase(), amount: debit },
        ]);
      } else {
        assert.deepEqual(after, before, 'complete observed token, allowance and virtual rollback');
        assert.deepEqual(receipt.logs, []);
        const returned = trace.returnValue.startsWith('0x') ? trace.returnValue : '0x' + trace.returnValue;
        assert.equal(returned.slice(0, 10), id(failureName).slice(0, 10));
        action.failureSignature = failureName;
        if (!guarded) {
          assert.ok(before[outputIndex].accounts[0].balance < debit, 'inventory, not allowance, is insufficient');
          assert.ok(before[outputIndex].accounts[0].aquaAllowance >= debit);
          assert.ok(before[outputIndex].virtual[index] >= debit);
          assert.equal(quote.rejected, undefined, 'raw sibling quote still succeeds');
        }
      }
      console.log(`${label}: ${name} ${success ? 'filled' : 'reverted as expected'}; ${trace.structLogs.length} trace steps`);
    };
    if (!guarded) {
      await swap('first consumes 600', 0, 600, true);
      await swap('sibling settlement failure', 1, 500, false, true, 'SafeTransferFromFailed()');
    } else {
      await swap('reject sibling capacity consumption', 0, 600, false, true, 'InsufficientCapacity(uint256,uint256)');
      await swap('first guarantee', 0, 500, true);
      await swap('reject one unit above sibling', 1, 501, false, true, 'InsufficientCapacity(uint256,uint256)');
      await swap('sibling guarantee', 1, 500, true);
      const beforePush = await state();
      const receipt = await write(aqua, 'push', [maker, router.address, hashes[0], tokens[1].address, backing / 2n], taker);
      const afterPush = await state();
      assert.equal(afterPush[1].accounts[0].balance - beforePush[1].accounts[0].balance, backing / 2n);
      assert.equal(afterPush[1].remaining[0], backing / 2n);
      scenario.push = { before: beforePush, after: afterPush, receipt };
      await swap('restored guarantee', 0, 500, true);
      await swap('reverse replenishment', 0, 100, true, false);
      await write(vault, 'pause');
      await write(vault, 'dockAll');
      for (const t of tokens) {
        const [balance] = await read(t, 'balanceOf', [maker]);
        await write(vault, 'withdraw', [t.address, owner, balance]);
        assert.equal((await read(t, 'balanceOf', [maker]))[0], 0n);
      }
      scenario.exit = { paused: (await read(vault, 'paused'))[0], vaultTokenBalances: ['0', '0'] };
      assert.equal(scenario.exit.paused, true);
    }
  } finally { await connection.close(); }
}
writeFileSync(`${directory}/report.json`, stringify(report));
console.log(`Release checks passed: ${directory}/report.json`);
