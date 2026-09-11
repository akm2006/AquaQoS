import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { artifacts } from 'hardhat';
import { AbiCoder, Contract, ContractFactory, Interface, JsonRpcProvider, MaxUint256, Wallet,
  id, keccak256 } from 'ethers';

const config = JSON.parse(readFileSync('deployments/sepolia/config.json', 'utf8'));
const output = 'deployments/sepolia/report.json';
assert.equal(existsSync(output), false, `${output} already exists; deployment is intentionally single-use`);
const parseEnv = path => Object.fromEntries(readFileSync(path, 'utf8').split(/\r?\n/).flatMap(line => {
  const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
  if (!match || match[1].startsWith('#')) return [];
  return [[match[1], match[2].replace(/^(['"])(.*)\1$/, '$2')]];
}));
const env = { ...parseEnv('.env.sepolia'), ...process.env };
assert.match(env.PRIVATE_KEY ?? '', /^(0x)?[0-9a-fA-F]{64}$/, 'PRIVATE_KEY is missing or malformed');
const provider = new JsonRpcProvider(env.SEPOLIA_RPC_URL ?? config.rpcUrl, config.chainId, { staticNetwork: true });
const signer = new Wallet(env.PRIVATE_KEY, provider);
assert.equal(signer.address.toLowerCase(), config.owner.toLowerCase(), 'private key does not match configured public owner');
const network = await provider.getNetwork();
assert.equal(network.chainId, BigInt(config.chainId));
const aquaCode = await provider.getCode(config.aqua.address);
assert.equal(keccak256(aquaCode), config.aqua.runtimeHash, 'Sepolia Aqua runtime differs from authenticated pin');
const balanceBefore = await provider.getBalance(signer.address);
assert.ok(balanceBefore > 0n, 'deployer has no Sepolia ETH');
if (process.env.AQUAQOS_PREFLIGHT === '1') {
  let deploymentGas = 0n;
  for (const [name, args] of [['AquaQoSRouter', [config.aqua.address, signer.address]],
    ['TokenMock', [config.tokenA.name, config.tokenA.symbol]],
    ['TokenMock', [config.tokenB.name, config.tokenB.symbol]]]) {
    const artifact = await artifacts.readArtifact(name);
    const request = await new ContractFactory(artifact.abi, artifact.bytecode, signer).getDeployTransaction(...args);
    deploymentGas += await provider.estimateGas({ ...request, from: signer.address });
  }
  const fees = await provider.getFeeData();
  const upperCost = deploymentGas * (fees.maxFeePerGas ?? fees.gasPrice);
  assert.ok(balanceBefore > upperCost, 'balance cannot cover even the first three deployments');
  console.log(`Sepolia preflight passed for ${signer.address}: Aqua authenticated; balance ${balanceBefore} wei; first-three deployment estimate ${deploymentGas} gas.`);
  provider.destroy();
  process.exit(0);
}
const sha = data => createHash('sha256').update(data).digest('hex');
const git = (...args) => execFileSync('git', ['-c', `safe.directory=${process.cwd().replaceAll('\\', '/')}`, ...args], { encoding: 'utf8' }).trim();
const report = { kind: 'aquaqos-sepolia-deployment-v1', chainId: config.chainId, network: config.network,
  explorerUrl: config.explorerUrl, sourceCommit: git('rev-parse', 'HEAD'),
  dirty: git('status', '--porcelain', '--', 'contracts', 'scripts', 'hardhat.config.ts',
    'package.json', 'pnpm-lock.yaml', 'sources.lock.json', 'deployments/sepolia/config.json') !== '',
  owner: signer.address, balanceBefore, aqua: { ...config.aqua }, config,
  sourceHashes: Object.fromEntries(['contracts/AquaQoSRouter.sol', 'contracts/AquaQoSVault.sol',
    'scripts/deploy-sepolia.mjs', 'hardhat.config.ts', 'pnpm-lock.yaml', 'sources.lock.json',
    'deployments/sepolia/config.json'].map(p => [p, sha(readFileSync(p))])),
  deployments: [], transactions: [], actions: [], limitations: [
    'Ethereum Sepolia test assets have no monetary value.',
    'Demo TokenMock contracts are owner-mintable and are not production assets.',
    'The deployer is also the taker; the protected maker is the restricted vault.',
    'This bounded two-strategy proof does not establish external-audit or production readiness.',
  ] };
const stringify = value => JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2) + '\n';
const save = () => { mkdirSync('deployments/sepolia', { recursive: true }); writeFileSync(output, stringify(report)); };
const receiptJson = receipt => receipt.toJSON();
async function retain(name, response, success = true) {
  console.log(`${name}: submitted ${response.hash}`);
  let receipt;
  try { receipt = await response.wait(1, 180000); }
  catch (error) {
    receipt = error.receipt;
    if (success || !receipt) throw error;
  }
  assert.ok(receipt, `${name}: missing receipt`);
  assert.equal(receipt.status, success ? 1 : 0, name);
  const block = await provider.getBlock(receipt.blockNumber);
  assert.ok(block && block.hash === receipt.blockHash);
  const item = { name, hash: response.hash, explorer: `${config.explorerUrl}/tx/${response.hash}`,
    receipt: receiptJson(receipt), block: { number: block.number, hash: block.hash, timestamp: block.timestamp } };
  report.transactions.push(item); save();
  return { receipt, item };
}
async function deploy(name, args = []) {
  const artifact = await artifacts.readArtifact(name);
  const factory = new ContractFactory(artifact.abi, artifact.bytecode, signer);
  const request = await factory.getDeployTransaction(...args);
  request.gasLimit = await provider.estimateGas({ ...request, from: signer.address });
  const response = await signer.sendTransaction(request);
  const { receipt, item } = await retain(`deploy ${name}`, response);
  assert.ok(receipt.contractAddress);
  const runtime = await provider.getCode(receipt.contractAddress);
  assert.notEqual(runtime, '0x');
  const build = JSON.parse(readFileSync(await artifacts.getBuildInfoPath(artifact.buildInfoId), 'utf8'));
  const deployed = { name, address: receipt.contractAddress, constructorArgs: args,
    transactionHash: response.hash, explorer: `${config.explorerUrl}/address/${receipt.contractAddress}`,
    artifactBytecodeHash: keccak256(artifact.bytecode), initcodeHash: keccak256(request.data),
    runtimeHash: keccak256(runtime), runtimeBytes: (runtime.length - 2) / 2,
    runtime, buildInfoId: artifact.buildInfoId, compiler: build.solcLongVersion,
    compilerInputHash: sha(JSON.stringify(build.input)), receipt: item.receipt };
  report.deployments.push(deployed); save();
  return new Contract(deployed.address, artifact.abi, signer);
}
async function write(name, contract, method, args = [], success = true) {
  const data = contract.interface.encodeFunctionData(method, args);
  let gasLimit;
  if (success) gasLimit = await provider.estimateGas({ from: signer.address, to: await contract.getAddress(), data });
  else gasLimit = 1_500_000n;
  const response = await signer.sendTransaction({ to: await contract.getAddress(), data, gasLimit });
  return retain(name, response, success);
}
const aquaAbi = (await artifacts.readArtifact('Aqua')).abi;
const aqua = new Contract(config.aqua.address, aquaAbi, signer);
const router = await deploy('AquaQoSRouter', [config.aqua.address, signer.address]);
const first = await deploy('TokenMock', [config.tokenA.name, config.tokenA.symbol]);
const second = await deploy('TokenMock', [config.tokenB.name, config.tokenB.symbol]);
const tokens = [first, second].sort((a, b) => a.target.toLowerCase().localeCompare(b.target.toLowerCase()));
const vault = await deploy('AquaQoSVault', [config.aqua.address, router.target, tokens[0].target, tokens[1].target, signer.address]);
report.addresses = { aqua: config.aqua.address, router: router.target, vault: vault.target,
  tokens: tokens.map(t => t.target) }; save();
const backing = BigInt(config.backing), guarantee = BigInt(config.guarantee);
for (const token of tokens) {
  await write(`mint ${await token.symbol()} to vault`, token, 'mint', [vault.target, backing]);
  await write(`mint ${await token.symbol()} to taker`, token, 'mint', [signer.address, 10n * backing]);
  await write(`approve router for ${await token.symbol()}`, token, 'approve', [router.target, MaxUint256]);
  await write(`approve Aqua for ${await token.symbol()}`, token, 'approve', [config.aqua.address, MaxUint256]);
}
for (const salt of [1n, 2n]) await write(`create strategy ${salt}`, vault, 'createStrategy', [salt, backing, backing, guarantee, guarantee]);
await write('activate protected group', vault, 'activate');
const orders = [], hashes = [];
for (const salt of [1n, 2n]) {
  const o = await vault.order(salt), order = [o.maker, o.traits, o.data];
  orders.push(order); hashes.push(await router.hash(order));
}
report.orders = orders; report.hashes = hashes; save();
const traits = direction => '0x' + '00'.repeat(20) + (direction ? '00e0' : '0060');
async function state() {
  const result = [];
  for (const token of tokens) {
    const virtual = [], remaining = [];
    for (const hash of hashes) {
      const [amount, marker] = await aqua.rawBalances(vault.target, router.target, hash, token.target);
      assert.equal(marker, 2n); virtual.push(amount);
      const s = await vault.strategies(hash);
      const index = token.target === tokens[0].target ? 0 : 1;
      const available = amount > s[index + 2] ? amount - s[index + 2] : 0n;
      remaining.push(available < s[index] ? available : s[index]);
    }
    result.push({ token: token.target, vaultBalance: await token.balanceOf(vault.target),
      takerBalance: await token.balanceOf(signer.address), vaultAllowance: await token.allowance(vault.target, config.aqua.address),
      virtual, remaining });
  }
  return result;
}
const unit = 10n ** 18n;
async function swap(name, strategy, amount, success, direction = true) {
  const before = await state(), debit = BigInt(amount) * unit;
  let quote;
  try { const q = await router.quote.staticCall(orders[strategy], debit, traits(direction)); quote = { input: q[0], output: q[1] }; }
  catch (error) {
    assert.equal(success, false);
    const data = error.data ?? error.info?.error?.data ?? null;
    assert.equal(String(data).slice(0, 10), id('InsufficientCapacity(uint256,uint256)').slice(0, 10));
    quote = { rejected: true, data };
  }
  const { receipt, item } = await write(name, router, 'swap', [orders[strategy], debit, traits(direction)], success);
  const after = await state();
  if (!success) assert.deepEqual(after, before, `${name}: rollback`);
  const action = { name, strategy, amount: debit, direction, quote, before, after,
    transactionHash: item.hash, explorer: item.explorer, receipt: item.receipt };
  report.actions.push(action); save(); return receipt;
}
await swap('reject 600 to protect sibling', 0, 600, false);
await swap('first protected 500', 0, 500, true);
await swap('reject sibling 501', 1, 501, false);
await swap('sibling protected 500', 1, 500, true);
const beforePush = await state();
const push = await write('replenish first strategy', aqua, 'push', [vault.target, router.target, hashes[0], tokens[1].target, guarantee]);
const afterPush = await state();
assert.equal(afterPush[1].vaultBalance - beforePush[1].vaultBalance, guarantee);
report.push = { before: beforePush, after: afterPush, transactionHash: push.item.hash, explorer: push.item.explorer }; save();
await swap('restored protected 500', 0, 500, true);
await swap('reverse replenishment 100', 0, 100, true, false);
report.final = await state();
report.balanceAfter = await provider.getBalance(signer.address);
report.totalGasCost = balanceBefore - report.balanceAfter;
report.complete = true; save();
console.log(`Sepolia proof complete: ${output}`);
provider.destroy();
