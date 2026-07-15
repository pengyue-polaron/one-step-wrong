import { describe, expect, it } from "vitest";
import { sharedDraftDefinition } from "@/cases/shared-draft/definition";
import { createDecisionState, decisionReducer, selectDecisionEnding } from "@/engine/decision/reducer";

describe("decision engine", () => {
  it("records a delayed incident and each recovery action", () => {
    const option = sharedDraftDefinition.decision.options.find((item) => item.id === "public-link")!;
    let state = createDecisionState(sharedDraftDefinition);
    state = decisionReducer(sharedDraftDefinition, state, { type: "CHOOSE", option });

    expect(state.stage).toBe("outcome");
    expect(state.events.map((event) => event.id)).toEqual(["task-opened", "choice-public-link", "incident"]);

    state = decisionReducer(sharedDraftDefinition, state, { type: "CONTINUE_OUTCOME" });
    state = decisionReducer(sharedDraftDefinition, state, { type: "PERFORM_RESPONSE", id: "restrict-link" });
    expect(state.stage).toBe("response");
    expect(state.completedActions).toEqual(["restrict-link"]);
    expect(state.events.at(-1)?.id).toBe("response-restrict-link");
  });

  it("contains an incident only after every required action", () => {
    const option = sharedDraftDefinition.decision.options.find((item) => item.id === "public-link")!;
    let state = decisionReducer(sharedDraftDefinition, createDecisionState(sharedDraftDefinition), { type: "CHOOSE", option });
    expect(selectDecisionEnding(sharedDraftDefinition, state)).toBe("expanded");

    for (const step of sharedDraftDefinition.responseSteps.filter((item) => item.required)) {
      state = decisionReducer(sharedDraftDefinition, state, { type: "PERFORM_RESPONSE", id: step.id });
    }
    expect(selectDecisionEnding(sharedDraftDefinition, state)).toBe("contained");
  });

  it("replay returns to a clean intro state", () => {
    const option = sharedDraftDefinition.decision.options[0];
    const chosen = decisionReducer(sharedDraftDefinition, createDecisionState(sharedDraftDefinition), { type: "CHOOSE", option });
    const replayed = decisionReducer(sharedDraftDefinition, chosen, { type: "REPLAY" });

    expect(replayed).toEqual(createDecisionState(sharedDraftDefinition));
  });
});
