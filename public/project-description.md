# RELAY — Expert Know-How, Ready for Every Shift

**Track:** Real Estate — Keppel, AI HARVEST  
**Short blurb:** Expert know-how, safely reused across every building.

## Project Overview

RELAY turns experienced facilities operators' judgement into reusable, governed Intelligence Pills. The first scenario is an Asset Operations Manager handling an after-hours tenant cooling request: which cooling scope can serve the request, what evidence is needed, and when must the manager ask a site expert?

The working demonstration follows three fictional office buildings. Tower A has verified micro-zoning, known tenant entitlement and current operating evidence. Tower B has a shared air-handling unit; Tower C lacks verified isolation evidence. The same expertise may support a supervised recommendation in Tower A while refusing transfer to Tower B. Reuse means carrying the expert's conditions and limits into the next decision.

The target users are Asset Operations Managers, duty FM staff and senior facilities experts. Junior staff receive a structured decision path; experts retain control over the knowledge they contribute; managers can inspect the basis for a recommendation and approve changes. The goal is faster, more consistent supervised decisions with a clear trail of responsibility.

## Real-World Scenario Insights

Keppel's AI HARVEST challenge identifies expertise concentrated in a few people, lengthy onboarding, inconsistent application of best practices and knowledge loss when experienced staff leave. Those are the business problems RELAY addresses.

The cooling scenario is grounded in Keppel's January 2024 description of South Central, which includes micro-zoned air conditioning supporting after-hours and 24/7 tenants. This establishes a practical intersection between energy use, building capability and tenant service. It does not establish the fictional rules or outcomes in our demonstration. [Keppel South Central](https://www.keppel.com/realestate/Special-Features-Library/Keppel-South-Central---A-Sustainable-Workplace-for-the-Talents-of-Tomorrow)

BCA identifies growing building complexity, rising maintenance expectations and tight manpower constraints, and describes the value of integrating operations, workflows and data across portfolios. RELAY's opportunity is to make the reasoning behind an exception reusable across shifts and assets. [BCA, 7 July 2026](https://www1.bca.gov.sg/resources/newsroom/forum--integrated-facilities-management-designed-to-uplift-sector/)

Keppel already describes AI and machine learning in its Operations Nerve Centre. RELAY's proposed contribution is the capture, approval, testing and controlled transfer of exception expertise around those operational systems. [Keppel–Midea collaboration, 13 April 2026](https://www.keppel.com/infrastructure/news-item.aspx?aid=20443&title=keppel-and-midea-partner-to-collaborate-on-ai-enabled-modular-cooling-solutions-opportunities-across-asia)

All demonstration buildings, requests, people, transcripts, thresholds and outcomes are synthetic. The project does not claim an interview with a Keppel employee, access to Keppel operating data, or a validated deployment need at a particular asset. Real expert and user validation is the next step before a pilot.

## Comprehensive Solution Design

The implemented workflow has six views. Overview introduces the decision. Capture Studio uses a synthetic handover source and counterfactual questions to surface context, evidence, exceptions and escalation. Pill Library makes the resulting capability inspectable and portable. Incident Desk applies it to a tenant request. Replay Lab evaluates candidates against fixed cases. Governance controls release, feedback and rollback.

An Intelligence Pill contains its owner, provenance, context contract, required evidence, finite decision policy, guardrails and version. The context contract states where the expertise applies and what a new site must verify. Transfer to another building requires local capability and entitlement evidence; an imported pill cannot authorise its own use.

The demonstration uses a labelled synthetic interview to structure expertise, identify missing facts and formulate expert questions. The app and sample pills work standalone without a model API. Optional JSON import brings in a candidate from another source; imported output remains a draft and must satisfy schema validation, evaluation and human release requirements.

The authoring prompt pattern separates supplied facts from inference: extract only supported expertise; list unanswered questions; map it into the finite schema; preserve provenance and context; and leave approval to a person. Counterfactual questions probe when the advice would fail. This constrains AI-generated material before it reaches the deterministic evaluator.

The bounded runtime is deterministic and requires no model API. Operations, tenant-service and energy checks evaluate typed facts using a finite policy vocabulary. They produce reasons, missing evidence and a proposed supervised decision. They do not call a hidden model or control building equipment. React and Next.js provide a static frontend; a shared JavaScript domain module supports UI evaluation and Node-based tests. The public demonstration uses synthetic browser-local state.

Pill JSON is data only. Unknown fields, unsupported schemas, invalid values and executable content are rejected rather than interpreted. Approved policy versions, external fixed tests and release eligibility remain separate: a pill cannot rewrite the tests used to assess it. Critical failures veto promotion, and a change to the candidate requires a fresh evaluation. Feedback creates material for review; it does not silently alter the active policy. Release and rollback preserve the relationship between a decision and the version used.

This exceeds a chatbot or retrieval tool because the output is a structured capability with executable conditions, context limits, tests, human approval, replay and version history. Portability includes the schema, policy semantics, evidence references and test cases, so knowledge can be transferred independently of a particular model or vendor.

The demonstration's reviewer names simulate accountability; they are not identity verification or production access control. A production pilot would require real authentication and RBAC, server-side records, site-specific permissions, independent facilities expert validation and commissioning. Operational actions would remain behind the organisation's existing approval and safety procedures.

## Business Value

The strongest prototype measures are operational: disclosed acceptance-case pass counts, critical failures, refused invalid transfers, evidence completeness, release records and time to a supervised decision. These should be reported from actual runs, with the evaluated cases and failures visible. A finite synthetic test suite is evidence of behaviour on those cases, not a claim of production safety or model accuracy.

Observed prototype results: the baseline and corrected candidate each matched all 14 disclosed synthetic scenarios. The intentionally permissive mutation matched 12 of 14 and triggered four release-gate failures: two scenario regressions and two disabled safeguards. The 22 domain and regression tests passed, and the deployed browser walkthrough verified recommendation, refusal, clarification, release, feedback isolation, rollback and export. These are software-fixture results, not field validation or an accuracy claim about an AI model.

A supervised pilot would compare median handling time, senior-expert interruptions, appropriate escalation and first-time evidence completeness against the current workflow. Paired cases should include the time spent reviewing, correcting and maintaining pills. Released staff time is capacity value; cash savings require a corresponding change in paid work or costs.

The shipped illustrative counterfactual assumes 120 kW whole-floor power, 30 kW zone power, a 90-minute request and S$0.30/kWh: `(120 − 30) × 1.5 = 135 kWh`, or S$40.50. These are synthetic fixture assumptions, not Keppel telemetry, predicted savings or realised impact. The whole-floor alternative may not be valid for a particular asset. Energy arithmetic never overrides service, context or supervision requirements. A pilot would need equivalent service baselines, shared plant overhead, actual metering, contract tariffs and demand charges.

The intended business value is a growing, owned library of expert judgement that remains useful when staff change, while preserving the conditions under which that judgement is trustworthy.
