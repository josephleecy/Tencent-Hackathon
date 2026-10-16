# RELAY

**Expert Know-How, Ready for Every Shift**

Expert know-how, safely reused across every building.

RELAY is a working prototype for the Keppel Real Estate Track / AI HARVEST challenge at the AI CAN DO IT Tencent Cloud AI Singapore Hackathon 2026. It captures expert reasoning in portable Intelligence Pills and checks when that knowledge can be reused across buildings.

- [Open the working project](https://relay-lime-alpha.vercel.app/)
- [Watch the narrated demo](https://relay-lime-alpha.vercel.app/demo/)
- [Project description](output/submission/project-description.md)
- [Solution diagram deck](output/submission/RELAY-solution-diagram.pptx)
- [Showcase cover](output/submission/relay-cover-upload.jpg)

## Walkthrough

1. Capture Studio shows a synthetic expert interview and a structured draft pill.
2. Pill Library exposes context, evidence, rules and guardrails.
3. Incident Desk compares a cooling request across three fictional buildings: a verified independent zone, a shared air-handling unit and unknown isolation.
4. Replay Lab tests proposed changes against fixed cases. Critical failures prevent release.
5. Governance demonstrates review, version release, feedback isolation, rollback and portable JSON export.

## Run locally

Use Node.js 22 or newer and pnpm 11.25.0.

```sh
pnpm install
pnpm test
pnpm dev
```

`pnpm build` exports the static site to `out/`. Vercel deploys the main branch with an empty base path. The optional GitHub Pages deployment supplies `NEXT_PUBLIC_BASE_PATH=/Tencent-Hackathon`.

## Prototype scope

Buildings, people, expert excerpts and telemetry are synthetic. Specialist checks are deterministic and make no live language-model calls. The app supports supervised recommendations and has no building-control endpoint.

Reviewer names and browser-local records simulate governance. Production adoption requires authenticated permissions, durable server records, qualified facilities experts and a supervised site pilot. Energy comparisons are illustrative arithmetic, not achieved or predicted savings.

## Project files

| Path | Contents |
|---|---|
| `app/`, `components/` | Next.js application and workflow views |
| `lib/` | Pill schema, policy interpreter and synthetic examples |
| `tests/` | Domain and regression checks |
| `docs/architecture.md` | Final system architecture |
| `output/submission/` | Final showcase materials |
| `public/` | Assets served by the project site |

The cooling scenario references [Keppel South Central's published micro-zoned cooling capabilities](https://www.keppel.com/realestate/Special-Features-Library/Keppel-South-Central---A-Sustainable-Workplace-for-the-Talents-of-Tomorrow). No Keppel endorsement or operating-data access is implied.
