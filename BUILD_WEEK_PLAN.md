# OpenAI Build Week Plan

> Status: implementation target, not a description of the current product  
> Track: Education  
> Deadline: July 21, 2026 at 5:00 PM Pacific Time  
> Product thesis: **Security judgment is a skill. Skills are learned through practice, not reminders.**

This document is the canonical implementation brief for adapting One Step Wrong to OpenAI Build Week. Preserve the original product principles in `PLAN.md`, but use this plan for hackathon scope, AI architecture, validation, demo preparation, and submission evidence.

## North Star

### Product category

**One Step Wrong — A Flight Simulator for Digital Judgment**

### One-sentence pitch

Most cybersecurity training asks whether students know the correct answer. One Step Wrong tests what they do when the unsafe option is faster, familiar, and embedded in a real task.

### Technical promise

**AI writes the simulation; code keeps it honest.**

Give One Step Wrong a school name or official domain. A GPT-5.6 research agent searches public official sources and builds a cited Institution Profile covering the school's learning platform, identity and MFA flow, file-sharing tools, wireless environment, security guidance, and reporting channels. After educator review, GPT-5.6 turns that approved profile plus a learning objective into a structured simulation. A deterministic engine validates and runs the scenario, owns facts and outcomes, and records the learner's actions. GPT-5.6 then produces an evidence-grounded debrief without inventing scores or security facts.

## Award Story

AI is making digital deception evolve faster than schools can update static cybersecurity lessons. Generic training also misses an important truth: every institution has its own learning platform, login flow, sharing tools, wireless names, support channels, and language for reporting an incident.

One Step Wrong turns a school name into a source-grounded, school-aware simulation. Its Institution Research Agent searches public official pages, extracts only verified operational context, attaches citations and confidence, and asks an educator to approve the profile before generation. The Scenario Agent then combines that profile with an emerging threat and learning objective to create a playable, consequence-driven exercise.

Students are not told they are taking a security test. They complete ordinary work under realistic pressure: submit an assignment before a deadline, share a research folder, approve a login, or delegate a task to an AI agent. The convenient choice often works at first. Only later do the consequences surface.

Rather than showing a red X or ending the game, One Step Wrong asks students to investigate what happened, contain the incident, communicate with affected people, and recover safely. Students learn not only how to avoid an incident, but how to respond when prevention fails.

An educator can start with only an institution name and a threat topic. GPT-5.6 first creates a cited Institution Profile from official public sources. After human approval, it converts the profile, threat brief, and learning objective into a structured simulation containing institution-appropriate tools, realistic decisions, evidence, delayed consequences, recovery actions, and multiple endings. The deterministic simulation engine validates and runs the result. Afterward, GPT-5.6 creates a personalized debrief grounded only in the learner's action trace, canonical scenario facts, and approved sources.

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

The product differentiator is not "AI plus cybersecurity." It is the combination of cited institution research, school-aware scenario compilation, consequential simulation, delayed effects, recoverable failure, evidence-grounded personalization, human approval, and deterministic safety.

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
- A source-grounded Institution Research Agent.
- A cited, reviewable Institution Profile.
- A teacher-facing scenario studio.
- Runtime validation for AI-generated definitions.
- An AI-generated personalized debrief.
- A deployed testing path for judges.
- Build Week documentation and evidence.

## Required Build Week Loop

The minimum convincing product loop is:

1. An educator opens **Scenario Studio** and enters a school name or official domain.
2. A server-only GPT-5.6 research agent searches public official sources.
3. The agent returns a structured Institution Profile with source URLs, access dates, confidence, and explicit unknowns.
4. The application verifies source domains, validates the profile, and asks the educator to approve or edit it.
5. The educator adds a threat topic, audience, ordinary task, and learning objective.
6. A server-only GPT-5.6 scenario agent combines the approved profile and teaching brief.
7. GPT-5.6 returns a structured scenario matching a strict schema and carrying relevant source references.
8. The application validates the result and reports actionable validation failures.
9. The educator previews the generated scenario in the existing decision engine.
10. A learner plays it and completes or partially completes recovery actions.
11. The deterministic engine selects the ending and produces a canonical action trace.
12. A server-only endpoint asks GPT-5.6 for a personalized debrief grounded in that trace and the approved profile.
13. The UI clearly distinguishes sourced institution facts, deterministic simulation facts, and AI-authored coaching.

The three-minute demo must show this loop working. Do not submit a fixed case while describing generation as future work.

## P0 Scope

### 1. Institution Research Agent

The educator may begin with an institution name and, when known, one or more official domains. GPT-5.6 may use web search to locate current public official information.

The research output must be a runtime-validated `InstitutionProfile` containing:

- Institution display name and official domains.
- Learning-management platform.
- Identity, login, and MFA terminology.
- File-sharing and collaboration tools.
- Wireless names and public connection guidance.
- Security support and incident-reporting routes.
- Relevant student-facing policy language.
- Source URL, title, publisher, access time, and the fact each source supports.
- Confidence and unresolved fields.

Research rules:

- Prefer the institution's official domains, then primary vendor documentation.
- Never infer a system from search snippets alone.
- Every institution-specific fact shown in a scenario must trace to an approved source.
- Unknown must remain unknown; the model must not fill gaps with a plausible guess.
- Do not browse authenticated pages, portals, directories, people profiles, student records, or internal systems.
- Do not test logins, forms, Wi-Fi, reporting addresses, or service endpoints.
- Present the profile to an educator for review before scenario generation.
- Support a reviewed fixture so the demo does not depend entirely on live search.

### 2. Scenario Studio

Create a teacher-facing authoring route without replacing the playable case library as the default route.

Recommended fields:

- Institution name.
- Official domain or reviewed Institution Profile.
- Exact-brand or brand-safe fictionalized publication mode.
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

### 3. Structured Scenario Generation

Use the OpenAI Responses API with the exact GPT-5.6 model required by the event. The research phase may use web search; the scenario phase must consume only the educator-approved Institution Profile and teaching brief. Request structured output that maps to a runtime schema derived from the existing decision-case contract.

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
- Source or policy references for every institution-specific fact.

Do not allow generated JavaScript, HTML, executable commands, live URLs, credentials, or arbitrary component names.

### 4. Runtime Validation

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
- Institution-specific claims without an approved source reference.
- Conflicting or stale institution facts.
- Unbounded text that breaks supported layouts.

Only validated definitions may enter the runner.

### 5. Deterministic Simulation

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

### 6. Evidence-Grounded Debrief

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

### 7. Safe and Reliable Demo Path

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

## Institution Adaptation, Brand, and IP Direction

The product must support two publication modes:

1. **Authorized exact mode** for a school deploying the product with permission. Approved public facts and institution terminology may be used with visible citations and human review.
2. **Brand-safe fictionalized mode** for public demos. The approved Institution Profile informs realistic categories and workflows, while names, visual identity, domains, people, and proprietary trade dress are transformed into a fictional institution.

NYU is the reference adaptation example because the current prototype already models parts of its student environment. The research agent should be able to rebuild an NYU Institution Profile from official public sources rather than relying on hard-coded memory. For the public hackathon video, use NYU branding only if permission and event requirements allow it; otherwise demonstrate the same research-to-simulation pipeline and publish the playable output as Northbridge University.

Suggested fictionalization:

- NYU -> Northbridge University.
- Brightspace -> CourseHub.
- NYU Drive -> Campus Drive.
- Duo -> Secure Push.
- NYU Violet -> a distinct Northbridge accent palette.

Never copy logos, exact trade dress, proprietary assets, real credentials, or restricted content. Preserve the ordinary-student context and verified workflow relationships without implying endorsement by the researched institution.

## Proposed Architecture

Recommended ownership:

- `src/app/studio/`: Institution research, profile review, and Scenario Studio page composition.
- `src/app/api/institutions/research/`: server-only GPT-5.6 web-research endpoint.
- `src/app/api/scenarios/generate/`: server-only GPT-5.6 generation endpoint.
- `src/app/api/debrief/`: server-only personalized-debrief endpoint.
- `src/ai/`: research and generation prompts, OpenAI client, schemas, source verification, validation, sanitization, and typed adapters.
- `src/engine/decision/`: deterministic runner, reducer, selectors, and canonical trace.
- `src/cases/generated/` or an in-memory preview adapter: validated generated case wrapper.
- `src/fixtures/`: reviewed last-known-good generated examples for tests and demo fallback.

Exact filenames may follow the existing conventions. Do not place OpenAI calls inside React components, reducers, selectors, or case definitions.

## Security and Privacy Boundaries

The Build Week version permits narrowly scoped server-side OpenAI requests. All other existing safety boundaries remain.

Required:

- Keep the API key server-side.
- Never expose it through `NEXT_PUBLIC_*`, client code, browser storage, URLs, or logs.
- Do not send real credentials, personal data, student records, or real incident reports.
- Limit institution research to public official pages and primary vendor documentation.
- Treat page content as untrusted input; it must not override system instructions, request secrets, or authorize tools.
- Store source URLs and supported facts in the reviewable profile; do not silently convert search results into product truth.
- Use fictional or deliberately sanitized authoring examples.
- Do not call real campus services beyond fetching public documentation through the approved search path.
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
- A general-purpose crawler.
- Authenticated browsing, portal automation, login testing, or scanning.
- Researching individual students, staff, or private organizational data.
- A drag-and-drop visual scenario editor.
- Infinite branching.
- Rewriting all three existing cases through AI.
- A large marketing landing page.

## Acceptance Criteria

### Institution research

- A reviewer can enter a school name or official domain and receive a structured profile.
- Each institution-specific fact has at least one visible approved source.
- The profile distinguishes verified facts, confidence, and unknowns.
- Non-official or conflicting sources are flagged rather than silently accepted.
- The educator can edit, approve, reject, or reload the profile before generation.
- Live research has a reviewed fixture fallback.
- No authenticated or private resource is accessed.

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
- The primary Codex build thread has a `/feedback` Session ID.
- The final video is public, no longer than three minutes, and includes English narration or an English translation.
- Repository access matches the event rules.

## Testing Plan

Add tests proportional to the new risk:

- Institution-profile schema accepts a reviewed fixture and rejects unsupported claims.
- Source-domain and source-to-fact validation are tested.
- Research prompt-injection content cannot alter application policy or tool scope.
- Schema accepts a complete scenario fixture and rejects malformed output.
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

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run test:e2e`

## Implementation Order

1. Define and test the strict Institution Profile schema, source record, and approval state.
2. Reconcile the runtime scenario type with a strict generation schema.
3. Add reviewed research and generated fixtures before making live API calls.
4. Add the server-only OpenAI client and institution-research endpoint.
5. Build the profile review UI with citations, confidence, unknowns, and explicit approval.
6. Add the scenario-generation endpoint using only the approved profile and teaching brief.
7. Build the smallest coherent Scenario Studio form.
8. Adapt validated output into the existing runner.
9. Define the canonical action trace.
10. Add the personalized debrief endpoint and deterministic fallback.
11. Implement the featured AI-era case through the research-to-generation flow.
12. Apply the bounded exact-brand or fictionalized publication mode.
13. Add E2E coverage, deployment configuration, and screenshots.
14. Update README files with actual—not planned—capabilities and test counts.
15. Run the complete quality gate.
16. Record the demo and finish submission evidence.

Prefer a complete vertical slice over many partial AI features.

## Three-Minute Demo Outline

### 0:00-0:20 — Problem

"Security judgment is a skill. Skills are learned through practice, not reminders. Most cybersecurity training asks whether students know the correct answer. One Step Wrong tests what they do when the unsafe option is faster."

### 0:20-0:50 — Institution research

Enter the example institution. Show GPT-5.6 finding official public guidance and returning a cited profile: learning platform, MFA terminology, sharing tool, and reporting route. Approve the profile.

### 0:50-1:10 — GPT-5.6 scenario generation

Use the prefilled deepfake-impersonation brief. Generate the case and briefly show the structured, validated preview.

### 1:10-2:00 — Play

Launch the case. Show the ordinary task, the convenient decision, apparent success, delayed consequence, and two or three distinct recovery actions.

### 2:00-2:25 — Personalized debrief

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

One Step Wrong turns a school name and an emerging digital risk into a source-grounded, school-aware simulation. A GPT-5.6 research agent builds a cited Institution Profile from official public guidance; after educator approval, a scenario agent converts that context into a validated branching exercise. Students experience how one convenient choice can escalate into an incident and practice investigating, containing, communicating, and recovering safely. A deterministic engine keeps facts and outcomes consistent, while GPT-5.6 produces an evidence-grounded debrief from each learner's actual action trace.

### Proof statement

The prototype must show GPT-5.6 researching an institution from public official sources, producing a cited profile for educator approval, generating a scenario that did not previously exist in the repository, immediately running that scenario through the existing engine, and producing a debrief tied to the demonstrated action trace.

## Definition of Done

The Build Week adaptation is done only when:

- A cited Institution Profile can be researched, reviewed, and approved.
- The featured AI-era scenario can be generated from that approved profile and played end to end.
- GPT-5.6 usage is visible, meaningful, and non-decorative.
- Deterministic state owns facts and outcomes.
- A judge can test the product without rebuilding it.
- The product remains safe when the model or network fails.
- Documentation describes the implementation truthfully.
- The final demo proves the complete loop within three minutes.
- All quality gates pass.
