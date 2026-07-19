# Facilitator Guide

<p>
  <a href="./FACILITATOR_GUIDE.md"><strong>English</strong></a> ·
  <a href="./FACILITATOR_GUIDE.zh-CN.md">简体中文</a>
</p>

This guide turns One Step Wrong into a short classroom, orientation, or team-learning activity. It does not require accounts, learner tracking, or an API key.

## Learning Goal

Learners should be able to:

1. Distinguish familiarity from verified identity.
2. Explain what a verification channel establishes and what it does not.
3. Keep high-impact actions behind an independently known channel.
4. Match access audience and permission to the work being done.
5. Separate temporary task access from future account-recovery authority.
6. Identify separate containment, recovery, communication, and reporting steps.
7. Apply the same judgment rule in a different task.

## Session Formats

| Format | Time | Suggested use |
| --- | ---: | --- |
| Individual rehearsal | 10 min | Orientation, advising, or self-directed learning |
| Pair discussion | 20 min | Class, student organization, or staff workshop |
| Facilitated comparison | 30–35 min | Security-awareness session or instructor-led lab |

## Before The Session

1. Open `/rehearsal` for identity verification, `/rehearsal/sharing-scope` for access scope, `/rehearsal/recovery-window` for recovery authority, or `/` to choose another case.
2. Complete one practice run yourself and open the facilitator report.
3. Decide whether learners will act individually, in pairs, or through a shared projected screen.
4. Do not announce which action is safest. Introduce the ordinary task and let the pressure work.
5. Do not ask learners to enter real names, credentials, payment information, or incident details.

## During Practice

Use prompts that preserve the decision:

- What are you trying to finish right now?
- What does this channel, audience, or permission actually establish?
- Which information came from the request itself?
- Who can act after this choice, and what can they change?
- What would change if the deadline were removed?
- Which action changes payment, access, or account state?

Avoid prompts that reveal the answer:

- Which option is secure?
- Can you spot the scam?
- Why is this request fake?

When learners disagree, ask each person to name the evidence behind the action rather than vote on the action alone.

## Review And Transfer

After the outcome:

1. Compare the recorded action sequence with the evidence discovered at each step.
2. Ask learners to state a tentative judgment rule in their own words.
3. Complete the new situation before the product reveals its built-in rule or guided evidence questions.
4. Compare the learner's action with the revealed rule, then use Evidence Coach to examine only evidence discovered in that run.
5. Open the facilitator report and follow its 5-minute **Ask → Compare → Apply** path: reconstruct the pressure, compare the discovered evidence with the original request, and name where the rule should be used next.
6. Use the report's observation cue to categorize the explanation after the session. Record only aggregate counts; do not retain learner wording.

The transfer decision is more useful than the first ending alone. A safe first run may reflect prior knowledge or a lucky choice; applying the rule in a different task is stronger evidence that the judgment carried forward.

## Discussion Prompts

- What made the convenient action feel reasonable?
- Which clue was available but easy to discount?
- Did a familiar person, brand, or context become a substitute for verification?
- Which check moved outside the channel controlled by the request?
- If an unsafe action had already occurred, which affected layer would you address first?
- What part of the rule would still apply to file sharing, MFA, account recovery, or an urgent document request?

## Lightweight Learning Evidence

One Step Wrong does not collect analytics. The [`pilot/`](./pilot/) kit provides a strict session-level template, measure definitions, and a local analyzer for a small formative pilot.

1. Record one aggregate row for the whole session, never one row per learner.
2. Count first rehearsal outcomes, new-situation results, explanation categories, and material technical blockers.
3. Categorize explanations with the predefined rubric; do not retain learner wording or quotes.
4. Do not record names, contact details, demographics, class or institution identifiers, timestamps, open notes, or real incident descriptions.
5. Run `npm run pilot:analyze -- pilot/local/session-aggregate.csv` to validate totals and produce an aggregate summary.

Do not treat an ending as a grade. Report the result as exploratory group-level evidence, not proof of causal improvement or individual competence. The template and analyzer are not evidence until a real session has occurred.

## Accessibility And Inclusion

- Let learners read at their own pace and replay a critical moment.
- Use the operating-system or browser reduced-motion setting when animation affects comfort or concentration. Final Submission also provides an in-app control.
- Read role messages and evidence aloud for a shared-screen session.
- Allow a partner to operate the interface while both learners discuss the decision.
- Avoid requiring personal disclosure about past security incidents.

## Facilitator Checklist

- [ ] The ordinary task is clear.
- [ ] Choices remain unmarked before selection.
- [ ] Learners identify evidence, not only a preferred action.
- [ ] Recovery is discussed by affected layer.
- [ ] The new situation is completed.
- [ ] The report is used for discussion, not individual grading.
- [ ] No real credentials, private incidents, or learner identity are recorded.
