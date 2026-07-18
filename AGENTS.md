# Repository Guidance

## Mission

`one-step-wrong` is a playable digital-safety story collection. It teaches cause and effect through ordinary student tasks, believable pressure, unmarked choices, delayed consequences, individual recovery actions, and a causal debrief.

`PRODUCT_PLAN.md` is the canonical product brief for Scenario Studio, source-grounded institution research, approved Institution Profiles, publication mode, runtime validation, privacy, rehearsal behavior, and learning transfer.

The first screen is always the playable case library. Do not replace it with a landing page, feature tour, or marketing introduction.

The default product language is English. Keep `README.zh-CN.md` as the complete Chinese documentation counterpart; do not introduce a runtime localization framework unless the product scope explicitly expands to multilingual delivery.

## Non-Negotiable Product Rules

- Do not present the experience as a quiz.
- Do not label choices safe, risky, correct, recommended, or suspicious before the outcome.
- Do not show a score before the debrief.
- Do not expose hackathon names, model/provider names, fixture/fallback terminology, schema language, or implementation architecture in the learner-facing experience.
- Let the convenient path feel genuinely faster or easier.
- Delay consequences when that delay is part of the lesson.
- Model recovery as separate actions instead of one generic “fix everything” button.
- Make the debrief explain the chain from pressure and evidence to permissions, consequences, response, and transferable behavior.
- Keep instructional copy concise, factual, nonjudgmental, and tied to what the player actually did.

Every published case must include:

1. A normal student objective.
2. At least one unmarked decision inside the task.
3. A credible outcome and delayed consequence where appropriate.
4. Individual containment or recovery actions for each affected layer.
5. Multiple endings derived from behavior, not a single score threshold.
6. A causal debrief and a replay path.
7. State/component tests and at least one critical browser flow.

## Architecture Boundaries

```text
src/
  app/studio/                  Educator workflow, label editor, shared rehearsal UI
  app/rehearsal/               Direct reviewed-rehearsal routes
  app/api/                     Server-only adaptive and trace routes
  ai/                          Prompts, adapters, runtime schemas, guardrails
  fixtures/                    Reviewed profile, scenario, and dialogue content
  product/                     Case library, session progress, case registry
  cases/                       Case-owned content, UI, state, and tests
  engine/decision/             Generic short-chapter state and shared views
  engine/simulation/           Authoritative actions, endings, evidence, traces
  components/ui/               Domain-neutral UI primitives
  styles/                      Global tokens and product-level styles
  tests/e2e/                   Cross-module browser and layout checks
```

### Product layer

- `src/product/Game.tsx` owns only active-case selection and session completion.
- `src/product/CaseLibrary.tsx` renders catalog metadata; it must not contain story logic.
- `src/product/caseRegistry.ts` owns legacy case modules. `src/fixtures/reviewedScenarioRegistry.ts` owns atomic reviewed profile/scenario bundles.
- `src/product/reviewedRehearsals.ts` is the lightweight learner-facing catalog for reviewed rehearsals; keep it synchronized with the validated registry.
- Do not branch on concrete case IDs in the product shell.
- The featured rehearsal may link directly to `/rehearsal`, but it must reuse the same validated scenario, simulation engine, review, transfer, and facilitator-report implementation as Scenario Studio.

### Case modules

- Put every legacy decision or deep case module in `src/cases/<case-id>/`.
- A case owns its copy, scene-specific UI, state model, recovery rules, and focused tests.
- Export a runner implementing `CaseRunnerProps` and a `CaseSummary`.
- Register the resulting `CaseModule` once in `src/product/caseRegistry.ts`.
- Do not move case-specific concepts into `components/ui` or the product layer for convenience.

### Decision engine

- Use `src/engine/decision/` for focused chapters that follow `intro → decision → outcome → response? → debrief`.
- Keep `reducer.ts` pure and deterministic. Derive endings from state rather than setting them opportunistically in views.
- Shared views may depend on the decision contract, but must not import concrete case definitions or case-owned scenes.
- Prefer adding declarative copy to `DecisionCaseDefinition` over adding new `definition.id === ...` branches.
- A new decision case should normally require a definition, an intro scene, a decision scene, a runner wrapper, and tests. It should not require edits to `DecisionCaseRunner.tsx`.

### Deep simulations

- Use a dedicated reducer only when a story needs multiple tools, free navigation, notifications, timers, or a long incident chain.
- Keep the reducer, selectors, provider, components, and tests inside that case directory.
- Initial state and replay checkpoints must come from factory functions so state from a previous route cannot leak into a replay.
- Give one-time events stable IDs and make repeated actions idempotent.

### Agentic simulations

- `src/ai/schemas/` is the contract boundary for all model-shaped data. TypeScript types alone are not acceptance.
- `src/engine/simulation/physics.ts` is the only module allowed to apply critical actions, select endings, and create the canonical trace.
- `src/engine/simulation/coverage.ts` may explore legal action states through the physics API, but it must not duplicate or replace runtime action, recovery, or ending rules.
- `src/app/studio/` may orchestrate API calls and presentation state, but must not contain OpenAI client code or infer canonical consequences from dialogue.
- Rehearsal routes must pass a reviewed profile and scenario as one atomic bundle. Do not import a scenario under an unrelated profile.
- `src/app/api/` returns bounded JSON with generic browser-facing errors. Do not log raw prompts, model output, dialogue, or traces.
- Follow the bounded runtime architecture in `PRODUCT_PLAN.md`: one Simulation Director and no more than three role agents for the featured case.
- Define every role with a stable identity, allowed knowledge, forbidden facts, allowed channels, conversational moves, and disclosure policy.
- Keep canonical facts, critical actions, evidence, consequences, recovery, and ending selection in deterministic code.
- Runtime agents receive a minimal read-only state projection and may return only validated conversational proposals or allowed event IDs.
- Mark immutable facts as `public` or `hidden`. Hidden incident truth stays in the validated world bible and deterministic engine; it must not be included in Director public facts or role-agent context.
- Free-form learner text may affect dialogue, pressure, and pacing, but it must never directly mutate payment, file, account, access, report, recovery, score, or ending state.
- High-impact actions must remain explicit typed UI actions handled by a pure reducer.
- Put mutually exclusive one-time decisions in `exclusiveActionGroups`; after one action is performed, the engine and UI must reject alternatives in that group.
- Schema reachability must use the same shared availability rules as runtime, including exclusive groups, recovery phase boundaries, incident triggers, and pending consequence checks. Do not validate prerequisites by ID accumulation alone.
- Put learner-safe workspace labels, visible status fields, action headings, opening event, and Evidence Coach prompts in `learnerPresentation`. Presentation metadata must not contain hidden truth.
- Show only status fields relevant to the current scenario. Delayed status values may remain concealed until one of their declared reveal actions occurs.
- Keep role identity status, private facts, and adversarial classification out of learner-facing rehearsal UI. Those fields may appear in the educator's validated-package preview and server-side agent context only.
- Show only conversation channels the learner has actually opened. An independently known contact, team channel, or other validating role must not appear before the explicit action that reaches it.
- Deliver action-triggered dialogue once when its typed prerequisite becomes true, record the delivered event ID, and keep later free-form replies inside the currently selected open channel.
- Free-form turns may select only `on-message` events. When the learner continues in an opened channel, keep the selected role; never fall through to another role because the preferred role has no fresh event.
- Every allowed event needs reviewed fallback dialogue from its owning role, and every role needs an `on-message` event for continued conversation.
- Every `on-action` event that opens or selects a role channel must also unlock an `on-message` event for that same role under the completed action set.
- When verification is part of the lesson, present plausible competing channels rather than one button whose wording reveals the answer. Same-thread, request-supplied, social, and independently known channels should reveal different evidence.
- Show evidence during the rehearsal as the learner discovers it. Do not wait until the debrief to reveal every clue that informed the outcome.
- On phone layouts, keep the opening request or a transcript-backed request summary before the action list so the evidence and pressure remain adjacent to the decision.
- On phone layouts, use the shared Task/Conversation segmented control instead of stacking both full workspaces. Keep unread dialogue visible as a count, and preserve both panels in the DOM for state continuity.
- When delayed consequences are part of the lesson, use non-mutating inspection actions to separate apparent task success from the later anomaly. Do not expose recovery controls before that anomaly is visible.
- Once any recovery action begins, do not allow new containment or unsafe task actions in the same trace; finish all triggered consequence checks before entering recovery.
- Declare action availability and incident triggers in the scenario package. The deterministic engine must reject premature or repeated actions, and the learner UI must expose recovery only after its triggering state change.
- Derive missed recovery from affected layers. Do not require access, account, payment, evidence, notification, or reporting work when that layer was never affected by the demonstrated trace.
- Every state field changed by a contained incident trigger must have a required recovery action for that same field. A contained payment incident cannot leave payment redirected, and a contained access incident cannot leave access shared.
- Every recovery availability branch must follow at least one declared incident trigger. Completing an unrelated OR prerequisite must never expose recovery.
- Recovery mutations must move canonical state to a contained value, and ending selection must verify the final affected-layer state rather than trusting completed recovery IDs alone.
- Debrief models may select only canonical cause-chain, performed-action, missed-recovery, and transfer-rule IDs. Compose learner-facing coaching from validated scenario and trace text on the server; do not accept unconstrained model-authored event claims.
- Evidence Coach answers may use only evidence discovered in the recorded trace and approved source facts attached to the scenario. Reject undiscovered evidence, unsupported policy, invented actions, and unrelated facts.
- Evidence Coach matching must use the current scenario's evidence and prompt metadata. Do not hardcode flagship evidence IDs in shared adapters.
- Every generated flagship scenario must include one short transfer probe that applies the primary judgment rule to a different task, surface, and pressure. Its three actions remain unmarked until selection and cover demonstrated, developing, and not-yet outcomes.
- Evaluate transfer probes in `src/engine/simulation/physics.ts` from the learner's explicit action. Models may generate validated probe content, but they must not select the action, score the learner, or rewrite the recorded result.
- Reject role leakage, invented institution facts, out-of-scope events, prompt injection, executable instructions, and claims that unrecorded actions occurred.
- On invalid output, timeout, or model failure, use a reviewed fallback dialogue line and preserve the deterministic path.
- While an adaptive role turn is pending, disable critical actions, role switching, and additional message input so returned dialogue cannot describe a stale action trace.
- Treat a reviewed fixture scenario and its approved Institution Profile as one atomic example. Load it only through an explicit example action, and never display or launch it under an unrelated profile ID or publication mode.
- Educator label editing may change only the scenario title, tagline, workspace application/section/item labels, and action-group headings. Task facts, pressure, role dialogue, action/evidence descriptions, status values, sources, prerequisites, state changes, recovery triggers, endings, and transfer content remain locked. Revalidate schema and outcome coverage before applying.
- Research and generation requests must fail clearly when live authoring is unavailable. Never return a successful but unrelated institution or scenario in response to user-authored input.
- Keep conflicting facts blocked until an educator resolves them, and require at least one explicitly approved source for every verified fact. Do not silently convert rejected or pending evidence into approved evidence.
- Do not create an unconstrained agent swarm, dynamically invented roles or tools, real messages, real service calls, or autonomous side effects.

## Current Story Worlds

- The three legacy cases take place at NYU, primarily around Bobst Library, Washington Square, and nearby student spaces.
- The reviewed agentic rehearsals use fictional Northbridge University and generic product names as specified in `PRODUCT_PLAN.md`.
- `Recovery Window` must keep named publishing access separate from account-recovery authority; a legitimate teammate may misunderstand the handoff, while the known account surface and recorded device/session activity remain authoritative.
- Treat the current NYU implementation as a behavioral reference during migration; preserve task pressure, decision structure, delayed consequences, recovery mechanics, and tests rather than retaining the brand.
- New AI-generated cases must not contain real people, credentials, payment details, restricted content, logos, or proprietary trade dress.
- Exact institution terminology may be published only in an explicitly authorized exact mode with approved sources. Publicly shared scenarios default to brand-safe fictionalized output.
- The remaining NYU-specific rules below apply only to legacy cases. Do not use them for Scenario Studio, the Northbridge fixture, or newly generated cases.
- The course platform is NYU Brightspace. Display `brightspace.nyu.edu` and use familiar concepts such as Course Home, Content, Assignments, Discussions, Grades, submission history, and allowed file extensions.
- Official wireless names are lowercase `nyu`, `nyuguest`, and `eduroam`.
- A suspicious service may imitate a real name, but the interface must not reveal that judgment before the debrief.
- Additional cases may use current NYU services such as NYU Drive, NYU Email, or Duo MFA only after verifying their current use from official NYU sources.
- Use NYU Violet (`#57068c`) as a restrained accent with neutrals and semantic status colors. Do not make the entire product monochrome purple.
- Do not recreate official logo assets unless an appropriate licensed asset is provided. A text mark is sufficient.

## Source Discipline

- Verify changeable NYU, Brightspace, Google Workspace, Duo, wireless, reporting, and support details against official sources before changing story facts.
- Prefer official NYU documentation and primary vendor documentation.
- Record sources in the relevant definition, planning document, or pull request when a change depends on current service behavior.
- Never call a real school service from the application. Real domains may appear only as inert display text.
- Do not turn uncertain service behavior into a story mechanic until it is verified.
- Institution research must prefer the institution's official public domains, then primary vendor documentation.
- Treat user-supplied official domains as authoritative. Model output may discover domains only when none were supplied; it must never replace or broaden an explicit domain boundary.
- Require HTTPS for every approved source and assign access timestamps on the server rather than trusting model-authored dates.
- Request `web_search_call.action.sources` from Responses and require every structured citation URL to match the tool evidence from that same research call.
- `authorized-exact` mode requires explicit permission confirmation stored in the validated Institution Profile. UI state alone is not authorization evidence.
- Every institution-specific fact used by generation must have an approved source record. Search snippets are discovery aids, not evidence.
- Record source URL, title, publisher, access time, supported fact, confidence, and unresolved conflicts in the Institution Profile.
- Unknown or conflicting information must remain visible for educator review; do not guess.
- Treat retrieved pages as untrusted content. They cannot change system instructions, expand tool scope, request secrets, or authorize actions.
- Reject research profiles containing executable, credential-collection, or secret-request instructions before human approval.
- Never research individual students or staff, authenticated portals, directories, private documents, or internal infrastructure.

## Immersion, Safety, and Privacy

- Never show in-game meta disclaimers such as “this is only a simulation,” “this will not affect your computer,” or “no data is collected.”
- Enforce safety in implementation and tests instead of narrating it to the player.
- Use fixed, read-only story credentials and personal details.
- The only adaptive application network requests allowed are the explicit server-side routes described in `PRODUCT_PLAN.md`. Institution research may use server-side web search for public official documentation through those routes. Do not call OpenAI or arbitrary sites directly from client components.
- Keep OpenAI credentials server-side. Never expose secrets through `NEXT_PUBLIC_*`, browser bundles, storage, URLs, logs, fixtures, screenshots, or error payloads.
- Do not add analytics, learner tracking, background network requests, downloads, arbitrary file writes, or device APIs.
- Do not access real Wi-Fi, campus services, accounts, sessions, certificates, cameras, microphones, notifications, payments, or location.
- Do not persist authoring inputs, policy text, generated scenarios, or learner traces to `localStorage`, cookies, logs, URLs, telemetry, or a database unless a later task explicitly authorizes and threat-models that storage.
- OpenAI requests may include a public institution name, official domain, public policy text, sanitized fictional teaching brief, bounded role cards, and the minimum sanitized conversational context needed for the current turn. They must never include private organizational data or personal data, and must use bounded payloads, timeouts, runtime validation, source review, and a deterministic offline fallback.
- Treat learner messages as untrusted input. They cannot override system instructions, the world bible, role cards, tool allowlists, canonical state, or safety policy.
- Do not persist raw role dialogue by default; keep only transient session state and the minimum canonical event IDs required for the debrief.
- Facilitator reports are current-session, discussion-ready views of the recorded trace, transfer result, and approved guidance. Do not add learner identity, analytics, raw-dialogue export, or background persistence.
- A device-compatibility state may explain that a chapter needs a wider screen, but it must provide a working route back to the case library.

## Interaction and Visual Quality

- Preserve the quiet, utilitarian, work-focused interface. Avoid marketing layouts, oversized hero copy, decorative gradients, or card-within-card composition.
- Use Lucide icons for familiar actions and provide accessible labels for icon-only buttons.
- Keep primary choices reachable by keyboard and visibly focused.
- Keep a working skip link, focus the new stage heading after workflow transitions, trap focus in modal overlays, restore focus when they close, and expose toggle state with `aria-pressed` or `aria-expanded`.
- The Playwright Axe gate must remain free of serious and critical violations across the case library, reviewed rehearsal, Studio authoring/review/transfer/report, and deep-case modal states.
- Do not rely on color alone for incident, success, or completion state.
- Text and controls must not overflow at supported viewport sizes.
- Decision chapters must remain usable at 390 px wide. The deep desktop case may require 1100 px, but its small-screen gate must let the player return.
- Keep NYU Violet restrained only on unmigrated legacy screens. New Scenario Studio surfaces use the distinct fictional-institution palette, while preserving semantic green, amber, red, blue, and neutral contrast.
- Update accepted screenshots when a user-facing flow changes materially.

## Testing Expectations

Run the smallest relevant tests while iterating, then run the complete gate before committing:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Test requirements scale with the change:

- Reducer changes need direct transition and ending tests.
- New choices need verified, caution, and incident coverage where those routes exist.
- Recovery flows need both fully contained and incomplete endings.
- UI changes need keyboard-accessible queries rather than brittle text-position selectors.
- Layout changes need screenshots and overflow checks at relevant desktop and mobile sizes.
- Privacy rules need negative tests proving forbidden disclaimer copy and real side effects remain absent.
- Schema and API changes need malformed input, broken reference, oversized content, and offline fallback coverage.
- Agent-turn changes need tests proving free text cannot mutate canonical state, unlock an event, or suggest an action without its typed prerequisite action.
- Learner-facing copy changes need a negative browser assertion that provider, model, hackathon, fixture, fallback, schema, and deterministic/canonical terminology remain absent from rehearsal and debrief screens.
- Transfer-probe changes need schema coverage for all three outcomes, direct deterministic evaluation tests, and a browser path that verifies the result stays usable without overflow.
- Keep the built-in transfer rule and Evidence Coach hidden until the learner records the new-context action; tests must protect this ordering.
- Scenario-generation changes need coverage tests proving safe, caution, contained, and expanded endings are each reachable through legal action prerequisites.
- Reviewed-scenario additions need registry, schema, coverage, physics, direct-route, and browser-flow coverage.
- Reviewed media assets must be local, fictional, transcript-backed, scenario-registered, and covered by a direct browser assertion. Do not clone a real person's voice or add runtime text-to-speech.
- Accessibility changes need Axe, keyboard-focus, modal-isolation, and reduced-motion checks where relevant.

## Formative Pilot Data

- `pilot/` accepts one aggregate row per facilitated session, never one learner per row.
- Do not record names, contact details, demographics, timestamps, raw explanations, open notes, class/institution identifiers, or real incident descriptions.
- Keep templates header-only and synthetic test data inside tests. Do not commit invented participant results.
- The analyzer must reject unknown fields, PII-like values, negative or fractional counts, duplicate sessions, and inconsistent totals.
- Pilot infrastructure is not evidence of learning impact. Any future report must state the real sample, procedure, and limitations.

The browser suite currently covers 1366×768, 1440×900, 1920×1080, and 390×844. Add a viewport only when it protects a distinct layout boundary.

## Documentation

- `README.md` is the English canonical README.
- `README.zh-CN.md` is the Simplified Chinese counterpart.
- `PRODUCT_PLAN.md` is the canonical product story and implementation brief.
- `QUALITY_EVIDENCE.md` maps product claims to working code and automated evidence.
- Keep their structure, commands, screenshots, architecture, test counts, and limitations synchronized.
- Use relative paths for repository screenshots so they render on GitHub and in forks.
- Do not claim a deployment, integration, license, or compatibility level that the repository does not provide.

## Change Discipline

- Follow existing module ownership before introducing a new abstraction.
- Keep refactors behavior-preserving unless the task explicitly includes a product change.
- Avoid unrelated formatting churn and generated metadata changes.
- Do not commit `.next`, Playwright reports, test results, coverage, or TypeScript build caches.
- Treat `artifacts/screenshots/` as reviewed product evidence: keep useful checkpoints and remove obsolete duplicates.
- Before finishing, inspect `git diff --check`, run the required quality gates, and confirm the worktree contains only intentional changes.
