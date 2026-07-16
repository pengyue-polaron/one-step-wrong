import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import type OpenAI from "openai";
import { idSchema, isValidHostname, normalizeDomain, shortTextSchema } from "@/ai/schemas/common";
import {
  institutionFactCategories,
  institutionProfileSchema,
  publicationModeSchema,
  type InstitutionProfile,
} from "@/ai/schemas/institution";
import { buildInstitutionResearchInput, institutionResearchInstructions } from "@/ai/prompts/institutionResearch";
import { getOpenAIClient, OPENAI_MODEL } from "@/ai/openai/server";

export const institutionResearchRequestSchema = z
  .object({
    institutionName: z.string().trim().min(2).max(120),
    officialDomains: z
      .array(z.string().trim().min(3).max(253).refine(isValidHostname, "Use a valid public hostname."))
      .max(6)
      .default([]),
    publicationMode: publicationModeSchema.default("brand-safe-fictionalized"),
    authorizationConfirmed: z.boolean().default(false),
    useFixture: z.boolean().default(false),
  })
  .superRefine((request, context) => {
    if (request.publicationMode === "authorized-exact" && !request.authorizationConfirmed) {
      context.addIssue({
        code: "custom",
        path: ["authorizationConfirmed"],
        message: "Confirm authorization before using exact institution branding.",
      });
    }
  });

export type InstitutionResearchRequest = z.infer<typeof institutionResearchRequestSchema>;

const researchOutputSchema = z.object({
  id: idSchema,
  displayName: shortTextSchema,
  officialDomains: z.array(z.string().trim().min(3).max(253)).min(1).max(6),
  protectedTerms: z.array(shortTextSchema).min(1).max(20),
  facts: z
    .array(
      z.object({
        id: idSchema,
        category: z.enum(institutionFactCategories),
        label: shortTextSchema,
        value: z.string().trim().min(1).max(700).nullable(),
        status: z.enum(["verified", "unknown", "conflicting"]),
        confidence: z.enum(["high", "medium", "low", "unknown"]),
        sourceIds: z.array(idSchema).max(8),
        note: z.string().trim().max(240).nullable(),
      }),
    )
    .min(1)
    .max(30),
  sources: z
    .array(
      z.object({
        id: idSchema,
        url: z.url().max(500),
        title: shortTextSchema,
        publisher: shortTextSchema,
        authority: z.enum(["institution", "primary-vendor"]),
        supportsFactIds: z.array(idSchema).min(1).max(20),
      }),
    )
    .min(1)
    .max(30),
  unresolvedFields: z.array(shortTextSchema).max(20),
  researchWarnings: z.array(z.string().trim().min(1).max(700)).max(12),
});

export type InstitutionResearchProvider = Pick<OpenAI, "responses">;

function canonicalEvidenceUrl(value: string) {
  const url = new URL(value);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  return `${url.hostname.toLowerCase()}${path}`;
}

export function validateSourcesAgainstWebSearch(
  sources: Array<{ url: string }>,
  output: unknown,
) {
  const evidenceUrls = new Set<string>();
  if (Array.isArray(output)) {
    output.forEach((item) => {
      if (!item || typeof item !== "object") return;
      const record = item as Record<string, unknown>;
      const action = record.action;
      if (record.type === "web_search_call" && action && typeof action === "object") {
        const actionRecord = action as Record<string, unknown>;
        if (typeof actionRecord.url === "string") {
          evidenceUrls.add(canonicalEvidenceUrl(actionRecord.url));
        }
        if (Array.isArray(actionRecord.sources)) {
          actionRecord.sources.forEach((source) => {
            if (source && typeof source === "object" && typeof (source as Record<string, unknown>).url === "string") {
              evidenceUrls.add(canonicalEvidenceUrl((source as Record<string, string>).url));
            }
          });
        }
      }
      if (record.type === "message" && Array.isArray(record.content)) {
        record.content.forEach((content) => {
          if (!content || typeof content !== "object" || !Array.isArray((content as Record<string, unknown>).annotations)) return;
          ((content as Record<string, unknown>).annotations as unknown[]).forEach((annotation) => {
            if (annotation && typeof annotation === "object" && typeof (annotation as Record<string, unknown>).url === "string") {
              evidenceUrls.add(canonicalEvidenceUrl((annotation as Record<string, string>).url));
            }
          });
        });
      }
    });
  }
  const missing = sources.filter((source) => !evidenceUrls.has(canonicalEvidenceUrl(source.url)));
  if (missing.length > 0) {
    throw new Error(`Research cited URLs not returned by Web Search: ${missing.map((source) => source.url).join(", ")}`);
  }
}

export async function researchInstitution(
  request: InstitutionResearchRequest,
  provider: InstitutionResearchProvider | null = getOpenAIClient(),
): Promise<InstitutionProfile> {
  if (!provider) throw new Error("OpenAI is not configured.");

  const domains = request.officialDomains.map(normalizeDomain);
  const response = await provider.responses.parse({
    model: OPENAI_MODEL,
    instructions: institutionResearchInstructions,
    input: buildInstitutionResearchInput({ ...request, officialDomains: domains }),
    tools: [
      {
        type: "web_search",
        search_context_size: "low",
        ...(domains.length ? { filters: { allowed_domains: domains } } : {}),
      },
    ],
    include: ["web_search_call.action.sources"],
    text: { format: zodTextFormat(researchOutputSchema, "institution_research") },
  });

  if (!response.output_parsed) throw new Error("Institution research returned no structured profile.");
  const raw = response.output_parsed;
  validateSourcesAgainstWebSearch(raw.sources, response.output);
  const officialDomains = domains.length ? domains : raw.officialDomains.map(normalizeDomain);
  const accessedAt = new Date().toISOString();
  const profile = institutionProfileSchema.parse({
    ...raw,
    schemaVersion: "1.0",
    publicationMode: request.publicationMode,
    brandAuthorization: request.publicationMode === "authorized-exact"
      ? { exactBrandUseConfirmed: true, confirmedAt: accessedAt }
      : { exactBrandUseConfirmed: false },
    officialDomains,
    facts: raw.facts.map(({ note, ...fact }) => ({ ...fact, ...(note ? { note } : {}) })),
    sources: raw.sources.map((source) => ({ ...source, accessedAt, reviewStatus: "review-required" as const })),
    approval: { status: "review-required" },
  });
  return profile;
}
