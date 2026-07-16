import { z } from "zod";
import {
  bodyTextSchema,
  containsUnsafeInstruction,
  findDuplicates,
  idSchema,
  longTextSchema,
  shortTextSchema,
  toValidationResult,
  type ValidationResult,
} from "@/ai/schemas/common";
import { publicationModeSchema } from "@/ai/schemas/institution";

export const canonicalStateSchema = z.object({
  identity: z.enum(["unverified", "claimed-legitimate", "verified-legitimate", "verified-false"]),
  payment: z.enum(["pending", "paused", "released", "redirected"]),
  access: z.enum(["restricted", "shared", "revoked"]),
  evidence: z.enum(["unpreserved", "preserved"]),
  people: z.enum(["unnotified", "notified"]),
  report: z.enum(["not-reported", "reported"]),
});

const stateChangeSchema = z.object({
  field: z.enum(["identity", "payment", "access", "evidence", "people", "report"]),
  value: z.string().trim().min(1).max(40),
});

const criticalActionSchema = z.object({
  id: idSchema,
  label: shortTextSchema,
  description: bodyTextSchema,
  kind: z.enum(["verify", "pause", "approve", "share", "preserve", "revoke", "notify", "report"]),
  phase: z.enum(["containment", "recovery", "either"]),
  availableAfterAllActionIds: z.array(idSchema).max(10),
  availableAfterAnyActionIds: z.array(idSchema).max(10),
  requiredAfterActionIds: z.array(idSchema).max(10),
  stateChanges: z.array(stateChangeSchema).min(1).max(4),
});

const roleCardSchema = z.object({
  id: idSchema,
  displayName: shortTextSchema,
  identityStatus: z.enum(["legitimate", "mistaken", "compromised", "adversarial"]),
  simulationGoal: bodyTextSchema,
  pressureStyle: bodyTextSchema,
  privateFacts: z.array(bodyTextSchema).min(1).max(8),
  forbiddenFacts: z.array(bodyTextSchema).min(1).max(8),
  allowedChannels: z.array(shortTextSchema).min(1).max(5),
  allowedMoves: z.array(shortTextSchema).min(1).max(8),
  disclosurePolicy: bodyTextSchema,
  escalationPolicy: bodyTextSchema,
});

const allowedEventSchema = z.object({
  id: idSchema,
  roleId: idSchema,
  label: shortTextSchema,
  trigger: bodyTextSchema,
  allowedAfterActionIds: z.array(idSchema).max(10),
  canonicalMutation: z.literal("none"),
});

const endingSchema = z.object({
  id: z.enum(["safe", "caution", "contained", "expanded"]),
  priority: z.number().int().min(1).max(100),
  title: shortTextSchema,
  summary: bodyTextSchema,
  causeChain: z.array(bodyTextSchema).min(2).max(6),
  requiredActionIds: z.array(idSchema).max(12),
  requiredAnyActionIds: z.array(idSchema).max(12),
  forbiddenActionIds: z.array(idSchema).max(12),
  requiresTriggeredRecoveryComplete: z.boolean(),
});

const transferProbeActionSchema = z.object({
  id: idSchema,
  label: shortTextSchema,
  description: bodyTextSchema,
  outcome: z.enum(["demonstrated", "developing", "not-yet"]),
  resultHeadline: shortTextSchema,
  resultSummary: bodyTextSchema,
});

export const scenarioPackageOutputSchema = z
  .object({
    schemaVersion: z.literal("1.0"),
    id: idSchema,
    sourceProfileId: idSchema,
    publicationMode: publicationModeSchema,
    title: shortTextSchema,
    tagline: shortTextSchema,
    summary: bodyTextSchema,
    targetLearner: shortTextSchema,
    durationMinutes: z.number().int().min(3).max(30),
    intro: z.object({
      ordinaryTask: bodyTextSchema,
      environment: bodyTextSchema,
      pressure: bodyTextSchema,
      learningObjective: bodyTextSchema,
    }),
    worldBible: z.object({
      incidentTruth: longTextSchema,
      immutableFacts: z
        .array(
          z.object({
            id: idSchema,
            statement: bodyTextSchema,
            audience: z.enum(["public", "hidden"]),
            institutionSpecific: z.boolean(),
            sourceFactIds: z.array(idSchema).max(8),
          }),
        )
        .min(3)
        .max(20),
      initialState: canonicalStateSchema,
    }),
    criticalActions: z.array(criticalActionSchema).min(3).max(12),
    evidence: z
      .array(
        z.object({
          id: idSchema,
          label: shortTextSchema,
          description: bodyTextSchema,
          revealedByActionIds: z.array(idSchema).min(1).max(6),
        }),
      )
      .min(1)
      .max(12),
    recoveryActionIds: z.array(idSchema).min(1).max(10),
    roleCards: z.array(roleCardSchema).min(1).max(3),
    allowedEvents: z.array(allowedEventSchema).min(1).max(20),
    fallbackDialogue: z
      .array(
        z.object({
          id: idSchema,
          eventId: idSchema,
          roleId: idSchema,
          content: bodyTextSchema,
        }),
      )
      .min(1)
      .max(30),
    endings: z.array(endingSchema).length(4),
    transferProbe: z.object({
      id: idSchema,
      title: shortTextSchema,
      ordinaryTask: bodyTextSchema,
      situation: bodyTextSchema,
      pressure: bodyTextSchema,
      actions: z.array(transferProbeActionSchema).length(3),
    }),
    transferRules: z.array(bodyTextSchema).min(1).max(6),
    sourceFactIds: z.array(idSchema).min(1).max(20),
  });

export const scenarioPackageSchema = scenarioPackageOutputSchema.superRefine((scenario, context) => {
    const groups = [
      ["criticalActions", scenario.criticalActions.map((item) => item.id)],
      ["immutableFacts", scenario.worldBible.immutableFacts.map((item) => item.id)],
      ["evidence", scenario.evidence.map((item) => item.id)],
      ["roleCards", scenario.roleCards.map((item) => item.id)],
      ["allowedEvents", scenario.allowedEvents.map((item) => item.id)],
      ["fallbackDialogue", scenario.fallbackDialogue.map((item) => item.id)],
      ["endings", scenario.endings.map((item) => item.id)],
      ["transferProbe.actions", scenario.transferProbe.actions.map((item) => item.id)],
    ] as const;
    for (const [path, ids] of groups) {
      for (const duplicate of findDuplicates([...ids])) {
        context.addIssue({ code: "custom", path: [path], message: `Duplicate ID: ${duplicate}` });
      }
    }

    const actionIds = new Set(scenario.criticalActions.map((action) => action.id));
    const roleIds = new Set(scenario.roleCards.map((role) => role.id));
    const eventIds = new Set(scenario.allowedEvents.map((event) => event.id));
    const sourceFactIds = new Set(scenario.sourceFactIds);
    const assertAction = (id: string, path: (string | number)[]) => {
      if (!actionIds.has(id)) context.addIssue({ code: "custom", path, message: `Unknown action: ${id}` });
    };

    scenario.worldBible.immutableFacts.forEach((fact, index) => {
      if (fact.institutionSpecific && fact.sourceFactIds.length === 0) {
        context.addIssue({ code: "custom", path: ["worldBible", "immutableFacts", index], message: "Institution facts require source references." });
      }
      fact.sourceFactIds.forEach((id) => {
        if (!sourceFactIds.has(id)) context.addIssue({ code: "custom", path: ["worldBible", "immutableFacts", index, "sourceFactIds"], message: `Unknown source fact: ${id}` });
      });
    });
    const stateValues: Record<string, readonly string[]> = {
      identity: ["unverified", "claimed-legitimate", "verified-legitimate", "verified-false"],
      payment: ["pending", "paused", "released", "redirected"],
      access: ["restricted", "shared", "revoked"],
      evidence: ["unpreserved", "preserved"],
      people: ["unnotified", "notified"],
      report: ["not-reported", "reported"],
    };
    scenario.criticalActions.forEach((action, actionIndex) => {
      const prerequisiteGroups = [
        ["availableAfterAllActionIds", action.availableAfterAllActionIds],
        ["availableAfterAnyActionIds", action.availableAfterAnyActionIds],
        ["requiredAfterActionIds", action.requiredAfterActionIds],
      ] as const;
      prerequisiteGroups.forEach(([field, ids]) => ids.forEach((id, index) => {
        assertAction(id, ["criticalActions", actionIndex, field, index]);
        if (id === action.id) {
          context.addIssue({ code: "custom", path: ["criticalActions", actionIndex, field, index], message: "An action cannot depend on itself." });
        }
        if (field === "requiredAfterActionIds" && scenario.criticalActions.find((candidate) => candidate.id === id)?.phase === "recovery") {
          context.addIssue({ code: "custom", path: ["criticalActions", actionIndex, field, index], message: "Recovery must be triggered by a non-recovery action." });
        }
      }));
      if (action.phase !== "recovery" && action.requiredAfterActionIds.length > 0) {
        context.addIssue({ code: "custom", path: ["criticalActions", actionIndex, "requiredAfterActionIds"], message: "Only recovery actions may declare incident triggers." });
      }
      action.stateChanges.forEach((change, changeIndex) => {
        if (!stateValues[change.field].includes(change.value)) {
          context.addIssue({
            code: "custom",
            path: ["criticalActions", actionIndex, "stateChanges", changeIndex, "value"],
            message: `Invalid ${change.field} state: ${change.value}`,
          });
        }
      });
    });
    const reachableActionIds = new Set<string>();
    let foundReachableAction = true;
    while (foundReachableAction) {
      foundReachableAction = false;
      scenario.criticalActions.forEach((action) => {
        if (reachableActionIds.has(action.id)) return;
        const allReachable = action.availableAfterAllActionIds.every((id) => reachableActionIds.has(id));
        const anyReachable = action.availableAfterAnyActionIds.length === 0
          || action.availableAfterAnyActionIds.some((id) => reachableActionIds.has(id));
        if (allReachable && anyReachable) {
          reachableActionIds.add(action.id);
          foundReachableAction = true;
        }
      });
    }
    scenario.criticalActions.forEach((action, index) => {
      if (!reachableActionIds.has(action.id)) {
        context.addIssue({ code: "custom", path: ["criticalActions", index], message: "Action prerequisites are unreachable." });
      }
    });
    scenario.recoveryActionIds.forEach((id, index) => {
      assertAction(id, ["recoveryActionIds", index]);
      const action = scenario.criticalActions.find((candidate) => candidate.id === id);
      if (action && action.phase !== "recovery") {
        context.addIssue({ code: "custom", path: ["recoveryActionIds", index], message: "Recovery catalog entries must be recovery-phase actions." });
      }
      if (action && action.requiredAfterActionIds.length === 0) {
        context.addIssue({ code: "custom", path: ["recoveryActionIds", index], message: "Recovery actions must declare the incident actions that require them." });
      }
    });
    if (!scenario.recoveryActionIds.some((id) => scenario.criticalActions.find((action) => action.id === id)?.phase === "recovery")) {
      context.addIssue({ code: "custom", path: ["recoveryActionIds"], message: "At least one recovery-phase action is required." });
    }
    scenario.evidence.forEach((item, index) => item.revealedByActionIds.forEach((id) => assertAction(id, ["evidence", index, "revealedByActionIds"])));
    scenario.allowedEvents.forEach((event, index) => {
      if (!roleIds.has(event.roleId)) context.addIssue({ code: "custom", path: ["allowedEvents", index, "roleId"], message: `Unknown role: ${event.roleId}` });
      event.allowedAfterActionIds.forEach((id) => assertAction(id, ["allowedEvents", index, "allowedAfterActionIds"]));
    });
    scenario.fallbackDialogue.forEach((line, index) => {
      if (!roleIds.has(line.roleId)) context.addIssue({ code: "custom", path: ["fallbackDialogue", index, "roleId"], message: `Unknown role: ${line.roleId}` });
      const event = scenario.allowedEvents.find((candidate) => candidate.id === line.eventId);
      if (!eventIds.has(line.eventId)) context.addIssue({ code: "custom", path: ["fallbackDialogue", index, "eventId"], message: `Unknown event: ${line.eventId}` });
      if (event && event.roleId !== line.roleId) context.addIssue({ code: "custom", path: ["fallbackDialogue", index], message: "Fallback role does not own its event." });
    });
    scenario.endings.forEach((ending, index) => {
      ending.requiredActionIds.forEach((id) => assertAction(id, ["endings", index, "requiredActionIds"]));
      ending.requiredAnyActionIds.forEach((id) => assertAction(id, ["endings", index, "requiredAnyActionIds"]));
      ending.forbiddenActionIds.forEach((id) => assertAction(id, ["endings", index, "forbiddenActionIds"]));
      if (ending.requiresTriggeredRecoveryComplete && ending.requiredAnyActionIds.length === 0) {
        context.addIssue({ code: "custom", path: ["endings", index], message: "Recovery-complete endings need at least one incident trigger." });
      }
      if (ending.requiresTriggeredRecoveryComplete) {
        ending.requiredAnyActionIds.forEach((triggerId) => {
          const hasRecovery = scenario.recoveryActionIds.some((recoveryId) =>
            scenario.criticalActions.find((action) => action.id === recoveryId)?.requiredAfterActionIds.includes(triggerId),
          );
          if (!hasRecovery) {
            context.addIssue({ code: "custom", path: ["endings", index, "requiredAnyActionIds"], message: `Incident trigger has no required recovery: ${triggerId}` });
          }
        });
      }
    });
    if (new Set(scenario.endings.map((ending) => ending.id)).size !== 4) {
      context.addIssue({ code: "custom", path: ["endings"], message: "Provide safe, caution, contained, and expanded endings." });
    }
    if (new Set(scenario.transferProbe.actions.map((action) => action.outcome)).size !== 3) {
      context.addIssue({
        code: "custom",
        path: ["transferProbe", "actions"],
        message: "Transfer probes must include demonstrated, developing, and not-yet outcomes.",
      });
    }
    if (containsUnsafeInstruction(scenario)) {
      context.addIssue({ code: "custom", path: [], message: "Scenario contains executable or credential-collection instructions." });
    }
  });

export type ScenarioPackage = z.infer<typeof scenarioPackageSchema>;
export type CanonicalState = z.infer<typeof canonicalStateSchema>;

export function validateScenarioPackage(value: unknown): ValidationResult<ScenarioPackage> {
  return toValidationResult(scenarioPackageSchema.safeParse(value));
}
