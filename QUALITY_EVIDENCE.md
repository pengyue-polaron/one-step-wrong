# Quality Evidence

This document maps product claims to reproducible repository evidence. It tracks what the application and automated tests demonstrate today, without treating planned integrations or external services as completed work.

## Current Evidence

| Product claim | Reproducible evidence | Status |
| --- | --- | --- |
| Cited institution profile with human approval | `/studio`, source-review tests, exact-brand authorization, authoritative-domain, HTTPS, and same-request source evidence tests | Verified |
| Runtime-validated scenario compilation | `src/ai/schemas/scenario.ts`, `src/ai/scenarios/generate.ts`, malformed-output tests | Verified |
| Development-only Codex fallback | Explicit opt-in and production lockout, reviewed-topology matching, protected-copy validation, isolated temporary runtime, tool-backed request rejection, Zod revalidation, API runtime provenance, and a real `npm run verify:codex` check | Verified in unit/API tests; live check requires local Codex login |
| Approved-source lineage survives fictionalization | Scenario Studio source-to-scenario trace from approved profile to published setting | Verified |
| Every declared outcome is legally reachable | `src/engine/simulation/coverage.ts`, generation rejection tests, and Studio outcome-coverage preview | Verified |
| Bounded adaptive dialogue | `src/ai/simulation/turn.ts`, minimum-context, leakage, invalid-event, and timeout tests | Verified with mocked provider output |
| Free text cannot perform high-impact actions | Studio browser tests and simulation physics tests | Verified |
| Explicit actions, trigger-bound recovery, contained final state, outcomes, and replay | `src/engine/simulation/physics.ts`, schema and prerequisite tests, and complete safe/incident browser routes | Verified |
| A first verification channel is chosen under pressure and each alternative has distinct evidence | `src/fixtures/voiceYouKnow.ts`, exclusive-action physics, simulation tests, desktop and mobile evidence-board flows | Verified |
| Access audience and permission scope are independently practiced | `src/fixtures/sharingScope.ts`, exclusive-action physics, direct route, layered access/content recovery, and browser flow | Verified |
| Task access is separated from account-recovery authority | `src/fixtures/recoveryWindow.ts`, exclusive verification/access choices, device/session evidence, direct route, and safe/contained browser flows | Verified |
| Unsafe actions produce delayed, inspectable consequences | Action-delivered dialogue, inspection prerequisites, and incident browser flow | Verified |
| Containment restores every affected operational layer | Schema checks, payment-hold and access-revocation physics tests, facilitator final-state report | Verified |
| Review is grounded in recorded actions | Debrief adapter, route tests, and the safe and incident browser paths | Verified |
| Immediate new-context application before explicit rule reveal | Three-outcome transfer validation, direct evaluation tests, ordering assertions, desktop and mobile browser paths | Verified as a formative signal |
| Evidence-grounded learner questions | `src/ai/debrief/evidenceCoach.ts`, citation-boundary tests, `/api/coach`, and the browser debrief flow | Verified with reviewed fallback and mocked provider output |
| Discussion-ready facilitator report | Rehearsal result, transfer evidence, 5-minute Ask → Compare → Apply path, aggregate-only observation cue, approved guidance, print layout, and browser assertions | Verified |
| Ready-to-run classroom use | Bilingual `FACILITATOR_GUIDE.md` with 10–35 minute formats and discussion prompts | Documented |
| Privacy-preserving formative pilot readiness | Header-only aggregate template, defined measures, strict validation, aggregate-only output, and analyzer tests in `pilot/`, `scripts/analyze-pilot.mjs`, and `src/pilot/analyze-pilot.test.ts` | Documented and validated; no participant results collected |
| Featured rehearsal is immediately playable | Case-library entry and direct `/rehearsal` browser path | Verified |
| Complete no-key product path | **Use example institution**, then **Use example rehearsal** in `/studio` | Verified |
| Desktop and mobile product quality | Sequenced reviewed path, honest long-operation status, explicit review readiness, phone task/conversation switcher, responsive facilitator path, `artifacts/screenshots/`, and Playwright layout tests | Verified |
| Authoring form and error ergonomics | Named form controls, segmented-control state, source-review validation, focused actionable errors, and browser assertions | Verified |
| Core accessibility states | Axe serious/critical gate, skip navigation, stage focus, modal focus isolation, toggle semantics, and reduced-motion tests | Verified by automated checks; not a certification |
| Automated quality gate | `.github/workflows/ci.yml` | Runs on `main` |

## Local Verification

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run verify:ai
npm run build
npm run test:e2e
npm run pilot:analyze -- pilot/templates/session-aggregate.csv
```

The current suite covers all three reviewed direct entries, the case library, Studio authoring and the bounded label-editor state, source lineage, outcome coverage, delayed consequences, payment/access/content recovery, account-device revocation, the evidence board, immediate new-context application, Evidence Coach, facilitator reporting, keyboard focus, serious/critical Axe checks, modal isolation, desktop layout boundaries, and 390x844 phone task/conversation flows. Component tests separately verify which label fields remain editable and which narrative fields stay locked.

When a server is running with `OPENAI_API_KEY`, `npm run verify:live` requires live provenance for institution research, scenario generation, role dialogue, trace-grounded review, and Evidence Coach. It fails if any path falls back to reviewed content.

When a development server is running with `CODEX_LOCAL_PROVIDER=1` and an authenticated `codex login`, `npm run verify:codex` checks reviewed-topology matching and copy adaptation, role dialogue, debrief, and Evidence Coach through the local adapter. Institution research deliberately stays on the reviewed profile because Codex does not supply the same-request Web Search source evidence required by this product.

## Manual Product Review

For meaningful interface changes:

1. Start from the case library rather than a development-only route.
2. Complete one safe rehearsal and one incident-and-recovery rehearsal.
3. Confirm that choices remain unmarked before selection.
4. Confirm that evidence appears when discovered and remains understandable on a phone.
5. Check that the review matches the actions actually completed.
6. Enter the new situation before revealing the built-in rule, then compare all three transfer outcomes.
7. Use Evidence Coach only after the new-context action is recorded.
8. Open the facilitator report and confirm its action sequence, final state, evidence, guidance, and print view.
9. Inspect accepted screenshots at 1366x768 and 390x844.

## Evidence Boundaries

- A local or mocked provider test does not prove a live provider request.
- A passing build does not prove a hosted environment.
- Reviewed examples prove the complete product path, not the behavior of an external model.
- Screenshots support visual review but do not replace browser assertions.
- The pilot template, analyzer, and synthetic unit-test inputs are evaluation infrastructure, not participant evidence.
- No pilot result or learning-effect claim exists until real sessions occur and a reviewed aggregate is reported with its sample and limitations.
- Capability claims in `README.md` must match working code and automated evidence.
