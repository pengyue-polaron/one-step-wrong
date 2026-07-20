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
import { getOpenAIClient, getOpenAIModel, isOpenRouterConfigured } from "@/ai/openai/server";

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

function parseOpenRouterResearchOutput(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 50_000) {
    throw new Error("OpenRouter research returned an empty or oversized response.");
  }

  try {
    return researchOutputSchema.parse(JSON.parse(trimmed));
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
  }

  const parsedFences = [...trimmed.matchAll(/```(?:json)?\s*([\s\S]*?)\s*```/gi)]
    .flatMap((match) => {
      try {
        return [JSON.parse(match[1]) as unknown];
      } catch {
        return [];
      }
    });
  if (parsedFences.length !== 1) {
    throw new Error("OpenRouter research must return exactly one JSON object.");
  }
  return researchOutputSchema.parse(parsedFences[0]);
}

function canonicalEvidenceUrl(value: string) {
  const url = new URL(value);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  return `${url.protocol}//${hostname}${path}`;
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
  const openRouter = isOpenRouterConfigured();
  const instructions = openRouter
    ? `${institutionResearchInstructions}\n\nCall Web Search exactly once with one broad query. Return only the small number of facts that single result set directly supports, and list all other requested categories in unresolvedFields. Do not call Web Search again. Your final response must be one JSON object with exactly these top-level fields: id, displayName, officialDomains, protectedTerms, facts, sources, unresolvedFields, researchWarnings. Use lowercase kebab-case IDs. Each fact must contain exactly id, category, label, value, status, confidence, sourceIds, note. Fact category must be exactly one of "learning-platform", "identity-and-mfa", "collaboration", "wireless", "support-and-reporting", or "student-policy". Fact status must be exactly "verified", "unknown", or "conflicting". Fact confidence must be exactly "high", "medium", "low", or "unknown". Each source must contain exactly id, url, title, publisher, authority, supportsFactIds. Source authority must be exactly "institution" for the declared official domain or "primary-vendor" for a vendor source. unresolvedFields and researchWarnings must each be arrays of strings, including when empty. Use only the enum values and limits in the supplied response schema. Keep fact/source references reciprocal.`
    : institutionResearchInstructions;
  const tools = openRouter
    ? ([{
        type: "openrouter:web_search",
        parameters: {
          engine: "auto",
          max_results: 5,
          max_total_results: 5,
          search_context_size: "low",
          ...(domains.length ? { allowed_domains: domains } : {}),
        },
      }] as unknown as OpenAI.Responses.Tool[])
    : ([{
        type: "web_search",
        search_context_size: "low",
        ...(domains.length ? { filters: { allowed_domains: domains } } : {}),
      }] satisfies OpenAI.Responses.Tool[]);
  const requestBody = {
    model: getOpenAIModel(),
    instructions,
    input: buildInstitutionResearchInput({ ...request, officialDomains: domains }),
    tools,
    ...(!openRouter ? { include: ["web_search_call.action.sources" as const] } : {}),
    text: { format: zodTextFormat(researchOutputSchema, "institution_research") },
  };
  let raw: z.infer<typeof researchOutputSchema>;
  let output: unknown;
  if (openRouter) {
    const response = await provider.responses.create(requestBody);
    raw = parseOpenRouterResearchOutput(response.output_text);
    output = response.output;
  } else {
    const response = await provider.responses.parse(requestBody);
    if (!response.output_parsed) throw new Error("Institution research returned no structured profile.");
    raw = response.output_parsed;
    output = response.output;
  }
  validateSourcesAgainstWebSearch(raw.sources, output);
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
