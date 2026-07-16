import type { CanonicalState } from "@/ai/schemas/scenario";

const canonicalValueLabels: Record<keyof CanonicalState, Record<string, string>> = {
  identity: {
    unverified: "unconfirmed",
    "claimed-legitimate": "claimed again",
    "verified-legitimate": "confirmed",
    "verified-false": "contradicted",
  },
  payment: {
    pending: "pending",
    paused: "paused",
    released: "released",
    redirected: "changed",
  },
  access: {
    restricted: "restricted",
    shared: "shared",
    revoked: "revoked",
  },
  content: {
    intact: "intact",
    modified: "modified",
    restored: "restored",
  },
  evidence: {
    unpreserved: "not preserved",
    preserved: "preserved",
  },
  people: {
    unnotified: "not notified",
    notified: "notified",
  },
  report: {
    "not-reported": "not reported",
    reported: "reported",
  },
};

export function formatCanonicalValue(
  field: keyof CanonicalState,
  value: CanonicalState[keyof CanonicalState],
) {
  return canonicalValueLabels[field][value] ?? value;
}
