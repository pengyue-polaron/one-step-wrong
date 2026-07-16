import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import type OpenAI from "openai";
import { idSchema, normalizeDomain, shortTextSchema } from "@/ai/schemas/common";
import {
  institutionFactCategories,
  institutionProfileSchema,
  publicationModeSchema,
  type InstitutionProfile,
} from "@/ai/schemas/institution";
import { buildInstitutionResearchInput, institutionResearchInstructions } from "@/ai/prompts/institutionResearch";
import { getOpenAIClient, OPENAI_MODEL } from "@/ai/openai/server";

export const institutionResearchRequestSchema = z.object({
  institutionName: z.string().trim().min(2).max(120),
  officialDomains: z.array(z.string().trim().min(3).max(253)).max(6).default([]),
  publicationMode: publicationModeSchema.default("brand-safe-fictionalized"),
  useFixture: z.boolean().default(false),
});

export type InstitutionResearchRequest = z.infer<typeof institutionResearchRequestSchema>;

const researchOutputSchema = z.object({
  id: idSchema,
  displayName: shortTextSchema,
  officialDomains: z.array(z.string().trim().min(3).max(253)).min(1).max(6),
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
        accessedAt: z.iso.datetime(),
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
    text: { format: zodTextFormat(researchOutputSchema, "institution_research") },
  });

  if (!response.output_parsed) throw new Error("Institution research returned no structured profile.");
  const raw = response.output_parsed;
  const profile = institutionProfileSchema.parse({
    ...raw,
    schemaVersion: "1.0",
    publicationMode: request.publicationMode,
    officialDomains: raw.officialDomains.map(normalizeDomain),
    facts: raw.facts.map(({ note, ...fact }) => ({ ...fact, ...(note ? { note } : {}) })),
    sources: raw.sources.map((source) => ({ ...source, reviewStatus: "review-required" as const })),
    approval: { status: "review-required" },
  });
  return profile;
}
