import type { NetworkId } from "@/cases/final-submission/types";

export const networkLabels: Record<NetworkId, string> = {
  "campus-secure": "nyu",
  "campus-guest": "nyuguest",
  "campus-free-5g": "NYU_Free_5G",
  "mobile-hotspot": "Maya's iPhone hotspot",
};

export const responseActionLabels = {
  "revoke-session": "Ended the unknown-device session",
  "change-password": "Changed the campus account password",
  "enable-mfa": "Enabled multi-factor authentication",
  "disconnect-network": "Disconnected from NYU_Free_5G",
  "forget-network": "Forgot NYU_Free_5G",
  "remove-profile": "Removed the NYU Network Access profile",
  "delete-message": "Deleted the impersonated message",
  "warn-brief": "Sent a brief warning to a classmate",
  "warn-clear": "Sent a clear warning to a classmate",
  "warn-none": "Did not explain the incident to a classmate",
  "report-it": "Filed an incident report with university IT",
} as const;
