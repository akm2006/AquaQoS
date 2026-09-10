// Read-only upstream authentication; no transactions are sent to Ethereum.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { keccak256 } from 'ethers';

const directory = 'deployments/ethereum-fork';
const address = '0x499943e74fb0ce105688beee8ef2abec5d936d31';
const sourceUrl = `https://eth.blockscout.com/api/v2/smart-contracts/${address}`;
const rpcUrl = process.env.AQUAQOS_FORK_RPC ?? 'https://eth.drpc.org';
const rpc = async (method, params) => {
  const response = await fetch(rpcUrl, { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }), signal: AbortSignal.timeout(30000) });
  assert.equal(response.ok, true, `upstream HTTP ${response.status}`);
  const value = await response.json();
  assert.equal(value.error, undefined, `upstream ${method} failed`);
  return value.result;
};
const capture = process.argv.includes('--capture');
const blockNumber = 25948160; // Ethereum 0x18bf000; deliberately fixed, never "latest".
let record;
if (capture) {
  const response = await fetch(sourceUrl, { signal: AbortSignal.timeout(30000) });
  assert.ok(response.ok);
  const verified = await response.json();
  assert.equal(verified.name, 'AquaRouter');
  assert.equal(verified.compiler_version, 'v0.8.30+commit.73712a01');
  const sources = Object.fromEntries([
    { file_path: verified.file_path, source_code: verified.source_code }, ...verified.additional_sources,
  ].map(s => [s.file_path, { content: s.source_code }]));
  record = { sourceUrl, compiler: verified.compiler_version, contract: 'src/AquaRouter.sol:AquaRouter',
    input: { language: 'Solidity', sources, settings: verified.compiler_settings } };
} else record = JSON.parse(readFileSync(`${directory}/upstream-aqua.json`, 'utf8'));

// Pinned Hardhat 3.8.0's existing compiler adapter avoids adding a second compiler dependency.
const compilerModule = new URL('./internal/builtin-plugins/solidity/build-system/compiler/index.js', import.meta.resolve('hardhat'));
const { getCompiler } = await import(compilerModule.href);
const compiler = await getCompiler('0.8.30', { preferWasm: false });
const output = await compiler.compile(record.input);
assert.deepEqual((output.errors ?? []).filter(e => e.severity === 'error'), []);
const expected = `0x${output.contracts['src/AquaRouter.sol'].AquaRouter.evm.deployedBytecode.object}`;
const blockTag = `0x${blockNumber.toString(16)}`;
assert.equal(await rpc('eth_chainId', []), '0x1');
const block = await rpc('eth_getBlockByNumber', [blockTag, false]);
assert.equal(block.number, blockTag);
const actual = await rpc('eth_getCode', [address, blockTag]);
assert.equal(actual, expected, 'complete deployed Aqua runtime must match recompiled verified source, including metadata');
const sourceHash = createHash('sha256').update(JSON.stringify(record.input)).digest('hex');
if (capture) {
  mkdirSync(directory, { recursive: true });
  writeFileSync(`${directory}/upstream-aqua.json`, JSON.stringify(record, null, 2) + '\n');
  writeFileSync(`${directory}/pin.json`, JSON.stringify({ kind: 'ethereum-local-fork-pin-v1',
    upstreamChainId: 1, localChainId: 31337, blockNumber, blockHash: block.hash, timestamp: block.timestamp,
    aqua: { address, runtimeHash: keccak256(actual), runtimeBytes: (actual.length - 2) / 2, sourceHash, sourceUrl },
    tokens: [
      { symbol: 'DAI', address: '0x6b175474e89094c44da98b954eedeac495271d0f', decimals: 18 },
      { symbol: 'WETH', address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', decimals: 18 },
    ],
    daiFundingAccount: '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11',
  }, null, 2) + '\n');
} else {
  const pin = JSON.parse(readFileSync(`${directory}/pin.json`, 'utf8'));
  assert.equal(block.hash, pin.blockHash);
  assert.equal(keccak256(actual), pin.aqua.runtimeHash);
  assert.equal(sourceHash, pin.aqua.sourceHash);
}
console.log(`Authenticated Ethereum Aqua at block ${blockNumber}: ${keccak256(actual)} (${(actual.length - 2) / 2} bytes).`);
