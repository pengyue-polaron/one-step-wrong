export type GamePhase =
  | "intro"
  | "network-selection"
  | "captive-portal"
  | "submission"
  | "calm"
  | "incident"
  | "response"
  | "debrief";

export type NetworkId =
  | "campus-secure"
  | "campus-guest"
  | "campus-free-5g"
  | "mobile-hotspot";

export type WindowId =
  | "course"
  | "portal"
  | "chat"
  | "security"
  | "network"
  | "it-report"
  | "calendar";

export type NotificationTone = "info" | "notice" | "incident" | "success";

export type NetworkDefinition = {
  id: NetworkId;
  name: string;
  signal: 1 | 2 | 3;
  security: string;
  summary: string;
  operator?: string;
  connectionTime: string;
};

export type ScenarioEventLog = {
  id: string;
  time: string;
  title: string;
  detail?: string;
  tone: NotificationTone;
};

export type GameNotification = {
  id: string;
  title: string;
  body: string;
  tone: NotificationTone;
  read: boolean;
};

export type EndingId = "verified-path" | "contained" | "expanded";

export type EndingDefinition = {
  id: EndingId;
  title: string;
  eyebrow: string;
  summary: string;
  detail: string;
};

export type DebriefDefinition = {
  clueLabels: Record<string, string>;
  actionLabels: Record<string, string>;
  correctPath: string[];
};

export type ScenarioDefinition = {
  id: string;
  title: string;
  subtitle: string;
  courseName: string;
  fileName: string;
  fileSize: string;
  networks: NetworkDefinition[];
  endings: EndingDefinition[];
  debrief: DebriefDefinition;
};
