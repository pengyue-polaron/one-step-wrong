import { copy } from "@/cases/final-submission/copy";
import { networkLabels, responseActionLabels } from "@/cases/final-submission/events";
import type {
  EndingId,
  GameNotification,
  GamePhase,
  NetworkId,
  NotificationTone,
  ScenarioEventLog,
  WindowId,
} from "@/cases/final-submission/types";

export type PortalStep = "identity" | "profile" | "installed";

export type GameState = {
  started: boolean;
  phase: GamePhase;
  deadlineSeconds: number;
  countdownPaused: boolean;
  muted: boolean;
  reducedMotion: boolean;
  activeWindow: WindowId;
  openWindows: WindowId[];
  networkPanelOpen: boolean;
  notificationCenterOpen: boolean;
  selectedNetwork: NetworkId | null;
  connectionReady: boolean;
  portalStep: PortalStep;
  installDialogOpen: boolean;
  networkDetailsViewed: boolean;
  profileDetailsViewed: boolean;
  credentialsSimulated: boolean;
  profileInstalled: boolean;
  hotspotEnabled: boolean;
  assignmentUploading: boolean;
  uploadProgress: number;
  assignmentUploaded: boolean;
  integrityAccepted: boolean;
  assignmentSubmitted: boolean;
  receiptViewed: boolean;
  calmActions: string[];
  incidentStep: number;
  suspiciousLoginTriggered: boolean;
  suspiciousLoginReviewed: boolean;
  suspiciousLoginIgnored: boolean;
  sessionExpired: boolean;
  maliciousMessageSent: boolean;
  maliciousMessageDeleted: boolean;
  sessionsRevoked: boolean;
  passwordChanged: boolean;
  mfaEnabled: boolean;
  profileRemoved: boolean;
  unsafeNetworkForgotten: boolean;
  networkDisconnected: boolean;
  classmatesWarned: boolean;
  warningQuality: 0 | 1 | 2;
  itReported: boolean;
  notifications: GameNotification[];
  firedEvents: string[];
  eventLog: ScenarioEventLog[];
  storyMinute: number;
  endingId: EndingId | null;
  correctPathVisible: boolean;
};

export type GameAction =
  | { type: "START_GAME" }
  | { type: "TICK" }
  | { type: "TOGGLE_PAUSE" }
  | { type: "TOGGLE_MUTE" }
  | { type: "TOGGLE_REDUCED_MOTION" }
  | { type: "OPEN_WINDOW"; window: WindowId }
  | { type: "CLOSE_WINDOW"; window: WindowId }
  | { type: "TOGGLE_NETWORK_PANEL" }
  | { type: "TOGGLE_NOTIFICATION_CENTER" }
  | { type: "RETRY_UPLOAD" }
  | { type: "VIEW_NETWORK_DETAILS" }
  | { type: "SELECT_NETWORK"; network: NetworkId }
  | { type: "AUTHENTICATE_NETWORK" }
  | { type: "ENABLE_HOTSPOT" }
  | { type: "PORTAL_IDENTITY" }
  | { type: "VIEW_PROFILE_DETAILS" }
  | { type: "DEFER_PROFILE" }
  | { type: "REQUEST_INSTALL" }
  | { type: "CANCEL_INSTALL" }
  | { type: "CONFIRM_INSTALL" }
  | { type: "SET_UPLOAD_PROGRESS"; progress: number }
  | { type: "TOGGLE_INTEGRITY" }
  | { type: "FINAL_SUBMIT" }
  | { type: "CALM_ACTION"; action: string }
  | { type: "HANDLE_LOGIN_ALERT"; choice: "review" | "mine" | "later" }
  | { type: "ADVANCE_INCIDENT" }
  | { type: "RESPONSE_ACTION"; action: ResponseAction }
  | { type: "FINISH_RESPONSE" }
  | { type: "CONCLUDE_SAFE" }
  | { type: "SHOW_CORRECT_PATH" }
  | { type: "REPLAY_NETWORK" }
  | { type: "REPLAY_INCIDENT" }
  | { type: "RESET_FULL" };

export type ResponseAction =
  | "revoke-session"
  | "change-password"
  | "enable-mfa"
  | "disconnect-network"
  | "forget-network"
  | "remove-profile"
  | "delete-message"
  | "warn-brief"
  | "warn-clear"
  | "warn-none"
  | "report-it";

const initialNotifications: GameNotification[] = [
  {
    id: "friend-initial",
    title: "Lin Xiao",
    body: copy.messages.initial,
    tone: "info",
    read: false,
  },
];

export function createInitialState(): GameState {
  return {
    started: false,
    phase: "intro",
    deadlineSeconds: 702,
    countdownPaused: false,
    muted: false,
    reducedMotion: false,
    activeWindow: "course",
    openWindows: ["course"],
    networkPanelOpen: false,
    notificationCenterOpen: false,
    selectedNetwork: null,
    connectionReady: false,
    portalStep: "identity",
    installDialogOpen: false,
    networkDetailsViewed: false,
    profileDetailsViewed: false,
    credentialsSimulated: false,
    profileInstalled: false,
    hotspotEnabled: false,
    assignmentUploading: false,
    uploadProgress: 0,
    assignmentUploaded: false,
    integrityAccepted: false,
    assignmentSubmitted: false,
    receiptViewed: false,
    calmActions: [],
    incidentStep: 0,
    suspiciousLoginTriggered: false,
    suspiciousLoginReviewed: false,
    suspiciousLoginIgnored: false,
    sessionExpired: false,
    maliciousMessageSent: false,
    maliciousMessageDeleted: false,
    sessionsRevoked: false,
    passwordChanged: false,
    mfaEnabled: false,
    profileRemoved: false,
    unsafeNetworkForgotten: false,
    networkDisconnected: false,
    classmatesWarned: false,
    warningQuality: 0,
    itReported: false,
    notifications: initialNotifications.map((item) => ({ ...item })),
    firedEvents: [],
    eventLog: [],
    storyMinute: 0,
    endingId: null,
    correctPathVisible: false,
  };
}

function formatEventTime(storyMinute: number) {
  const totalMinutes = 23 * 60 + 47 + storyMinute;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function addEvent(
  state: GameState,
  event: { id: string; title: string; detail?: string; tone?: NotificationTone; minutes?: number },
): GameState {
  if (state.firedEvents.includes(event.id)) return state;
  const minute = state.storyMinute + (event.minutes ?? 1);
  return {
    ...state,
    storyMinute: minute,
    firedEvents: [...state.firedEvents, event.id],
    eventLog: [
      ...state.eventLog,
      {
        id: event.id,
        time: formatEventTime(minute),
        title: event.title,
        detail: event.detail,
        tone: event.tone ?? "info",
      },
    ],
  };
}

function pushNotification(state: GameState, notification: GameNotification) {
  if (state.notifications.some((item) => item.id === notification.id)) return state;
  return { ...state, notifications: [...state.notifications, notification] };
}

function openWindow(state: GameState, window: WindowId): GameState {
  return {
    ...state,
    activeWindow: window,
    openWindows: state.openWindows.includes(window) ? state.openWindows : [...state.openWindows, window],
    networkPanelOpen: false,
    notificationCenterOpen: false,
  };
}

function connectNetwork(state: GameState, label: string) {
  let next = addEvent(state, {
    id: `connected-${state.selectedNetwork}`,
    title: `Connected to ${label}`,
    detail: state.selectedNetwork === "mobile-hotspot" ? "Estimated data use: about 10 MB" : undefined,
    minutes: 1,
  });
  next = openWindow(
    {
      ...next,
      connectionReady: true,
      phase: "submission",
      networkPanelOpen: false,
      deadlineSeconds: Math.max(0, next.deadlineSeconds - 20),
    },
    "course",
  );
  return next;
}

function triggerLoginIncident(state: GameState): GameState {
  let next = addEvent(state, {
    id: "suspicious-login",
    title: "Account signed in on a new device",
    detail: "Unknown location · Windows Browser",
    tone: "incident",
    minutes: 2,
  });
  next = pushNotification(next, {
    id: "suspicious-login",
    title: "Account security alert",
    body: "Your campus account signed in on a new device. Location: Unknown.",
    tone: "incident",
    read: false,
  });
  return { ...next, phase: "incident", incidentStep: 1, suspiciousLoginTriggered: true };
}

function responseEnding(state: GameState): EndingId {
  const critical = [state.sessionsRevoked, state.profileRemoved, state.classmatesWarned, state.itReported];
  return critical.every(Boolean) ? "contained" : "expanded";
}

export function createIncidentReplayState(): GameState {
  let state = createInitialState();
  state = {
    ...state,
    started: true,
    phase: "calm",
    deadlineSeconds: 300,
    selectedNetwork: "campus-free-5g",
    connectionReady: true,
    credentialsSimulated: true,
    profileInstalled: true,
    portalStep: "installed",
    assignmentUploaded: true,
    uploadProgress: 100,
    integrityAccepted: true,
    assignmentSubmitted: true,
    openWindows: ["course", "chat"],
  };
  state = addEvent(state, { id: "connected-campus-free-5g", title: "Connected to NYU_Free_5G" });
  state = addEvent(state, { id: "credentials", title: "Completed identity verification on the network page" });
  state = addEvent(state, { id: "profile-installed", title: "Installed the NYU Network Access profile" });
  state = addEvent(state, { id: "assignment-submitted", title: "Assignment submitted", tone: "success" });
  return triggerLoginIncident(state);
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME":
      return { ...state, started: true, phase: "intro" };
    case "TICK":
      if (!state.started || state.countdownPaused || state.phase === "debrief") return state;
      return { ...state, deadlineSeconds: Math.max(0, state.deadlineSeconds - 1) };
    case "TOGGLE_PAUSE":
      return { ...state, countdownPaused: !state.countdownPaused };
    case "TOGGLE_MUTE":
      return { ...state, muted: !state.muted };
    case "TOGGLE_REDUCED_MOTION":
      return { ...state, reducedMotion: !state.reducedMotion };
    case "OPEN_WINDOW":
      return openWindow(state, action.window);
    case "CLOSE_WINDOW":
      return {
        ...state,
        openWindows: state.openWindows.filter((item) => item !== action.window),
        activeWindow: state.activeWindow === action.window ? "course" : state.activeWindow,
      };
    case "TOGGLE_NETWORK_PANEL":
      return {
        ...state,
        networkPanelOpen: !state.networkPanelOpen,
        notificationCenterOpen: false,
      };
    case "TOGGLE_NOTIFICATION_CENTER":
      return {
        ...state,
        notificationCenterOpen: !state.notificationCenterOpen,
        networkPanelOpen: false,
        notifications: state.notifications.map((item) => ({ ...item, read: true })),
      };
    case "RETRY_UPLOAD": {
      if (state.connectionReady) return state;
      return {
        ...state,
        phase: "network-selection",
        networkPanelOpen: true,
        deadlineSeconds: Math.max(0, state.deadlineSeconds - 12),
      };
    }
    case "VIEW_NETWORK_DETAILS":
      return { ...state, networkDetailsViewed: true };
    case "SELECT_NETWORK": {
      let next = addEvent(
        { ...state, selectedNetwork: action.network, networkPanelOpen: false },
        {
          id: `selected-${action.network}`,
          title: `Selected ${networkLabels[action.network]}`,
          minutes: 0,
        },
      );
      if (action.network === "campus-free-5g") {
        next = addEvent(next, { id: "connected-campus-free-5g", title: "Connected to NYU_Free_5G", minutes: 0 });
      }
      return openWindow({ ...next, phase: "captive-portal", portalStep: "identity" }, "portal");
    }
    case "AUTHENTICATE_NETWORK": {
      if (state.selectedNetwork === "campus-secure") return connectNetwork(state, "nyu");
      if (state.selectedNetwork === "campus-guest") return connectNetwork(state, "nyuguest");
      return state;
    }
    case "ENABLE_HOTSPOT":
      return connectNetwork({ ...state, hotspotEnabled: true }, "Maya's iPhone");
    case "PORTAL_IDENTITY": {
      const next = addEvent(state, {
        id: "credentials",
        title: "Completed identity verification on the network page",
        detail: copy.portal.address,
      });
      return { ...next, credentialsSimulated: true, portalStep: "profile" };
    }
    case "VIEW_PROFILE_DETAILS":
      return { ...state, profileDetailsViewed: true };
    case "DEFER_PROFILE":
      return {
        ...state,
        phase: "network-selection",
        selectedNetwork: null,
        networkPanelOpen: true,
        installDialogOpen: false,
        openWindows: state.openWindows.filter((item) => item !== "portal"),
      };
    case "REQUEST_INSTALL":
      return { ...state, installDialogOpen: true };
    case "CANCEL_INSTALL":
      return { ...state, installDialogOpen: false };
    case "CONFIRM_INSTALL": {
      let next = addEvent(state, {
        id: "profile-installed",
        title: "Installed the NYU Network Access profile",
        detail: "Publisher: Unverified",
        tone: "notice",
      });
      next = {
        ...next,
        profileInstalled: true,
        portalStep: "installed",
        installDialogOpen: false,
        connectionReady: true,
        phase: "submission",
      };
      return openWindow(next, "course");
    }
    case "SET_UPLOAD_PROGRESS":
      return {
        ...state,
        assignmentUploading: action.progress < 100,
        assignmentUploaded: action.progress >= 100,
        uploadProgress: action.progress,
      };
    case "TOGGLE_INTEGRITY":
      return { ...state, integrityAccepted: !state.integrityAccepted };
    case "FINAL_SUBMIT": {
      if (!state.assignmentUploaded || !state.integrityAccepted) return state;
      let next = addEvent(state, {
        id: "assignment-submitted",
        title: "Assignment submitted",
        detail: "Final_Assignment.pdf · Received",
        tone: "success",
        minutes: 2,
      });
      next = pushNotification(next, {
        id: "assignment-received",
        title: "Course system",
        body: "Final_Assignment.pdf was received.",
        tone: "success",
        read: false,
      });
      return {
        ...next,
        assignmentSubmitted: true,
        phase: state.selectedNetwork === "campus-free-5g" ? "calm" : "submission",
      };
    }
    case "CALM_ACTION": {
      if (state.calmActions.includes(action.action)) return state;
      const calmActions = [...state.calmActions, action.action];
      let next = { ...state, calmActions, receiptViewed: state.receiptViewed || action.action === "receipt" };
      if (calmActions.length >= 2) next = triggerLoginIncident(next);
      return next;
    }
    case "HANDLE_LOGIN_ALERT": {
      let next = {
        ...state,
        suspiciousLoginReviewed: action.choice === "review",
        suspiciousLoginIgnored: action.choice !== "review",
        incidentStep: 2,
        notifications: state.notifications.map((item) =>
          item.id === "suspicious-login" ? { ...item, read: true } : item,
        ),
      };
      if (action.choice === "review") next = openWindow(next, "security");
      next = pushNotification(next, {
        id: "session-expired",
        title: "Course system",
        body: "Your current session expired. Verify your identity again.",
        tone: "notice",
        read: false,
      });
      return next;
    }
    case "ADVANCE_INCIDENT": {
      if (state.incidentStep === 2) {
        let next = addEvent(
          { ...state, incidentStep: 3, sessionExpired: true },
          { id: "session-expired", title: "Course system session expired", tone: "notice" },
        );
        next = pushNotification(next, {
          id: "friend-question",
          title: "Lin Xiao",
          body: copy.messages.suspiciousQuestion,
          tone: "notice",
          read: false,
        });
        return openWindow(next, "course");
      }
      if (state.incidentStep === 3) {
        let next = { ...state, incidentStep: 4, maliciousMessageSent: true };
        next = addEvent(next, {
          id: "forged-message",
          title: "Unexpected link sent from your account",
          detail: "Sent to: Lin Xiao",
          tone: "incident",
        });
        next = pushNotification(next, {
          id: "friend-followup",
          title: "Lin Xiao",
          body: copy.messages.suspiciousFollowup,
          tone: "incident",
          read: false,
        });
        return openWindow(next, "chat");
      }
      if (state.incidentStep === 4) {
        let next = addEvent(
          { ...state, incidentStep: 5, phase: "response" },
          { id: "response-started", title: "Started responding to account and device anomalies", tone: "notice", minutes: 1 },
        );
        next = pushNotification(
          next,
          {
            id: "incident-task",
            title: "Unexpected account activity",
            body: "Check signed-in devices, network profiles, sent messages, and contact IT.",
            tone: "incident",
            read: false,
          },
        );
        return next;
      }
      return state;
    }
    case "RESPONSE_ACTION": {
      const actionMap: Record<ResponseAction, Partial<GameState>> = {
        "revoke-session": { sessionsRevoked: true },
        "change-password": { passwordChanged: true },
        "enable-mfa": { mfaEnabled: true },
        "disconnect-network": { networkDisconnected: true },
        "forget-network": { unsafeNetworkForgotten: true, networkDisconnected: true },
        "remove-profile": { profileRemoved: true },
        "delete-message": { maliciousMessageDeleted: true },
        "warn-brief": { classmatesWarned: true, warningQuality: 1 },
        "warn-clear": { classmatesWarned: true, warningQuality: 2 },
        "warn-none": { classmatesWarned: false, warningQuality: 0 },
        "report-it": { itReported: true },
      };
      return addEvent(
        { ...state, ...actionMap[action.action] },
        { id: `response-${action.action}`, title: responseActionLabels[action.action], tone: "success", minutes: 0 },
      );
    }
    case "FINISH_RESPONSE":
      return { ...state, phase: "debrief", endingId: responseEnding(state), activeWindow: "course" };
    case "CONCLUDE_SAFE":
      return { ...state, phase: "debrief", endingId: "verified-path" };
    case "SHOW_CORRECT_PATH":
      return { ...state, correctPathVisible: !state.correctPathVisible };
    case "REPLAY_NETWORK": {
      const next = createInitialState();
      return {
        ...next,
        started: true,
        phase: "network-selection",
        deadlineSeconds: 600,
        networkPanelOpen: true,
      };
    }
    case "REPLAY_INCIDENT":
      return createIncidentReplayState();
    case "RESET_FULL":
      return createInitialState();
    default:
      return state;
  }
}
