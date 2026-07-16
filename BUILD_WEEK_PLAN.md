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

One Step Wrong turns a school's real digital environment into a living security rehearsal: GPT-5.6 agents perform the people, pressure, and uncertainty around an incident, while deterministic code preserves the facts, actions, and outcomes.

### Demonstration hook

**One school name. One emerging threat. One living security rehearsal.**

Give One Step Wrong an institution and a threat. Its GPT-5.6 agents research the school's official public guidance, build a cited profile for educator approval, compile a bounded simulation world, perform its characters during play, and personalize the debrief afterward.

### Product line

**Not a branching story. A living security rehearsal.**

### Technical promise

**Agents perform the world; deterministic code defines its physics.**

A GPT-5.6 Institution Research Agent searches public official sources and builds a cited Institution Profile. After educator review, a Scenario Architect converts that approved context and a learning objective into a validated world bible, role cards, evidence, recovery actions, and deterministic rules. During play, a Simulation Director coordinates a small cast of bounded role agents that can respond naturally to what the learner says and does. Those agents may change wording, timing, and pressure, but they cannot change ground truth, perform real-world actions, or select the ending. The deterministic engine owns facts and consequences. A Debrief Analyst then produces coaching grounded only in the canonical action trace and approved sources.

## Award Story

AI is making digital deception adaptive. A suspicious message no longer needs to follow a fixed script: an impersonator can answer questions, exploit context, change tactics, and apply pressure in real time. Static security lessons teach students to recognize yesterday's example, but real incidents force them to make judgments inside a moving social situation.

Generic training also misses that every institution has its own learning platform, login flow, collaboration tools, support channels, and language for reporting an incident. One Step Wrong starts with the school itself. Its Institution Research Agent searches official public guidance, extracts only verified operational context, attaches citations and confidence, and asks an educator to approve the profile.

The Scenario Architect combines that approved profile with an emerging threat and learning objective to compile a safe simulation world: the learner's ordinary task, immutable facts, evidence, critical actions, recovery path, and a small cast of role agents. Each role receives a bounded identity, goal, private knowledge, allowed channels, and disclosure policy.

Then the simulation comes alive. The learner might message a faculty adviser through a known channel, question a teammate applying deadline pressure, or challenge an impersonator whose story changes under verification. The role agents react naturally to the learner's behavior instead of replaying one prewritten branch. A Simulation Director manages pacing and decides which validated conversational event to surface next.

The agents perform the social world, but they do not control reality. They cannot alter canonical facts, mutate account or payment state, invent institution policy, call real services, or decide whether the learner succeeds. High-impact actions—verify identity, change payment details, revoke access, preserve evidence, notify affected people, and report the incident—remain explicit UI actions checked by a deterministic state machine.

This creates the central teaching experience: the convenient choice can appear to work, consequences can surface later, and failure does not end the lesson. Learners must investigate, contain, communicate, and recover. After play, a Debrief Analyst explains the causal chain using only the learner's canonical action trace, scenario facts, and approved guidance.

The current prototype proves this learning model with unsafe Wi-Fi, oversharing, and MFA fatigue. The Build Week version must prove the full agentic loop with one flagship case: institution research, scenario compilation, a bounded live role-play, deterministic consequences, and evidence-grounded coaching.

**Static training teaches the last attack. Agentic simulation rehearses the next one.**

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
- A bounded runtime Simulation Director or live role agents.
- A reviewed fallback dialogue trace.
- An AI-generated personalized debrief.
- A deployed testing path for judges.
- Build Week documentation and evidence.

## Required Build Week Loop

The minimum convincing product loop is:

1. An educator opens **Scenario Studio** and enters a school name or official domain.
2. A server-only GPT-5.6 Institution Research Agent searches public official sources.
3. The agent returns a structured Institution Profile with source URLs, access dates, confidence, and explicit unknowns.
4. The application verifies source domains, validates the profile, and asks the educator to approve or edit it.
5. The educator adds a threat topic, audience, ordinary task, and learning objective.
6. A server-only GPT-5.6 Scenario Architect combines the approved profile and teaching brief.
7. GPT-5.6 returns a strict scenario package containing a world bible, role cards, critical actions, evidence, recovery rules, and source references.
8. The application validates the package and reports actionable failures.
9. The educator previews and approves the simulation.
10. A learner enters the ordinary task and encounters a live, bounded role-play.
11. A Simulation Director chooses only among validated events, while up to three role agents respond through their allowed identities and channels.
12. Free-form learner messages may influence dialogue, trust, timing, and pressure, but not canonical facts or high-impact state.
13. The learner uses explicit controls to verify, approve, revoke, preserve, notify, and report.
14. The deterministic engine applies consequences, selects the ending, and produces a canonical action trace.
15. A server-only Debrief Analyst creates personalized coaching grounded in that trace and the approved profile.
16. The UI distinguishes sourced institution facts, deterministic simulation facts, and AI-performed dialogue and coaching.

The three-minute demo must show this loop working. Do not submit a fixed transcript while describing live role agents as future work. Keep one recorded fallback trace so a network or model failure does not break judging.

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

The generated scenario package should cover at least:

- Summary metadata.
- Intro and ordinary learner task.
- Immutable world facts and incident truth.
- Decision context and unmarked critical actions.
- Evidence and delayed consequences.
- Separate containment and recovery steps.
- Multiple deterministic endings.
- Cause chains and transfer rules.
- Source references for every institution-specific fact.
- A maximum of three role cards.
- Allowed conversational events and pacing conditions.
- A deterministic fallback transcript.

Each role card must define:

- Stable role ID and display identity.
- Simulation goal and pressure style.
- Private facts the role knows.
- Facts the role must never know or reveal.
- Allowed communication channels.
- Allowed conversational moves.
- Disclosure and escalation policy.
- Whether the role is legitimate, mistaken, compromised, or adversarial in the canonical world.

Do not allow generated JavaScript, HTML, executable commands, live service actions, credentials, arbitrary component names, or unbounded role or tool definitions.

### 4. Runtime Validation

TypeScript types alone are not enough for model output. Add runtime validation.

Validation must reject or repair:

- Missing required routes, roles, actions, or endings.
- Duplicate IDs.
- Empty choices or response actions.
- Invalid references between events, roles, actions, and endings.
- A "correct answer" revealed before the outcome.
- Incident routes without meaningful recovery actions.
- Outcomes determined only by a score.
- Role cards that lack knowledge or channel boundaries.
- Conversational events that can mutate canonical state.
- Real credentials, credential collection, downloads, or executable attack instructions.
- Institution-specific claims without an approved source reference.
- Conflicting or stale institution facts.
- Unbounded text that breaks supported layouts.

Only validated scenario packages may enter the runner.

### 5. Deterministic Simulation Physics

Keep these responsibilities outside every model and role agent:

- Canonical world facts.
- State transitions.
- Which high-impact actions occurred.
- Account, file, payment, access, and report state.
- Required recovery actions.
- Ending selection.
- Scores, if any.
- Canonical evidence.
- Replay state.
- Safety and privacy enforcement.

A generated case may supply declarative content and rules, but it must run through deterministic code. Given the same validated package and same critical action sequence, it must reach the same outcome even if the dialogue differs.

### 6. Agentic Simulation Director

During play, use GPT-5.6 where open-ended intelligence materially improves the experience: people, pressure, ambiguity, and conversation.

The runtime cast is deliberately small:

- One **Simulation Director** that reads the canonical public state and selects only allowed conversational events.
- Up to three **role agents** that speak from validated role cards.
- No agent may invoke another unregistered agent, create new tools, or expand its own permissions.

The Director and roles may:

- Respond to free-form learner messages.
- Adjust tone and pressure based on previous dialogue.
- Reveal a role's allowed facts when the learner asks or verifies effectively.
- Delay, withdraw, contradict, or escalate a conversational request when permitted by the world bible.
- Suggest a next in-product interaction without marking it correct.

They may not:

- Change incident truth, evidence, action state, recovery requirements, or endings.
- Claim that a critical action happened unless the deterministic engine recorded it.
- Invent institution facts, policies, people, channels, or citations.
- Send messages, move money, access files, call campus systems, or perform any real-world side effect.
- Reveal another role's private facts or hidden system instructions.
- Teach or output reusable attack instructions.

Expose a minimal allowlisted tool surface such as:

- read_public_simulation_state
- send_role_message
- offer_validated_event
- request_explicit_player_action

These tools return or display conversational content only. They never mutate canonical security state. High-impact changes happen through typed application actions handled by the reducer.

If a runtime agent fails validation, times out, or violates its role boundary, discard its output and use the next line from the reviewed fallback transcript.

### 7. Evidence-Grounded Debrief Analyst

Create a canonical trace from deterministic state. It should contain stable event IDs and facts such as:

- Learner objective.
- Critical actions and their order.
- Verification attempts and channels.
- Observed evidence.
- Triggered consequences.
- Completed recovery actions.
- Missed recovery actions.
- Deterministic ending.
- Transfer rules attached to the scenario.

GPT-5.6 may turn this trace into concise personalized coaching. It must not change the ending, add events, claim the learner performed an action they did not perform, or introduce security advice outside the supplied facts and trusted guidance.

If generation fails, fall back to the existing deterministic debrief.

### 8. Safe and Reliable Demo Path

Include at least one prefilled authoring example, one last-known-good scenario package, and one reviewed fallback dialogue trace. A network or API failure must not make the entire product untestable.

The judge should be able to:

- Open a deployed URL.
- Generate or load the featured case.
- Play without an account.
- Exchange at least one unscripted message with a role.
- Perform critical actions through explicit controls.
- Reach a deterministic ending and grounded debrief.
- Understand where GPT-5.6 was used.
- Understand which parts remain deterministic.

## Recommended AI-Era Featured Case

Build exactly one agentic flagship case for the submission.

Recommended concept: **"The Voice You Know"**

- Ordinary task: a student organization treasurer must finalize a guest-speaker reimbursement before an event begins.
- Trigger: a voice-like message that appears to come from the faculty adviser requests an urgent account change.
- Role agents:
  - **Faculty Adviser** — legitimate, available only through a known independent channel, and unaware of the requested change.
  - **Impersonator** — urgent, context-aware, and able to adapt its explanation, but bounded by a fixed false story and no attack instructions.
  - **Teammate** — legitimate but deadline-driven, adding social pressure without knowing whether the request is authentic.
- Optional non-conversational service: the fictional campus security desk accepts a structured incident report through explicit UI.
- Convenient path: trust familiarity and comply before independently verifying.
- Safer friction: contact the adviser through the known channel, compare claims, inspect evidence, and pause the high-impact action.
- Delayed consequence: depending on deterministic actions, the request, shared documents, or account recovery state begins to change.
- Recovery: pause the simulated payment, revoke access, preserve evidence, notify affected people, and report through the approved fictional channel.
- Transfer rule: familiarity of voice is not proof of identity; bind high-impact actions to an independently verified channel.

The learner may type natural questions or messages to the roles. Their replies should change with the conversation, but the real adviser, false request, evidence, payment state, recovery requirements, and ending remain canonical.

Keep the case fictional. Do not synthesize audio, reproduce a real person's voice or identity, use a real school brand or payment detail, or include operational attack instructions.

The winning demo is not a large multi-agent platform. It is one polished, believable rehearsal in which two runs can sound different while the same security actions still produce the same trustworthy outcome.

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

- src/app/studio/: Institution research, profile review, and Scenario Studio page composition.
- src/app/api/institutions/research/: server-only GPT-5.6 web-research endpoint.
- src/app/api/scenarios/generate/: server-only GPT-5.6 Scenario Architect endpoint.
- src/app/api/simulation/turn/: server-only Simulation Director and bounded role-response endpoint.
- src/app/api/debrief/: server-only Debrief Analyst endpoint.
- src/ai/: OpenAI client, prompts, schemas, validation, source verification, sanitization, and typed adapters.
- src/ai/simulation/: world-bible types, role cards, allowed tools, turn orchestration, output guardrails, and fallback selection.
- src/engine/decision/: deterministic runner, reducer, selectors, critical actions, and canonical trace.
- src/cases/generated/ or an in-memory preview adapter: validated generated scenario wrapper.
- src/fixtures/: reviewed Institution Profile, scenario package, and fallback dialogue trace.

Recommended state split:

- **Canonical state:** deterministic world facts, critical actions, evidence, consequences, recovery, and ending.
- **Conversational state:** sanitized learner messages, role replies, current speaker, and allowed event IDs.
- **Presentation state:** open panel, typed draft, loading state, and transient animation.

Only the deterministic reducer may update canonical state. Runtime agents receive the minimum read-only projection needed for the current turn. They return typed conversational proposals that must pass schema, role, and event validation before display.

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
- Treat learner messages as untrusted input; they cannot override the world bible, role card, tool allowlist, or canonical state.
- Give runtime agents only a minimal read-only state projection and conversational tools with no real side effects.
- Validate role identity, knowledge boundaries, allowed event IDs, and output length on every turn.
- Discard and replace leaking, malformed, or timed-out role output with a reviewed fallback.
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
- An unconstrained autonomous agent swarm or agents that invent new roles and tools.
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
- The package contains immutable facts, explicit critical actions, bounded role cards, recovery steps, and deterministic endings.
- Every incident has separate containment or recovery steps.
- The featured case renders without overflow at its supported viewport.
- Generation errors have a working recovery or fixture path.

### Live agentic play

- The learner can send at least one unscripted message and receive an in-character reply.
- Each role knows only the facts and channels allowed by its role card.
- The Director can select only validated events.
- Role dialogue can adapt without changing canonical incident truth.
- Free text cannot directly approve a payment, revoke access, submit a report, or mutate other critical state.
- Invalid, leaking, or timed-out output falls back to a reviewed line.
- The experience remains playable when the runtime model is unavailable.

### Deterministic simulation

- Safe, caution, contained, and expanded outcomes are testable where applicable.
- The same validated package and critical action sequence always produce the same deterministic ending.
- Dialogue variation does not change physics unless the learner takes a typed critical action.
- Replay produces fresh canonical and conversational state.
- No model call is required for state transitions or ending selection.

### Debrief

- The personalized debrief references only canonical trace facts.
- It accurately distinguishes completed and missed actions.
- It does not override the deterministic ending.
- The existing deterministic debrief remains available.
- Model failure does not block completion.

### Security

- No API key appears in client assets or repository history.
- No real service is contacted.
- No raw dialogue, prompt, or trace is stored in browser persistence.
- Generated content cannot inject HTML or executable code.
- Inputs and outputs have bounded sizes.
- Role agents cannot expand their tool or knowledge scope.
- Retrieved pages and learner text cannot override system, developer, world, or role instructions.

### Documentation and judging

- README explains where Codex accelerated development.
- README explains exactly what GPT-5.6 does before, during, and after play.
- README distinguishes pre-existing foundations from Build Week work.
- Setup instructions include required environment variables without including secrets.
- A deployed demo or frictionless test path exists.
- The primary Codex build thread has a /feedback Session ID.
- The final video is public, no longer than three minutes, and includes English narration or an English translation.
- Repository access matches the event rules.

## Testing Plan

Add tests proportional to the new risk:

- Institution-profile schema accepts a reviewed fixture and rejects unsupported claims.
- Source-domain and source-to-fact validation are tested.
- Research prompt-injection content cannot alter application policy or tool scope.
- Scenario-package schema accepts a complete fixture and rejects malformed output.
- Validation rejects duplicate IDs, invalid routes, missing recovery actions, and unbounded roles.
- Validation rejects executable or credential-collection content.
- API routes reject oversized or malformed requests.
- OpenAI client is mocked in automated tests.
- Generated fixture completes safe and incident paths.
- Every role is tested against allowed knowledge, forbidden facts, channels, and conversational moves.
- The Director cannot propose an event outside the validated allowlist.
- Free-form learner text cannot mutate canonical state or inject instructions.
- Agent tool results cannot mutate canonical state.
- The same critical action trace produces the same ending across varied dialogue fixtures.
- Invalid, leaking, and timed-out role responses select the deterministic fallback.
- Canonical trace is stable and contains no extra personal data.
- Debrief prompt receives only allowed facts.
- Hallucinated debrief facts are not accepted or displayed as canonical.
- API failure falls back cleanly.
- Browser test covers studio -> preview -> live role exchange -> critical action -> recovery -> debrief.
- Existing cases and current quality gates continue to pass.

Before completion:

- npm run lint
- npm run typecheck
- npm test
- npm run build
- npm run test:e2e

## Implementation Order

1. Define and test the strict Institution Profile schema, source record, and approval state.
2. Define the scenario-package schema: world bible, critical actions, role cards, allowed events, endings, and fallback trace.
3. Add reviewed research, scenario, and dialogue fixtures before making live API calls.
4. Add the server-only OpenAI client and institution-research endpoint.
5. Build the profile review UI with citations, confidence, unknowns, and explicit approval.
6. Add the Scenario Architect endpoint using only the approved profile and teaching brief.
7. Build the smallest coherent Scenario Studio form.
8. Adapt validated output into the existing deterministic runner.
9. Implement **The Voice You Know** as the only live-agent flagship.
10. Add the typed simulation-turn route, one Director, and at most three role cards.
11. Keep critical actions as explicit reducer events; add role, event, prompt-injection, timeout, and fallback tests.
12. Define the canonical action trace.
13. Add the Debrief Analyst endpoint and deterministic fallback.
14. Apply the bounded exact-brand or fictionalized publication mode.
15. Add E2E coverage, deployment configuration, and screenshots.
16. Update README files with actual—not planned—capabilities and test counts.
17. Run the complete quality gate.
18. Record the demo and finish submission evidence.

Prefer one complete, polished living rehearsal over many partial agents or scenarios.

## Three-Minute Demo Outline

### 0:00-0:18 — Problem

"Static training teaches the last attack. Agentic simulation rehearses the next one. Security judgment is a skill, and skills are learned through practice."

### 0:18-0:42 — Institution research

Enter the example institution. Show GPT-5.6 finding official public guidance and returning a cited profile with the relevant collaboration and reporting workflow. Approve the profile.

### 0:42-1:00 — Scenario compilation

Use the prefilled deepfake-impersonation brief. Generate **The Voice You Know** and briefly show its validated world facts, critical actions, and bounded roles.

### 1:00-1:52 — Living rehearsal

Launch the ordinary reimbursement task. Type one unscripted challenge to the apparent adviser and show the reply. Contact the real adviser through the independent channel. Let the teammate add deadline pressure. Use explicit controls to pause the payment and preserve evidence.

### 1:52-2:18 — Consequence and recovery

Show that conversation changes the pressure, while deterministic actions control payment, access, reporting, and the ending. Complete two or three distinct recovery actions.

### 2:18-2:38 — Grounded debrief

Show the deterministic ending and GPT-5.6 coaching grounded in the actions actually taken.

### 2:38-2:52 — Trust architecture

Explain: "Agents perform the world; deterministic code defines its physics. GPT-5.6 adapts the people and pressure, but it cannot change facts, perform real actions, or choose the ending."

### 2:52-3:00 — Impact

Show the existing library: "One school name. One emerging threat. One living security rehearsal."

## Submission Copy

### Title

**One Step Wrong — A Flight Simulator for Digital Judgment**

### Tagline

**One school name. One emerging threat. One living security rehearsal.**

Product line: **Not a branching story. A living security rehearsal.**

Technical trust line: **Agents perform the world; deterministic code defines its physics.**

### Short description

One Step Wrong turns a school name and an emerging digital risk into a source-grounded, living security rehearsal. A GPT-5.6 Institution Research Agent builds a cited profile from official public guidance; after educator approval, a Scenario Architect compiles a validated world with immutable facts, critical actions, recovery rules, and bounded roles. During play, a Simulation Director and role agents adapt the people, pressure, and conversation to the learner's behavior. Deterministic code still owns every high-impact action, consequence, and ending. Afterward, a Debrief Analyst explains the causal chain from the learner's actual trace.

### Proof statement

The prototype must show GPT-5.6 researching an institution from official public sources, producing a cited profile for educator approval, compiling a scenario that did not previously exist in the repository, responding to at least one unscripted learner message through a bounded role, running critical actions and outcomes through the deterministic engine, and producing a debrief tied to the demonstrated action trace.

## Definition of Done

The Build Week adaptation is done only when:

- A cited Institution Profile can be researched, reviewed, and approved.
- **The Voice You Know** can be compiled from that profile and played end to end.
- At least one bounded role responds meaningfully to an unscripted learner message.
- The Director and role agents cannot change ground truth, critical state, or endings.
- Critical actions remain explicit, typed, deterministic, and testable.
- GPT-5.6 usage is visible and meaningful before, during, and after play.
- A judge can test the product without rebuilding it.
- A reviewed scenario and dialogue fallback keep the product usable when the model or network fails.
- Documentation describes the implementation truthfully.
- The final demo proves the complete loop within three minutes.
- All quality gates pass.
