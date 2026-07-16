# Build Week Evidence and Demo Runbook

This document maps the Build Week product claims to reproducible evidence. It does not treat a local implementation as proof of deployment, a live model call, repository access, feedback, or video publication.

## Current Evidence

| Requirement | Reproducible evidence | Status |
| --- | --- | --- |
| Cited institution profile with human approval | `/studio`, source review tests, exact-brand authorization, authoritative-domain, HTTPS, and same-call Web Search URL evidence tests | Verified offline |
| Runtime-validated scenario compilation | `src/ai/schemas/scenario.ts`, `src/ai/scenarios/generate.ts`, malformed-output tests | Verified offline |
| Bounded Director and role performance | `src/ai/simulation/turn.ts`, minimum-context, leakage, invalid-event, and timeout tests | Verified with mocked model output |
| Free text cannot mutate canonical state | Studio browser tests and simulation physics tests | Verified |
| Deterministic actions, affected-layer recovery, endings, and replay | `src/engine/simulation/physics.ts`, prerequisite/API tests, and all-ending tests | Verified |
| Trace-grounded debrief with fallback | `src/ai/debrief/createDebrief.ts` and route tests | Verified with mocked model output and fixture fallback |
| Complete no-key judging path | **Load reviewed example** in `/studio` | Verified locally |
| Desktop and mobile product quality | `artifacts/screenshots/` and Playwright layout tests | Verified locally and in CI |
| Automated quality and production-container gate | `.github/workflows/ci.yml` | Runs on `main`; production image verified locally |
| Real GPT-5.6 Responses API execution | Requires a valid server-side `OPENAI_API_KEY` | Pending external credential |
| Public demo URL | Requires deployment credentials | Pending external credential |
| Event-compliant repository access | Repository is currently private | Pending owner decision |
| Codex `/feedback` Session ID | Must be submitted from the primary Codex thread | Pending external action |
| Public video, at most three minutes | Must be recorded and published | Pending external action |

Run the full local gate with:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

## Three-Minute Demo

Record at 1440×900 or 1920×1080. Use the reviewed example for the reliable take; record a separate live-model take when the server key is available. Keep the mode badge visible so fixture output is never presented as live GPT-5.6 output.

### 0:00-0:20 - Problem and promise

Show the case library, then open `/studio`.

> Security judgment is a skill, but most training reveals the answer before learners feel the pressure. One Step Wrong turns a school's public guidance into a living rehearsal. Agents perform the world; deterministic code defines its physics.

### 0:20-0:50 - Research and human approval

Select **Load reviewed example**. Show the official source links, confidence labels, research warning, explicit unknown, and source-review controls, then approve the profile.

> The Institution Research Agent produces a structured, cited profile from official public guidance. Unknowns stay unknown, and an educator reviews the facts before generation. Public demos compile into a fictional institution to protect brand and identity.

### 0:50-1:15 - Validated scenario compilation

Generate the scenario and briefly show the ordinary task, immutable facts, bounded roles, critical actions, recovery requirements, and validation state.

> The Scenario Architect converts only the approved profile and teaching brief into a validated scenario package. It cannot generate executable code, new tools, or unbounded roles. Invalid packages never enter the runner.

### 1:15-2:10 - Adaptive people, deterministic actions

Launch the rehearsal. Ask the apparent adviser an unscripted question. Then use the independent adviser channel, inspect evidence, and choose explicit actions. For the incident path, approve first, then preserve evidence, pause the payment, revoke access, notify affected people, and report.

> GPT-5.6 performs the people and pressure, but free text cannot approve a payment or change the incident truth. The Director selects only allowlisted events, each role receives minimum context, and every high-impact action passes through a deterministic reducer.

### 2:10-2:40 - Consequence, recovery, and debrief

Complete the run and show the ending, ordered action trace, completed and missed recovery actions, source guidance, and transfer rule.

> The same critical action sequence always produces the same ending, even when the conversation changes. The Debrief Analyst may personalize the explanation, but it can use only the canonical trace and approved guidance.

### 2:40-3:00 - Reliability and technical proof

Show the fallback badge, the GitHub Actions run, and the architecture diagram in `README.md`.

> Every model boundary has runtime validation, timeouts, and a reviewed fallback, so judges can complete the experience without a key or network. The repository includes schema, API, state, component, browser, and responsive-layout tests.

## Recording Checklist

- Capture one unscripted learner message and its in-character reply.
- Show at least one source citation and one explicit unknown.
- Show that typed critical actions, not chat text, change canonical state.
- Reach an ending and display the grounded debrief.
- Keep live and fixture badges visible and describe them accurately.
- Include English narration or English subtitles.
- Keep the published cut at or below three minutes.
- Verify the public video and demo links in a signed-out browser.
- Record the `/feedback` Session ID in the submission form, not in source code.

## External Completion Order

1. Add `OPENAI_API_KEY` only to the server deployment environment and capture a real GPT-5.6 research, generation, turn, and debrief run.
2. Deploy the fixture-capable build and verify the complete path in a signed-out browser.
3. Change repository access only after confirming the event's current rules and the owner's intent.
4. Submit `/feedback` from the primary Codex build thread and retain the Session ID.
5. Record, caption, publish, and independently open the final video.
