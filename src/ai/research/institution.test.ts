import { describe, expect, it, vi } from "vitest";
import {
  institutionResearchRequestSchema,
  researchInstitution,
  type InstitutionResearchProvider,
} from "@/ai/research/institution";
import { northbridgeInstitutionProfile } from "@/fixtures/institutionProfile";

describe("Institution Research Agent adapter", () => {
  it("accepts structured provider output and leaves it pending human review", async () => {
    const raw = {
      id: northbridgeInstitutionProfile.id,
      displayName: northbridgeInstitutionProfile.displayName,
      officialDomains: northbridgeInstitutionProfile.officialDomains,
      facts: northbridgeInstitutionProfile.facts.map((fact) => ({ ...fact, note: fact.note ?? null })),
      sources: northbridgeInstitutionProfile.sources.map((source) => ({
        id: source.id,
        url: source.url,
        title: source.title,
        publisher: source.publisher,
        accessedAt: source.accessedAt,
        authority: source.authority,
        supportsFactIds: source.supportsFactIds,
      })),
      unresolvedFields: northbridgeInstitutionProfile.unresolvedFields,
      researchWarnings: northbridgeInstitutionProfile.researchWarnings,
    };
    const parse = vi.fn().mockResolvedValue({ output_parsed: raw });
    const provider = { responses: { parse } } as unknown as InstitutionResearchProvider;
    const request = institutionResearchRequestSchema.parse({
      institutionName: "Northbridge University",
      officialDomains: ["northbridge.example"],
    });

    const profile = await researchInstitution(request, provider);
    expect(profile.approval.status).toBe("review-required");
    expect(profile.sources.every((source) => source.reviewStatus === "review-required")).toBe(true);
    expect(parse).toHaveBeenCalledOnce();
    const call = parse.mock.calls[0][0];
    expect(call.model).toBe("gpt-5.6");
    expect(call.tools[0].type).toBe("web_search");
    expect(call.tools[0].filters.allowed_domains).toEqual(["northbridge.example"]);
  });
});
