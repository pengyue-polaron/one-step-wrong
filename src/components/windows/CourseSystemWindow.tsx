"use client";

import { BookOpen, Check, CheckCircle2, FileText, RefreshCw, WifiOff } from "lucide-react";
import { PixelButton } from "@/components/ui/PixelButton";
import { useGame } from "@/state/GameContext";
import { WindowFrame } from "@/components/windows/WindowFrame";

function AssignmentHeader({ courseName }: { courseName: string }) {
  return (
    <div className="course-heading">
      <div>
        <span className="course-code">MDS 102 · WEEK 12</span>
        <h2>Final Assignment</h2>
        <p>{courseName}</p>
      </div>
      <div className="due-box"><span>截止时间</span><strong>今天 23:59</strong></div>
    </div>
  );
}

export function CourseSystemWindow() {
  const { state, scenario, dispatch } = useGame();
  const isDangerRoute = state.selectedNetwork === "campus-free-5g";

  return (
    <WindowFrame id="course" title="Northbridge Courses" icon={<BookOpen size={15} />} address="https://courses.northbridge.edu/assignments/final">
      <div className="course-layout">
        <aside className="course-nav">
          <span className="university-seal">NB</span>
          <strong>课程空间</strong>
          <nav><span>概览</span><span>材料</span><span className="is-active">作业</span><span>成绩</span></nav>
        </aside>
        <main className="course-main">
          <AssignmentHeader courseName={scenario.courseName} />
          {state.sessionExpired && (state.phase === "incident" || state.phase === "response") ? (
            <div className="session-expired" data-testid="session-expired">
              <WifiOff size={28} />
              <div><h3>登录状态已失效</h3><p>请从安全网络重新验证身份。提交回执已保存在本机。</p></div>
              <PixelButton onClick={() => dispatch({ type: "OPEN_WINDOW", window: "security" })}>查看账号活动</PixelButton>
            </div>
          ) : null}

          {!state.assignmentSubmitted ? (
            <section className="submission-card" data-testid="submission-card">
              <div className="file-row">
                <span className="file-icon"><FileText size={21} /></span>
                <div><strong>{scenario.fileName}</strong><small>PDF · {scenario.fileSize}</small></div>
                <span className={`upload-state ${state.connectionReady ? "is-ready" : ""}`}>
                  {state.assignmentUploaded ? "上传完成" : state.connectionReady ? "等待上传" : "上传失败"}
                </span>
              </div>

              {!state.connectionReady ? (
                <div className="upload-error">
                  <WifiOff size={17} />
                  <div><strong>网络连接中断</strong><p>文件未上传，请检查网络后重试。</p></div>
                </div>
              ) : null}

              {state.assignmentUploading || state.assignmentUploaded ? (
                <div className="upload-progress-wrap">
                  <div className="upload-meta"><span>正在上传</span><strong>{state.uploadProgress}%</strong></div>
                  <div className="upload-track" role="progressbar" aria-valuenow={state.uploadProgress} aria-valuemin={0} aria-valuemax={100}>
                    <span style={{ width: `${state.uploadProgress}%` }} />
                  </div>
                </div>
              ) : null}

              {state.assignmentUploaded ? (
                <label className="integrity-check">
                  <input type="checkbox" checked={state.integrityAccepted} onChange={() => dispatch({ type: "TOGGLE_INTEGRITY" })} />
                  <span><Check size={13} /></span>
                  我确认这是本人完成的作业，并遵守课程学术诚信要求。
                </label>
              ) : null}

              <div className="submission-actions">
                {!state.connectionReady ? (
                  <>
                    <PixelButton icon={<RefreshCw size={15} />} onClick={() => dispatch({ type: "RETRY_UPLOAD" })}>重新上传</PixelButton>
                    <PixelButton variant="quiet">保存草稿</PixelButton>
                  </>
                ) : !state.assignmentUploaded ? (
                  <PixelButton variant="primary" icon={<FileText size={15} />} onClick={() => dispatch({ type: "SET_UPLOAD_PROGRESS", progress: 7 })}>
                    上传文件
                  </PixelButton>
                ) : (
                  <PixelButton variant="primary" disabled={!state.integrityAccepted} onClick={() => dispatch({ type: "FINAL_SUBMIT" })}>
                    最终提交
                  </PixelButton>
                )}
              </div>
            </section>
          ) : (
            <section className="receipt-card" data-testid="submission-success">
              <div className="receipt-status"><CheckCircle2 size={25} /><div><span>提交成功</span><h3>文件已接收</h3></div></div>
              <dl>
                <div><dt>文件</dt><dd>{scenario.fileName}</dd></div>
                <div><dt>提交时间</dt><dd>{state.eventLog.find((item) => item.id === "assignment-submitted")?.time ?? "23:54"}</dd></div>
                <div><dt>状态</dt><dd><span className="received-label">已接收</span></dd></div>
                <div><dt>回执编号</dt><dd>NB-MDS102-2841</dd></div>
              </dl>
              <p>你可以在截止前替换提交内容。</p>
              {isDangerRoute ? (
                <div className="normal-actions">
                  <span>提交后的事项</span>
                  <div>
                    <PixelButton
                      variant={state.calmActions.includes("receipt") ? "quiet" : "secondary"}
                      disabled={state.calmActions.includes("receipt")}
                      onClick={() => dispatch({ type: "CALM_ACTION", action: "receipt" })}
                    >
                      {state.calmActions.includes("receipt") ? "回执已保存" : "保存提交回执"}
                    </PixelButton>
                    <PixelButton onClick={() => dispatch({ type: "OPEN_WINDOW", window: "chat" })}>回复林晓</PixelButton>
                    <PixelButton onClick={() => dispatch({ type: "OPEN_WINDOW", window: "calendar" })}>查看明日课程</PixelButton>
                  </div>
                </div>
              ) : (
                <PixelButton variant="primary" onClick={() => dispatch({ type: "CONCLUDE_SAFE" })}>结束本次提交</PixelButton>
              )}
            </section>
          )}
          <footer className="course-requirements"><span>允许提交：PDF</span><span>最大文件：20 MB</span><span>可重交至截止时间</span></footer>
        </main>
      </div>
    </WindowFrame>
  );
}
