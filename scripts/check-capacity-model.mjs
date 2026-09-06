// Specification check only: this does not execute Aqua or prove the contracts.
import assert from 'node:assert/strict';

const remaining = (virtual, baseline, guarantee) =>
  Math.min(guarantee, Math.max(virtual - baseline, 0));

function admits(inventory, virtual, baseline, guarantee, reserved, strategy, debit) {
  if (debit > virtual[strategy]) return false;
  let required = debit;
  for (let i = 0; i < virtual.length; i++) {
    required += reserved[i] + remaining(
      virtual[i] - reserved[i] - (i === strategy ? debit : 0), baseline[i], guarantee[i],
    );
  }
  return inventory >= required;
}

// Fully allocated backing must still let a strategy consume its own entitlement.
assert(admits(1000, [1000, 1000], [500, 500], [500, 500], [0, 0], 0, 1));
assert(admits(1000, [1000, 1000], [500, 500], [500, 500], [0, 0], 0, 500));
assert(!admits(1000, [1000, 1000], [500, 500], [500, 500], [0, 0], 0, 501));
assert(admits(1200, [1000, 1000], [500, 500], [500, 500], [0, 0], 0, 700));
assert.equal(remaining(600, 500, 500), 100);
assert.equal(remaining(850, 500, 500), 350); // replenish 250
assert.equal(remaining(1500, 500, 500), 500); // capped

// Enumerate bounded two-strategy states. Reservations may contain both unsettled
// pulls and already-settled pulls retained until the transaction ends. Only the
// unsettled portion will consume inventory again. The inequality must protect
// actual entitlements after all pending pulls, including a newly admitted fill.
let admitted = 0;
for (let v0 = 0; v0 <= 5; v0++)
for (let v1 = 0; v1 <= 5; v1++)
for (let b0 = 0; b0 <= 2; b0++)
for (let b1 = 0; b1 <= 2; b1++)
for (let g0 = 0; g0 <= 3; g0++)
for (let g1 = 0; g1 <= 3; g1++)
for (let r0 = 0; r0 <= 2; r0++)
for (let r1 = 0; r1 <= 2; r1++)
for (let debit = 1; debit <= v0; debit++) {
  const v = [v0, v1], b = [b0, b1], g = [g0, g1], r = [r0, r1];
  // Evaluate exactly at the admission boundary: larger backing only helps.
  const inventory = r0 + r1 + debit
    + remaining(v0 - r0 - debit, b0, g0) + remaining(v1 - r1, b1, g1);
  assert(admits(inventory, v, b, g, r, 0, debit));
  assert(!admits(inventory - 1, v, b, g, r, 0, debit));
  for (let pending0 = 0; pending0 <= Math.min(r0, v0 - debit); pending0++)
  for (let pending1 = 0; pending1 <= Math.min(r1, v1); pending1++) {
    const after = inventory - debit - pending0 - pending1;
    const obligations = remaining(v0 - debit - pending0, b0, g0)
      + remaining(v1 - pending1, b1, g1);
    assert(after >= obligations, JSON.stringify({ v, b, g, r, debit, pending0, pending1 }));
    admitted++;
  }
}
console.log(`Capacity model passed: ${admitted} settlement cases plus consumption/burst/replenishment boundaries.`);
