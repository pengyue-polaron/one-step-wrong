# One Step Wrong

<p>
  <a href="./README.md"><strong>English</strong></a> ·
  <a href="./README.zh-CN.md">简体中文</a>
</p>

<p>
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-111827?logo=next.js" />
  <img alt="React 19" src="https://img.shields.io/badge/React-19-1f6f8b?logo=react" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white" />
  <img alt="Tests" src="https://img.shields.io/badge/tests-24%20unit%20%2B%2010%20E2E-456b52" />
</p>

**One Step Wrong** is an interactive digital-safety story collection set at New York University. Players enter ordinary student tasks, make choices inside believable tools, encounter delayed consequences, and learn through a causal debrief generated from what they actually did.

It is not a quiz. Choices are not labeled safe, risky, correct, or recommended before the outcome.

![The case library showing three playable NYU digital-safety stories](./artifacts/screenshots/case-library.png)

## Why This Project

Most security training explains the answer before learners feel the pressure that makes a convenient option attractive. This project reverses that order:

1. Give the player a normal task and a credible deadline.
2. Present unmarked choices inside the task itself.
3. Let the convenient path work before its wider effects appear.
4. Require separate recovery actions for account, device, content, and social impact.
5. Reconstruct the causal chain in the debrief.

## OpenAI Build Week Direction

**Not a branching story. A living security rehearsal.** In the planned Build Week adaptation, an educator starts with a school name or official domain. A GPT-5.6 Institution Research Agent builds a cited profile from official public guidance; after educator approval, a Scenario Architect compiles a validated world with immutable facts, critical actions, recovery rules, and bounded roles. During play, a Simulation Director and up to three role agents adapt the people, pressure, and conversation to the learner's behavior. The deterministic engine still owns every high-impact action, consequence, and ending. A Debrief Analyst then produces coaching grounded in the learner's canonical action trace and approved sources.

> **Agents perform the world; deterministic code defines its physics.**

These AI capabilities are an implementation target and are not part of the current static prototype yet. See [`BUILD_WEEK_PLAN.md`](./BUILD_WEEK_PLAN.md) for the canonical product story, flagship case, architecture, safety boundaries, acceptance criteria, demo outline, and implementation order.

## Playable Cases

| Case | Student task | Security boundary | Experience |
| --- | --- | --- | --- |
| **01 · Final Submission** | Restore connectivity and submit an assignment to NYU Brightspace before the deadline. | Wireless identity, domains, configuration profiles, and account recovery. | Deep desktop simulation, 1100 px minimum width. |
| **02 · Sharing Scope** | Give a project team the access needed to finish an interview review. | Specific identities, link scope, editor permissions, version recovery, and disclosure. | Responsive decision chapter. |
| **03 · Is This You?** | Join an advising meeting while repeated Duo requests arrive. | User-initiated login, device and location matching, sessions, recovery methods, and reporting. | Responsive decision chapter. |

Each case has an ordinary objective, an unmarked decision, a delayed consequence where appropriate, individual response actions, multiple endings, and a replayable causal debrief. Progress lasts only for the current browser session.

## Screenshots

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
- Native CSS design system with restrained NYU Violet accents
- Lucide React icons
- `useReducer` state machines for deterministic story progression
- Vitest and React Testing Library for state and component tests
- Playwright for complete user flows and responsive layout checks

The application is fully local and static. It has no backend, analytics, account system, or production campus-service integration.

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

For the first Playwright run:

```bash
npx playwright install chromium
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

## Architecture

```text
src/
  app/                              Next.js route and document metadata
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
  components/ui/                    Reusable button primitives only
  styles/                           Tokens, shared styles, and case-library styles
  tests/e2e/                        Browser flows and responsive layout checks
artifacts/screenshots/              Accepted product screenshots
```

The registry depends on a small `CaseModule` contract: case metadata plus a runner component. The product layer does not know whether a case uses the generic decision engine or a dedicated state machine.

The two chapter models are intentional:

- **Decision chapters** use `intro → decision → outcome → response? → debrief` and provide data plus a case-owned scene.
- **Deep simulations** own their state machine and interface while still entering through the same registry.

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
npm run build
npm run test:e2e
```

The current suite contains 24 state/component tests and 10 browser tests. Browser coverage includes complete safe and incident paths, recovery outcomes, 1366×768 through 1920×1080 desktop layouts, and a 390×844 phone flow.

## Safety and Privacy

- Credentials and personal details are fixed, read-only story data.
- No form data is persisted or transmitted.
- No real Wi-Fi, account, certificate, download, or device API is used.
- Real service names and domains appear only as inert interface text.
- The app never calls NYU, Brightspace, Google Workspace, Duo, or other campus services.

These guarantees belong in code and tests, not as immersion-breaking disclaimers inside the game.

## Contributing

Focused issues and pull requests are welcome. Preserve the product rules in `AGENTS.md`, keep case-specific code within its owning module, and include tests proportional to the changed behavior. For visual changes, attach before/after screenshots at relevant desktop and mobile sizes.

## Known Limitations

- The first case is intentionally desktop-only because its multi-window workspace needs at least 1100 px.
- Desktop windows have fixed positions and cannot be freely dragged or resized.
- Sound is synthesized in the browser; there is no music or voice acting.
- There is no backend, login, saved progress, localization framework, or real campus integration.

## License

No open-source license has been published for this repository. Until a license is added, the source is available for inspection but no reuse rights are granted.
