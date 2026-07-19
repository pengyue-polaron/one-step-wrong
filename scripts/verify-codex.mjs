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

function requireValue(label, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${label} returned ${actual || "no value"}; expected ${expected}.`);
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
  requireValue("scenario runtime", generation.adaptiveRuntime, "local-codex");
  requireValue("scenario provenance", generation.provenance, "local-adaptation");

  const turn = await post("/api/simulation/turn", {
    scenario: generation.scenario,
    learnerMessage: "What should I verify before I continue?",
    completedActionIds: [],
    preferredRoleId: null,
    deliveredEventIds: [],
    conversationHistory: [],
  });
  requireValue("role dialogue", turn.turn?.provenance, "live-role");

  const debrief = await post("/api/debrief", {
    scenario: generation.scenario,
    actionIds: [],
  });
  requireValue("trace-grounded debrief", debrief.provenance, "live-debrief");

  const coach = await post("/api/coach", {
    scenario: generation.scenario,
    profile: reviewed.profile,
    actionIds: [],
    question: "What remains unverified in this run?",
  });
  requireValue("evidence coach", coach.provenance, "live-coach");

  console.log("Local Codex adaptive-path verification completed.");
} catch (error) {
  console.error(`CODEX VERIFICATION FAILED\n${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
