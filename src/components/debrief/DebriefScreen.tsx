"use client";

import { ArrowRight, Check, CheckCircle2, Lightbulb, RefreshCcw, RotateCcw, ShieldCheck, TriangleAlert, Wifi } from "lucide-react";
import { PixelButton } from "@/components/ui/PixelButton";
import { useGame } from "@/state/GameContext";
import { selectClues, selectEffectiveActions, selectEnding, selectScore } from "@/state/selectors";

function ScoreMeter({ label, value }: { label: string; value: number }) {
  return (
    <div className="score-meter">
      <div><span>{label}</span><strong>{value}</strong></div>
      <div className="score-track"><span style={{ width: `${value}%` }} /></div>
    </div>
  );
}

export function DebriefScreen() {
  const { state, scenario, dispatch } = useGame();
  const ending = selectEnding(state, scenario);
  const score = selectScore(state);
  const clues = selectClues(state, scenario);
  const actions = selectEffectiveActions(state, scenario);
  const safe = state.endingId === "verified-path";
  const contained = state.endingId === "contained";

  return (
    <main className={`debrief-screen debrief-screen--${state.endingId}`}>
      <header className="debrief-topbar">
        <div className="system-brand"><span className="brand-mark">N</span><span>一步之差</span></div>
        <div><span>CASE 01</span><strong>最后一次提交</strong></div>
      </header>

      <div className="debrief-body">
        <section className="ending-hero">
          <div className="ending-icon">{safe ? <ShieldCheck size={30} /> : contained ? <CheckCircle2 size={30} /> : <TriangleAlert size={30} />}</div>
          <div>
            <span className="ending-eyebrow">{ending.eyebrow} · 事件复盘</span>
            <h1>{ending.title}</h1>
            <p>{ending.summary}</p>
            <small>{ending.detail}</small>
          </div>
          <div className="ending-fact">
            <span>任务结果</span>
            <strong><Check size={15} /> 作业已提交</strong>
            <p>{safe ? "账号与设备未出现异常" : "提交有效，但连接方式引发了后续事件"}</p>
          </div>
        </section>

        <div className="debrief-grid">
          <section className="debrief-section score-section">
            <header><span>01</span><div><h2>本次判断</h2><p>只在复盘中呈现</p></div></header>
            <div className="score-list">
              <ScoreMeter label="风险识别" value={score.recognition} />
              <ScoreMeter label="安全意识" value={score.awareness} />
              <ScoreMeter label="应对表现" value={score.response} />
            </div>
          </section>

          <section className="debrief-section timeline-section" data-testid="event-timeline">
            <header><span>02</span><div><h2>发生了什么</h2><p>根据你的实际操作生成</p></div></header>
            <ol className="event-timeline">
              {state.eventLog.map((event) => (
                <li key={event.id} className={`timeline-${event.tone}`}>
                  <time>{event.time}</time><i /><div><strong>{event.title}</strong>{event.detail ? <p>{event.detail}</p> : null}</div>
                </li>
              ))}
            </ol>
          </section>

          <section className="debrief-section evidence-section">
            <header><span>03</span><div><h2>{safe ? "起作用的判断" : "沿途的线索"}</h2><p>线索存在，但需要主动核对</p></div></header>
            <ul className="clue-list">
              {clues.map((clue) => <li key={clue}><Lightbulb size={15} /><span>{clue}</span></li>)}
            </ul>
            {!safe ? (
              <div className="effective-actions"><h3>有效止损操作</h3>{actions.length ? <ul>{actions.map((action) => <li key={action}><Check size={13} />{action}</li>)}</ul> : <p>这次没有完成关键止损操作。</p>}</div>
            ) : null}
          </section>

          <section className="debrief-section replay-section">
            <header><span>04</span><div><h2>哪一步还能改变结果</h2><p>从关键节点重新体验</p></div></header>
            <div className="decision-path">
              <button onClick={() => dispatch({ type: "REPLAY_NETWORK" })}><span><Wifi size={16} /></span><div><strong>选择网络</strong><small>重新权衡速度与验证成本</small></div><ArrowRight size={15} /></button>
              <i />
              <button onClick={() => dispatch({ type: "REPLAY_NETWORK" })}><span><ShieldCheck size={16} /></span><div><strong>安装配置</strong><small>查看发布者或取消安装</small></div><ArrowRight size={15} /></button>
              {!safe ? <><i /><button onClick={() => dispatch({ type: "REPLAY_INCIDENT" })}><span><TriangleAlert size={16} /></span><div><strong>收到登录提醒</strong><small>从第一个异常开始止损</small></div><ArrowRight size={15} /></button></> : null}
            </div>
          </section>
        </div>

        {state.correctPathVisible ? (
          <section className="correct-path" aria-label="更可靠的做法">
            <header><Lightbulb size={18} /><div><h2>更可靠的做法</h2><p>重点不是记住一个网络名，而是验证来源与权限。</p></div></header>
            <ol>{scenario.debrief.correctPath.map((step) => <li key={step}>{step}</li>)}</ol>
          </section>
        ) : null}

        <footer className="debrief-actions">
          <PixelButton icon={<Lightbulb size={15} />} onClick={() => dispatch({ type: "SHOW_CORRECT_PATH" })}>{state.correctPathVisible ? "收起正确做法" : "查看正确做法"}</PixelButton>
          <PixelButton icon={<RotateCcw size={15} />} onClick={() => dispatch({ type: safe ? "REPLAY_NETWORK" : "REPLAY_INCIDENT" })}>重试关键节点</PixelButton>
          <PixelButton variant="primary" icon={<RefreshCcw size={15} />} onClick={() => dispatch({ type: "RESET_FULL" })}>重新体验完整案例</PixelButton>
        </footer>
      </div>
    </main>
  );
}
