"use client";

import { ArrowRight, Check, CheckCircle2, LayoutGrid, Lightbulb, RefreshCcw, RotateCcw, ShieldCheck, TriangleAlert, Wifi } from "lucide-react";
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

export function DebriefScreen({ onExit }: { onExit?: () => void }) {
  const { state, scenario, dispatch } = useGame();
  const ending = selectEnding(state, scenario);
  const score = selectScore(state);
  const clues = selectClues(state, scenario);
  const actions = selectEffectiveActions(state, scenario);
  const safe = state.endingId === "verified-path";
  const contained = state.endingId === "contained";
  const causeChain = safe
    ? [
        ["现场线索", "先核对 Bobst Library 的官方名称"],
        ["来源验证", "登录页根域名是 nyu.edu"],
        ["权限边界", "没有安装无关的代理或证书"],
        ["结果", "只完成了 Brightspace 提交"],
      ]
    : [
        ["诱因", "截止压力与满格信号压缩了判断时间"],
        ["证据", "登录页根域名不是 nyu.edu"],
        ["权限", "配置要求更改网络代理与证书"],
        ["后果", "账号会话与已发送消息出现异常"],
      ];

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

        <section className="learning-transfer" aria-labelledby="learning-transfer-title">
          <header><span>05</span><div><h2 id="learning-transfer-title">把这次判断带到下一次</h2><p>先还原因果，再提炼可迁移的检查动作</p></div></header>
          <div className="cause-chain">
            {causeChain.map(([label, text], index) => (
              <div className="cause-step" key={label}>
                <span>{label}</span><strong>{text}</strong>{index < causeChain.length - 1 ? <ArrowRight size={14} /> : null}
              </div>
            ))}
          </div>
          <div className="transfer-rules">
            <article><span>01</span><h3>核对网络全名</h3><p>不要凭“像学校”或信号强判断，逐字核对现场公布的 SSID。</p></article>
            <article><span>02</span><h3>看根域名</h3><p>在输入账号前，确认真正控制页面的是 nyu.edu，而不只是网址里含有 NYU。</p></article>
            <article><span>03</span><h3>质疑额外权限</h3><p>普通联网若要求安装代理、证书或设备配置，应停下并换可信连接。</p></article>
            <article><span>04</span><h3>分层止损</h3><p>分别处理账号会话、设备配置、冒名消息和学校 IT 上报，避免遗漏。</p></article>
          </div>
        </section>

        {state.correctPathVisible ? (
          <section className="correct-path" aria-label="更可靠的做法">
            <header><Lightbulb size={18} /><div><h2>更可靠的做法</h2><p>重点不是记住一个网络名，而是验证来源与权限。</p></div></header>
            <ol>{scenario.debrief.correctPath.map((step) => <li key={step}>{step}</li>)}</ol>
          </section>
        ) : null}

        <footer className="debrief-actions">
          {onExit ? <PixelButton icon={<LayoutGrid size={15} />} onClick={onExit}>返回案例库</PixelButton> : null}
          <PixelButton icon={<Lightbulb size={15} />} onClick={() => dispatch({ type: "SHOW_CORRECT_PATH" })}>{state.correctPathVisible ? "收起正确做法" : "查看正确做法"}</PixelButton>
          <PixelButton icon={<RotateCcw size={15} />} onClick={() => dispatch({ type: safe ? "REPLAY_NETWORK" : "REPLAY_INCIDENT" })}>重试关键节点</PixelButton>
          <PixelButton variant="primary" icon={<RefreshCcw size={15} />} onClick={() => dispatch({ type: "RESET_FULL" })}>重新体验完整案例</PixelButton>
        </footer>
      </div>
    </main>
  );
}
