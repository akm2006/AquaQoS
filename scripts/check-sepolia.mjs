import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { Interface, JsonRpcProvider, id, keccak256 } from 'ethers';

const report = JSON.parse(readFileSync('deployments/sepolia/report.json', 'utf8'));
const config = JSON.parse(readFileSync('deployments/sepolia/config.json', 'utf8'));
assert.equal(report.complete, true);
assert.equal(report.dirty, false);
assert.equal(report.chainId, 11155111);
assert.equal(report.owner.toLowerCase(), config.owner.toLowerCase());
assert.equal(report.aqua.runtimeHash, config.aqua.runtimeHash);
const sha = data => createHash('sha256').update(data).digest('hex');
const git = (...args) => execFileSync('git', ['-c', `safe.directory=${process.cwd().replaceAll('\\', '/')}`, ...args]);
for (const [path, hash] of Object.entries(report.sourceHashes))
  assert.equal(sha(git('show', `${report.sourceCommit}:${path}`)), hash, `source identity ${path}`);
assert.deepEqual(report.deployments.map(d => d.name), ['AquaQoSRouter', 'TokenMock', 'TokenMock', 'AquaQoSVault']);
assert.equal(report.actions.length, 6);
assert.deepEqual(report.actions.map(a => Number(a.receipt.status)), [0, 1, 0, 1, 1, 1]);
assert.equal(report.verification?.length, 4);
for (const value of report.verification)
  assert.ok(value.status === 'already_verified' || value.status === 'match' || value.status === 'exact_match');
const rpcUrls = process.env.SEPOLIA_RPC_URL
  ? [process.env.SEPOLIA_RPC_URL, config.rpcUrl, 'https://sepolia.gateway.tenderly.co']
  : [config.rpcUrl, 'https://sepolia.gateway.tenderly.co'];
let provider;
for (const rpcUrl of [...new Set(rpcUrls)]) {
  const candidate = new JsonRpcProvider(rpcUrl, config.chainId, { staticNetwork: true });
  try {
    assert.equal((await candidate.getNetwork()).chainId, BigInt(config.chainId));
    if (await candidate.getTransactionReceipt(report.deployments[0].transactionHash)) {
      provider = candidate;
      break;
    }
  } catch {
    // Try the next public endpoint. Historical receipt retention varies by provider.
  }
  candidate.destroy();
}
assert.ok(provider, 'No configured Sepolia RPC returned the deployment receipt; set SEPOLIA_RPC_URL to an archival endpoint.');
assert.equal((await provider.getNetwork()).chainId, BigInt(config.chainId));
assert.equal(keccak256(await provider.getCode(config.aqua.address)), config.aqua.runtimeHash);
for (const deployed of report.deployments) {
  assert.equal(keccak256(await provider.getCode(deployed.address)), deployed.runtimeHash);
  const receipt = await provider.getTransactionReceipt(deployed.transactionHash);
  assert.ok(receipt && receipt.status === 1 && receipt.contractAddress.toLowerCase() === deployed.address.toLowerCase());
  const verified = await fetch(`https://sourcify.dev/server/v2/contract/${config.chainId}/${deployed.address}`,
    { signal: AbortSignal.timeout(30000) });
  assert.equal(verified.ok, true, `${deployed.name}: Sourcify lookup failed`);
  const match = await verified.json();
  assert.equal(match.creationMatch, 'exact_match');
  assert.equal(match.runtimeMatch, 'exact_match');
}
const transfer = new Interface(['event Transfer(address indexed from,address indexed to,uint256 value)']);
for (const action of report.actions) {
  const receipt = await provider.getTransactionReceipt(action.transactionHash);
  assert.ok(receipt);
  assert.equal(receipt.status, Number(action.receipt.status));
  assert.equal(receipt.blockHash, action.receipt.blockHash);
  const events = receipt.logs.filter(log => log.topics[0] === id('Transfer(address,address,uint256)'));
  if (receipt.status === 0) {
    assert.deepEqual(action.after, action.before);
    assert.equal(events.length, 0);
  } else {
    assert.equal(events.length, 3);
    for (const event of events) assert.ok(transfer.parseLog(event));
  }
}
for (const token of report.final) {
  const abi = new Interface(['function balanceOf(address) view returns(uint256)',
    'function allowance(address,address) view returns(uint256)']);
  const balance = abi.decodeFunctionResult('balanceOf', await provider.call({ to: token.token,
    data: abi.encodeFunctionData('balanceOf', [report.addresses.vault]) }))[0];
  const allowance = abi.decodeFunctionResult('allowance', await provider.call({ to: token.token,
    data: abi.encodeFunctionData('allowance', [report.addresses.vault, report.addresses.aqua]) }))[0];
  assert.equal(balance.toString(), token.vaultBalance);
  assert.equal(allowance.toString(), token.vaultAllowance);
}
provider.destroy();
console.log('Sepolia evidence passed: source identity, Sourcify matches, deployed code, receipts, transfers and final state.');
