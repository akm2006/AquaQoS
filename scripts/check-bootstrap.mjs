// Run from the repository root: node scripts/check-bootstrap.mjs
// This checks operating artifacts, not protocol correctness or Codex runtime activation.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const pins = JSON.parse(readFileSync('sources.lock.json', 'utf8'));
for (const key of ['aqua', 'swapVm', 'template', 'aquaSdk']) {
  assert.match(pins[key].commit, /^[a-f0-9]{40}$/);
  assert.match(pins[key].repository, /^https:\/\/github.com\/1inch\//);
}
const docs = ['AGENTS.md', 'README.md'];
function markdownFiles(root) {
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = `${root}/${entry.name}`;
    if (entry.isDirectory()) files.push(...markdownFiles(path));
    else if (entry.name.endsWith('.md')) files.push(path);
  }
  return files;
}
docs.push(...markdownFiles('docs'));
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
console.log('Bootstrap checks passed: source identities, local links and skill files.');
