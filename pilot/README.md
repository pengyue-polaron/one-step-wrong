# Anonymous Pilot Kit

This kit supports a small formative pilot without adding analytics, accounts, or learner-level records to One Step Wrong. The application remains unchanged: facilitators record aggregate counts after a session and analyze them locally.

The kit can show whether a group completed the rehearsal, how transfer choices were distributed, and how many explanations met a predefined rubric. It cannot establish that the product caused learning improvement.

## Files

- `templates/session-aggregate.csv` is the only accepted input shape. It contains a header and no invented results.
- `MEASURES.md` defines every count and the explanation rubric.
- `scripts/analyze-pilot.mjs` validates and summarizes one or more session rows.
- `pilot/local/` is ignored by Git and is the intended location for local working data.

## Run A Session

1. Use the facilitator guide and complete the featured rehearsal, review, and new situation.
2. Assign the session a neutral code such as `S001`. Do not encode a class, institution, date, facilitator, or learner identity in the code.
3. After the session, enter one row of aggregate counts using the definitions in `MEASURES.md`.
4. Do not enter names, email addresses, phone numbers, links, demographics, timestamps, quotes, open notes, or descriptions of real incidents.
5. Analyze the local file:

```bash
npm run pilot:analyze -- pilot/local/session-aggregate.csv
```

The command prints an aggregate Markdown summary. It never prints session codes or individual rows.

## Privacy Boundary

The analyzer accepts only:

- a numeric session code in the form `S001`;
- a bounded scenario version;
- one controlled delivery mode;
- non-negative integer counts.

It rejects unknown or missing columns, quoted/free-text cells, PII-like values, duplicate session codes, negative or decimal counts, and inconsistent totals.

If a learner voluntarily shares personal information or a real incident, do not place it in the pilot file. Follow the host organization's policies for consent, review, retention, and deletion. This kit is a formative evaluation aid, not a substitute for an approved human-subjects research protocol.

## Reporting Boundary

Report the output as exploratory group-level evidence. Do not claim:

- causal learning improvement;
- statistical significance;
- population-wide effectiveness;
- individual competence;
- results from sessions that did not occur.

The template and analyzer are infrastructure, not participant evidence. A real pilot result exists only after an actual session, a reviewed aggregate file, and an honest description of the sample and procedure.
