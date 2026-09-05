# Owner bootstrap prompt — 2026-09-05

Exact project request retained from this session. Runtime/global configuration context excluded.

You are taking over this repository as the technical lead, protocol engineer, research lead, QA/security lead, release manager, and hackathon submission engineer for **AquaQoS**, a From-Scratch ETHOnline 2026 project targeting primarily the **1inch — Build an Aqua App** track.

Today is September 5, 2026 and ETHOnline has already started, so work created from this point may be committed as hackathon work.

The repository currently contains a planning document named approximately:

`AquaQoS_ETHOnline_2026_Winning_Package.md`

Read it completely before doing anything else.

That document is a **strategic brief, not guaranteed technical truth**. Validate every material claim, assumption, API, contract behavior, hackathon requirement, and architecture decision against current primary sources before relying on it.

Your job from this point onward is to establish a durable project operating system that allows Codex to reliably carry AquaQoS from this empty/planning-stage directory through:

research → protocol design → problem reproduction → implementation → tests → adversarial/security review → benchmarks → usable frontend → deployment/demo → documentation → technical paper → submission packaging → final audit.

Do not merely give me a setup plan. **Perform the setup in this repository.**

---

# 1. First audit the environment

Before modifying the repository, inspect and record:

* current directory contents
* whether this is already a Git repository
* Git status/history/remotes
* Codex CLI version
* applicable root/global `AGENTS.md` / `AGENTS.override.md`
* current relevant Codex configuration
* available project/global skills
* available custom/subagents
* available MCPs/tools
* Node.js version
* package managers available: npm/yarn/pnpm
* Solidity toolchain availability: Hardhat, Foundry, solc where relevant
* `gh` CLI availability/authentication
* any relevant existing developer tooling

Do not expose secrets.

Do not modify `~/.codex`, `~/.agents`, global MCP configuration, global skills, global agents, or other repositories unless I explicitly authorize it.

Prefer repository-local configuration.

Do not install tools or MCPs merely because they exist. Only add something when it solves a concrete AquaQoS workflow problem.

If an existing global skill/MCP/agent already provides a capability reliably, reuse it rather than duplicating it.

---

# 2. Establish the source-of-truth hierarchy

Use this priority when resolving technical disagreements:

1. Current ETHOnline 2026 official rules and 1inch prize requirements.
2. Current official 1inch Aqua / SwapVM documentation, repositories, SDKs, whitepapers and templates.
3. Actual behavior proven by source code and executable tests.
4. AquaQoS project decisions recorded after validation.
5. `AquaQoS_ETHOnline_2026_Winning_Package.md`.

Never preserve an idea from the winning-package document merely because it sounds good if source code or testing disproves it.

Seed your research from at least these official sources and follow their current canonical links:

* ETHGlobal ETHOnline 2026 prize page
* `1inch/aqua`
* `1inch/swap-vm`
* `1inch/swap-vm-template`
* 1inch Aqua TypeScript SDK
* current Aqua documentation
* Aqua whitepaper
* SwapVM whitepaper

Use current official sources rather than blogs when possible.

Record:

* source URL
* relevant branch/tag/release
* commit SHA where appropriate
* date checked
* what claim the source supports

Do not rely on stale cached interfaces when current source can be inspected.

---

# 3. Validate the hackathon requirements immediately

Confirm the current official requirements for the **fresh / From Scratch 1inch Aqua track**.

At minimum verify and persist whether these remain true:

* official Aqua/SwapVM contracts must be used
* modified SwapVM redeployment is allowed
* SwapVM projects receive higher judging consideration
* onchain token transfers must be demonstrated
* local forks are acceptable if currently stated
* proper Git commit history is required
* final position must be demonstrable through tests/scripts/UI
* current prize structure
* submission deadline
* video requirements
* repository/public-source requirements

Do not guess any deadline or submission requirement.

Put the verified requirements in the repository and make them acceptance gates.

---

# 4. Initialize Git correctly

If this directory is not a Git repository, initialize it now.

Create an appropriate `.gitignore` before installing dependencies.

Never commit:

* private keys
* seed phrases
* `.env`
* RPC secrets
* API keys
* auth tokens
* generated caches
* unnecessary build outputs

Preserve the existing winning-package markdown as planning provenance.

Create coherent commits throughout development. Never accumulate the entire hackathon into one giant final commit.

Use commit messages that explain real milestones.

Do not rewrite published Git history later merely to make it look cleaner.

Do not create or publish a public GitHub repository or perform public/social actions without asking me first, but maintain excellent local Git history from the beginning.

---

# 5. Create the persistent project control plane

Create a concise root:

`AGENTS.md`

It must be the durable operating contract for all future Codex sessions.

Keep it concise enough to remain useful in context.

It should include at least:

* AquaQoS mission
* primary bounty target
* core project thesis
* source-of-truth hierarchy
* architecture quality principles
* smart-contract/security rules
* testing requirements
* benchmark integrity rules
* Git discipline
* no fabricated claims/results
* documentation discipline
* instruction to update project status after milestones
* requirement to prefer primary 1inch sources
* rule that frontend remains functional/minimal until protocol correctness and benchmarks are stable
* rule to continue unblocked work rather than stopping because one manual action is unavailable
* rule to clearly isolate tasks requiring me
* rule to never silently weaken an invariant just to make tests pass
* rule to avoid sponsor-integration soup
* rule to make the 1inch/Aqua integration load-bearing

Do NOT copy the entire winning package into `AGENTS.md`.

Instead link to durable project docs.

---

# 6. Create durable project documentation

Create a clean documentation structure, adapting names only if there is a strong reason.

At minimum create:

`docs/PROJECT_CHARTER.md`

Contains:

* validated AquaQoS thesis
* problem definition
* intended innovation
* why Aqua is necessary
* primary user
* non-goals
* hackathon scope
* stretch scope

`docs/HACKATHON_REQUIREMENTS.md`

Contains:

* exact verified ETHOnline/1inch requirements
* source links
* qualification checklist
* deadlines
* demo requirements

`docs/EXECUTION_PLAN.md`

Contains:

* project phases
* dependencies
* milestone gates
* critical path
* what must be finished before frontend polish
* final submission phase

`docs/ACCEPTANCE_CRITERIA.md`

Defines objective completion criteria for:

* problem reproduction
* CAPACITY_GUARD
* Registry/Vault if retained
* integration
* tests
* benchmark
* frontend
* deployment
* demo
* documentation
* submission

`docs/DECISIONS.md`

Maintain a lightweight ADR-style chronological decision log.

For each important architectural decision record:

* date
* decision
* alternatives
* evidence
* reason
* consequences

Never silently change the core architecture.

`docs/RESEARCH_SOURCES.md`

Maintain primary-source research provenance including versions/SHAs.

`docs/STATUS.md`

This is the handoff file for future Codex sessions.

Keep it current and concise:

* current phase
* last completed milestone
* what currently works
* failing tests
* known technical risks
* next 3 highest-priority tasks
* blockers
* latest benchmark state
* latest deployment state

Update this after every meaningful milestone and before ending a long session.

`docs/MANUAL_ACTIONS.md`

Only put tasks here that genuinely require me or are unreliable/unsafe for Codex, e.g.:

* wallet funding/secrets
* ETHGlobal dashboard actions
* Discord messages
* sponsor conversations requiring my account
* X account/public posts
* manual narration/video recording
* approvals for publishing external repositories

For every manual task state:

* why it is needed
* when it becomes blocking
* exact steps I should perform
* what evidence/result Codex needs afterward

`docs/SUBMISSION_CHECKLIST.md`

Track the complete final submission package.

---

# 7. Create AquaQoS-specific project skills

Use Codex's current supported project skill convention.

Prefer project-local skills under:

`.agents/skills/`

Use progressive disclosure: small `SKILL.md`, with larger source-specific material under `references/` only when useful.

Do not make giant skills.

Create only high-value skills. A good starting set is:

### `aquaqos-protocol`

Trigger when designing or modifying Aqua, SwapVM, `CAPACITY_GUARD`, Registry/Vault architecture, shared-liquidity accounting, settlement, strategy lifecycle or Solidity protocol code.

Its instructions should require:

* current primary-source verification
* trace behavior into official source code
* explicit invariants
* no guessed interfaces
* tests alongside implementation
* careful distinction between Aqua virtual balances and real token inventory
* awareness of quote/swap consistency
* security-first external-call/state assumptions

### `aquaqos-validation`

Trigger for testing, fuzzing, benchmarking, invariant validation and security review.

Require:

* baseline reproduction before claiming a fix
* adversarial cases
* boundary cases
* fuzz/property tests where valuable
* comparisons against conservative Aqua and raw overcommitment
* never fabricate benchmark values
* retain reproducible raw results

### `aquaqos-submission`

Trigger during README, proof page, technical paper, architecture diagrams, demo preparation and final ETHGlobal submission.

Require:

* every technical claim traceable to code/test/source
* direct mapping to 1inch judging requirements
* concise judge-first communication
* real transaction evidence
* reproducible commands
* no empty marketing language

Validate each skill after creating it.

Do not create redundant skills simply to make the directory look sophisticated.

---

# 8. Configure project subagents where supported

Inspect the installed Codex version and use only currently supported configuration syntax.

Prefer repository-local subagents under:

`.codex/agents/`

Create focused reviewers rather than many overlapping agents.

At minimum consider:

### protocol-researcher

Read-only.

Purpose:

* inspect official 1inch code/docs
* challenge architecture assumptions
* map exact implementation paths
* identify prior art/conflicts

### security-reviewer

Read-only.

Purpose:

* review Solidity/SwapVM changes
* identify incorrect invariants, external-call assumptions, authorization issues, accounting errors and test gaps
* defect-first review
* never edit code

### benchmark-auditor

Read-only.

Purpose:

* challenge methodology
* detect biased workloads
* verify metrics
* distinguish measured results from assumptions
* ensure benchmark scripts are reproducible

Use the main/root agent as implementation owner unless a dedicated writer agent has a clear benefit.

Do not hardcode obsolete model names. Inspect the models/features actually available to this Codex installation and choose capable current models and reasoning levels appropriate to the role.

If subagents are unsupported or unstable in the installed version, document the fallback instead of forcing them.

---

# 9. Project-local Codex config

Only create:

`.codex/config.toml`

if the current Codex version supports the settings you intend to use and they materially improve this repository.

Keep it project-specific.

Good uses may include:

* project subagent registration
* safe concurrency limits
* project MCP configuration if truly needed

Do not put:

* secrets
* auth
* API keys
* personal/global preferences
* unnecessary feature flags

Do not overwrite my global configuration.

Validate the file using the installed Codex version after writing it.

---

# 10. MCP policy

Audit available MCPs first.

Do NOT install a large MCP bundle.

Native shell/git/GitHub CLI/current web search and official repositories may already be enough.

An MCP may be added only if you can state:

1. what exact recurring project task it solves
2. why built-in tools are insufficient
3. what context/tool-schema cost it introduces
4. whether it requires secrets
5. whether it is maintained/reliable

Potentially useful categories include documentation retrieval or browser/devtools testing, but do not assume they are necessary.

Do not add blockchain MCPs of uncertain provenance.

The core protocol should never depend on an MCP to build or test.

---

# 11. Technical source pinning

Determine the exact current compatible versions/releases/commits for:

* Aqua
* SwapVM
* SwapVM template
* Aqua SDK
* Solidity compiler
* Hardhat/Foundry as selected

The official SwapVM template is a strong candidate for the implementation baseline, but do not adopt it blindly.

Compare:

* using the official SwapVM template as our scaffold
* building around the packages directly
* any better current official starter

Choose the option that maximizes:

* official compatibility
* hackathon credibility
* implementation speed
* testability
* maintainability
* clarity of our custom modifications

Record the decision in `docs/DECISIONS.md`.

Pin dependencies/lockfiles appropriately.

Do not copy unrelated template functionality into the final product without understanding it.

Clearly preserve relevant third-party licenses/notices.

---

# 12. Core AquaQoS hypothesis to validate

The current working thesis is:

> Aqua enables multiple independently-accounted strategies to share real maker inventory. AquaQoS introduces guaranteed + burst liquidity scheduling so one strategy cannot consume shared capacity that must remain protected for sibling strategies.

The intended main primitive is:

`CAPACITY_GUARD`

But **do not assume our current design is technically correct**.

Your first engineering responsibility after bootstrap is to verify:

* the documented Aqua double-commitment/shared-inventory behavior
* whether and how virtual balances remain independently accounted across sibling strategies
* exact settlement behavior
* what information can be safely read during SwapVM execution
* quote/swap consistency constraints
* strategy enumeration/registration requirements
* whether CAPACITY_GUARD can be implemented cleanly as a custom SwapVM instruction
* whether a Registry and/or maker Vault is necessary
* whether execution-time cross-strategy reads are safe and gas-practical
* whether there are already official/native primitives solving enough of this that AquaQoS would become redundant
* whether a recent project already implements essentially the same solution

If the thesis fails this technical validation, do not hide it.

Record the evidence and propose the smallest defensible pivot.

---

# 13. Development discipline

Protocol correctness comes before frontend polish.

Priority order:

1. reproduce the real problem
2. specify invariants
3. implement smallest valid primitive
4. test it thoroughly
5. adversarial/security review
6. benchmark it
7. prove measurable value
8. integrate usable frontend
9. deployment/demo
10. final frontend polish
11. technical paper/docs
12. submission package

For frontend until the final pass:

* functional
* clear
* responsive enough
* visually clean
* no excessive animation
* no hours wasted on branding

Do not sacrifice contract/tests/benchmark quality for UI polish.

---

# 14. Milestone gates

Do not call a phase complete because code exists.

A milestone is complete only when:

* implementation exists
* relevant tests pass
* negative/adversarial paths are tested
* docs/status are updated
* important assumptions are validated
* reviewer findings are resolved or explicitly accepted
* coherent Git commit exists

For high-risk contract changes, use a separate read-only review pass before advancing.

Never change expected tests just to accommodate a broken implementation unless the specification itself has been proven wrong and the decision is documented.

---

# 15. Benchmark integrity

The benchmark is a first-class deliverable.

Eventually compare:

A. conservative Aqua allocation
B. naive/raw Aqua overcommitment
C. AquaQoS guaranteed + burst scheduling

Metrics should include where technically valid:

* shared liquidity ratio
* successful trading volume
* settlement/fill failure rate
* guarantee violations
* capital utilization
* unsafe trade rejections
* burst-capacity utilization
* gas overhead

Do not pick workloads solely because AquaQoS wins.

Document methodology and limitations.

Keep raw machine-readable results.

Never put illustrative numbers into final marketing as though they were measured.

---

# 16. Security and financial-code rules

Treat all smart-contract/accounting code as high risk.

Explicitly reason about:

* authorization
* strategy registration
* stale/unregistered sibling strategies
* reentrancy/external calls
* token behavior assumptions
* balance vs allowance
* atomic state changes
* race/sequential execution assumptions
* quote/swap divergence
* griefing/DoS
* reserve overconfiguration
* integer rounding
* zero/maximum boundaries
* duplicated strategy registration
* maker escape paths
* upgradeability assumptions
* gas-growth with strategy count

Never claim AquaQoS guarantees “solvency” or legal/financial safety unless that exact property is formally defined and proven.

Use precise language such as:

* protected capacity
* configured guarantee
* tested invariant
* settlement failure
* shared inventory

---

# 17. Work autonomously but surface real blockers

You are expected to take ownership.

Do not repeatedly ask me what to do next when the execution plan already answers it.

When one task requires manual input:

1. add it to `docs/MANUAL_ACTIONS.md`
2. continue every independent task you can
3. only interrupt me when the missing action becomes genuinely blocking

Ask concise questions only for choices that cannot be safely resolved from evidence.

Do not make public posts, publish repos, spend money, fund wallets, expose secrets or make irreversible external actions without approval.

---

# 18. Final submission must eventually contain

Plan the repository so we can reliably produce:

* working Aqua/SwapVM protocol implementation
* custom SwapVM functionality
* real token-transfer demonstration
* deterministic problem reproduction
* adversarial tests
* fuzz/property tests where useful
* reproducible benchmark
* usable web app
* `/proof` or equivalent judge-verification page
* clean public GitHub repo
* strong README
* architecture diagram
* threat model
* benchmark documentation
* concise 5–7 page technical paper if time permits
* deployment/demo scripts
* final contract addresses or local-fork reproduction
* 2–4 minute demo video package
* ETHGlobal description
* sponsor requirement mapping
* X/public launch assets only after technical package is ready

---

# 19. Bootstrap completion requirements

For THIS FIRST TURN:

1. audit the environment and current Codex capabilities
2. read the full winning-package markdown
3. research current official ETHOnline/1inch requirements
4. inspect current official Aqua/SwapVM/template/SDK sources sufficiently to establish the starting baseline
5. initialize/fix Git hygiene
6. create the durable project control-plane files
7. create only justified project-local skills
8. create only justified project-local agents/config
9. validate the Codex configuration you create
10. record exact primary sources and dependency/version candidates
11. produce the initial execution plan
12. create a coherent bootstrap Git commit if safe
13. update `docs/STATUS.md`

Do not spend this turn building the frontend.

Do not prematurely implement CAPACITY_GUARD before you have mapped the current SwapVM extension architecture well enough to know the intended integration point.

---

# 20. Restart handling

New skills, project agents or Codex configuration may require a Codex restart/relaunch before they are reliably active.

If your bootstrap changes require that:

* finish all bootstrap files
* validate them statically
* commit them
* clearly tell me a restart is required
* give the exact command/instruction for reopening Codex in this same repository
* stop before beginning core implementation

If no restart is required and all project-local capabilities are active, continue directly into the next phase:

> **Reproduce and characterize the Aqua shared-inventory/double-commitment problem using the exact official versions selected for AquaQoS.**

---

# 21. Final response for this bootstrap turn

When finished, report concisely:

### Environment

What tools/versions/capabilities were found.

### Created

What durable project files/config/skills/agents were created.

### Validated

Current ETHOnline + 1inch qualification requirements.

### Technical baseline

Exact Aqua/SwapVM/template/SDK versions or commit SHAs chosen or under consideration.

### Risks

Anything in the current AquaQoS thesis that already appears technically questionable.

### Git

Repository state and bootstrap commit.

### Manual actions

Only things I genuinely need to do.

### Next

Exact next technical milestone.

### Restart

Whether Codex must be restarted before continuing.

From this point onward, behave as the persistent AquaQoS technical lead and keep the repository itself sufficiently documented that a fresh Codex session can resume correctly by reading `AGENTS.md` and `docs/STATUS.md`.
