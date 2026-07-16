const baseUrl = (process.env.VERIFY_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

async function post(path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}: ${payload.error || "unknown error"}`);
  }
  return payload;
}

function requireProvenance(label, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${label} used ${actual || "no provenance"}; expected ${expected}. Check OPENAI_API_KEY and server logs.`);
  }
  console.log(`PASS ${label}: ${actual}`);
}

const brief = {
  threatTopic: "Voice impersonation and urgent payment changes",
  targetLearner: "Student organization treasurers, ages 18+",
  ordinaryTask: "Finalize a guest-speaker reimbursement before an event begins.",
  environment: "Student organization finance workspace and group chat",
  pressure: "The event begins in twenty minutes",
  learningObjective: "Verify high-impact requests through an independently known channel, then contain and recover from unsafe actions.",
  durationMinutes: 8,
  tone: "realistic",
};

try {
  const research = await post("/api/institutions/research", {
    institutionName: "New York University",
    officialDomains: ["nyu.edu"],
    publicationMode: "brand-safe-fictionalized",
    authorizationConfirmed: false,
    useFixture: false,
  });
  requireProvenance("institution research", research.provenance, "live-research");

  const reviewed = await post("/api/institutions/research", {
    institutionName: "New York University",
    officialDomains: ["nyu.edu"],
    publicationMode: "brand-safe-fictionalized",
    authorizationConfirmed: false,
    useFixture: true,
  });

  const generation = await post("/api/scenarios/generate", {
    profile: reviewed.profile,
    brief,
    useFixture: false,
  });
  requireProvenance("scenario generation", generation.provenance, "live-generation");

  const scenario = generation.scenario;
  const profile = generation.profile || reviewed.profile;
  const firstAction = scenario.criticalActions.find(
    (action) =>
      action.availableAfterAllActionIds.length === 0
      && action.availableAfterAnyActionIds.length === 0,
  );
  if (!firstAction) throw new Error("Generated scenario has no action available at the start.");
  const actionIds = [firstAction.id];

  const turn = await post("/api/simulation/turn", {
    scenario,
    learnerMessage: "What should I verify before I continue?",
    completedActionIds: actionIds,
    preferredRoleId: scenario.roleCards[0]?.id,
    conversationHistory: [],
  });
  requireProvenance("role dialogue", turn.turn?.provenance, "live-role");

  const debrief = await post("/api/debrief", { scenario, actionIds });
  requireProvenance("trace-grounded debrief", debrief.provenance, "live-debrief");

  const coach = await post("/api/coach", {
    scenario,
    profile,
    actionIds,
    question: "What did this action establish, and what remains unverified?",
  });
  requireProvenance("evidence coach", coach.provenance, "live-coach");

  console.log("Live GPT-5.6 verification completed.");
} catch (error) {
  console.error(`LIVE VERIFICATION FAILED\n${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
