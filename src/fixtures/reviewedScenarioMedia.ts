type OpeningAudio = {
  eventId: string;
  src: string;
};

const reviewedScenarioMedia: Record<string, { openingAudio?: OpeningAudio }> = {
  "the-voice-you-know": {
    openingAudio: {
      eventId: "urgent-request",
      src: "/audio/the-voice-you-know-opening.ogg",
    },
  },
};

export function getReviewedOpeningAudio(scenarioId: string, eventId: string) {
  const openingAudio = reviewedScenarioMedia[scenarioId]?.openingAudio;
  return openingAudio?.eventId === eventId ? openingAudio : null;
}
