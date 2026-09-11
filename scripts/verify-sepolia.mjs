import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { artifacts } from 'hardhat';

const path = 'deployments/sepolia/report.json';
const report = JSON.parse(readFileSync(path, 'utf8'));
assert.equal(report.complete, true, 'deployment report is incomplete');
report.verification = [];
for (const deployed of report.deployments) {
  const artifact = await artifacts.readArtifact(deployed.name);
  const build = JSON.parse(readFileSync(await artifacts.getBuildInfoPath(artifact.buildInfoId), 'utf8'));
  assert.equal(build.solcLongVersion, deployed.compiler);
  const contractIdentifier = `${build.userSourceNameMap[artifact.sourceName]}:${artifact.contractName}`;
  assert.ok(build.input.sources[build.userSourceNameMap[artifact.sourceName]], `${contractIdentifier}: source missing`);
  const response = await fetch(`https://sourcify.dev/server/v2/verify/${report.chainId}/${deployed.address}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({
      stdJsonInput: build.input, compilerVersion: build.solcLongVersion,
      contractIdentifier, creationTransactionHash: deployed.transactionHash,
    }), signal: AbortSignal.timeout(30000),
  });
  const submitted = await response.json();
  if (response.status === 409 && submitted.customCode === 'already_verified') {
    report.verification.push({ name: deployed.name, address: deployed.address, status: 'already_verified', response: submitted });
    continue;
  }
  assert.equal(response.status, 202, `${deployed.name}: ${JSON.stringify(submitted)}`);
  let result;
  for (let attempt = 0; attempt < 30; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const status = await fetch(`https://sourcify.dev/server/v2/verify/${submitted.verificationId}`,
      { signal: AbortSignal.timeout(30000) });
    assert.equal(status.ok, true);
    result = await status.json();
    if (result.isJobCompleted) break;
  }
  assert.equal(result?.isJobCompleted, true, `${deployed.name}: verification timed out`);
  assert.equal(result.error, undefined, `${deployed.name}: ${JSON.stringify(result.error)}`);
  assert.ok(['match', 'exact_match'].includes(result.contract.runtimeMatch));
  assert.ok(['match', 'exact_match'].includes(result.contract.creationMatch));
  report.verification.push({ name: deployed.name, address: deployed.address, status: result.contract.match,
    verificationId: submitted.verificationId, result });
  console.log(`${deployed.name} ${deployed.address}: ${result.contract.match}`);
}
writeFileSync(path, JSON.stringify(report, null, 2) + '\n');
console.log('Sourcify source verification complete.');
