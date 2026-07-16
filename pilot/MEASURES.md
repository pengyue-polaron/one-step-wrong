# Pilot Measures

Each CSV row represents one facilitated session, never one learner. Record counts only after the session. Do not preserve raw learner wording.

## Session Fields

| Field | Accepted value | Definition |
| --- | --- | --- |
| `session_code` | `S` plus 3-6 digits | Neutral local sequence, such as `S001`. It must not encode identity, class, institution, or date. |
| `scenario_version` | Versioned slug or 7-40 character commit hash | Reviewed scenario identifier such as `voice-you-know-v1`, or the commit used for the session. |
| `delivery_mode` | `individual`, `pair`, `facilitated-group`, or `projected-group` | How learners completed the activity. |
| `participants_started` | Non-negative integer greater than 0 | Learners who began the rehearsal in this session. |
| `participants_completed` | Non-negative integer | Learners who reached a first rehearsal ending. |
| `participants_with_technical_blocker` | Non-negative integer | Learners whose completion was materially interrupted by a device, browser, network, or display problem. |

`participants_completed` and `participants_with_technical_blocker` cannot exceed `participants_started`.

## First Rehearsal Outcome

Record the product's first ending for each learner who completed the rehearsal:

- `first_safe`
- `first_caution`
- `first_contained`
- `first_expanded`

These four counts must add up exactly to `participants_completed`. They are paths through the story, not grades.

## New-Situation Transfer

Record the product's transfer result for learners who completed the new situation:

- `transfer_demonstrated`
- `transfer_developing`
- `transfer_not_yet`

The total may be lower than `participants_completed` if some learners did not reach the new situation, but it cannot be higher.

## Explanation Rubric

After the new situation, ask learners to explain the judgment pattern behind their action and what that action protects. Use the prompt that matches the rehearsal:

- identity verification: why an independently known channel is stronger, what it establishes, and what remains unverified;
- access scope: why the selected audience and permission fit the task, what they allow, and what remains exposed.

Categorize the answer immediately; do not transcribe or retain the wording.

- `explanation_clear`: names the scenario's judgment rule, connects it to the selected action, and explains the relevant tradeoff or remaining uncertainty.
- `explanation_partial`: recognizes the relevant risk dimension but does not fully explain how the action changes it or what remains unresolved.
- `explanation_unclear`: gives only a generic warning, names a preferred action without supporting reasoning, or does not answer.

The explanation total may be lower than `participants_completed`, but it cannot be higher. Do not infer missing explanations from the learner's ending.

## Interpretation

Use transfer and explanation distributions as separate descriptive signals. Session aggregates cannot show whether a specific learner improved from the first rehearsal to the new situation. Without a pre-test, control group, and reviewed study design, the summary cannot support a causal learning claim.
