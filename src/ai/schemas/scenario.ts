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
import { reachableActionIdsForScenario } from "@/engine/simulation/availability";

export const canonicalStateSchema = z.object({
  identity: z.enum(["unverified", "claimed-legitimate", "verified-legitimate", "verified-false"]),
  payment: z.enum(["pending", "paused", "released", "redirected"]),
  access: z.enum(["restricted", "shared", "revoked"]),
  content: z.enum(["intact", "modified", "restored"]),
  evidence: z.enum(["unpreserved", "preserved"]),
  people: z.enum(["unnotified", "notified"]),
  report: z.enum(["not-reported", "reported"]),
});

export type CanonicalState = z.infer<typeof canonicalStateSchema>;
const canonicalFieldSchema = z.enum(["identity", "payment", "access", "content", "evidence", "people", "report"]);

const recoveredCanonicalValues: Record<keyof CanonicalState, readonly string[]> = {
  identity: ["verified-legitimate", "verified-false"],
  payment: ["pending", "paused"],
  access: ["restricted", "revoked"],
  content: ["intact", "restored"],
  evidence: ["preserved"],
  people: ["notified"],
  report: ["reported"],
};

export function isRecoveredCanonicalValue(field: keyof CanonicalState, value: string) {
  return recoveredCanonicalValues[field].includes(value);
}

const stateChangeSchema = z.object({
  field: canonicalFieldSchema,
  value: z.string().trim().min(1).max(40),
});

const criticalActionSchema = z.object({
  id: idSchema,
  label: shortTextSchema,
  description: bodyTextSchema,
  kind: z.enum(["verify", "inspect", "pause", "approve", "share", "preserve", "revoke", "restore", "notify", "report"]),
  phase: z.enum(["containment", "recovery", "either"]),
  availableAfterAllActionIds: z.array(idSchema).max(10),
  availableAfterAnyActionIds: z.array(idSchema).max(10),
  requiredAfterActionIds: z.array(idSchema).max(10),
  stateChanges: z.array(stateChangeSchema).max(4),
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
  delivery: z.enum(["on-action", "on-message"]),
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

const learnerPresentationSchema = z.object({
  openingEventId: idSchema,
  workspace: z.object({
    appName: shortTextSchema,
    sectionLabel: shortTextSchema,
    itemTitle: shortTextSchema,
    itemDescription: bodyTextSchema,
    metadata: z
      .array(z.object({ label: shortTextSchema, value: shortTextSchema }))
      .min(2)
      .max(6),
  }),
  statusFields: z
    .array(
      z.object({
        field: canonicalFieldSchema,
        label: shortTextSchema,
        concealedLabel: shortTextSchema,
        revealAfterAnyActionIds: z.array(idSchema).max(6),
      }),
    )
    .min(2)
    .max(6),
  actionHeadings: z.object({
    verify: shortTextSchema,
    task: shortTextSchema,
    inspect: shortTextSchema,
    recovery: shortTextSchema,
  }),
  coachPrompts: z
    .array(z.object({ evidenceId: idSchema, question: bodyTextSchema }))
    .min(1)
    .max(10),
});

export const scenarioPackageOutputSchema = z
  .object({
    schemaVersion: z.literal("1.0"),
    id: idSchema,
    sourceProfileId: idSchema,
    publicationMode: publicationModeSchema,
    publishedSetting: shortTextSchema,
    title: shortTextSchema,
    tagline: shortTextSchema,
    summary: bodyTextSchema,
    targetLearner: shortTextSchema,
    learnerRole: shortTextSchema,
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
    criticalActions: z.array(criticalActionSchema).min(3).max(14),
    exclusiveActionGroups: z
      .array(
        z.object({
          id: idSchema,
          actionIds: z.array(idSchema).min(2).max(6),
        }),
      )
      .max(6),
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
    learnerPresentation: learnerPresentationSchema,
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
      ["exclusiveActionGroups", scenario.exclusiveActionGroups.map((item) => item.id)],
    ] as const;
    for (const [path, ids] of groups) {
      for (const duplicate of findDuplicates([...ids])) {
        context.addIssue({ code: "custom", path: [path], message: `Duplicate ID: ${duplicate}` });
      }
    }

    const actionIds = new Set(scenario.criticalActions.map((action) => action.id));
    const actionById = new Map(scenario.criticalActions.map((action) => [action.id, action]));
    const roleIds = new Set(scenario.roleCards.map((role) => role.id));
    const eventIds = new Set(scenario.allowedEvents.map((event) => event.id));
    const sourceFactIds = new Set(scenario.sourceFactIds);
    const assertAction = (id: string, path: (string | number)[]) => {
      if (!actionIds.has(id)) context.addIssue({ code: "custom", path, message: `Unknown action: ${id}` });
    };
    const followsAnIncidentTrigger = (
      candidateId: string,
      triggerIds: Set<string>,
      visited = new Set<string>(),
    ): boolean => {
      if (triggerIds.has(candidateId)) return true;
      if (visited.has(candidateId)) return false;
      visited.add(candidateId);
      const candidate = actionById.get(candidateId);
      if (!candidate) return false;
      const requiredPathFollows = candidate.availableAfterAllActionIds.some((prerequisiteId) =>
        followsAnIncidentTrigger(prerequisiteId, triggerIds, new Set(visited)),
      );
      const alternatePathsFollow = candidate.availableAfterAnyActionIds.length > 0
        && candidate.availableAfterAnyActionIds.every((prerequisiteId) =>
          followsAnIncidentTrigger(prerequisiteId, triggerIds, new Set(visited)),
        );
      return requiredPathFollows || alternatePathsFollow;
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
      content: ["intact", "modified", "restored"],
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
      if (action.kind === "inspect" && action.stateChanges.length > 0) {
        context.addIssue({ code: "custom", path: ["criticalActions", actionIndex, "stateChanges"], message: "Inspection actions reveal evidence without mutating canonical state." });
      }
      if (action.kind !== "inspect" && action.stateChanges.length === 0) {
        context.addIssue({ code: "custom", path: ["criticalActions", actionIndex, "stateChanges"], message: "State-changing actions require at least one canonical mutation." });
      }
      action.stateChanges.forEach((change, changeIndex) => {
        if (!stateValues[change.field].includes(change.value)) {
          context.addIssue({
            code: "custom",
            path: ["criticalActions", actionIndex, "stateChanges", changeIndex, "value"],
            message: `Invalid ${change.field} state: ${change.value}`,
          });
        }
        if (action.phase === "recovery" && !isRecoveredCanonicalValue(change.field, change.value)) {
          context.addIssue({
            code: "custom",
            path: ["criticalActions", actionIndex, "stateChanges", changeIndex, "value"],
            message: `Recovery must move ${change.field} to a contained state.`,
          });
        }
      });
    });
    const groupedActionIds = new Set<string>();
    scenario.exclusiveActionGroups.forEach((group, groupIndex) => {
      group.actionIds.forEach((id, actionIndex) => {
        assertAction(id, ["exclusiveActionGroups", groupIndex, "actionIds", actionIndex]);
        if (groupedActionIds.has(id)) {
          context.addIssue({
            code: "custom",
            path: ["exclusiveActionGroups", groupIndex, "actionIds", actionIndex],
            message: `An action may belong to only one exclusive group: ${id}`,
          });
        }
        groupedActionIds.add(id);
        const action = actionById.get(id);
        if (action?.phase === "recovery") {
          context.addIssue({
            code: "custom",
            path: ["exclusiveActionGroups", groupIndex, "actionIds", actionIndex],
            message: "Recovery actions cannot be mutually exclusive.",
          });
        }
      });
    });
    const reachableActionIds = reachableActionIdsForScenario(scenario);
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
      if (action && !followsAnIncidentTrigger(action.id, new Set(action.requiredAfterActionIds))) {
        context.addIssue({
          code: "custom",
          path: ["recoveryActionIds", index],
          message: "Every recovery availability path must follow one of its incident triggers.",
        });
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
    scenario.allowedEvents.forEach((event, index) => {
      const hasFallback = scenario.fallbackDialogue.some(
        (line) => line.eventId === event.id && line.roleId === event.roleId,
      );
      if (!hasFallback) {
        context.addIssue({
          code: "custom",
          path: ["allowedEvents", index],
          message: "Every allowed event requires fallback dialogue from its owning role.",
        });
      }
      if (event.delivery === "on-action") {
        const hasContinuingEvent = scenario.allowedEvents.some(
          (candidate) =>
            candidate.roleId === event.roleId
            && candidate.delivery === "on-message"
            && candidate.allowedAfterActionIds.every((id) => event.allowedAfterActionIds.includes(id)),
        );
        if (!hasContinuingEvent) {
          context.addIssue({
            code: "custom",
            path: ["allowedEvents", index],
            message: "An action-delivered event must unlock continued dialogue with the same role.",
          });
        }
      }
    });
    const openingEvent = scenario.allowedEvents.find(
      (event) => event.id === scenario.learnerPresentation.openingEventId,
    );
    if (!openingEvent) {
      context.addIssue({
        code: "custom",
        path: ["learnerPresentation", "openingEventId"],
        message: `Unknown opening event: ${scenario.learnerPresentation.openingEventId}`,
      });
    } else {
      if (openingEvent.delivery !== "on-message") {
        context.addIssue({
          code: "custom",
          path: ["learnerPresentation", "openingEventId"],
          message: "The opening event must be delivered as an on-message event.",
        });
      }
      if (openingEvent.allowedAfterActionIds.length > 0) {
        context.addIssue({
          code: "custom",
          path: ["learnerPresentation", "openingEventId"],
          message: "The opening event cannot require completed actions.",
        });
      }
    }
    const statusFields = scenario.learnerPresentation.statusFields.map((item) => item.field);
    for (const duplicate of findDuplicates(statusFields)) {
      context.addIssue({
        code: "custom",
        path: ["learnerPresentation", "statusFields"],
        message: `Duplicate status field: ${duplicate}`,
      });
    }
    scenario.learnerPresentation.statusFields.forEach((item, fieldIndex) => {
      item.revealAfterAnyActionIds.forEach((id, actionIndex) =>
        assertAction(id, ["learnerPresentation", "statusFields", fieldIndex, "revealAfterAnyActionIds", actionIndex]),
      );
    });
    const evidenceIds = new Set(scenario.evidence.map((item) => item.id));
    const coachedEvidenceIds = scenario.learnerPresentation.coachPrompts.map((item) => item.evidenceId);
    for (const duplicate of findDuplicates(coachedEvidenceIds)) {
      context.addIssue({
        code: "custom",
        path: ["learnerPresentation", "coachPrompts"],
        message: `Duplicate coach evidence: ${duplicate}`,
      });
    }
    scenario.learnerPresentation.coachPrompts.forEach((item, index) => {
      if (!evidenceIds.has(item.evidenceId)) {
        context.addIssue({
          code: "custom",
          path: ["learnerPresentation", "coachPrompts", index, "evidenceId"],
          message: `Unknown evidence: ${item.evidenceId}`,
        });
      }
    });
    scenario.roleCards.forEach((role, index) => {
      if (!scenario.allowedEvents.some((event) => event.roleId === role.id && event.delivery === "on-message")) {
        context.addIssue({
          code: "custom",
          path: ["roleCards", index],
          message: "Every role requires an on-message event for continued channel dialogue.",
        });
      }
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
          const trigger = actionById.get(triggerId);
          trigger?.stateChanges.forEach((change) => {
            const hasLayerRecovery = scenario.recoveryActionIds.some((recoveryId) => {
              const recovery = actionById.get(recoveryId);
              return recovery?.requiredAfterActionIds.includes(triggerId)
                && recovery.stateChanges.some((recoveryChange) =>
                  recoveryChange.field === change.field
                  && recoveryChange.value !== change.value
                  && isRecoveredCanonicalValue(recoveryChange.field, recoveryChange.value),
                );
            });
            if (!hasLayerRecovery) {
              context.addIssue({
                code: "custom",
                path: ["endings", index, "requiredAnyActionIds"],
                message: `Incident trigger ${triggerId} has no ${change.field} layer recovery.`,
              });
            }
          });
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

export function validateScenarioPackage(value: unknown): ValidationResult<ScenarioPackage> {
  return toValidationResult(scenarioPackageSchema.safeParse(value));
}
