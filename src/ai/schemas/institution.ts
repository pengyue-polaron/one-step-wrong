import { z } from "zod";
import {
  bodyTextSchema,
  findDuplicates,
  hostnameMatchesDomain,
  idSchema,
  normalizeDomain,
  shortTextSchema,
  toValidationResult,
  type ValidationResult,
} from "@/ai/schemas/common";

export const institutionFactCategories = [
  "learning-platform",
  "identity-and-mfa",
  "collaboration",
  "wireless",
  "support-and-reporting",
  "student-policy",
] as const;

export const publicationModeSchema = z.enum(["authorized-exact", "brand-safe-fictionalized"]);

export const institutionSourceSchema = z.object({
  id: idSchema,
  url: z.url().max(500),
  title: shortTextSchema,
  publisher: shortTextSchema,
  accessedAt: z.iso.datetime(),
  authority: z.enum(["institution", "primary-vendor"]),
  reviewStatus: z.enum(["review-required", "approved", "rejected"]),
  supportsFactIds: z.array(idSchema).min(1).max(20),
});

export const institutionFactSchema = z.object({
  id: idSchema,
  category: z.enum(institutionFactCategories),
  label: shortTextSchema,
  value: bodyTextSchema.nullable(),
  status: z.enum(["verified", "unknown", "conflicting"]),
  confidence: z.enum(["high", "medium", "low", "unknown"]),
  sourceIds: z.array(idSchema).max(8),
  note: z.string().trim().max(240).optional(),
});

export const institutionProfileSchema = z
  .object({
    schemaVersion: z.literal("1.0"),
    id: idSchema,
    displayName: shortTextSchema,
    publicationMode: publicationModeSchema,
    officialDomains: z.array(z.string().trim().min(3).max(253)).min(1).max(6),
    facts: z.array(institutionFactSchema).min(1).max(30),
    sources: z.array(institutionSourceSchema).min(1).max(30),
    unresolvedFields: z.array(shortTextSchema).max(20),
    researchWarnings: z.array(bodyTextSchema).max(12),
    approval: z.object({
      status: z.enum(["review-required", "approved", "rejected"]),
      reviewedAt: z.iso.datetime().optional(),
      reviewerNote: z.string().trim().max(500).optional(),
    }),
  })
  .superRefine((profile, context) => {
    const normalizedDomains = profile.officialDomains.map(normalizeDomain);
    for (const duplicate of findDuplicates(normalizedDomains)) {
      context.addIssue({ code: "custom", path: ["officialDomains"], message: `Duplicate domain: ${duplicate}` });
    }

    profile.officialDomains.forEach((domain, index) => {
      if (normalizeDomain(domain) !== domain) {
        context.addIssue({ code: "custom", path: ["officialDomains", index], message: "Domains must be normalized hostnames." });
      }
    });

    const factIds = new Set(profile.facts.map((fact) => fact.id));
    const sourceIds = new Set(profile.sources.map((source) => source.id));
    for (const duplicate of findDuplicates(profile.facts.map((fact) => fact.id))) {
      context.addIssue({ code: "custom", path: ["facts"], message: `Duplicate fact ID: ${duplicate}` });
    }
    for (const duplicate of findDuplicates(profile.sources.map((source) => source.id))) {
      context.addIssue({ code: "custom", path: ["sources"], message: `Duplicate source ID: ${duplicate}` });
    }

    profile.facts.forEach((fact, index) => {
      if (fact.status === "verified" && (!fact.value || fact.sourceIds.length === 0)) {
        context.addIssue({
          code: "custom",
          path: ["facts", index],
          message: "Verified facts require a value and at least one source.",
        });
      }
      if (fact.status === "unknown" && (fact.value !== null || fact.sourceIds.length > 0)) {
        context.addIssue({
          code: "custom",
          path: ["facts", index],
          message: "Unknown facts must remain null and unsourced.",
        });
      }
      fact.sourceIds.forEach((sourceId) => {
        if (!sourceIds.has(sourceId)) {
          context.addIssue({ code: "custom", path: ["facts", index, "sourceIds"], message: `Unknown source: ${sourceId}` });
        }
      });
    });

    profile.sources.forEach((source, index) => {
      source.supportsFactIds.forEach((factId) => {
        if (!factIds.has(factId)) {
          context.addIssue({ code: "custom", path: ["sources", index, "supportsFactIds"], message: `Unknown fact: ${factId}` });
        }
      });
      if (source.authority === "institution" && !profile.officialDomains.some((domain) => hostnameMatchesDomain(source.url, domain))) {
        context.addIssue({
          code: "custom",
          path: ["sources", index, "url"],
          message: "Institution source does not match an approved official domain.",
        });
      }
    });

    for (const fact of profile.facts) {
      for (const sourceId of fact.sourceIds) {
        const source = profile.sources.find((candidate) => candidate.id === sourceId);
        if (source && !source.supportsFactIds.includes(fact.id)) {
          context.addIssue({
            code: "custom",
            path: ["facts", profile.facts.indexOf(fact), "sourceIds"],
            message: `Source ${sourceId} does not declare support for ${fact.id}.`,
          });
        }
      }
    }
  });

export type InstitutionProfile = z.infer<typeof institutionProfileSchema>;
export type InstitutionFact = z.infer<typeof institutionFactSchema>;

export function validateInstitutionProfile(value: unknown): ValidationResult<InstitutionProfile> {
  return toValidationResult(institutionProfileSchema.safeParse(value));
}

export function validateProfileForApproval(profile: InstitutionProfile): ValidationResult<InstitutionProfile> {
  const base = validateInstitutionProfile(profile);
  if (!base.success) return base;

  const issues = profile.facts.flatMap((fact, index) => {
    if (fact.status === "conflicting") return [{ path: `facts.${index}`, message: "Resolve conflicting facts before approval." }];
    if (fact.status !== "verified") return [];
    const hasApprovedSource = fact.sourceIds.some(
      (sourceId) => profile.sources.find((source) => source.id === sourceId)?.reviewStatus === "approved",
    );
    return hasApprovedSource ? [] : [{ path: `facts.${index}.sourceIds`, message: "Verified facts need an approved source." }];
  });

  return issues.length ? { success: false, issues } : { success: true, data: profile, issues: [] };
}
