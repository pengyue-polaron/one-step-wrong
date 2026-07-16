# Quality Evidence

This document maps product claims to reproducible repository evidence. It tracks what the application and automated tests demonstrate today, without treating planned integrations or external services as completed work.

## Current Evidence

| Product claim | Reproducible evidence | Status |
| --- | --- | --- |
| Cited institution profile with human approval | `/studio`, source-review tests, exact-brand authorization, authoritative-domain, HTTPS, and same-request source evidence tests | Verified |
| Runtime-validated scenario compilation | `src/ai/schemas/scenario.ts`, `src/ai/scenarios/generate.ts`, malformed-output tests | Verified |
| Bounded adaptive dialogue | `src/ai/simulation/turn.ts`, minimum-context, leakage, invalid-event, and timeout tests | Verified with mocked provider output |
| Free text cannot perform high-impact actions | Studio browser tests and simulation physics tests | Verified |
| Explicit actions, affected-layer recovery, outcomes, and replay | `src/engine/simulation/physics.ts`, prerequisite tests, and complete safe/incident browser routes | Verified |
| Competing verification channels reveal distinct evidence | `src/fixtures/voiceYouKnow.ts`, simulation tests, desktop and mobile evidence-board flows | Verified |
| Review is grounded in recorded actions | Debrief adapter, route tests, and the safe and incident browser paths | Verified |
| New-context learning transfer | Three-outcome transfer validation, direct evaluation tests, desktop and mobile browser paths | Verified |
| Complete no-key product path | **Use example institution**, then **Use example rehearsal** in `/studio` | Verified |
| Desktop and mobile product quality | `artifacts/screenshots/` and Playwright layout tests | Verified |
| Automated quality gate | `.github/workflows/ci.yml` | Runs on `main` |

## Local Verification

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

The current suite contains 83 schema, API, state, and component tests plus 14 browser tests. Browser coverage includes the case library, all published case routes, Scenario Studio authoring, safe and incident rehearsal paths, the evidence board, review, transfer, desktop layout boundaries, and 390x844 phone flows.

## Manual Product Review

For meaningful interface changes:

1. Start from the case library rather than a development-only route.
2. Complete one safe rehearsal and one incident-and-recovery rehearsal.
3. Confirm that choices remain unmarked before selection.
4. Confirm that evidence appears when discovered and remains understandable on a phone.
5. Check that the review matches the actions actually completed.
6. Apply the rule in the new situation and compare all three transfer outcomes.
7. Inspect accepted screenshots at 1366x768 and 390x844.

## Evidence Boundaries

- A local or mocked provider test does not prove a live provider request.
- A passing build does not prove a hosted environment.
- Reviewed examples prove the complete product path, not the behavior of an external model.
- Screenshots support visual review but do not replace browser assertions.
- Capability claims in `README.md` must match working code and automated evidence.

