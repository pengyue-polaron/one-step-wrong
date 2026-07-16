# One Step Wrong Product Plan

> Status: active product brief  
> Product thesis: **Security judgment is a skill. Skills are learned through practice, not reminders.**

This document defines the product direction for One Step Wrong. `PLAN.md` preserves the original case-library foundation; this plan covers Scenario Studio, institution-aware authoring, adaptive rehearsal, evidence, recovery, and learning transfer.

## Product Promise

**One Step Wrong is a flight simulator for digital judgment.**

Learners enter an ordinary school task, face credible pressure, make unmarked choices, and see consequences follow what they actually did. Educators can turn reviewed public guidance and a learning objective into a bounded rehearsal that remains useful with or without adaptive model output.

The product is not a quiz, a chatbot, or a collection of phishing examples. Its value comes from:

- believable tasks rather than security trivia;
- choices whose labels do not reveal the answer;
- consequences that may appear after the convenient action seems to work;
- separate investigation, containment, communication, and recovery actions;
- evidence gathered during play;
- a causal review based on the learner's recorded actions;
- evidence-grounded follow-up questions that explain what each completed check established;
- a second situation that tests whether the judgment transfers.

## Target Users

### Learners

Students and staff who need practice making security decisions inside familiar academic workflows, especially when time pressure, authority, social proof, or convenience make the wrong action feel reasonable.

### Educators

Security-awareness, instructional-technology, and student-support teams that need scenarios grounded in their institution's terminology and public guidance without creating a custom simulation from scratch.

## Core Experience

### Case library

The first screen remains the playable case library. It offers complete rehearsals that can be started immediately and does not require authoring, an account, or an API key.

### Scenario Studio

The educator workflow has four stages:

1. **Research** public official guidance for an institution.
2. **Review** sources, supported facts, conflicts, warnings, and explicit unknowns.
3. **Design** an ordinary task, threat, audience, pressure, and learning objective.
4. **Preview** the bounded roles, actions, evidence, recovery, and possible outcomes before starting the rehearsal.

The learner workflow has three stages:

1. **Practice** inside the ordinary task.
2. **Review** the consequences and causal chain.
3. **Apply** the same judgment in a different situation.

Authoring concepts and implementation terminology must not leak into the learner workflow.

After the learner selects an action in the new situation, an optional **Facilitate** view summarizes the rehearsal result, transfer evidence, recorded actions, discovered evidence, discussion prompts, and approved institutional guidance. It remains transient and does not store learner identity.

## Learning Model

Every scenario must:

1. Begin with an ordinary goal rather than a security assignment.
2. Introduce realistic pressure, ambiguity, and a genuinely convenient shortcut.
3. Avoid labeling choices as safe, risky, correct, suspicious, or recommended.
4. Let evidence emerge from learner actions instead of presenting every clue up front.
5. Keep high-impact changes behind explicit controls.
6. Model recovery as separate actions for each affected layer.
7. Reconstruct the result without shaming the learner.
8. End with a transferable judgment rule and a new-context application.

When identity verification is part of the lesson, the scenario must offer plausible competing channels. A request-supplied callback, a same-conversation confirmation, social confirmation, and an independently known channel establish different things. Each completed check should reveal evidence explaining what it did and did not prove.

## Flagship Rehearsal

### The Voice You Know

- **Institution:** fictional Northbridge University, informed by a reviewed NYU public-source profile.
- **Learner role:** student organization treasurer.
- **Ordinary task:** finalize a guest-speaker reimbursement before the event begins.
- **Pressure:** a familiar adviser voice asks for a last-minute payment-detail change.
- **Verification choices:** call the number attached to the request, ask the organization group chat, or call the saved directory number.
- **Convenient path:** approve the change and share workspace access.
- **Safer friction:** pause the payment and verify through an independently known channel.
- **Recovery:** preserve evidence, pause payment, revoke access, notify affected people, and report through the approved fictional channel.
- **Transfer rule:** a familiar voice is a clue, not proof of identity.

The public scenario contains no real person, voice, payment information, or campus operation.

## Product Architecture

Adaptive systems may change wording, timing, pressure, and conversational responses. They may not change immutable facts, perform real operations, select high-impact actions, determine the ending, or grade the transfer decision.

The runtime is split into:

- **World state:** facts, completed actions, evidence, affected layers, recovery, and outcome.
- **Conversation state:** sanitized learner messages, bounded role replies, and allowed conversational events.
- **Presentation state:** current view, drafts, loading, and transient interface state.

Only the simulation engine may update world state. Server-side adaptive routes receive the minimum read-only context needed for their task, and every structured response must pass runtime validation before use.

## Institution Context

Research is limited to public official documentation and primary vendor guidance. The educator must be able to:

- inspect each source and its supported facts;
- see confidence, conflicts, warnings, and unknowns;
- edit or reject unsupported material;
- approve the Institution Profile before scenario generation;
- choose fictionalized publication by default;
- use exact names only after confirming permission.

An official domain supplied by the educator cannot be replaced by generated output. Source URLs must use HTTPS, match the allowed domain, and be tied to evidence returned by the same server-side research request.

## Reliability

The complete flagship rehearsal must remain usable without a network or API key through reviewed institution, scenario, dialogue, and review content. The interface may describe this as an example or recorded review in educator surfaces, but learner screens should present only the story, available actions, evidence, and consequences.

Failures must:

- preserve the last valid state;
- return a concise user-facing message;
- avoid exposing provider, prompt, schema, stack, or credential details;
- fall back only to content reviewed for the same institution profile and publication mode.

## Safety And Privacy

- Keep API credentials server-side.
- Never collect real credentials, student records, private incident data, or payment details.
- Treat retrieved pages and learner messages as untrusted input.
- Do not call real campus, identity, payment, device, or messaging services.
- Keep authoring and dialogue transient by default.
- Bound request size, response size, role count, event count, and request duration.
- Do not render generated HTML or executable content.
- Give adaptive roles no tools with real side effects.

These guarantees belong in code and tests, not in immersion-breaking learner disclaimers.

## Explicit Non-Goals

- A generic cybersecurity chatbot.
- An AI tutor floating over every screen.
- User accounts, school SSO, or a production database.
- A learning-management-system integration.
- Real phishing delivery, credential collection, voice cloning, or payment operations.
- A general-purpose crawler or authenticated portal automation.
- A drag-and-drop scenario editor.
- Infinite branching or unconstrained agent creation.
- Model-selected scores, actions, consequences, or endings.
- A marketing landing page replacing the playable case library.

## Acceptance Criteria

### Educator workflow

- Public guidance can be researched or loaded from a reviewed example.
- Every institution fact is supported, disputed, or explicitly unknown.
- Sources can be approved or rejected before profile approval.
- A bounded scenario can be generated, validated, previewed, and launched.
- Fictionalization prevents protected institution terms from leaking into a public scenario.

### Learner workflow

- The rehearsal begins with an ordinary task and credible pressure.
- Verification choices do not reveal the answer in their labels.
- Each verification channel reveals distinct evidence.
- Free text can influence conversation but cannot mutate high-impact state.
- Recovery appears only for layers actually affected by completed actions.
- The review accurately lists completed actions, evidence, outcome, and missed recovery.
- Follow-up answers cite only evidence discovered in the current run and approved source facts.
- The new situation evaluates only the explicit action selected there.
- The facilitator report connects the rehearsal, transfer result, and approved guidance without storing learner identity.
- Learner screens contain no provider, model, hackathon, fixture, fallback, schema, canonical, or deterministic terminology.

### Quality

- Invalid or unavailable adaptive output cannot break the complete product path.
- Desktop layouts remain usable from 1366x768 through 1920x1080.
- Responsive chapters and Scenario Studio remain usable at 390x844 without horizontal overflow.
- Lint, type checking, unit/API/component tests, production build, and browser tests pass.

## Next Product Priorities

1. Add more scenarios that test different judgment patterns, not just different attack skins.
2. Improve educator editing so facts, actions, evidence, and transfer prompts can be refined without editing code.
3. Test whether learners can explain the strength and limits of a verification channel without guided prompts.
4. Add accessibility checks for keyboard navigation, focus order, contrast, and reduced motion.
