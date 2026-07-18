import type { CaseSummary } from "@/cases/types";
import type { DecisionCaseDefinition } from "@/engine/decision/types";

export const unexpectedPushSummary = {
  id: "unexpected-push",
  number: "02",
  title: "Was That You?",
  kicker: "Login and verification",
  summary: "The meeting starts in two minutes and Duo requests keep arriving. Which login is actually yours?",
  location: "Kimmel Center · 7F",
  duration: "7–9 min",
  topic: "Multi-factor authentication",
  app: "NYU Duo",
  tone: "green",
} satisfies CaseSummary;

export const unexpectedPushDefinition = {
  ...unexpectedPushSummary,
  intro: {
    time: "17:58",
    title: "Was That You?",
    body: "Your advising meeting starts in two minutes. Zoom is still on the sign-in page, but your phone has already received three Duo requests. Someone in the class chat says NYU is migrating accounts.",
    task: "Verify the login you initiated and join the advising meeting on time.",
    startLabel: "Review login request",
  },
  decision: {
    eyebrow: "DUO MOBILE · LOGIN REQUEST",
    title: "NYU Login",
    body: "The request comes from Chrome in Jersey City. You have not entered your NetID on the current Zoom page.",
    deadline: "01:42",
    options: [
      { id: "verify-browser", title: "Return to the browser and verify", meta: "Leave the phone request pending", description: "Confirm whether you initiated a login, then start again from the current page.", route: "verified", event: "Paused the Duo request and checked the current browser login" },
      { id: "deny-request", title: "Deny this request", meta: "Deny · I didn't request this", description: "Mark it as not initiated by you, then sign in again from your own Zoom page.", route: "caution", event: "Denied a Duo login request you did not initiate" },
      { id: "approve-request", title: "Approve the login", meta: "Approve", description: "Clear the prompt first, then return to Zoom to see whether the meeting opens.", route: "incident", event: "Approved a Duo login request you did not initiate" },
    ],
  },
  incident: {
    delay: "90 seconds later",
    title: "The approved login did not open your Zoom",
    body: "A new Chrome session appears in your NYU account, and a recovery phone change is requested. The Duo prompt belonged to another device.",
    evidence: [
      { label: "New session", value: "Chrome · Jersey City, NJ" },
      { label: "Account activity", value: "Viewed NYU Email · Requested recovery change" },
      { label: "Verification", value: "Duo Push · Approved" },
    ],
  },
  responseTitle: "Pull back the access you approved",
  responseBody: "Denying later pushes does not end an already approved session. The session, password, recovery methods, and university record each need attention.",
  responseSteps: [
    { id: "revoke-session", title: "End the unknown browser session", description: "Terminate the Jersey City session from NYU account activity.", event: "Ended the unknown Chrome session", required: true },
    { id: "change-password", title: "Change the NYU NetID password", description: "Set a new unique password through start.nyu.edu.", event: "Changed the NYU NetID password", required: true },
    { id: "review-recovery", title: "Review recovery and forwarding", description: "Remove the unknown phone number and inspect email forwarding rules.", event: "Reviewed account recovery methods and email rules", required: true },
    { id: "report-security", title: "Contact NYU IT Security", description: "Report the unexpected Duo approval, time, device, and response actions.", event: "Reported the incident to NYU IT Security", required: true },
    { id: "warn-class", title: "Warn the class about the migration claim", description: "Help classmates avoid approving requests based on the same story.", event: "Asked the class to verify unexpected Duo requests", required: false },
  ],
  endings: {
    verified: { eyebrow: "Ending 01", title: "Tie approval to your own action", summary: "You approved only the login you had just initiated.", detail: "MFA is not a way to dismiss a prompt. It confirms that a login really started with you." },
    caution: { eyebrow: "Ending 02", title: "Request denied", summary: "The uninitiated login did not receive its second factor.", detail: "You blocked this access. Contacting IT can help determine whether the password was already exposed." },
    contained: { eyebrow: "Ending 03", title: "Session ended", summary: "The unknown login and recovery-method change are contained.", detail: "Another device briefly entered the account, but you handled the session, password, recovery method, and report." },
    expanded: { eyebrow: "Ending 04", title: "The account still has an opening", summary: "Some access path or recovery method remains unresolved.", detail: "Changing a password, denying new pushes, and ending an old session address different layers. Missing one can leave a path open." },
  },
  clues: [
    "When the phone request appeared, you had not entered your NetID on the current Zoom page.",
    "The device and location do not match the browser you are using.",
    "The class-chat migration claim has no verifiable notice from NYU IT.",
  ],
  causeChain: {
    verified: ["Meeting time pressure", "Check your own login action first", "Restart and match the device", "Approve only your request"],
    caution: ["Unexpected Duo request arrives", "Choose Deny explicitly", "Sign in from your own page", "Unauthorized session blocked"],
    incident: ["Repeated pushes and a migration story", "Approve to clear the prompt", "Another device completes sign-in", "Account and recovery methods exposed"],
  },
  transferRules: [
    { title: "Ask whether you initiated it", body: "An MFA request must match a login you just performed, not merely the right brand and account." },
    { title: "Match device and location", body: "When browser, place, or time does not match, deny first and investigate." },
    { title: "Repeated pushes are not a deadline", body: "Repeated requests may be designed to wear down your judgment, not signal urgency." },
    { title: "An approval creates a session", body: "After an accidental approval, handle the session, password, recovery methods, and IT report." },
  ],
  correctPath: ["Open Duo only after initiating the login yourself.", "Check the service, device, location, and request time.", "When details do not match, choose Deny and mark the request as uninitiated.", "After an accidental approval, immediately end unknown sessions, change the password, review recovery methods, and contact NYU IT."],
} satisfies DecisionCaseDefinition;
