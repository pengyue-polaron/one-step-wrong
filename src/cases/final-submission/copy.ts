export const copy = {
  intro: {
    kicker: "NYU · BOBST LIBRARY · 23:47",
    title: "Final Submission",
    body: "The file is finished, but the submission page has stalled before upload for the third time. Twelve minutes remain.",
    prompt: "Submit Final_Assignment.pdf to the course system before 23:59.",
  },
  task: {
    submission: "Submit the final assignment",
    submissionHint: "Restore the network connection and finish the upload.",
    response: "Stop the incident from spreading",
    responseHint: "Check signed-in devices, network profiles, sent messages, and the IT report.",
  },
  portal: {
    title: "NYU High-Speed Network Access",
    body: "A new device was detected. Complete network setup for a stable connection.",
    address: "http://nyu-access.test",
    officialAddress: "https://login.nyu.edu/netid",
    guestAddress: "https://guestwifi.nyu.edu",
  },
  messages: {
    initial: "Did you submit? Mine stalled twice too.",
    followup: "Did it go through? I am about to pack up.",
    suspiciousQuestion: "What was that link you just sent me?",
    suspiciousFollowup: "It wants me to install something too. What is this?",
    forged: "NYU high-speed network access. Try this if you cannot get online:\nhttp://nyu-access.test",
  },
} as const;
