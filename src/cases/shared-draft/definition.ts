import type { CaseSummary } from "@/cases/types";
import type { DecisionCaseDefinition } from "@/engine/decision/types";

export const sharedDraftSummary = {
  id: "shared-draft",
  number: "02",
  title: "Sharing Scope",
  kicker: "Collaboration and access",
  summary: "The team needs access now. How do you keep the work moving without handing interview files to everyone who gets the link?",
  location: "Bobst Library · LL2",
  duration: "8–10 min",
  topic: "Cloud sharing",
  app: "NYU Drive",
  tone: "blue",
} satisfies CaseSummary;

export const sharedDraftDefinition = {
  ...sharedDraftSummary,
  intro: {
    time: "20:16",
    title: "Sharing Scope",
    body: "Your documentary team must finish a quote check tonight. Three teammates are waiting for access, and the folder also contains consent forms and unpublished transcripts.",
    task: "Grant the access needed to finish the review before 20:30.",
    startLabel: "Open sharing settings",
  },
  decision: {
    eyebrow: "NYU DRIVE · SHARING",
    title: "Interview Research · Week 8",
    body: "Maya says invitations are not reaching her usual account and sends a Gmail address. The other teammates use NYU accounts.",
    deadline: "14:00",
    options: [
      { id: "specific-accounts", title: "Add three NYU accounts", meta: "Invited people only · Editor", description: "Add mc9812@nyu.edu, lx2048@nyu.edu, and ar7731@nyu.edu individually.", route: "verified", event: "Granted editor access to three named NYU accounts" },
      { id: "nyu-link", title: "Let the NYU community edit by link", meta: "New York University · Editor", description: "Anyone with an NYU account and the link can edit.", route: "caution", event: "Set the link to allow editing across the NYU community" },
      { id: "public-link", title: "Let anyone with the link edit", meta: "Anyone with the link · Editor", description: "No sign-in required. Forwarding the link solves the access problem fastest.", route: "incident", event: "Set the folder so anyone with the link can edit" },
    ],
  },
  incident: {
    delay: "6 minutes later",
    title: "A visitor outside the team appears",
    body: "The folder link was forwarded again. An anonymous visitor downloaded transcripts and changed the participant name sheet.",
    evidence: [
      { label: "Visitor", value: "Anonymous User 483 · External" },
      { label: "Activity", value: "Downloaded 4 files · Edited 1 sheet" },
      { label: "Access source", value: "Anyone with the link" },
    ],
  },
  responseTitle: "Pull access back to the task",
  responseBody: "Closing the link is only one layer. Access, changed content, team communication, and reporting each need attention.",
  responseSteps: [
    { id: "restrict-link", title: "Close the public edit link", description: "Change General access back to Restricted.", event: "Closed editing for anyone with the link", required: true },
    { id: "remove-outsider", title: "Remove the unknown visitor", description: "End the external session and revoke any access still in effect.", event: "Removed the unknown external visitor", required: true },
    { id: "restore-version", title: "Review activity and restore the file", description: "Check downloads and restore the changed participant sheet.", event: "Reviewed activity and restored the file version", required: true },
    { id: "notify-team", title: "Notify the team and affected people", description: "Explain the link scope, accessed files, and actions already taken.", event: "Sent the team a clear incident notice", required: true },
    { id: "report-it", title: "File an NYU IT security report", description: "Preserve the activity record for further university review.", event: "Reported the sharing incident to NYU IT", required: false },
  ],
  endings: {
    verified: { eyebrow: "Ending 01", title: "Only the people who need it", summary: "The work continues without extending access beyond the team.", detail: "You used specific identities instead of a transferable link, so the access boundary matched the task." },
    caution: { eyebrow: "Ending 02", title: "A wider circle", summary: "The task is done, but the potential sharing scope includes all of NYU.", detail: "An organization link is narrower than a public one, but still broader than the three people who need access." },
    contained: { eyebrow: "Ending 03", title: "Access pulled back", summary: "The public entry point, outside access, and file changes are addressed.", detail: "The material was exposed, but you revoked access, restored the file, and communicated the impact." },
    expanded: { eyebrow: "Ending 04", title: "The link keeps traveling", summary: "Some access or content impact remains unresolved.", detail: "One response action cannot simultaneously invalidate a forwarded link, active sessions, and file changes." },
  },
  clues: [
    "Only three teammates need access; the permission scope does not need to include the university or the public internet.",
    "A familiar Gmail address and a claim about NYU login trouble do not prove who controls the account.",
    "Editor access can change content, so its impact is wider than view-only access.",
  ],
  causeChain: {
    verified: ["Three collaborators identified", "NYU identities checked individually", "Only necessary editor access granted", "Work finished with a clear boundary"],
    caution: ["Avoid individual invitations", "Use an organization-wide link", "The link can keep traveling inside NYU", "Task finished with an oversized scope"],
    incident: ["Deadline pressure and access requests", "Public link with editor access", "Link forwarded again", "Files downloaded and changed"],
  },
  transferRules: [
    { title: "Identity before address", body: "Confirm the requester through a known channel before adding a new email address." },
    { title: "Match scope to the task", body: "When three people need access, prefer those three identities over an entire domain." },
    { title: "Match permission to the action", body: "Reading does not require Editor access, and uploading does not require changing every file." },
    { title: "Closing a link is not full recovery", body: "After an incident, also review active sessions, downloads, and file versions." },
  ],
  correctPath: ["Confirm the NYU accounts each teammate currently uses.", "Add the actual collaborators one by one and grant Viewer, Commenter, or Editor based on the task.", "Before sending, confirm General access is still Restricted.", "Review activity and membership, then remove temporary access when the work ends."],
} satisfies DecisionCaseDefinition;
