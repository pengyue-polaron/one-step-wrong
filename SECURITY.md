# Security Policy

## Supported Version

Security fixes are applied to the current `main` branch. This repository does not maintain older release lines.

## Report A Vulnerability

Use GitHub private vulnerability reporting when it is available for this repository. If that option is unavailable, open an issue asking the maintainer for a private contact channel without including vulnerability details, credentials, personal data, or a working exploit.

Include the affected route or module, expected boundary, observed behavior, reproduction conditions, and likely impact. Use fictional or redacted data only.

## Relevant Security Boundaries

Reports are especially useful when they demonstrate that the application can:

- Expose `OPENAI_API_KEY`, Codex credentials, prompts, or model output to the browser or logs.
- Persist authoring input, learner dialogue, or traces without explicit authorization.
- Let free-form text change payment, access, content, account, recovery, score, or ending state.
- Accept model output that bypasses runtime schemas, source approval, or scenario reachability checks.
- Reach a real campus service, device API, credential store, file download, or arbitrary network target.
- Execute prompt-injected instructions or disclose hidden scenario facts.
- Introduce cross-site scripting, request forgery, path traversal, command execution, or dependency compromise.

Story choices that intentionally lead to a simulated incident are product behavior, not vulnerabilities, unless they cross one of the implementation boundaries above.

## Credentials And Test Data

Never submit a real API key, account, credential, payment detail, private school document, learner identity, or incident report. The committed examples are fictional or public-source teaching data. Rotate any credential immediately if it is accidentally exposed, even when the commit is later removed.
