# One Step Wrong

<p>
  <a href="./README.md"><strong>English</strong></a> ·
  <a href="./README.zh-CN.md">简体中文</a>
</p>

<p>
  <img alt="CI" src="https://github.com/pengyue-polaron/one-step-wrong/actions/workflows/ci.yml/badge.svg" />
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-111827?logo=next.js" />
  <img alt="React 19" src="https://img.shields.io/badge/React-19-1f6f8b?logo=react" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white" />
  <img alt="Tests" src="https://img.shields.io/badge/tests-105%20unit%20%2B%2015%20E2E-456b52" />
  <img alt="OpenAI Responses API" src="https://img.shields.io/badge/OpenAI-Responses%20API-276a69" />
  <img alt="MIT License" src="https://img.shields.io/badge/license-MIT-6b7280" />
</p>

**One Step Wrong** is a flight simulator for digital judgment. Learners enter ordinary student tasks, make choices inside believable tools, encounter delayed consequences, and learn through a causal debrief generated from what they actually did. Educators can also use **Scenario Studio** to turn a reviewed Institution Profile and teaching brief into a bounded, playable rehearsal.

It is not a quiz. Choices are not labeled safe, risky, correct, or recommended before the outcome.

![The case library with a featured interactive rehearsal and three NYU digital-safety stories](./artifacts/screenshots/case-library.png)

## Why This Project

Most security training explains the answer before learners feel the pressure that makes a convenient option attractive. This project reverses that order:

1. Give the player a normal task and a credible deadline.
2. Present unmarked choices inside the task itself.
3. Let the convenient path work before its wider effects appear.
4. Require separate recovery actions for account, device, content, and social impact.
5. Reconstruct the causal chain in the debrief.

## Scenario Studio

**Not a branching story. A living security rehearsal.** Open [`/studio`](http://localhost:3000/studio) to create and try a school-aware rehearsal:

1. Research a school from public official sources, or load the reviewed NYU source profile.
2. Review citations, conflicts, warnings, and explicit unknowns before approving the institution context.
3. Define the audience, ordinary task, pressure, threat, and learning objective.
4. Trace approved source facts into a fictionalized published setting, then preview roles, actions, recovery, and outcome coverage.
5. Enter the rehearsal, open verification channels through explicit actions, and see each action return evidence and dialogue.
6. Review the causal chain and final operational state from the actions actually completed.
7. Choose an action in a different task before the built-in transfer rule is revealed.

Learners can start the flagship immediately from the case library or open [`/rehearsal`](http://localhost:3000/rehearsal) directly. After the new-context action is recorded, Evidence Coach answers follow-up questions using only evidence discovered in that run and approved source facts. Completing the new situation unlocks a transient facilitator report with the action sequence, final operational state, evidence, discussion prompts, approved guidance, and a print view.

Adaptive generation and dialogue are optional server-side capabilities. Source checks, reviewed institution context, typed actions, recorded evidence, ending selection, and transfer evaluation remain authoritative. Without an API key, the direct flagship and the explicit **Use example...** path remain complete; live authoring controls are clearly unavailable instead of silently replacing a school or brief with unrelated data.

> **Conversation can adapt. Completed actions determine the consequences.**

The flagship case, **The Voice You Know**, uses fictional Northbridge University and no real person, voice, payment detail, or campus action. See [`PRODUCT_PLAN.md`](./PRODUCT_PLAN.md) for the product direction, [`QUALITY_EVIDENCE.md`](./QUALITY_EVIDENCE.md) for reproducible evidence, and [`AGENTS.md`](./AGENTS.md) for architecture and safety boundaries.

For a ready-to-run 10–35 minute classroom or workshop format, use the bilingual [`FACILITATOR_GUIDE.md`](./FACILITATOR_GUIDE.md).

The reviewed offline profile is grounded in public NYU pages for [Brightspace](https://engineering.nyu.edu/academics/teaching-innovation/learning-management-system), [Duo and file sharing](https://tisch.nyu.edu/cit/information-technology/faq), [Google Workspace](https://shanghai.nyu.edu/page/google-workspace-nyu), [wireless access](https://library.nyu.edu/services/computing/on-campus/wifi/), [phishing indicators and reporting](https://wp.nyu.edu/itsecurity/2024/08/02/salary-adjustment-acknowledgement-phishing-message/), and [student reimbursement documentation](https://www.stern.nyu.edu/portal-partners/budget/students). The profile explicitly leaves a university-wide payment-change callback rule unknown. Brand-safe compilation then transforms protected names, domains, and platforms while retaining source fact IDs.

Brand-safe fictionalization is the default. Authorized exact-brand research requires an explicit permission confirmation, and that confirmation is carried in the validated Institution Profile. When an official domain is supplied, model output cannot replace it; institution evidence must remain on that domain, use HTTPS, receive a server-authored access time, and match a URL returned by the same Responses Web Search call.

## Playable Cases

| Case | Student task | Security boundary | Experience |
| --- | --- | --- | --- |
| **01 · Final Submission** | Restore connectivity and submit an assignment to NYU Brightspace before the deadline. | Wireless identity, domains, configuration profiles, and account recovery. | Deep desktop simulation, 1100 px minimum width. |
| **02 · Sharing Scope** | Give a project team the access needed to finish an interview review. | Specific identities, link scope, editor permissions, version recovery, and disclosure. | Responsive decision chapter. |
| **03 · Was That You?** | Join an advising meeting while repeated Duo requests arrive. | User-initiated login, device and location matching, sessions, recovery methods, and reporting. | Responsive decision chapter. |

Each case has an ordinary objective, an unmarked decision, a delayed consequence where appropriate, individual response actions, multiple endings, and a replayable causal debrief. Progress lasts only for the current browser session.

## Screenshots

### Scenario Studio

![Reviewed NYU Institution Profile with citations, confidence, and an explicit unknown](./artifacts/screenshots/studio-profile.png)

<table>
  <tr>
    <td width="50%"><img alt="Validated Scenario Studio package" src="./artifacts/screenshots/studio-preview.png" /></td>
    <td width="50%"><img alt="Live bounded role rehearsal" src="./artifacts/screenshots/studio-live.png" /></td>
  </tr>
  <tr>
    <td align="center">Validated world, roles, and critical actions</td>
    <td align="center">Action-unlocked channels with explicit learner actions</td>
  </tr>
</table>

![Competing verification channels reveal different evidence during the rehearsal](./artifacts/screenshots/studio-evidence.png)

![Studio review grounded in the learner's recorded actions](./artifacts/screenshots/studio-debrief.png)

![Evidence Coach explaining what a completed verification channel did and did not establish](./artifacts/screenshots/studio-coach.png)

![New-context transfer check showing whether the judgment carried forward](./artifacts/screenshots/studio-transfer.png)

![Facilitator report connecting rehearsal evidence, transfer, and approved guidance](./artifacts/screenshots/facilitator-report.png)

### Decisions in context

<table>
  <tr>
    <td width="50%"><img alt="NYU Drive sharing decision" src="./artifacts/screenshots/drive-sharing.png" /></td>
    <td width="50%"><img alt="Unexpected Duo request decision" src="./artifacts/screenshots/duo-request.png" /></td>
  </tr>
  <tr>
    <td align="center">NYU Drive sharing scope</td>
    <td align="center">Duo login verification</td>
  </tr>
</table>

### Causal debrief

![A debrief connecting the player's choice, evidence, response actions, and transferable rules](./artifacts/screenshots/drive-debrief.png)

### Responsive chapters

<table>
  <tr>
    <td width="33%"><img alt="Case library on a phone" src="./artifacts/screenshots/mobile-case-library.png" /></td>
    <td width="33%"><img alt="NYU Drive chapter on a phone" src="./artifacts/screenshots/mobile-drive-sharing.png" /></td>
    <td width="33%"><img alt="Duo chapter on a phone" src="./artifacts/screenshots/mobile-duo-request.png" /></td>
  </tr>
</table>

## Tech Stack

- Next.js 16, React 19, and strict TypeScript
- OpenAI Responses API with Structured Outputs and Web Search
- Zod runtime schemas and cross-reference validation for all model output
- Bounded state-space exploration proving that every declared scenario outcome is reachable
- Native CSS design system with case-specific institutional palettes
- Lucide React icons
- Pure reducers and simulation physics for deterministic story progression
- Vitest and React Testing Library for state and component tests
- Playwright for complete user flows and responsive layout checks

The case library and complete reviewed flagship work locally. Scenario Studio uses narrowly scoped Next.js server routes when `OPENAI_API_KEY` is configured; without it, the explicit reviewed-example buttons remain available and live authoring requests return a clear error. There is no database, analytics, account system, persistence, or production campus-service integration.

## Technical Evidence

GPT-5.6 has five bounded responsibilities:

1. Research public official institution guidance with source evidence.
2. Compile an approved profile and teaching brief into a validated scenario package.
3. Produce role dialogue within fixed identities, knowledge, channels, and allowed events.
4. Select only validated review elements from the recorded action trace.
5. Answer follow-up questions using discovered evidence and approved source facts.

It does not perform critical actions, mutate payment or access state, choose an ending, or evaluate the learner's transfer action. Those decisions remain in [`src/engine/simulation/physics.ts`](./src/engine/simulation/physics.ts). Runtime validation lives in [`src/ai/schemas`](./src/ai/schemas), model adapters live in [`src/ai`](./src/ai), and all browser-facing calls pass through bounded server routes in [`src/app/api`](./src/app/api).

Before a generated rehearsal can launch, [`src/engine/simulation/coverage.ts`](./src/engine/simulation/coverage.ts) explores every reachable action set through the production physics API. The reviewed flagship currently checks 704 legal action states. Generation fails if safe, caution, contained, or expanded has no legal path; the educator preview shows a shortest representative trace for each outcome.

The same schema proves that every recovery availability branch follows an incident trigger, every state field changed by a contained incident has an effective recovery action for that field, and the final affected-layer state is actually contained. In the flagship, approving payment first appears to work, a later status check reveals the changed route, and containment requires a separate finance hold. Conversation channels appear only after the learner explicitly reaches them; free-form turns remain with the selected role, and action-triggered events are recorded so reviewed dialogue does not loop indefinitely.

The transfer action is recorded before the built-in rule and guided Evidence Coach prompts appear. This turns the second situation into observable learning evidence rather than a restatement immediately after being shown the answer.

Codex was used throughout the repository's implementation to translate the product thesis into the modular case architecture, deterministic simulation engine, source-review workflow, Scenario Studio, product UI, test suite, and documentation. The main engineering decisions were to keep learner actions authoritative, make evidence visible during play, preserve a complete no-key path, and treat generated content as validated proposals rather than world state.

Run `npm run verify:ai` for the model-boundary and API suite. With a local server and `OPENAI_API_KEY`, run `npm run verify:live` to require live provenance from research, generation, role dialogue, review, and Evidence Coach; the command fails if any path uses reviewed fallback content.

## Quick Start

### Requirements

- Node.js 20.9 or newer
- npm 10 or newer

### Run locally

```bash
git clone https://github.com/pengyue-polaron/one-step-wrong.git
cd one-step-wrong
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Add `?dev=1` to expose the development-only story checkpoint panel.

Adaptive research, generation, dialogue, and review are optional. Create `.env.local` from [`.env.example`](./.env.example) and set the server-only key:

```bash
OPENAI_API_KEY=your_key_here
```

Never prefix this key with `NEXT_PUBLIC_`. Without it, use **Use example institution** and **Use example rehearsal**, or open `/rehearsal` directly.

For the first Playwright run:

```bash
npx playwright install chromium
```

### Run the production container

The image uses Next.js standalone output and runs as an unprivileged user. It remains fully playable through the explicit reviewed-example path when no API key is supplied.

```bash
docker build -t one-step-wrong .
docker run --rm -p 3000:3000 one-step-wrong
```

To enable the optional server-side adaptive paths, inject the key at runtime rather than building it into the image:

```bash
docker run --rm -p 3000:3000 \
  -e OPENAI_API_KEY="$OPENAI_API_KEY" \
  one-step-wrong
```

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create an optimized production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint across the repository. |
| `npm run typecheck` | Check TypeScript without emitting files. |
| `npm test` | Run the Vitest state and component suite once. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run test:e2e` | Run the Playwright browser suite. |
| `npm run verify:ai` | Run the focused AI schema, guardrail, adapter, and API suite. |
| `npm run verify:live` | Require live provenance across every GPT-5.6 path on a running server. |

## Architecture

```text
src/
  app/
    api/                            Server-only research, generation, turn, debrief, coach routes
    rehearsal/                      Direct learner entry to the flagship rehearsal
    studio/                         Educator workflow and live flagship preview
  ai/
    schemas/                        Runtime contracts, cross-references, safety validation
    research/                       Institution Research Agent adapter
    scenarios/                      Scenario Architect adapter
    simulation/                     Bounded Director and role-turn validation
    debrief/                        Trace-grounded review and Evidence Coach adapters
  fixtures/                         Reviewed profile, scenario, and dialogue content
  product/
    Game.tsx                        Session-level case selection and completion
    CaseLibrary.tsx                 Playable first screen
    caseRegistry.ts                 Single registry for every published case
  cases/
    types.ts                        Shared case-module contract
    final-submission/               Deep desktop case: UI, state, content, tests
    shared-draft/                   Drive definition and scene
    unexpected-push/                Duo definition and scene
  engine/decision/
    DecisionCaseRunner.tsx          Shared flow orchestration
    reducer.ts                      Pure state transitions and ending selection
    components/                     Shared chapter chrome and choices
    views/                          Outcome, response, and debrief screens
  engine/simulation/               Authoritative physics, traces, transfer, and outcome coverage
  components/ui/                    Reusable button primitives only
  styles/                           Tokens, shared styles, and case-library styles
  tests/e2e/                        Browser flows and responsive layout checks
artifacts/screenshots/              Accepted product screenshots
```

The registry depends on a small `CaseModule` contract: case metadata plus a runner component. The product layer does not know whether a case uses the generic decision engine or a dedicated state machine. Scenario Studio is a separate authoring route and does not replace the playable case library.

The two chapter models are intentional:

- **Decision chapters** use `intro → decision → outcome → response? → debrief` and provide data plus a case-owned scene.
- **Deep simulations** own their state machine and interface while still entering through the same registry.
- **Agentic simulations** accept only runtime-validated declarative packages. Model dialogue is conversational state; explicit typed actions alone can change canonical state.

See [`AGENTS.md`](./AGENTS.md) for architecture rules, content constraints, and the completion checklist.

## Adding a Case

1. Create `src/cases/<case-id>/` with a summary, definition or state model, scene, and tests.
2. Use the decision engine for a focused choice and debrief flow. Use a dedicated reducer only when the story needs multiple tools, free navigation, or a longer incident chain.
3. Export a runner that implements `CaseRunnerProps`.
4. Register the module once in `src/product/caseRegistry.ts`.
5. Add verified story paths, responsive checks, and an accepted screenshot.

Do not add case-specific branching to the product shell. Keep concrete tool UI and story copy inside the case that owns them.

## Quality Gates

Before a change is ready:

```bash
npm run lint
npm run typecheck
npm test
npm run verify:ai
npm run build
npm run test:e2e
```

The current suite contains 105 schema, API, state, and component tests plus 15 browser tests. Coverage includes the featured direct entry, profile review, exact-brand authorization, authoritative hostname validation, streaming request limits, source lineage, action-unlocked channels, delivered-event tracking, delayed consequences, automatic four-outcome reachability, affected-layer recovery, final operational state, pre-rule transfer, Evidence Coach citations, facilitator reporting, malformed adaptive output, instruction-injection rejection, complete safe and incident paths, production builds, 1366x768 through 1920x1080 desktop layouts, and 390x844 phone flows.

## Safety and Privacy

- Credentials and personal details are fixed, read-only story data.
- Authoring and dialogue data remains transient. It is sent only to the explicit server route being used and is never persisted by this application.
- No real Wi-Fi, account, certificate, download, or device API is used.
- Real service names and domains appear only as inert interface text.
- Live institution research is limited to public documentation through OpenAI Web Search; the app never logs in to or invokes campus services.
- OpenAI credentials remain server-only and requests are bounded. Invalid dialogue or review output stays on same-scenario reviewed content; research and generation failures return clear errors without replacing educator input.

These guarantees belong in code and tests, not as immersion-breaking disclaimers inside the game.

## Contributing

Focused issues and pull requests are welcome. Preserve the product rules in `AGENTS.md`, keep case-specific code within its owning module, and include tests proportional to the changed behavior. For visual changes, attach before/after screenshots at relevant desktop and mobile sizes.

## Known Limitations

- The first case is intentionally desktop-only because its multi-window workspace needs at least 1100 px.
- Desktop windows have fixed positions and cannot be freely dragged or resized.
- Sound is synthesized in the browser; there is no music or voice acting.
- There is no login, database, saved progress, collaboration system, runtime localization framework, or real campus integration.
- Live adaptive authoring requires a valid API key and network access; the explicit reviewed-example path keeps the complete product flow available without either.

## License

Licensed under the [MIT License](./LICENSE).
