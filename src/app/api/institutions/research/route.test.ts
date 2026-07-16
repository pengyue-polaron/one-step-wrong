import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/institutions/research/route";

describe("POST /api/institutions/research", () => {
  it("rejects malformed and oversized requests", async () => {
    const response = await POST(
      new Request("http://localhost/api/institutions/research", {
        method: "POST",
        body: JSON.stringify({ institutionName: "x".repeat(121), officialDomains: [] }),
      }),
    );
    expect(response.status).toBe(400);
  });

  it("rejects a request body beyond the route limit before schema parsing", async () => {
    const response = await POST(
      new Request("http://localhost/api/institutions/research", {
        method: "POST",
        body: JSON.stringify({ institutionName: "Northbridge", padding: "x".repeat(9_000) }),
      }),
    );
    expect(response.status).toBe(413);
  });

  it("returns the reviewed fallback without an API key", async () => {
    const previous = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    const response = await POST(
      new Request("http://localhost/api/institutions/research", {
        method: "POST",
        body: JSON.stringify({
          institutionName: "New York University",
          officialDomains: ["nyu.edu"],
          useFixture: false,
        }),
      }),
    );
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.provenance).toBe("reviewed-fixture");
    expect(result.profile.approval.status).toBe("approved");
    if (previous === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previous;
  });
});
