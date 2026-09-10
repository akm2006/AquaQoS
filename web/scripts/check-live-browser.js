async function verifyLive(page) {
  const assert = (condition, message) => { if (!condition) throw Error(message); };
  const origin = await page.evaluate(() => location.origin);
  const errors = [], badResponses = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) badResponses.push(`${r.status()} ${r.url()}`); });
  await page.goto(origin + '/live/');
  const button = name => page.getByRole('button', { name, exact: true });
  async function execute(name) {
    const response = page.waitForResponse(r => r.url().endsWith('/api/action') && r.request().method() === 'POST');
    await button(name).click();
    const result = await response;
    assert(result.status() === 200, await result.text());
    const data = await result.json();
    await button('Refresh state').waitFor({ state: 'visible' });
    await page.waitForFunction(() => !Array.from(document.querySelectorAll('button')).find(b => b.textContent === 'Refresh state')?.disabled);
    return data.state;
  }
  await button(/^Create (maker|fresh) group$/).waitFor();
  let state = await execute(/^Create (maker|fresh) group$/);
  assert(state.tokens[1].remaining === '5000', 'initial guarantee');
  for (let i = 0; i < 2; i++) {
    await execute('Check quote'); state = await execute('Execute trade');
    assert(state.history.at(-1).receipt.status === '0x1', 'real fill receipt');
  }
  assert((await page.getByRole('region', { name: 'Live Token 1', exact: true }).innerText()).includes('4,000'), 'render real remaining balance');
  await execute('Check quote'); state = await execute('Execute rejection test');
  assert(state.history.at(-1).error.name === 'InsufficientCapacity', 'capacity failure');
  assert((await page.locator('.live-receipt').first().innerText()).includes('InsufficientCapacity'), 'error displayed');
  await page.getByRole('combobox', { name: 'Trading strategy', exact: true }).selectOption('1');
  await page.getByLabel('Requested units', { exact: true }).fill('2500');
  await execute('Check quote'); state = await execute('Execute trade');
  assert(state.tokens[1].balance === '1500', 'sibling protected fill');
  state = await execute('Replenish strategy');
  assert(state.tokens[1].remaining === '2500', 'replenished capacity');
  assert((await page.locator('.live-receipt').first().locator('.transfer-list li').count()) === 1, 'push transfer displayed');
  const downloadEvent = page.waitForEvent('download'); await button('Export session ↓').click();
  const download = await downloadEvent; assert(download.suggestedFilename().startsWith('aquaqos-live-'), 'export evidence');
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `no live page overflow ${width}`);
    await page.screenshot({ path: `output/playwright/live-${width}.png`, fullPage: true });
  }
  state = await execute('Pause group'); assert(state.paused, 'pause');
  await page.getByLabel('Token 0 guarantee', { exact: true }).fill('1000');
  await page.getByLabel('Token 1 guarantee', { exact: true }).fill('1000');
  await execute('Update strategy 2 guarantees'); state = await execute('Activate group');
  assert(!state.paused, 'reactivate');
  await execute('Pause group');
  await page.getByText('Close strategies & withdraw test inventory', { exact: true }).click();
  await execute('Dock all strategies'); state = await execute('Withdraw Token 1');
  assert(state.tokens[1].balance === '0', 'owner withdrawal confirmed');
  assert(errors.length === 0, errors.join('; '));
  assert(badResponses.length === 0, badResponses.join('; '));
  return 'Live browser passed setup, actual fills/rejection/sibling/replenishment, export, maker lifecycle/exit and 1440/390/320px layouts without console exceptions or HTTP errors.';
}
