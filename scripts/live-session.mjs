import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { artifacts, network } from 'hardhat';
import { Interface, MaxUint256, keccak256 } from 'ethers';

const sourceFiles = ['contracts/AquaQoSRouter.sol', 'contracts/AquaQoSVault.sol',
  'hardhat.config.ts', 'pnpm-lock.yaml', 'sources.lock.json', 'scripts/live-session.mjs'];
const sha = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const git = (...args) => execFileSync('git', ['-c', `safe.directory=${process.cwd().replaceAll('\\', '/')}`, ...args], { encoding: 'utf8' }).trim();
export const json = value => JSON.stringify(value, (_, v) => typeof v === 'bigint' ? String(v) : v);
export function units(value, zero = false, maximum = 1000000000n) {
  if (typeof value !== 'string' || !/^(0|[1-9]\d{0,77})$/.test(value)
      || BigInt(value) > maximum || (!zero && value === '0')) throw Error('Use whole mock-token units between ' + (zero ? '0' : '1') + ' and ' + maximum.toLocaleString('en-US') + '.');
  return BigInt(value);
}
// Pinned TakerTraitsLib: ten slice offsets, flags, optional 32-byte maximum input.
const traits = (out, maxInput) => '0x' + (maxInput === undefined ? '0000' : '0020').repeat(10)
  + (out === 1 ? '00e0' : '0060') + (maxInput === undefined ? '' : BigInt(maxInput).toString(16).padStart(64, '0'));

export async function createLiveSession(config) {
  if (!Number.isInteger(config.count) || config.count < 2 || config.count > 8) throw Error('Choose 2–8 strategies.');
  const backing = units(config.backing), guarantee = units(config.guarantee, true);
  if (guarantee * BigInt(config.count) > backing) throw Error('Total configured protection exceeds inventory.');
  const connection = await network.create({ network: 'default', override: {
    hardfork: 'cancun', throwOnTransactionFailures: false,
  } });
  const rpc = (method, params = []) => connection.provider.request({ method, params });
  try {
    const [owner, taker] = await rpc('eth_accounts');
    const id = randomUUID(), deployments = [], setupReceipts = [], history = [], orders = [], hashes = [];
    const identity = { sourceCommit: git('rev-parse', 'HEAD'), dirty: git('status', '--porcelain') !== '',
      sourceHashes: Object.fromEntries(sourceFiles.map(p => [p, sha(p)])), pins: JSON.parse(readFileSync('sources.lock.json')) };
    async function send(to, data, from = owner) {
      const tx = { from, data, gas: '0xf00000', ...(to ? { to } : {}) };
      const hash = await rpc('eth_sendTransaction', [tx]);
      const receipt = await rpc('eth_getTransactionReceipt', [hash]);
      return { tx, receipt };
    }
    async function deploy(name, args = []) {
      const artifact = await artifacts.readArtifact(name), abi = new Interface(artifact.abi);
      const result = await send(null, artifact.bytecode + abi.encodeDeploy(args).slice(2));
      assert.equal(result.receipt.status, '0x1', `deploy ${name}`);
      const address = result.receipt.contractAddress;
      const code = await rpc('eth_getCode', [address, 'latest']);
      const build = JSON.parse(readFileSync(await artifacts.getBuildInfoPath(artifact.buildInfoId)));
      const deployed = { object: artifact.deployedBytecode, immutableReferences: artifact.immutableReferences };
      const mask = bytes => {
        let s = bytes.replace(/^0x/, '');
        for (const ref of Object.values(deployed.immutableReferences ?? {}).flat())
          s = s.slice(0, ref.start * 2) + '00'.repeat(ref.length) + s.slice((ref.start + ref.length) * 2);
        return s;
      };
      assert.equal(mask(code), mask(deployed.object), `${name} deployed runtime matches compiled code outside constructor immutables`);
      assert.equal(build.solcVersion, '0.8.30');
      assert.equal(build.input.settings.evmVersion, 'cancun');
      deployments.push({ name, address, ...result, runtimeHash: keccak256(code), buildInfoId: artifact.buildInfoId });
      return { address, abi };
    }
    const read = async (c, method, args = []) => c.abi.decodeFunctionResult(method,
      await rpc('eth_call', [{ to: c.address, data: c.abi.encodeFunctionData(method, args), from: taker }, 'latest']));
    const write = (c, method, args = [], from = owner) => send(c.address, c.abi.encodeFunctionData(method, args), from);
    const setup = async (c, method, args, from) => {
      const r = await write(c, method, args, from); assert.equal(r.receipt.status, '0x1', method);
      setupReceipts.push({ operation: method, ...r });
    };
    const aqua = await deploy('Aqua');
    const router = await deploy('AquaQoSRouter', [aqua.address, owner]);
    const tokens = [await deploy('TokenMock', ['Token A', 'A']), await deploy('TokenMock', ['Token B', 'B'])]
      .sort((a, b) => a.address.toLowerCase().localeCompare(b.address.toLowerCase()));
    const vault = await deploy('AquaQoSVault', [aqua.address, router.address, ...tokens.map(t => t.address), owner]);
    for (const token of tokens) {
      await setup(token, 'mint', [vault.address, backing]);
      await setup(token, 'mint', [taker, 1000000000000n]);
      await setup(token, 'approve', [router.address, MaxUint256], taker);
      await setup(token, 'approve', [aqua.address, MaxUint256], taker);
    }
    for (let i = 1; i <= config.count; i++) {
      await setup(vault, 'createStrategy', [i, backing, backing, guarantee, guarantee]);
      const [o] = await read(vault, 'order', [i]);
      const order = [o.maker, o.traits, o.data];
      orders.push(order); hashes.push((await read(router, 'hash', [order]))[0]);
    }
    await setup(vault, 'activate', []);
    for (const [contract, getter, expected] of [[vault, 'owner', owner], [vault, 'AQUA', aqua.address],
      [vault, 'ROUTER', router.address], [vault, 'tokenA', tokens[0].address], [vault, 'tokenB', tokens[1].address],
      [router, 'AQUA', aqua.address]]) assert.equal((await read(contract, getter))[0].toLowerCase(), expected.toLowerCase());
    const chainId = Number(BigInt(await rpc('eth_chainId')));
    async function state() {
      const paused = (await read(vault, 'paused'))[0], strategies = [];
      for (let i = 0; i < hashes.length; i++) {
        const s = await read(vault, 'strategies', [hashes[i]]);
        const virtual = [], remaining = [], markers = [];
        for (let t = 0; t < 2; t++) {
          const [v, marker] = await read(aqua, 'rawBalances', [vault.address, router.address, hashes[i], tokens[t].address]);
          virtual.push(String(v)); markers.push(Number(marker));
          const r = s.active && !paused ? (v > s[t + 2] ? v - s[t + 2] : 0n) : 0n;
          remaining.push(String(r < s[t] ? r : s[t]));
        }
        strategies.push({ hash: hashes[i], active: s.active, guarantees: [String(s[0]), String(s[1])],
          baselines: [String(s[2]), String(s[3])], virtual, remaining, markers });
      }
      const balances = [];
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const balance = (await read(token, 'balanceOf', [vault.address]))[0];
        const allowance = (await read(token, 'allowance', [vault.address, aqua.address]))[0];
        const remaining = strategies.reduce((n, s) => n + BigInt(s.remaining[i]), 0n);
        assert.ok(paused || (balance >= remaining && allowance >= remaining), 'live backing invariant');
        balances.push({ address: token.address, balance: String(balance), allowance: String(allowance),
          ownerBalance: String((await read(token, 'balanceOf', [owner]))[0]),
          takerBalance: String((await read(token, 'balanceOf', [taker]))[0]), remaining: String(remaining) });
      }
      return { paused, blockNumber: Number(BigInt(await rpc('eth_blockNumber'))), tokens: balances, strategies };
    }
    function decode(data) {
      for (const c of [vault, router, aqua, ...tokens]) {
        try { const e = c.abi.parseError(data); if (e) return { name: e.name, args: Array.from(e.args, String), data }; } catch {}
      }
      return { name: 'Transaction reverted', args: [], data };
    }
    const strategy = value => {
      if (!Number.isInteger(value) || value < 0 || value >= orders.length) throw Error('Unknown strategy.');
      return value;
    };
    const tokenIndex = value => { if (value !== 0 && value !== 1) throw Error('Choose Token 0 or Token 1.'); return value; };
    let quote = null;
    return {
      id, close: () => connection.close(),
      snapshot: async () => ({ kind: 'aquaqos-live-local-v1', id, chainId, config, identity, deployments,
        addresses: { owner, taker, vault: vault.address, router: router.address, aqua: aqua.address },
        ...await state(), quote, history, setupReceipts }),
      async action(input) {
        if (input.operation === 'quote') {
          const i = strategy(input.strategy), out = tokenIndex(input.token), amount = units(input.amount);
          quote = null;
          const candidate = { id: randomUUID(), strategy: i, token: out, amount: String(amount), input: null, error: null };
          try { candidate.input = String((await read(router, 'quote', [orders[i], amount, traits(out)]))[0]); }
          catch (e) {
            const data = typeof e.data === 'string' ? e.data : e.data?.data;
            if (!data) throw e;
            candidate.error = decode(data);
          }
          quote = candidate;
          return;
        }
        if (history.length >= 100) {
          const current = await state();
          const active = current.strategies.some(s => s.active);
          const exit = (input.operation === 'pause' && !current.paused)
            || (input.operation === 'dockAll' && current.paused && active)
            || (input.operation === 'withdraw' && current.paused && !active
              && current.tokens[tokenIndex(input.token)].balance === input.amount && input.amount !== '0');
          if (!exit) throw Error('This local session reached 100 actions. Complete the maker exit or export and start a fresh session.');
        }
        let c, method, args, from = owner;
        if (input.operation === 'swap') {
          if (!quote || quote.id !== input.quoteId) throw Error('Quote is stale. Request a new quote.');
          c = router; method = 'swap'; args = [orders[quote.strategy], BigInt(quote.amount), traits(quote.token, quote.input ?? undefined)]; from = taker;
        } else if (input.operation === 'push') {
          const i = strategy(input.strategy), t = tokenIndex(input.token);
          c = aqua; method = 'push'; args = [vault.address, router.address, hashes[i], tokens[t].address, units(input.amount)]; from = taker;
        } else if (input.operation === 'guarantees') {
          c = vault; method = 'setGuarantees'; args = [hashes[strategy(input.strategy)], units(input.guaranteeA, true), units(input.guaranteeB, true)];
        } else if (['pause', 'activate', 'dockAll'].includes(input.operation)) {
          c = vault; method = input.operation; args = [];
        } else if (input.operation === 'withdraw') {
          c = vault; method = 'withdraw'; args = [tokens[tokenIndex(input.token)].address, owner, units(input.amount, false, MaxUint256)];
        } else throw Error('Unsupported operation.');
        const before = await state();
        quote = null;
        const result = await write(c, method, args, from);
        const after = await state();
        let error = null;
        if (result.receipt.status === '0x0') {
          assert.deepEqual({ ...after, blockNumber: 0 }, { ...before, blockNumber: 0 }, 'reverted transaction preserves token and virtual state');
          const trace = await rpc('debug_traceTransaction', [result.receipt.transactionHash,
            { disableMemory: true, disableStack: true, disableStorage: true }]);
          error = decode(trace.returnValue.startsWith('0x') ? trace.returnValue : '0x' + trace.returnValue);
        }
        const transfers = result.receipt.logs.flatMap(log => {
          const t = tokens.findIndex(x => x.address.toLowerCase() === log.address.toLowerCase());
          if (t < 0) return [];
          const e = tokens[t].abi.parseLog(log);
          return e?.name === 'Transfer' ? [{ token: t, from: e.args[0], to: e.args[1], amount: String(e.args[2]) }] : [];
        });
        history.push({ operation: input.operation, ...result, before, after, error, transfers });
      },
    };
  } catch (e) { await connection.close(); throw e; }
}
