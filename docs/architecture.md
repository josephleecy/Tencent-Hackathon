# RELAY architecture

The static Next.js frontend has six views: Overview, Capture Studio, Pill Library, Incident Desk, Replay Lab and Governance. `components/Workspace.jsx` owns browser-local demonstration state and calls the shared ESM domain functions in `lib/relay.mjs`. `lib/fixtures.mjs` supplies explicitly synthetic expert material, buildings, incidents and immutable evaluation cases.

Capture/import produces a schema-validated draft. Its finite context, evidence and policy fields are interpreted as data; executable code and unknown fields are rejected. Operations, tenant-service and energy perspectives produce a supervised recommendation, escalation or missing-evidence clarification. No runtime model API or building actuator is connected.

Candidate mutation changes the policy while keeping evaluation cases fixed. Eight replay cases and six acceptance cases expose regressions. Critical failures veto release. Review binds the current payload to its evaluation and requires a named simulated reviewer. Local records preserve feedback separately from active policy, version history, sequential rollback and JSON export, including drafts. Corrupt saved records reset safely.

The expertise-capture prompt pattern extracts supported conditions, separates inference, asks counterfactual questions and preserves provenance. Runtime specialist checks are deterministic. The system therefore demonstrates governed expertise reuse without claiming live autonomous model coordination or real facilities validation.

Public hosting uses a Next.js static export on GitHub Pages. GitHub Actions installs the pinned dependencies, runs domain tests, builds the export and deploys it. No secret credentials are included in source or static assets. Production adoption would require authenticated server-side governance, real expert verification and a supervised site pilot; reviewer names and browser storage are demonstration features.

The editable solution deck and project description expand the business workflow, provenance and pilot metrics. All demonstration data is synthetic; operational use requires independent expert validation.
