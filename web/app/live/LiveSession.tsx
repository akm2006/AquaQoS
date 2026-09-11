"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { num, short } from "../_lib/format";
import { routes } from "../_lib/routes";
import "./live.css";

type Token = {
  address: string;
  balance: string;
  allowance: string;
  ownerBalance: string;
  takerBalance: string;
  remaining: string;
};
type Strategy = {
  hash: string;
  active: boolean;
  guarantees: string[];
  virtual: string[];
  remaining: string[];
};
type Execution = {
  operation: string;
  receipt: { transactionHash: string; status: string; gasUsed: string };
  error: { name: string; args: string[] } | null;
  before: { tokens: Token[] };
  after: { tokens: Token[] };
  transfers: { token: number; from: string; to: string; amount: string }[];
};
type LiveState = {
  kind: string;
  id: string;
  chainId: number;
  blockNumber: number;
  paused: boolean;
  config: { count: number; backing: string; guarantee: string };
  identity: { sourceCommit: string; dirty: boolean };
  addresses: {
    owner: string;
    taker: string;
    vault: string;
    aqua: string;
    router: string;
  };
  tokens: Token[];
  strategies: Strategy[];
  history: Execution[];
  quote: {
    id: string;
    strategy: number;
    token: number;
    amount: string;
    input: string | null;
    error: { name: string; args: string[] } | null;
  } | null;
};
type ResponseState = {
  sessionToken: string;
  revision: number;
  state: LiveState | null;
};

export default function LiveSession() {
  const [connection, setConnection] = useState<ResponseState | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [count, setCount] = useState("2"),
    [backing, setBacking] = useState("10000"),
    [guarantee, setGuarantee] = useState("2500");
  const [strategy, setStrategy] = useState("0"),
    [token, setToken] = useState("1"),
    [amount, setAmount] = useState("3000");
  const [guaranteeA, setGuaranteeA] = useState("1000"),
    [guaranteeB, setGuaranteeB] = useState("1000");
  const [stale, setStale] = useState(false);
  const state = connection?.state;
  async function load() {
    setBusy(true);
    try {
      const response = await fetch("/api/state", { cache: "no-store" });
      if (!response.ok)
        throw Error(
          "Start the local execution server with the commands below, then reconnect.",
        );
      const data = await response.json();
      if (
        typeof data.sessionToken !== "string" ||
        !Number.isInteger(data.revision) ||
        (data.state && data.state.kind !== "aquaqos-live-local-v1")
      )
        throw Error("Unexpected local service response.");
      setConnection(data);
      setError("");
      setStale(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Local connection failed.");
      setStale(true);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function act(operation: string, fields: Record<string, unknown> = {}) {
    if (!connection || busy || stale) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-AquaQoS-Session": connection.sessionToken,
        },
        body: JSON.stringify({
          operation,
          revision: connection.revision,
          ...fields,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw Error(data.error || "The action could not be completed.");
      setConnection(data);
      if (operation === "setup") setStrategy("0");
    } catch (e) {
      setError(
        (e instanceof Error ? e.message : "Connection interrupted.") +
          " Refresh state before trying another action.",
      );
      setStale(true);
    } finally {
      setBusy(false);
    }
  }
  const disabled = busy || stale || !connection;
  const selection = {
    strategy: Number(strategy),
    token: Number(token),
    amount,
  };
  const quote = state?.quote;
  const matchingQuote =
    quote &&
    quote.strategy === Number(strategy) &&
    quote.token === Number(token) &&
    quote.amount === amount;
  function download() {
    if (!state) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `aquaqos-live-${state.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <main id="main" className="workspace live-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">LIVE LOCAL EXECUTION</p>
          <h1>Put capacity to work.</h1>
          <p>
            Configure a maker group. Execute a trade. Inspect what actually
            changed.
          </p>
        </div>
        <Link className="button" href={routes.workspace} prefetch={false}>
          Compare recorded scenarios
        </Link>
      </div>
      <section className="panel live-notice">
        <div>
          <strong>
            {state
              ? `Local chain ${state.chainId} · Block ${state.blockNumber}`
              : "Connect to your local execution server"}
          </strong>
          <p>
            Fresh isolated EVM · Test maker and taker accounts · Mock tokens
            with no market value
          </p>
        </div>
        <button className="button" onClick={load} disabled={busy}>
          {connection ? "Refresh state" : "Reconnect"}
        </button>
      </section>
      {error && (
        <p className="panel live-error" role="alert">
          {error}
        </p>
      )}
      <p className="small-note" role="status">
        {busy
          ? "Reading or executing on the local chain…"
          : stale
            ? "Displayed state may be stale. Actions are paused until refresh."
            : state
              ? "Balances below were read after the latest confirmed local transaction."
              : "Create a group to begin."}
      </p>
      {!connection && (
        <section className="panel live-instructions">
          <h2>Run the local workspace</h2>
          <pre>
            pnpm build{"\n"}pnpm --dir web build{"\n"}node scripts/serve-live.mjs
          </pre>
          <p>
            Open http://127.0.0.1:4174/live/. The server creates its own chain
            and uses its test accounts. No wallet setup is needed. Closing it
            ends the session.
          </p>
        </section>
      )}
      <section className="panel live-section">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">01 / MAKER CONFIGURATION</span>
            <h2>
              {state ? "Start a fresh maker group" : "Create your maker group"}
            </h2>
          </div>
        </div>
        <form
          className="live-form"
          onSubmit={(e) => {
            e.preventDefault();
            void act("setup", { count: Number(count), backing, guarantee });
          }}
        >
          <label>
            Strategies
            <select value={count} onChange={(e) => setCount(e.target.value)}>
              {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <label>
            Inventory per token
            <input
              required
              inputMode="numeric"
              pattern="[0-9]+"
              value={backing}
              onChange={(e) => setBacking(e.target.value)}
            />
          </label>
          <label>
            Guarantee per strategy / token
            <input
              required
              inputMode="numeric"
              pattern="[0-9]+"
              value={guarantee}
              onChange={(e) => setGuarantee(e.target.value)}
            />
          </label>
          <button className="button primary" disabled={disabled}>
            {state ? "Create fresh group" : "Create maker group"}
          </button>
        </form>
        <p className="small-note">
          Each strategy starts with virtual depth equal to the shared inventory.
          Total guarantees must fit that inventory. A fresh group replaces this
          local session; export its receipts first.
        </p>
      </section>
      {state && (
        <>
          <div className="section-head">
            <div>
              <span className="eyebrow">CONTRACT STATE</span>
              <h2>
                {state.paused
                  ? "Group paused · protection inactive"
                  : "Group active · capacity protected"}
              </h2>
            </div>
            <button className="button" onClick={download}>
              Export session
            </button>
          </div>
          <div className="comparison-grid">
            {state.tokens.map((t, i) => (
              <section
                className="panel live-token"
                key={t.address}
                aria-label={`Live Token ${i}`}
              >
                <span className="eyebrow">SHARED TOKEN {i}</span>
                <div className="balance-main">
                  <strong>
                    {num(t.balance)}
                    <small> units</small>
                  </strong>
                </div>
                <div className="meter-legend">
                  <span>{num(t.remaining)} remaining protection</span>
                  <span>
                    {num(BigInt(t.balance) - BigInt(t.remaining))} unreserved
                  </span>
                </div>
                <div className="strategy-list">
                  <div className="strategy-header">
                    <span>Strategy</span>
                    <span>Virtual units</span>
                    <span>Protected left</span>
                  </div>
                  {state.strategies.map((s, n) => (
                    <div key={s.hash}>
                      <span>
                        {n + 1}
                        {s.active ? "" : " · docked"}
                      </span>
                      <span className="mono">{num(s.virtual[i])}</span>
                      <span className="mono">{num(s.remaining[i])}</span>
                    </div>
                  ))}
                </div>
                <p className="small-note">
                  {state.paused
                    ? "Pause ends the capacity commitment. Activate rechecks both tokens and resets all baselines."
                    : "Remaining protection is consumed by outputs and restored by replenishment, capped at each configured guarantee."}
                </p>
                <details>
                  <summary>Token address & allowance</summary>
                  <p className="source-line">{t.address}</p>
                  <p className="source-line">
                    Vault allowance to Aqua: {t.allowance}
                  </p>
                </details>
              </section>
            ))}
          </div>
          <section className="panel live-section">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">02 / TRADE & REPLENISH</span>
                <h2>Execute against current capacity</h2>
              </div>
            </div>
            <div className="live-form">
              <label>
                Trading strategy
                <select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                >
                  {state.strategies.map((s, i) => (
                    <option value={i} key={s.hash}>
                      Strategy {i + 1}
                      {s.active ? "" : " (docked)"}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Output / deposit token
                <select
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                >
                  <option value="0">Token 0</option>
                  <option value="1">Token 1</option>
                </select>
              </label>
              <label>
                Requested units
                <input
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </label>
              <button
                className="button"
                disabled={disabled}
                onClick={() => act("quote", selection)}
              >
                Check quote
              </button>
              <button
                className="button"
                disabled={disabled}
                onClick={() => act("push", selection)}
              >
                Replenish strategy
              </button>
            </div>
            {matchingQuote && (
              <div className="live-quote" role="status">
                <div>
                  <strong>
                    {quote.error
                      ? `Quote rejected: ${quote.error.name}`
                      : `${num(quote.input!)} Token ${1 - quote.token} for ${num(quote.amount)} Token ${quote.token}`}
                  </strong>
                  <p>
                    {quote.error
                      ? "You can execute this local test to inspect the expected reverted receipt."
                      : "Execution uses this quoted input as its maximum. Any intervening operation requires a new quote."}
                  </p>
                </div>
                <button
                  className="button primary"
                  disabled={disabled}
                  onClick={() => act("swap", { quoteId: quote.id })}
                >
                  {quote.error ? "Execute rejection test" : "Execute trade"}
                </button>
              </div>
            )}
          </section>
          <section className="panel live-section">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">03 / MAKER CONTROLS</span>
                <h2>Manage the commitment</h2>
              </div>
            </div>
            <div className="live-actions">
              <button
                className="button"
                disabled={disabled || state.paused}
                onClick={() => act("pause")}
              >
                Pause group
              </button>
              <button
                className="button"
                disabled={disabled || !state.paused}
                onClick={() => act("activate")}
              >
                Activate group
              </button>
            </div>
            <p className="small-note">
              Pause before changing guarantees. Reactivation starts a new
              commitment and can fail if current inventory or virtual balances
              cannot support it.
            </p>
            <div className="live-form">
              <label>
                Token 0 guarantee
                <input
                  inputMode="numeric"
                  value={guaranteeA}
                  onChange={(e) => setGuaranteeA(e.target.value)}
                />
              </label>
              <label>
                Token 1 guarantee
                <input
                  inputMode="numeric"
                  value={guaranteeB}
                  onChange={(e) => setGuaranteeB(e.target.value)}
                />
              </label>
              <button
                className="button"
                disabled={disabled || !state.paused}
                onClick={() =>
                  act("guarantees", {
                    strategy: Number(strategy),
                    guaranteeA,
                    guaranteeB,
                  })
                }
              >
                Update strategy {Number(strategy) + 1} guarantees
              </button>
            </div>
            <details className="live-exit">
              <summary>Close strategies & withdraw test inventory</summary>
              <p>
                Docking closes every registered strategy. Withdrawals go to the
                local test owner after the group is paused and docked.
              </p>
              <div className="live-actions">
                <button
                  className="button"
                  disabled={
                    disabled ||
                    !state.paused ||
                    state.strategies.every((s) => !s.active)
                  }
                  onClick={() => act("dockAll")}
                >
                  Dock all strategies
                </button>
                {state.tokens.map((t, i) => (
                  <button
                    className="button"
                    key={t.address}
                    disabled={
                      disabled ||
                      !state.paused ||
                      state.strategies.some((s) => s.active) ||
                      t.balance === "0"
                    }
                    onClick={() =>
                      act("withdraw", { token: i, amount: t.balance })
                    }
                  >
                    Withdraw Token {i}
                  </button>
                ))}
              </div>
            </details>
          </section>
          <section className="panel live-section">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">CONFIRMED LOCAL RECEIPTS</span>
                <h2>Execution history</h2>
              </div>
              <span className="small-note">Newest first</span>
            </div>
            {!state.history.length && (
              <p>
                Execute a trade or maker action to inspect its receipt here.
              </p>
            )}
            {[...state.history].reverse().map((h, i) => (
              <details
                className="live-receipt"
                key={h.receipt.transactionHash}
                open={i === 0}
              >
                <summary>
                  {h.operation} ·{" "}
                  {h.receipt.status === "0x1" ? "Confirmed" : "Reverted"} ·{" "}
                  {num(h.receipt.gasUsed)} gas
                </summary>
                <p className="source-line">{h.receipt.transactionHash}</p>
                {h.error && (
                  <p className="warning">
                    {h.error.name}({h.error.args.join(", ")})
                  </p>
                )}
                <div className="table-scroll">
                  <table>
                    <caption>Vault and taker balances</caption>
                    <thead>
                      <tr>
                        <th>Token</th>
                        <th>Vault before</th>
                        <th>Vault after</th>
                        <th>Taker before</th>
                        <th>Taker after</th>
                      </tr>
                    </thead>
                    <tbody>
                      {h.after.tokens.map((t, n) => (
                        <tr key={n}>
                          <td>Token {n}</td>
                          <td>{num(h.before.tokens[n].balance)}</td>
                          <td>{num(t.balance)}</td>
                          <td>{num(h.before.tokens[n].takerBalance)}</td>
                          <td>{num(t.takerBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <h4>ERC-20 Transfer events</h4>
                {h.transfers.length ? (
                  <ul className="transfer-list">
                    {h.transfers.map((t, n) => (
                      <li key={n}>
                        <span title={`${t.from} to ${t.to}`}>
                          {short(t.from)} to {short(t.to)}
                        </span>
                        <strong>
                          {num(t.amount)} Token {t.token}
                        </strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="small-note">
                    No token Transfer events in this receipt.
                  </p>
                )}
              </details>
            ))}
          </section>
          <details className="panel live-section">
            <summary>Deployment identity & local test accounts</summary>
            <dl className="address-list">
              {Object.entries(state.addresses).map(([name, address]) => (
                <div key={name}>
                  <dt>{name}</dt>
                  <dd>{address}</dd>
                </div>
              ))}
            </dl>
            <p className="source-line">
              Source {state.identity.sourceCommit}
              {state.identity.dirty
                ? " · local changes present"
                : " · clean checkout"}
              . Export includes deployment receipts, runtime hashes, source
              hashes and setup transactions.
            </p>
          </details>
        </>
      )}
    </main>
  );
}
