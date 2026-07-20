# Contributing

One Step Wrong is a learning product, not a general-purpose game engine. Changes should preserve the judgment practice, deterministic safety boundary, and quiet work-focused interface described in [`AGENTS.md`](./AGENTS.md).

## Set Up The Repository

```bash
git clone https://github.com/pengyue-polaron/one-step-wrong.git
cd one-step-wrong
npm ci
npx playwright install chromium
npm run dev
```

The reviewed rehearsals and the **Use example...** Studio path work without an API key. Copy [`.env.example`](./.env.example) to `.env.local` only when testing an optional adaptive provider.

## Before Making A Change

1. Read the relevant product and architecture rules in [`AGENTS.md`](./AGENTS.md).
2. Trace the existing flow and use its case, engine, or UI ownership boundary.
3. Keep learner-facing choices unmarked until an outcome occurs.
4. Keep critical actions and endings in deterministic state transitions.
5. Do not add learner tracking, real service calls, credentials, private data, or immersion-breaking safety disclaimers.

## Code Ownership

- Put case-specific content, state, scenes, and tests in `src/cases/<case-id>/`.
- Put shared short-chapter behavior in `src/engine/decision/`.
- Put canonical simulation actions, recovery, transfer, and endings in `src/engine/simulation/`.
- Validate every model-shaped value in `src/ai/schemas/` before it reaches the product.
- Keep learner routes in `src/app/rehearsal/` and educator authoring in `src/app/studio/`.
- Keep product-shell code free of concrete case branching.

## Quality Gate

Run the complete gate before opening a pull request:

```bash
npm run lint
npm run typecheck
npm test
npm run verify:ai
npm run build
npm run test:e2e
```

Add direct reducer or physics tests for behavioral changes. Add browser coverage for a new critical path, recovery flow, or responsive interaction. Visual changes should update accepted screenshots only after checking the rendered desktop and phone states.

## Pull Requests

Keep pull requests focused and explain:

- The learner or facilitator problem being addressed.
- The product or architecture boundary affected.
- The user path used to verify the change.
- The automated checks that passed.
- Any capability that remains optional, mocked, or unverified live.

Do not include `.env.local`, build output, browser reports, pilot session data, or generated video files.
