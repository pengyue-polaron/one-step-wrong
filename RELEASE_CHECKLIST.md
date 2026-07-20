# Repository Release Checklist

Use this checklist before changing the repository from private to public.

## Source And History

- [ ] `main` contains the intended release and is synchronized with `origin/main`.
- [ ] `git status --short` is empty.
- [ ] `.env.local`, `.next*`, `node_modules`, browser reports, test results, pilot data, and demo recordings are not tracked.
- [ ] The current tree and commit history contain no API keys, tokens, private keys, credentials, personal data, or private school material.
- [ ] The MIT license and asset notes match everything distributed in the repository.

## Product

- [ ] The case library is the first screen.
- [ ] `/rehearsal` completes without an API key through practice, review, transfer, Evidence Coach, and facilitator report.
- [ ] `/studio` completes through **Use example institution** and **Use example rehearsal** without an API key.
- [ ] One safe route and one incident-and-recovery route have been completed manually.
- [ ] The 390x844 phone flow and a 1366x768 desktop flow have been visually inspected.
- [ ] No learner-facing screen exposes provider, model, hackathon, fixture, fallback, schema, deterministic, or canonical implementation terms.

## Verification

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run verify:ai
npm run build
npm run test:e2e
npm audit --omit=dev
```

- [ ] Every command above passes from a clean checkout.
- [ ] The local Codex path, when claimed, passes `npm run verify:codex` against a running development server.
- [ ] The Platform path, when claimed as live, passes `npm run verify:live` with a valid server-only key.
- [ ] Test commands leave `next-env.d.ts` unchanged.

## Repository Presentation

- [ ] README screenshots render without authentication after the visibility change.
- [ ] GitHub About text, topics, license, and default branch are correct.
- [ ] CI completes successfully on the public `main` branch.
- [ ] `CONTRIBUTING.md`, `SECURITY.md`, and `ASSET_NOTES.md` are visible.
- [ ] A canonical public origin, when available, is assigned to `SITE_URL` and the GitHub homepage field.
- [ ] The repository opens successfully in an incognito window and can be cloned without account access.

Do not publish `.env.local` or convert the local Codex adapter into a public service. A public deployment should use the reviewed no-key path or the server-side Platform API integration.
