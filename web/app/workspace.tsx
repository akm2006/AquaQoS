"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  actionsFor,
  entitlements,
  num,
  outcome,
  policies,
  short,
  tone,
  validateReport,
  workloads,
  type Action,
  type Policy,
  type Report,
  type Run,
  type Scenario,
  type Snapshot,
} from "./evidence";

export default function Workspace() {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [count, setCount] = useState(2);
  const [workload, setWorkload] = useState("concentratedOverload");
  const [baseline, setBaseline] = useState<Policy>("B");
  const [policy, setPolicy] = useState<Policy>("C");
  const [step, setStep] = useState(0);
  const [token, setToken] = useState(1);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/evidence/report.json", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok)
          throw Error(`Evidence request failed (${response.status}).`);
        const data: unknown = await response.json();
        validateReport(data);
        setReport(data);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [retry]);
  if (!report)
    return (
      <section className="panel load-panel" aria-live="polite">
        <span className="eyebrow">RECORDED CONTRACT STATE</span>
        <h2>
          {error
            ? "Evidence could not be loaded"
            : "Opening the capacity workspace"}
        </h2>
        <p>
          {error ||
            "Loading checked transactions, token balances and strategy outcomes."}
        </p>
        {error ? (
          <button
            className="button primary"
            onClick={() => {
              setError("");
              setRetry(retry + 1);
            }}
          >
            Retry loading
          </button>
        ) : (
          <div className="loading-track" />
        )}
      </section>
    );
  const raw = report.runs.find(
    (r) => r.system === baseline && r.count === count,
  )!;
  const qos = report.runs.find(
    (r) => r.system === policy && r.count === count,
  )!;
  const rawScenario = raw.scenarios.find((s) => s.name === workload)!;
  const qosScenario = qos.scenarios.find((s) => s.name === workload)!;
  const rawActions = actionsFor(rawScenario),
    qosActions = actionsFor(qosScenario);
  const current = qosActions[step - 1];
  const change = (fn: () => void) => {
    fn();
    setStep(0);
  };

  return (
    <>
      <section className="stats-strip" aria-label="Scenario configuration">
        <div>
          <span>Shared inventory / token</span>
          <strong>
            10,000 <small>units</small>
          </strong>
          <p>Same starting backing in both systems</p>
        </div>
        <div>
          <span>Registered strategies</span>
          <strong>
            {count.toString().padStart(2, "0")} <small>XYC</small>
          </strong>
          <p>Independent Aqua virtual ledgers</p>
        </div>
        <div>
          <span>Configured protection</span>
          <strong>
            {policy === "C" ? "50" : "100"}
            <small>% of starting backing</small>
          </strong>
          <p>{num(qos.policy.guarantee)} units per strategy / token</p>
        </div>
        <div className="scope-stat">
          <span>Evidence environment</span>
          <strong>
            <i className="status-dot" /> Local EVM
          </strong>
          <p>Executed receipts · No live transactions</p>
        </div>
      </section>

      <section
        className="scenario-toolbar panel"
        aria-label="Scenario controls"
      >
        <div className="scenario-title">
          <span className="section-number">01</span>
          <div>
            <h2>Set the comparison</h2>
            <p>Choose from measured scenarios</p>
          </div>
        </div>
        <label>
          Workload
          <select
            value={workload}
            onChange={(e) => change(() => setWorkload(e.target.value))}
          >
            {Object.entries(workloads).map(([v, title]) => (
              <option key={v} value={v}>
                {title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Strategies
          <select
            value={count}
            onChange={(e) => change(() => setCount(Number(e.target.value)))}
          >
            {[2, 4, 8].map((n) => (
              <option key={n} value={n}>
                {n} strategies
              </option>
            ))}
          </select>
        </label>
        <label>
          Guarantee policy
          <select
            value={policy}
            onChange={(e) => change(() => setPolicy(e.target.value as Policy))}
          >
            <option value="C">50% protected + burst</option>
            <option value="C100">100% protected</option>
          </select>
        </label>
      </section>

      <div className="section-head">
        <div>
          <span className="eyebrow">SAME INVENTORY. SAME OFFERED DEMAND.</span>
          <h2>Watch capacity change.</h2>
        </div>
        <div className="segmented" aria-label="Displayed token">
          {[0, 1].map((t) => (
            <button
              key={t}
              aria-pressed={token === t}
              onClick={() => setToken(t)}
            >
              Token {t}
            </button>
          ))}
        </div>
      </div>
      <div className="comparison-grid">
        <CapacityCard
          run={raw}
          scenario={rawScenario}
          step={step}
          token={token}
        />
        <CapacityCard
          run={qos}
          scenario={qosScenario}
          step={step}
          token={token}
        />
      </div>
      <div className="comparison-footnote">
        <label>
          Reference system
          <select
            value={baseline}
            onChange={(e) =>
              change(() => setBaseline(e.target.value as Policy))
            }
          >
            <option value="B">Raw Aqua overcommitment</option>
            <option value="A">Conservative Aqua allocation</option>
          </select>
        </label>
        <p>
          {policy === "C"
            ? "50% protection leaves room for burst. More fills at this setting also mean smaller guarantees."
            : "100% protection matches conservative Aqua’s initial allocation. Virtual pricing depth and custody still differ."}
        </p>
      </div>

      <section
        className="panel playback"
        aria-label="Recorded transaction replay"
      >
        <div className="playback-top">
          <div className="scenario-title">
            <span className="section-number">02</span>
            <div>
              <h2>Replay the transactions</h2>
              <p>Each step reveals an executed local receipt</p>
            </div>
          </div>
          <div className="play-controls">
            <button
              className="button quiet"
              disabled={step === 0}
              onClick={() => setStep(0)}
              aria-label="Reset replay"
            >
              ↺ <span>Reset</span>
            </button>
            <button
              className="button"
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
              aria-label="Previous transaction"
            >
              ←
            </button>
            <button
              className="button primary"
              disabled={step === qosActions.length}
              onClick={() => setStep(step + 1)}
            >
              Next transaction <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
        <div className="playback-status" role="status" aria-live="polite">
          <span className="step-label">
            STEP {step.toString().padStart(2, "0")}{" "}
            <span>/ {qosActions.length.toString().padStart(2, "0")}</span>
          </span>
          <span>
            {current
              ? current.type === "push"
                ? `Deposit ${num(current.amount)} Token ${current.token} into strategy ${current.strategy + 1}.`
                : `Strategy ${current.strategy + 1} requests ${num(current.amount)} Token ${current.aToB ? 1 : 0}.`
              : "Both systems begin with the same real inventory. Select Next transaction to begin."}
          </span>
        </div>
        <div className="timeline" aria-label="Choose recorded step">
          <button
            aria-label="Show initial state"
            aria-pressed={step === 0}
            onClick={() => setStep(0)}
          >
            Start
          </button>
          {qosActions.map((a, i) => (
            <button
              key={a.actionIndex}
              aria-label={`Show recorded step ${i + 1}`}
              aria-pressed={step === i + 1}
              className={i < step ? "completed" : ""}
              onClick={() => setStep(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <InventoryChart
          runs={[rawScenario, qosScenario]}
          labels={[policies[baseline], "AquaQoS"]}
          token={token}
          step={step}
        />
      </section>

      <section className="panel activity">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">COMPLETE OFFERED DEMAND</span>
            <h2>Transaction outcomes</h2>
          </div>
          <span className="small-note">Select a step to inspect</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Step</th>
                <th scope="col">Strategy / action</th>
                <th scope="col">Requested units</th>
                <th scope="col">{policies[baseline]}</th>
                <th scope="col">AquaQoS</th>
              </tr>
            </thead>
            <tbody>
              {qosActions.map((a, i) => (
                <tr
                  key={a.actionIndex}
                  className={step === i + 1 ? "selected-row" : ""}
                >
                  <td>
                    <button
                      className="row-step"
                      aria-label={`Inspect transaction ${i + 1}`}
                      aria-pressed={step === i + 1}
                      onClick={() => setStep(i + 1)}
                    >
                      {String(i + 1).padStart(2, "0")} ↗
                    </button>
                  </td>
                  <td>
                    Strategy {a.strategy + 1}
                    <small>
                      {a.type === "push"
                        ? `Deposit Token ${a.token}`
                        : `Token ${a.aToB ? "0 → 1" : "1 → 0"}`}
                    </small>
                  </td>
                  <td className="mono">{num(a.amount)}</td>
                  <td>
                    <span className={`outcome ${tone(rawActions[i])}`}>
                      {outcome(rawActions[i])}
                    </span>
                  </td>
                  <td>
                    <span className={`outcome ${tone(a)}`}>{outcome(a)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className="evidence-banner">
        <div>
          <span className="eyebrow">EVERY NUMBER HAS A RECEIPT</span>
          <p>
            All values come from the checked benchmark. Read the assumptions,
            compare gas costs, or inspect the source evidence.
          </p>
        </div>
        <Link className="button" href="/proof/">
          Explore protocol evidence ↗
        </Link>
      </div>
      <p className="source-line">
        Source <code>{report.sourceCommit}</code> · Raw mock-token units ·
        Recorded local execution
      </p>
    </>
  );
}

function CapacityCard({
  run,
  scenario,
  step,
  token,
}: {
  run: Run;
  scenario: Scenario;
  step: number;
  token: number;
}) {
  const action = actionsFor(scenario)[step - 1];
  const before = action?.before ?? scenario.initialState,
    after = action?.after ?? scenario.initialState;
  const balances = after.tokens[token],
    protectedUnits = entitlements(run, balances);
  const totalProtected = protectedUnits.reduce((a, b) => a + b, 0n);
  const guarded = ["C", "C100"].includes(run.system);
  const balance = BigInt(balances.balance),
    available = balance - totalProtected;
  const transfers =
    action?.receipt.logs.filter(
      (log) =>
        log.topics[0]?.toLowerCase() ===
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
    ) ?? [];
  const error = action?.trace ?? action?.quoteError;
  const roles: [string, string][] = [
    ["Maker", run.policy.maker],
    ["Taker", run.policy.taker],
    ["Router", run.addresses.router],
    ["Aqua", run.addresses.aqua],
    ...run.addresses.tokens.map((a, i): [string, string] => [`Token ${i}`, a]),
  ];
  const role = (a: string) =>
    roles.find(
      ([, address]) => address.toLowerCase() === a.toLowerCase(),
    )?.[0] ?? short(a);
  const signedDelta = (a: string, b: string) => {
    const d = BigInt(b) - BigInt(a);
    return `${d > 0 ? "+" : ""}${num(d)}`;
  };
  return (
    <section
      className={`panel capacity-card ${guarded ? "guarded" : "raw"}`}
      aria-label={`${policies[run.system]} capacity`}
    >
      <div className="card-title">
        <div
          className={`system-icon ${guarded ? "aqua-icon" : ""}`}
          aria-hidden="true"
        >
          {guarded ? "◇" : "≋"}
        </div>
        <div>
          <span className="eyebrow">
            {guarded ? "CAPACITY GUARD ENABLED" : "REFERENCE POLICY"}
          </span>
          <h3>{guarded ? "AquaQoS" : policies[run.system]}</h3>
        </div>
        <span className="policy-tag">
          {guarded ? "PROTECTED" : "UNGUARDED"}
        </span>
      </div>
      <div className="balance-main">
        <span>Shared Token {token} remaining</span>
        <strong>
          {num(balance)}
          <small> units</small>
        </strong>
        <span className={`outcome ${tone(action)}`}>{outcome(action)}</span>
      </div>
      <div
        className="capacity-meter"
        role="img"
        aria-label={`${num(totalProtected)} protected units out of ${num(balance)} remaining inventory`}
      >
        {protectedUnits.map((g, i) => (
          <span
            key={i}
            className={`segment segment-${i % 4}`}
            style={{
              width:
                balance === 0n ? 0 : `${Number((g * 10000n) / balance) / 100}%`,
            }}
          />
        ))}
      </div>
      <div className="meter-legend">
        <span>
          <i className={guarded ? "aqua-key" : "gray-key"} />
          {guarded
            ? `${num(totalProtected)} protected`
            : "No AquaQoS reservations"}
        </span>
        <span>
          {guarded ? `${num(available)} unreserved` : "Shared maker balance"}
        </span>
      </div>
      <div className="strategy-list">
        <div className="strategy-header">
          <span>Strategy</span>
          <span>Virtual units</span>
          <span>Protected left</span>
        </div>
        {balances.virtual.map((v, i) => (
          <div key={i}>
            <span>
              <i className={`strategy-dot dot-${i % 4}`} />
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="mono">{num(v)}</span>
            <span className="mono">
              {guarded ? num(protectedUnits[i]) : "—"}
            </span>
          </div>
        ))}
      </div>
      <p className="card-explanation">
        {!action
          ? guarded
            ? `${num(run.policy.guarantee)} units configured per strategy and token. Protection is consumed and can be replenished.`
            : "Virtual balances share the maker’s real inventory. No guard runs on this reference path."
          : action.type === "push"
            ? "Aqua.push moves tokens into shared inventory and replenishes this strategy’s virtual balance."
            : action.outcome === "guard_rejection"
              ? "This request would exceed the configured capacity policy. The transaction reverted; token balances stayed unchanged."
              : action.outcome === "settlement_failure"
                ? "The quote had virtual depth, but the maker lacked real output inventory. Settlement reverted atomically."
                : action.outcome === "quote_rejection"
                  ? "The reference quote could not price this amount. The benchmark also sent the transaction and retained its reverted receipt."
                  : "The fill settled through official Aqua. Real tokens moved and only the trading strategy’s virtual ledger changed."}
      </p>
      <details className="receipt-details">
        <summary>
          Inspect {action ? "transaction & balances" : "initial balances"}{" "}
          <span>↗</span>
        </summary>
        {action && (
          <>
            <p className="receipt-hash">
              Transaction <code>{action.receipt.transactionHash}</code>
            </p>
            <div className="receipt-facts">
              <span>
                {action.receipt.status === "0x1"
                  ? "Success · 0x1"
                  : "Reverted · 0x0"}
              </span>
              <span>{num(action.gasUsed)} gas</span>
            </div>
            {error && (
              <p className="warning">
                {error.name}({error.args.join(", ")})
              </p>
            )}
          </>
        )}
        <div className="table-scroll">
          <table>
            <caption>Real balances before and after this step</caption>
            <thead>
              <tr>
                <th>Account</th>
                <th>Before</th>
                <th>After</th>
                <th>Δ units</th>
              </tr>
            </thead>
            <tbody>
              {after.tokens.flatMap((t, i) =>
                [
                  ["Maker", t.balance, before.tokens[i].balance],
                  ["Taker", t.takerBalance, before.tokens[i].takerBalance],
                ].map(([who, end, start]) => (
                  <tr key={`${who}${i}`}>
                    <td>
                      {who} / T{i}
                    </td>
                    <td>{num(start)}</td>
                    <td>{num(end)}</td>
                    <td>{signedDelta(start, end)}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
        <h4>Receipt Transfer events</h4>
        {transfers.length ? (
          <ul className="transfer-list">
            {transfers.map((log, i) => (
              <li key={i}>
                <span>
                  {role(`0x${log.topics[1].slice(-40)}`)} →{" "}
                  {role(`0x${log.topics[2].slice(-40)}`)}
                </span>
                <strong>
                  {num(log.data)} {role(log.address)}
                </strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="small-note">
            {action
              ? "No Transfer events in this reverted receipt."
              : "No transaction selected."}
          </p>
        )}
        <details>
          <summary>Exact addresses & allowance</summary>
          <dl className="address-list">
            {roles.map(([name, address]) => (
              <div key={name}>
                <dt>{name}</dt>
                <dd>{address}</dd>
              </div>
            ))}
            {after.tokens.map((t, i) => (
              <div key={i}>
                <dt>T{i} maker → Aqua allowance</dt>
                <dd>{t.allowance}</dd>
              </div>
            ))}
          </dl>
        </details>
        <details>
          <summary>Raw receipt & state JSON</summary>
          <pre>
            {JSON.stringify(
              { receipt: action?.receipt ?? null, before, after },
              null,
              2,
            )}
          </pre>
        </details>
      </details>
    </section>
  );
}

function InventoryChart({
  runs,
  labels,
  token,
  step,
}: {
  runs: Scenario[];
  labels: string[];
  token: number;
  step: number;
}) {
  const series = runs.map((s) => [
    Number(s.initialState.tokens[token].balance),
    ...actionsFor(s).map((a) => Number(a.after.tokens[token].balance)),
  ]);
  const max = Math.max(...series.flat(), 1),
    length = series[0].length;
  const x = (i: number) => 60 + (i * 800) / (length - 1),
    y = (n: number) => 180 - (n / max) * 145;
  return (
    <div className="inventory-chart">
      <div className="chart-title">
        <span>Recorded Token {token} inventory</span>
        <div>
          <span>
            <i className="raw-key" />
            {labels[0]}
          </span>
          <span>
            <i className="aqua-key" />
            {labels[1]}
          </span>
        </div>
      </div>
      <svg
        viewBox="0 0 900 210"
        role="img"
        aria-label={`Full recorded Token ${token} inventory trajectory. Current step ${step}. Exact balances are displayed in the comparison cards.`}
      >
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line
              x1="60"
              x2="860"
              y1={y(max * f)}
              y2={y(max * f)}
              className="chart-grid"
            />
            <text x="48" y={y(max * f) + 4} textAnchor="end">
              {Math.round(max * f).toLocaleString("en-US")}
            </text>
          </g>
        ))}
        <line
          x1={x(step)}
          x2={x(step)}
          y1="24"
          y2="183"
          className="chart-cursor"
        />
        {series.map((values, index) => (
          <g key={index} className={index ? "chart-qos" : "chart-raw"}>
            <polyline
              points={values.map((v, i) => `${x(i)},${y(v)}`).join(" ")}
              fill="none"
              strokeWidth="2.5"
            />
            {values.map((v, i) => (
              <circle key={i} cx={x(i)} cy={y(v)} r={i === step ? 5 : 2.5} />
            ))}
          </g>
        ))}
        {series[0].map((_, i) => (
          <text key={i} x={x(i)} y="202" textAnchor="middle">
            {i === 0 ? "Start" : i}
          </text>
        ))}
      </svg>
      <p className="small-note">
        The full recorded sequence is shown. The vertical marker follows the
        selected step.
      </p>
    </div>
  );
}
