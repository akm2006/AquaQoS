// Run from the repository root: node scripts/check-bootstrap.mjs
// This checks operating artifacts, not protocol correctness or Codex runtime activation.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';

const brief = 'AquaQoS_ETHOnline_2026_Winning_Package.md';
assert.equal(createHash('sha256').update(readFileSync(brief)).digest('hex'),
  'afe4a87cc791e00b1ed926337f1f7413202beb3c7f4d0834941723473d4a66ee');
const pins = JSON.parse(readFileSync('sources.lock.json', 'utf8'));
for (const key of ['aqua', 'swapVm', 'template', 'aquaSdk']) {
  assert.match(pins[key].commit, /^[a-f0-9]{40}$/);
  assert.match(pins[key].repository, /^https:\/\/github.com\/1inch\//);
}
const docs = ['AGENTS.md', 'README.md', ...readdirSync('docs').filter(x => x.endsWith('.md')).map(x => `docs/${x}`)];
for (const file of docs) {
  for (const [, link] of readFileSync(file, 'utf8').matchAll(/\]\(([^)]+)\)/g)) {
    if (/^[a-z]+:/i.test(link) || link.startsWith('#')) continue;
    assert.ok(existsSync(resolve(dirname(file), link.split('#')[0])), `${file}: broken link ${link}`);
  }
}
for (const skill of ['aquaqos-protocol', 'aquaqos-validation', 'aquaqos-submission']) {
  const text = readFileSync(`.agents/skills/${skill}/SKILL.md`, 'utf8');
  assert.ok(text.startsWith(`---\nname: ${skill}\n`));
  assert.ok(!text.includes('[TODO:'));
}
console.log('Bootstrap checks passed: preserved brief, source identities, local links and skill files.');
