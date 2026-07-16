import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScenarioStudio } from "@/app/studio/ScenarioStudio";
import { reviewedNyuInstitutionProfile } from "@/fixtures/institutionProfile";
import { voiceYouKnowScenario } from "@/fixtures/voiceYouKnow";
import type { InstitutionProfile } from "@/ai/schemas/institution";

function pendingConflictProfile(): InstitutionProfile {
  const profile: InstitutionProfile = structuredClone(reviewedNyuInstitutionProfile);
  profile.facts = [{ ...profile.facts[0], status: "conflicting", confidence: "medium" }];
  profile.sources = [{ ...profile.sources[0], reviewStatus: "review-required" }];
  profile.unresolvedFields = ["The learning-platform wording needs educator review."];
  profile.researchWarnings = ["Two official pages use different product descriptions."];
  profile.approval = { status: "review-required" };
  return profile;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Scenario Studio profile review", () => {
  it("gates exact-brand research behind an explicit authorization confirmation", async () => {
    const user = userEvent.setup();
    render(<ScenarioStudio />);

    await user.click(screen.getByRole("button", { name: "Authorized exact" }));
    expect(screen.getByRole("button", { name: "Research official sources" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Load reviewed example" })).toBeDisabled();
    await user.click(screen.getByRole("checkbox", { name: /Authorization confirmed/ }));
    expect(screen.getByRole("button", { name: "Research official sources" })).toBeEnabled();
  });

  it("requires the educator to resolve conflicts and approve supporting sources", async () => {
    const user = userEvent.setup();
    const profile = pendingConflictProfile();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ profile, provenance: "live-research", notice: "Research ready for review." }),
    }));

    render(<ScenarioStudio />);
    await user.click(screen.getByRole("button", { name: "Research official sources" }));

    expect(await screen.findByText("Two official pages use different product descriptions.")).toBeInTheDocument();
    expect(screen.getByText("0 / 1 approved")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Approve profile" }));
    expect(screen.getByText(/Resolve conflicting facts before approval/)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Status for Learning platform"), "verified");
    await user.click(screen.getByRole("button", { name: "Approve profile" }));
    expect(screen.getByText(/Verified facts need an approved source/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Approve source Learning Management System" }));
    expect(screen.getByText("1 / 1 approved")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Approve profile" }));
    expect(screen.getByTestId("studio-brief")).toBeInTheDocument();
  });

  it("shows actionable API issue paths instead of only a generic error", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error: "Check the institution name and official domains.",
        issues: [{ path: "officialDomains.0", message: "Use a normalized official hostname." }],
      }),
    }));

    render(<ScenarioStudio />);
    await user.click(screen.getByRole("button", { name: "Research official sources" }));

    expect(await screen.findByText(/officialDomains\.0: Use a normalized official hostname/)).toBeInTheDocument();
  });

  it("switches the visible profile together with a reviewed fallback scenario", async () => {
    const user = userEvent.setup();
    const alternateProfile: InstitutionProfile = structuredClone(reviewedNyuInstitutionProfile);
    alternateProfile.id = "alternate-institution";
    alternateProfile.displayName = "Alternate Institution";
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ profile: alternateProfile, provenance: "reviewed-fixture", notice: "Profile ready." }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          profile: reviewedNyuInstitutionProfile,
          scenario: voiceYouKnowScenario,
          provenance: "reviewed-fixture",
          notice: "Fallback pair loaded.",
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    render(<ScenarioStudio />);
    await user.click(screen.getByRole("button", { name: "Load reviewed example" }));
    expect(await screen.findByRole("heading", { name: "Alternate Institution" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Approve profile" }));
    await user.click(screen.getByRole("button", { name: "Compile flagship example" }));

    expect(await screen.findByTestId("studio-preview")).toHaveTextContent("New York University");
    expect(screen.queryByText("Alternate Institution")).not.toBeInTheDocument();
  });
});
