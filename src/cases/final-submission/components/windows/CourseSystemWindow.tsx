"use client";

import { BookOpen, Check, CheckCircle2, FileText, RefreshCw, WifiOff } from "lucide-react";
import { PixelButton } from "@/components/ui/PixelButton";
import { useGame } from "@/cases/final-submission/state/GameContext";
import { WindowFrame } from "@/cases/final-submission/components/windows/WindowFrame";

function AssignmentHeader({ courseName }: { courseName: string }) {
  return (
    <div className="course-heading">
      <div>
        <span className="course-code">MCC 102 · WEEK 12</span>
        <h2>Final Assignment</h2>
        <p>{courseName}</p>
      </div>
      <div className="due-box"><span>DUE</span><strong>Today at 23:59</strong></div>
    </div>
  );
}

export function CourseSystemWindow() {
  const { state, scenario, dispatch } = useGame();
  const isDangerRoute = state.selectedNetwork === "campus-free-5g";

  return (
    <WindowFrame id="course" title="NYU Brightspace" icon={<BookOpen size={15} />} address="https://brightspace.nyu.edu/d2l/le/assignments/final">
      <div className="course-layout">
        <header className="course-nav">
          <span className="university-seal">NYU</span>
          <div className="brightspace-brand"><strong>NYU Brightspace</strong><small>{scenario.courseName}</small></div>
          <nav><span>Course Home</span><span>Content</span><span className="is-active">Assignments</span><span>Discussions</span><span>Grades</span></nav>
          <span className="student-avatar" aria-label="Current user LS">LS</span>
        </header>
        <main className="course-main">
          <AssignmentHeader courseName={scenario.courseName} />
          {state.sessionExpired && (state.phase === "incident" || state.phase === "response") ? (
            <div className="session-expired" data-testid="session-expired">
              <WifiOff size={28} />
              <div><h3>Your session expired</h3><p>Verify your identity again from a trusted network. The submission receipt is saved on this device.</p></div>
              <PixelButton onClick={() => dispatch({ type: "OPEN_WINDOW", window: "security" })}>Review account activity</PixelButton>
            </div>
          ) : null}

          {!state.assignmentSubmitted ? (
            <section className="submission-card" data-testid="submission-card">
              <div className="file-row">
                <span className="file-icon"><FileText size={21} /></span>
                <div><strong>{scenario.fileName}</strong><small>PDF · {scenario.fileSize}</small></div>
                <span className={`upload-state ${state.connectionReady ? "is-ready" : ""}`}>
                  {state.assignmentUploaded ? "Upload complete" : state.connectionReady ? "Ready to upload" : "Upload failed"}
                </span>
              </div>

              {!state.connectionReady ? (
                <div className="upload-error">
                  <WifiOff size={17} />
                  <div><strong>Network connection interrupted</strong><p>The file was not uploaded. Check the network and try again.</p></div>
                </div>
              ) : null}

              {state.assignmentUploading || state.assignmentUploaded ? (
                <div className="upload-progress-wrap">
                  <div className="upload-meta"><span>Uploading</span><strong>{state.uploadProgress}%</strong></div>
                  <div className="upload-track" role="progressbar" aria-valuenow={state.uploadProgress} aria-valuemin={0} aria-valuemax={100}>
                    <span style={{ width: `${state.uploadProgress}%` }} />
                  </div>
                </div>
              ) : null}

              {state.assignmentUploaded ? (
                <label className="integrity-check">
                  <input checked={state.integrityAccepted} name="academic-integrity" onChange={() => dispatch({ type: "TOGGLE_INTEGRITY" })} type="checkbox" />
                  <span><Check size={13} /></span>
                  I confirm this is my own work and follows the course academic integrity requirements.
                </label>
              ) : null}

              <div className="submission-actions">
                {!state.connectionReady ? (
                  <>
                    <PixelButton icon={<RefreshCw size={15} />} onClick={() => dispatch({ type: "RETRY_UPLOAD" })}>Retry upload</PixelButton>
                    <PixelButton variant="quiet">Save draft</PixelButton>
                  </>
                ) : !state.assignmentUploaded ? (
                  <PixelButton variant="primary" icon={<FileText size={15} />} onClick={() => dispatch({ type: "SET_UPLOAD_PROGRESS", progress: 7 })}>
                    Add file
                  </PixelButton>
                ) : (
                  <PixelButton variant="primary" disabled={!state.integrityAccepted} onClick={() => dispatch({ type: "FINAL_SUBMIT" })}>
                    Submit to Brightspace
                  </PixelButton>
                )}
              </div>
            </section>
          ) : (
            <section className="receipt-card" data-testid="submission-success">
              <div className="receipt-status"><CheckCircle2 size={25} /><div><span>SUBMITTED</span><h3>File received</h3></div></div>
              <h3 className="submission-history-title">Submission History</h3>
              <dl>
                <div><dt>File</dt><dd>{scenario.fileName}</dd></div>
                <div><dt>Submitted</dt><dd>{state.eventLog.find((item) => item.id === "assignment-submitted")?.time ?? "23:54"}</dd></div>
                <div><dt>Status</dt><dd><span className="received-label">Received</span></dd></div>
                <div><dt>Receipt</dt><dd>NYU-MCC102-2841</dd></div>
              </dl>
              <p>You can replace this submission before the deadline.</p>
              {isDangerRoute ? (
                <div className="normal-actions">
                  <span>After submitting</span>
                  <div>
                    <PixelButton
                      variant={state.calmActions.includes("receipt") ? "quiet" : "secondary"}
                      disabled={state.calmActions.includes("receipt")}
                      onClick={() => dispatch({ type: "CALM_ACTION", action: "receipt" })}
                    >
                      {state.calmActions.includes("receipt") ? "Receipt saved" : "Save submission receipt"}
                    </PixelButton>
                    <PixelButton onClick={() => dispatch({ type: "OPEN_WINDOW", window: "chat" })}>Reply to Lin Xiao</PixelButton>
                    <PixelButton onClick={() => dispatch({ type: "OPEN_WINDOW", window: "calendar" })}>Review tomorrow&apos;s schedule</PixelButton>
                  </div>
                </div>
              ) : (
                <PixelButton variant="primary" onClick={() => dispatch({ type: "CONCLUDE_SAFE" })}>Finish this submission</PixelButton>
              )}
            </section>
          )}
          <footer className="course-requirements"><span>Allowed File Extensions: PDF</span><span>Maximum File Size: 20 MB</span><span>Resubmissions allowed until deadline</span></footer>
        </main>
      </div>
    </WindowFrame>
  );
}
