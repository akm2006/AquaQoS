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
const provider = new JsonRpcProvider(process.env.SEPOLIA_RPC_URL ?? config.rpcUrl, config.chainId, { staticNetwork: true });
assert.equal((await provider.getNetwork()).chainId, BigInt(config.chainId));
assert.equal(keccak256(await provider.getCode(config.aqua.address)), config.aqua.runtimeHash);
for (const deployed of report.deployments) {
  assert.equal(keccak256(await provider.getCode(deployed.address)), deployed.runtimeHash);
  const receipt = await provider.getTransactionReceipt(deployed.transactionHash);
  assert.ok(receipt && receipt.status === 1 && receipt.contractAddress.toLowerCase() === deployed.address.toLowerCase());
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
console.log('Sepolia evidence passed: source identity, deployed code, receipts, transfers and final state.');
