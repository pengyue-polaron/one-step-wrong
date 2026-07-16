import type { EndingDefinition } from "@/cases/final-submission/types";

export const endingDefinitions: EndingDefinition[] = [
  {
    id: "verified-path",
    eyebrow: "Ending 01",
    title: "One more check",
    summary: "The assignment is submitted without account or device anomalies.",
    detail: "You accepted a small time or data cost and chose a connection with a clear source and verifiable access path.",
  },
  {
    id: "contained",
    eyebrow: "Ending 02",
    title: "Contained in time",
    summary: "The unknown session is ended and the impact is contained.",
    detail: "The account was briefly exposed, but you handled the session, device profile, affected classmates, and IT report separately.",
  },
  {
    id: "expanded",
    eyebrow: "Ending 03",
    title: "Impact expands",
    summary: "The impersonated message keeps spreading and the account needs further recovery.",
    detail: "The assignment was submitted, but unresolved sessions and configuration changes extended the impact to other students.",
  },
];
