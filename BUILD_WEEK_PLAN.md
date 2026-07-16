# OpenAI Build Week Plan

> Status: implementation target, not a description of the current product  
> Track: Education  
> Deadline: July 21, 2026 at 5:00 PM Pacific Time  
> Product thesis: **Security judgment is a skill. Skills are learned through practice, not reminders.**

This document is the canonical implementation brief for adapting One Step Wrong to OpenAI Build Week. Preserve the original product principles in \`PLAN.md\`, but use this plan for hackathon scope, AI architecture, validation, demo preparation, and submission evidence.

## North Star

### Product category

**One Step Wrong — A Flight Simulator for Digital Judgment**

### One-sentence pitch

Most cybersecurity training asks whether students know the correct answer. One Step Wrong tests what they do when the unsafe option is faster, familiar, and embedded in a real task.

### Technical promise

**AI writes the simulation; code keeps it honest.**

GPT-5.6 turns an educator's threat brief, learning objective, or security policy into a structured simulation. A deterministic engine validates and runs the scenario, owns facts and outcomes, and records the learner's actions. GPT-5.6 then produces an evidence-grounded debrief without inventing scores or security facts.

## Award Story

AI is making digital deception evolve faster than schools can update static cybersecurity lessons. One Step Wrong closes that gap by turning emerging threats and school security guidance into playable, consequence-driven simulations.

Students are not told they are taking a security test. They complete ordinary work under realistic pressure: submit an assignment before a deadline, share a research folder, approve a login, or delegate a task to an AI agent. The convenient choice often works at first. Only later do the consequences surface.

Rather than showing a red X or ending the game, One Step Wrong asks students to investigate what happened, contain the incident, communicate with affected people, and recover safely. Students learn not only how to avoid an incident, but how to respond when prevention fails.

A teacher gives GPT-5.6 a threat brief, learning objective, or school policy. GPT-5.6 converts it into a structured simulation containing realistic decisions, evidence, delayed consequences, recovery actions, and multiple endings. The deterministic simulation engine validates and runs the result. Afterward, GPT-5.6 creates a personalized debrief grounded only in the learner's action trace and canonical scenario facts.

The current prototype proves the interaction model with unsafe Wi-Fi, oversharing, and MFA fatigue. The Build Week version must prove the AI loop by generating and immediately playing a new scenario, ideally involving an AI-era risk such as deepfake impersonation, unsafe agent delegation, prompt injection, or sensitive-data disclosure.

## Why This Is Not Another Security Quiz

Every scenario must preserve the following learning model:

1. Give the learner an ordinary goal, not a security assignment.
2. Introduce realistic pressure, ambiguity, and a genuinely convenient shortcut.
3. Do not label choices as safe, suspicious, correct, or recommended.
4. Let the convenient path appear to work before delayed consequences emerge.
5. Let the learner investigate and perform separate containment and recovery actions.
6. Reconstruct the causal chain without shaming the learner.
7. Connect the experience to a transferable judgment rule.

The product differentiator is not "AI plus cybersecurity." It is the combination of consequential simulation, delayed effects, recoverable failure, AI-assisted scenario creation, evidence-grounded personalization, and deterministic safety.

## Current Baseline

The repository already provides:

- Three complete playable cases.
- A reusable short-case definition and decision engine.
- A dedicated reducer for the deeper desktop simulation.
- Multiple endings derived from player behavior.
- Causal debriefs and replay paths.
- Unit, component, browser, and responsive-layout tests.
- A case registry that does not couple the product shell to concrete case IDs.

Do not rebuild these foundations. Extend them.

The current product does **not** yet provide:

- An OpenAI SDK dependency.
- A server-side GPT-5.6 integration.
- A teacher-facing scenario studio.
- Runtime validation for AI-generated definitions.
- An AI-generated personalized debrief.
- A deployed testing path for judges.
- Build Week documentation and evidence.

## Required Build Week Loop

The minimum convincing product loop is:

1. An educator opens **Scenario Studio**.
2. The educator supplies a threat topic, audience, ordinary task, learning objective, and optional policy text.
3. A server-only endpoint calls GPT-5.6.
4. GPT-5.6 returns a structured scenario matching a strict schema.
5. The application validates the result and reports actionable validation failures.
6. The educator previews the generated scenario in the existing decision engine.
7. A learner plays it and completes or partially completes recovery actions.
8. The deterministic engine selects the ending and produces a canonical action trace.
9. A server-only endpoint asks GPT-5.6 for a personalized debrief grounded in that trace.
10. The UI clearly distinguishes deterministic facts from AI-authored coaching.

The three-minute demo must show this loop working. Do not submit a fixed case while describing generation as future work.

## P0 Scope

### 1. Scenario Studio

Create a teacher-facing authoring route without replacing the playable case library as the default route.

Recommended fields:

- Threat topic.
- Target learner and age range.
- Ordinary task the learner is trying to complete.
- Environment and source of pressure.
- Learning objective.
- Optional trusted policy or guidance.
- Desired duration.
- Tone or difficulty.

The studio must support:

- Generate.
- Validation state.
- Human-readable validation errors.
- Editable preview or regeneration.
- Launch preview.
- A clearly labeled built-in example for reliable judging.

Persistence, accounts, collaboration, and a full content-management system are out of scope.

### 2. Structured Scenario Generation

Use the OpenAI Responses API with the exact GPT-5.6 model required by the event. Request structured output that maps to a runtime schema derived from the existing decision-case contract.

The generated contract should cover at least:

- Summary metadata.
- Intro and learner task.
- Decision context.
- Three unmarked options.
- Verified, caution, and incident routes.
- Delayed incident and evidence.
- Separate response steps.
- Multiple endings.
- Clues.
- Cause chains.
- Transfer rules.
- Correct recovery path.
- Source or policy references when provided.

Do not allow generated JavaScript, HTML, executable commands, live URLs, credentials, or arbitrary component names.

### 3. Runtime Validation

TypeScript types alone are not enough for model output. Add runtime validation.

Validation must reject or repair:

- Missing required routes or endings.
- Duplicate IDs.
- Empty choices or response actions.
- Invalid references between routes and endings.
- A "correct answer" revealed before the outcome.
- Incident routes without meaningful recovery actions.
- Outcomes determined only by a score.
- Real credentials, credential collection, downloads, or executable attack instructions.
- Unbounded text that breaks supported layouts.

Only validated definitions may enter the runner.

### 4. Deterministic Simulation

Keep these responsibilities outside the model:

- State transitions.
- Which events occurred.
- Required recovery actions.
- Ending selection.
- Scores, if any.
- Canonical evidence.
- Replay state.
- Safety and privacy enforcement.

A generated case may supply declarative content and rules, but it must run through deterministic code.

### 5. Evidence-Grounded Debrief

Create a canonical trace from deterministic state. It should contain stable event IDs and facts such as:

- Learner objective.
- Chosen option.
- Observed evidence.
- Triggered consequences.
- Completed recovery actions.
- Missed recovery actions.
- Deterministic ending.
- Transfer rules attached to the scenario.

GPT-5.6 may turn this trace into concise personalized coaching. It must not change the ending, add events, claim the learner performed an action they did not perform, or introduce security advice outside the supplied facts and trusted guidance.

If generation fails, fall back to the existing deterministic debrief.

### 6. Safe and Reliable Demo Path

Include at least one prefilled authoring example and one last-known-good generated fixture. A network or API failure must not make the entire product untestable.

The judge should be able to:

- Open a deployed URL.
- Generate or load the featured case.
- Play without an account.
- Reach a debrief.
- Understand where GPT-5.6 was used.
- Understand which parts remain deterministic.

## Recommended AI-Era Featured Case

Use one case that is visibly different from the three existing stories.

Recommended concept: **"Can You Send It Now?"**

- Ordinary task: a student organization treasurer must reimburse a guest speaker before an event begins.
- Pressure: a voice message that sounds like the faculty adviser requests an urgent account change.
- Convenient path: trust the familiar voice and update payment details immediately.
- Safer friction: verify through a known second channel.
- Delayed consequence: the payment request, shared documents, or account recovery path begins to change.
- Recovery: pause payment, revoke access, preserve evidence, notify affected people, and report through the appropriate institutional channel.
- Transfer rule: familiarity of voice is not proof of identity; bind high-impact actions to a verified channel.

Keep the scenario fictional. Do not reproduce a real person's voice, identity, school, brand, payment details, or attack instructions.

An unsafe-agent scenario is also acceptable if it can be explained and demonstrated more clearly.

## Brand and IP Direction

The hackathon demo and video should use a fictional institution and generic product names unless explicit permission exists for third-party marks.

Suggested migration:

- NYU -> Northbridge University.
- Brightspace -> CourseHub.
- NYU Drive -> Campus Drive.
- Duo -> Secure Push.
- NYU Violet -> a distinct Northbridge accent palette.

Do not copy logos, exact trade dress, proprietary assets, or real domains. Preserve the ordinary-student context while removing dependency on external brands.

This migration is part of submission safety, not the core AI feature. Keep it bounded and avoid redesigning the product.

## Proposed Architecture

Recommended ownership:

- \`src/app/studio/\`: Scenario Studio route and page composition.
- \`src/app/api/scenarios/generate/\`: server-only GPT-5.6 generation endpoint.
- \`src/app/api/debrief/\`: server-only personalized-debrief endpoint.
- \`src/ai/\`: prompts, OpenAI client, schemas, validation, sanitization, and typed adapters.
- \`src/engine/decision/\`: deterministic runner, reducer, selectors, and canonical trace.
- \`src/cases/generated/\` or an in-memory preview adapter: validated generated case wrapper.
- \`src/fixtures/\`: reviewed last-known-good generated examples for tests and demo fallback.

Exact filenames may follow the existing conventions. Do not place OpenAI calls inside React components, reducers, selectors, or case definitions.

## Security and Privacy Boundaries

The Build Week version permits narrowly scoped server-side OpenAI requests. All other existing safety boundaries remain.

Required:

- Keep the API key server-side.
- Never expose it through \`NEXT_PUBLIC_*\`, client code, browser storage, URLs, or logs.
- Do not send real credentials, personal data, student records, or real incident reports.
- Use fictional or deliberately sanitized authoring examples.
- Do not call real campus services.
- Do not persist learner traces by default.
- Avoid logging raw prompts, policy text, model output, or action traces.
- Apply input length limits and request timeouts.
- Return generic errors to the browser; keep secrets out of error payloads.
- Make AI-authored content reviewable before publishing.
- Preserve a deterministic fallback when the API is unavailable.

## Explicit Non-Goals

Do not spend Build Week on:

- A generic cybersecurity chatbot.
- An AI tutor floating over every screen.
- User accounts or school SSO.
- A production database or learning-management-system integration.
- Real phishing delivery.
- Credential collection.
- Voice cloning.
- Real device, network, browser-session, or payment operations.
- AI-determined scores or endings.
- A drag-and-drop visual scenario editor.
- Infinite branching.
- Rewriting all three existing cases through AI.
- A large marketing landing page.

## Acceptance Criteria

### Scenario generation

- A reviewer can generate a new case from a short brief.
- Output is structured and runtime-validated.
- Invalid output cannot enter the runner.
- Generated choices are unmarked before outcomes.
- Every incident has separate containment or recovery steps.
- The featured case renders without overflow at its supported viewport.
- Generation errors have a working recovery or fixture path.

### Simulation

- Safe, caution, contained, and expanded outcomes are testable where applicable.
- The same validated definition and action sequence always produce the same deterministic ending.
- Replay produces fresh state.
- No model call is required for state transitions.

### Debrief

- The personalized debrief references only canonical trace facts.
- It accurately distinguishes completed and missed actions.
- It does not override the deterministic ending.
- The existing deterministic debrief remains available.
- Model failure does not block completion.

### Security

- No API key appears in client assets or repository history.
- No real service is contacted.
- No prompt or trace is stored in browser persistence.
- Generated content cannot inject HTML or executable code.
- Inputs and outputs have bounded sizes.

### Documentation and judging

- README explains where Codex accelerated development.
- README explains exactly what GPT-5.6 does.
- README distinguishes pre-existing foundations from Build Week work.
- Setup instructions include required environment variables without including secrets.
- A deployed demo or frictionless test path exists.
- The primary Codex build thread has a \`/feedback\` Session ID.
- The final video is public, no longer than three minutes, and includes English narration or an English translation.
- Repository access matches the event rules.

## Testing Plan

Add tests proportional to the new risk:

- Schema accepts a complete fixture and rejects malformed output.
- Validation rejects duplicate IDs, invalid routes, and missing recovery actions.
- Validation rejects executable or credential-collection content.
- API routes reject oversized or malformed requests.
- OpenAI client is mocked in automated tests.
- Generated fixture completes safe and incident paths.
- Canonical trace is stable and contains no extra personal data.
- Debrief prompt receives only allowed facts.
- Hallucinated debrief facts are not accepted or displayed as canonical.
- API failure falls back cleanly.
- Browser test covers studio -> preview -> decision -> recovery -> debrief.
- Existing cases and current quality gates continue to pass.

Before completion:

- \`npm run lint\`
- \`npm run typecheck\`
- \`npm test\`
- \`npm run build\`
- \`npm run test:e2e\`

## Implementation Order

1. Reconcile the runtime scenario type with a strict generation schema.
2. Add reviewed generated fixtures and validation tests before making live API calls.
3. Add the server-only OpenAI client and generation endpoint.
4. Build the smallest coherent Scenario Studio form.
5. Adapt validated output into the existing runner.
6. Define the canonical action trace.
7. Add the personalized debrief endpoint and deterministic fallback.
8. Implement the featured AI-era case through the generation flow.
9. Apply the bounded fictional-brand migration.
10. Add E2E coverage, deployment configuration, and screenshots.
11. Update README files with actual—not planned—capabilities and test counts.
12. Run the complete quality gate.
13. Record the demo and finish submission evidence.

Prefer a complete vertical slice over many partial AI features.

## Three-Minute Demo Outline

### 0:00-0:20 — Problem

"Security judgment is a skill. Skills are learned through practice, not reminders. Most cybersecurity training asks whether students know the correct answer. One Step Wrong tests what they do when the unsafe option is faster."

### 0:20-0:50 — GPT-5.6 generation

Open Scenario Studio. Use the prefilled deepfake-impersonation brief. Generate the case and briefly show the structured, validated preview.

### 0:50-1:55 — Play

Launch the case. Show the ordinary task, the convenient decision, apparent success, delayed consequence, and two or three distinct recovery actions.

### 1:55-2:25 — Personalized debrief

Show the deterministic ending and the GPT-5.6 explanation grounded in the actions actually taken.

### 2:25-2:45 — Trust architecture

Explain: "GPT-5.6 creates and personalizes. Our deterministic engine owns facts, state, and outcomes. AI writes the simulation; code keeps it honest."

### 2:45-3:00 — Impact

Show the existing library and explain that the same system can turn new threats and trusted school guidance into playable practice.

## Submission Copy

### Title

**One Step Wrong — A Flight Simulator for Digital Judgment**

### Tagline

**AI writes the simulation; code keeps it honest.**

### Short description

One Step Wrong turns emerging digital risks into playable, consequence-driven simulations. Students complete ordinary tasks under realistic pressure, experience how one convenient choice can escalate into an incident, and practice investigating, containing, communicating, and recovering safely. GPT-5.6 transforms an educator's threat brief into a validated branching scenario and produces an evidence-grounded debrief from each learner's actual action trace, while a deterministic engine keeps facts, scoring, and outcomes consistent and auditable.

### Proof statement

The prototype must show GPT-5.6 generating a scenario that did not previously exist in the repository, immediately run that scenario through the existing engine, and produce a debrief tied to the demonstrated action trace.

## Definition of Done

The Build Week adaptation is done only when:

- The featured AI-era scenario can be generated and played end to end.
- GPT-5.6 usage is visible, meaningful, and non-decorative.
- Deterministic state owns facts and outcomes.
- A judge can test the product without rebuilding it.
- The product remains safe when the model or network fails.
- Documentation describes the implementation truthfully.
- The final demo proves the complete loop within three minutes.
- All quality gates pass.
