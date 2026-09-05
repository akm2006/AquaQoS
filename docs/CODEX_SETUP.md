# Local Codex setup

CLI inspected: 0.153.4. Three standalone project roles live in `.codex/agents/` with
required name, description and developer instructions. `.codex/config.toml` only sets
two spawned threads and one nesting level. Skills use supported `.agents/skills/*/SKILL.md`.
No MCPs, secrets, auth or global model preferences added.

Roles inherit the active model; protocol/security use high reasoning, benchmark uses medium.
The current catalog supports these settings. No guarantee is made that a future selected
model supports them: inspect availability on relaunch. Read-only sandbox is the role default;
parent runtime permission overrides may take precedence, so role instructions also forbid
edits and external actions. Never treat a role name as a security boundary by itself.

After bootstrap, **start a fresh session** so skills and agent discovery reliably refresh.
PowerShell:

```powershell
codex -C "C:\Users\akash\Desktop\AquaQoS" "Read AGENTS.md and docs/STATUS.md. Verify the AquaQoS skills and reviewer roles are available, then continue phase 1 reproduction."
```

In the app, reopen this directory and start a new chat with the same instruction. If a
normal trust prompt appears, review/approve this repository through the product UI; do not
edit global trust settings automatically. Do not reinstall Codex or weaken permissions.

Validation commands:

```powershell
node scripts/check-bootstrap.mjs
codex --strict-config doctor --summary --ascii
```

The bundled skill-creator `quick_validate.py` additionally validates each skill. Installed
Codex `debug prompt-input` can verify discovery without invoking a model; inspect only
presence of expected role/skill names, since its full output contains user configuration.
Doctor overall exit status includes unrelated environment failures; inspect the config row.
`--strict-config` is not supported with `debug` in this CLI; use it with doctor only.
Prompt-input confirmed the three skills, but does not expose the full agent tool schema;
custom role activation still requires verification in the fresh session.
See STATUS for actual validation outcomes and ENVIRONMENT_AUDIT for the global sandbox warning.

If host Git reports dubious ownership after sandbox initialization, use the verified-path
per-command option `git -c safe.directory=C:/Users/akash/Desktop/AquaQoS status` (and likewise
for subsequent Git commands). Do not add a global wildcard trust exception.

Fallback if roles are not loaded: use existing global `sol_auditor` with the relevant
project role instructions for read-only review, or an explicit separate root review pass.
The root can read skills directly. Do not force unsupported flags or install MCP bundles.
