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
  it("presents the authoring product without competition or provider branding", () => {
    render(<ScenarioStudio />);
    expect(screen.getByText("Scenario Studio")).toBeInTheDocument();
    expect(screen.queryByText(/Build Week|GPT-5\.6|fixture|fallback/i)).not.toBeInTheDocument();
  });

  it("gates exact-brand research behind an explicit authorization confirmation", async () => {
    const user = userEvent.setup();
    render(<ScenarioStudio />);

    await user.click(screen.getByRole("button", { name: "Use exact names" }));
    expect(screen.getByRole("button", { name: "Find public guidance" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Use example institution" })).toBeDisabled();
    await user.click(screen.getByRole("checkbox", { name: /Permission confirmed/ }));
    expect(screen.getByRole("button", { name: "Find public guidance" })).toBeEnabled();
  });

  it("makes the reviewed path primary when adaptive authoring is unavailable", () => {
    render(<ScenarioStudio adaptiveAuthoringAvailable={false} />);

    expect(screen.getByRole("button", { name: "Find public guidance" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Use example institution" })).toBeEnabled();
    expect(screen.getByText("The reviewed institution is ready to use in this workspace.")).toBeInTheDocument();
  });

  it("reveals conversation channels only after the matching explicit action", async () => {
    const user = userEvent.setup();
    render(<ScenarioStudio mode="featured" />);

    expect(screen.getByRole("button", { name: /Dr\. Maya Chen Voice message/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Dr\. Maya Chen Saved directory call/ })).not.toBeInTheDocument();
    expect(screen.queryByText("Jordan Lee")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Share reimbursement folder/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Call the number attached to the message/ }));
    expect(screen.getByText(/I also need the reimbursement folder shared/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Share reimbursement folder/ })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: /Call the saved directory number/ }));
    expect(screen.getByText(/I did not request any account change/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Dr\. Maya Chen Saved directory call/ })).toBeInTheDocument();
  });

  it("requires the educator to resolve conflicts and approve supporting sources", async () => {
    const user = userEvent.setup();
    const profile = pendingConflictProfile();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ profile, provenance: "live-research", notice: "Research ready for review." }),
    }));

    render(<ScenarioStudio />);
    await user.click(screen.getByRole("button", { name: "Find public guidance" }));

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
    await user.click(screen.getByRole("button", { name: "Find public guidance" }));

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
    await user.click(screen.getByRole("button", { name: "Use example institution" }));
    expect(await screen.findByRole("heading", { name: "Alternate Institution" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Approve profile" }));
    await user.click(screen.getByRole("button", { name: "Use example rehearsal" }));

    expect(await screen.findByTestId("studio-preview")).toHaveTextContent("New York University");
    expect(screen.queryByText("Alternate Institution")).not.toBeInTheDocument();
  });
});
