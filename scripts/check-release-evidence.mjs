import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { AbiCoder, Interface, id, keccak256 } from 'ethers';

const sha = data => createHash('sha256').update(data).digest('hex');
const orderType = 'tuple(address maker,uint256 traits,bytes data)';
const swapAbi = new Interface([`function swap(${orderType} order,uint256 amount,bytes takerData)`]);
const tokenAbi = new Interface(['event Transfer(address indexed from,address indexed to,uint256 value)']);
const git = (...args) => execFileSync('git', ['-c', `safe.directory=${process.cwd().replaceAll('\\', '/')}`, ...args]);

function check(report, directory) {
  assert.equal(report.dirty, false, 'release evidence requires a committed runner');
  assert.match(report.sourceCommit, /^[a-f0-9]{40}$/);
  for (const [path, hash] of Object.entries(report.sourceHashes)) {
    assert.equal(sha(git('show', `${report.sourceCommit}:${path}`)), hash, `source identity ${path}`);
  }
  assert.equal(report.scenarios.length, 2);
  for (const [index, s] of report.scenarios.entries()) {
    assert.equal(s.label, index ? 'guarded' : 'raw');
    assert.equal(s.actions.length, index ? 6 : 2);
    if (report.fork) {
      assert.deepEqual(report.fork, JSON.parse(readFileSync(`${directory}/pin.json`)));
      assert.equal(s.upstreamAqua.runtimeHash, report.fork.aqua.runtimeHash);
      assert.equal(s.addresses.aqua, report.fork.aqua.address);
    }
    for (const d of s.deployments) {
      assert.equal(keccak256(d.runtime), d.runtimeHash);
      assert.equal(d.runtimeHash, d.expectedRuntimeHash);
      const transaction = s.transactions.find(t => t.receipt.transactionHash === d.receipt.transactionHash);
      assert.ok(transaction);
      assert.equal(transaction.receipt.contractAddress, d.address);
      assert.equal(keccak256(transaction.tx.data), d.initcodeHash);
      assert.equal(transaction.receipt.status, '0x1');
    }
    for (const action of s.actions) {
      const transaction = s.transactions.find(t => t.receipt.transactionHash === action.receipt.transactionHash);
      assert.ok(transaction);
      assert.deepEqual(transaction.receipt, action.receipt);
      assert.equal(transaction.tx.to, s.addresses.router);
      const decoded = swapAbi.decodeFunctionData('swap', transaction.tx.data);
      const order = decoded[0].toArray();
      assert.equal(keccak256(AbiCoder.defaultAbiCoder().encode([orderType], [order])), s.hashes[action.strategy]);
      assert.equal(decoded[1].toString(), action.amount);
      assert.equal(decoded[2], '0x' + '00'.repeat(20) + (action.direction ? '00e0' : '0060'));
      assert.match(action.trace.file, /^[a-z0-9-]+\.json\.gz$/);
      const bytes = readFileSync(`${directory}/${action.trace.file}`);
      assert.equal(sha(bytes), action.trace.sha256);
      const trace = JSON.parse(gunzipSync(bytes));
      assert.equal(trace.structLogs.length, action.trace.steps);
      assert.equal(trace.failed, action.trace.failed);
      assert.equal(trace.returnValue, action.trace.returnValue);
      assert.equal(action.receipt.status, trace.failed ? '0x0' : '0x1');
      const transfers = action.receipt.logs.filter(l => l.topics[0] === id('Transfer(address,address,uint256)'))
        .map(l => { assert.equal(l.transactionHash, action.receipt.transactionHash); const p = tokenAbi.parseLog(l);
          return { token: l.address.toLowerCase(), from: p.args.from.toLowerCase(), to: p.args.to.toLowerCase(), amount: p.args.value.toString() }; });
      assert.deepEqual(transfers, action.transfers);
      if (trace.failed) {
        assert.deepEqual(action.before, action.after);
        assert.deepEqual(action.receipt.logs, []);
        const data = trace.returnValue.startsWith('0x') ? trace.returnValue : '0x' + trace.returnValue;
        assert.equal(data.slice(0, 10), id(index ? 'InsufficientCapacity(uint256,uint256)' : 'SafeTransferFromFailed()').slice(0, 10));
      } else {
        const out = action.direction ? 1 : 0, input = 1 - out;
        const debit = BigInt(action.amount);
        const b = action.before, a = action.after;
        const vOut = BigInt(b[out].virtual[action.strategy]), vIn = BigInt(b[input].virtual[action.strategy]);
        const requiredInput = (debit * vIn + vOut - debit - 1n) / (vOut - debit);
        assert.equal(requiredInput.toString(), action.expectedInput);
        for (let who = 0; who < 2; who++) {
          const sign = who ? -1n : 1n;
          assert.equal(BigInt(b[out].accounts[who].balance) - BigInt(a[out].accounts[who].balance), sign * debit);
          assert.equal(BigInt(a[input].accounts[who].balance) - BigInt(b[input].accounts[who].balance), sign * requiredInput);
        }
        for (let j = 0; j < 2; j++) {
          assert.equal(BigInt(b[out].virtual[j]) - BigInt(a[out].virtual[j]), j === action.strategy ? debit : 0n);
          assert.equal(BigInt(a[input].virtual[j]) - BigInt(b[input].virtual[j]), j === action.strategy ? requiredInput : 0n);
        }
      }
    }
    if (index) assert.deepEqual(s.exit, { paused: true, vaultTokenBalances: ['0', '0'] });
  }
}

for (const directory of ['deployments/local-release', 'deployments/ethereum-fork']) {
  const report = JSON.parse(readFileSync(`${directory}/report.json`));
  check(report, directory);
  if (process.argv.includes('--self-test')) {
    const corruptions = [r => { r.dirty = true; }, r => { r.scenarios[0].actions.pop(); },
      r => { r.scenarios[0].actions[0].amount = '1'; },
      r => { r.scenarios[0].actions[1].after[0].accounts[0].balance = '1'; },
      r => { r.scenarios[1].deployments[0].runtime = '0x00'; },
      r => { r.scenarios[1].actions[0].trace.sha256 = '00'; },
      r => { r.scenarios[1].actions[1].expectedInput = '0'; }];
    for (const mutate of corruptions) { const bad = structuredClone(report); mutate(bad); assert.throws(() => check(bad, directory)); }
    console.log(`${directory}: valid evidence passed; ${corruptions.length} corrupted reports rejected.`);
  } else console.log(`${directory}: source, deployment, calldata, receipts, states and detailed traces checked.`);
}
