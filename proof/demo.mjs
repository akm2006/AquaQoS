const $ = id => document.getElementById(id);
const state = { report: null, policy: 'C100', workload: 'concentratedOverload', index: -1, run: null, actions: [] };
const fmt = value => typeof value === 'bigint' ? value.toString() : String(value ?? '—');
const safe = value => { const node = document.createElement('span'); node.textContent = fmt(value); return node; };
const text = (node, value) => { node.replaceChildren(safe(value)); };
const esc = value => fmt(value).replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const statusName = outcome => ({ success: 'successful fill', guard_rejection: 'capacity guard rejection', settlement_failure: 'raw settlement failure', quote_rejection: 'quote rejection' }[outcome] ?? outcome);
const actionList = scenario => [...(scenario?.attempts ?? []), ...(scenario?.actions ?? [])].sort((a, b) => a.actionIndex - b.actionIndex);
function validate(report) {
  if (report?.kind !== 'local-a-b-c-benchmark-v2' || !Array.isArray(report.runs) || !report.runs.length) throw new Error('retained benchmark schema is not recognised');
  if (!report.runs.some(run => run.count === 2 && run.system === 'B')) throw new Error('two-strategy raw baseline is missing');
}
function runFor() {
  state.run = state.report.runs.find(run => run.count === 2 && run.system === state.policy);
  const scenario = state.run?.scenarios.find(item => item.name === state.workload);
  state.actions = actionList(scenario);
  state.index = -1;
}
function cell(value) { const td = document.createElement('td'); td.textContent = fmt(value); return td; }
function table(headers, rows) {
  const table = document.createElement('table'); const thead = document.createElement('thead'); const tr = document.createElement('tr');
  headers.forEach(header => { const th = document.createElement('th'); th.textContent = header; tr.append(th); }); thead.append(tr); table.append(thead);
  const tbody = document.createElement('tbody'); rows.forEach(row => { const tr = document.createElement('tr'); row.forEach(value => tr.append(cell(value))); tbody.append(tr); }); table.append(tbody); return table;
}
function currentState() { if (state.index < 0) return state.run.scenarios.find(item => item.name === state.workload).initialState; return state.actions[state.index].after; }
function transfers(action) {
  const topic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
  return (action?.receipt?.logs ?? []).filter(log => log.topics?.[0]?.toLowerCase() === topic).map(log => ({ token: log.address, from: `0x${log.topics[1].slice(-40)}`, to: `0x${log.topics[2].slice(-40)}`, amount: BigInt(log.data).toString() }));
}
function render() {
  const scenario = state.run.scenarios.find(item => item.name === state.workload); const action = state.index < 0 ? null : state.actions[state.index]; const after = currentState();
  text($('step'), state.index < 0 ? 'Initial state' : `Step ${state.index + 1} of ${state.actions.length}`); text($('summary'), state.index < 0 ? `Two strategies · ${state.run.system} policy · source ${state.report.sourceCommit}` : `${statusName(action.outcome)} · strategy ${action.strategy} · ${action.aToB ? 'Token 0 → Token 1' : 'Token 1 → Token 0'} · offered output ${action.amount}`);
  $('transaction').replaceChildren(action ? table(['Field', 'Value'], [['outcome', statusName(action.outcome)], ['gas used', action.gasUsed], ['receipt status', action.status], ['transaction hash', action.receipt?.transactionHash], ['error', action.quoteError?.name ?? action.trace?.name ?? action.failure?.name ?? 'none'], ['error args', action.quoteError?.args?.join(', ') ?? action.trace?.args?.join(', ') ?? action.failure?.args?.join(', ') ?? '—']]) : document.createTextNode('Choose Next to inspect the first retained receipt.'));
  const tokenRows = after.tokens.map((token, index) => [`Token ${index}`, token.balance, token.allowance, token.takerBalance]); $('balances').replaceChildren(table(['Token', 'Maker balance', 'Maker allowance', 'Taker balance'], tokenRows));
  const virtualRows = after.tokens.flatMap((token, index) => token.virtual.map((value, strategy) => [`Token ${index}`, strategy, value])); $('virtual').replaceChildren(table(['Token', 'Strategy', 'Virtual balance'], virtualRows));
  const transferRows = transfers(action); $('transfers').replaceChildren(transferRows.length ? table(['Token address', 'From', 'To', 'Amount'], transferRows.map(row => [row.token, row.from, row.to, row.amount])) : document.createTextNode(action ? 'No ERC-20 Transfer logs: the recorded transaction reverted or was a quote rejection.' : 'No transaction selected.'));
  $('receipt').textContent = action ? JSON.stringify(action.receipt, null, 2) : JSON.stringify(scenario.initialState, null, 2);
  $('previous').disabled = state.index < 0; $('next').disabled = state.index >= state.actions.length - 1;
}
async function main() {
  try { const response = await fetch('../benchmarks/raw/a-b-c-v1.json'); if (!response.ok) throw new Error(`report request failed (${response.status})`); state.report = await response.json(); validate(state.report); runFor(); $('replay').hidden = false; text($('load-status'), `Loaded ${state.report.kind}; retained source ${state.report.sourceCommit}.`); render(); } catch (error) { text($('load-status'), 'Replay unavailable.'); text($('error'), error.message); }
}
$('policy').addEventListener('change', event => { state.policy = event.target.value; runFor(); render(); });
$('workload').addEventListener('change', event => { state.workload = event.target.value; runFor(); render(); });
$('reset').addEventListener('click', () => { state.index = -1; render(); });
$('previous').addEventListener('click', () => { state.index -= 1; render(); });
$('next').addEventListener('click', () => { state.index += 1; render(); });
main();
