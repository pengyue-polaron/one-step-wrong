"use client";

import { Check, CheckCircle2, ClipboardList, TicketCheck } from "lucide-react";
import { PixelButton } from "@/components/ui/PixelButton";
import { useGame } from "@/state/GameContext";
import { WindowFrame } from "@/components/windows/WindowFrame";

export function ITReportWindow() {
  const { state, dispatch } = useGame();
  const inIncident = state.suspiciousLoginTriggered || state.phase === "response";
  return (
    <WindowFrame id="it-report" title="Northbridge IT Support" icon={<TicketCheck size={15} />} address="https://it.northbridge.edu/report">
      <div className="support-page">
        <header><span className="support-mark">IT</span><div><span className="step-label">校园技术支持</span><h2>报告技术问题</h2><p>报告账号、设备或网络问题。紧急事件会优先分流。</p></div></header>
        {state.itReported ? (
          <div className="ticket-success" data-testid="ticket-success"><CheckCircle2 size={31} /><h3>工单已创建</h3><p>IT 将协助检查账号与设备。</p><dl><div><dt>工单编号</dt><dd>NB-IT-2027</dd></div><div><dt>状态</dt><dd>已受理</dd></div></dl></div>
        ) : inIncident ? (
          <form className="report-form" onSubmit={(event) => { event.preventDefault(); dispatch({ type: "RESPONSE_ACTION", action: "report-it" }); }}>
            <div className="form-grid">
              <label><span>问题类型</span><select defaultValue="suspicious-network"><option value="suspicious-network">可疑网络</option><option>账号异常</option><option>设备配置</option><option>其他</option></select></label>
              <label><span>发生时间</span><input value="今天 23:47 - 23:56" readOnly /></label>
              <label><span>网络名称</span><input value="Campus_Free_5G" readOnly /></label>
              <label><span>当前状态</span><select defaultValue="ongoing"><option value="ongoing">已发现异常，正在处理</option><option>异常已停止</option></select></label>
            </div>
            <fieldset className="report-checks"><legend>事件经过</legend>
              <label><input type="checkbox" defaultChecked /><span><Check size={12} /></span>在网络页面完成过模拟账号验证</label>
              <label><input type="checkbox" defaultChecked /><span><Check size={12} /></span>安装过网络配置</label>
              <label><input type="checkbox" defaultChecked /><span><Check size={12} /></span>发现未知设备登录</label>
              <label><input type="checkbox" defaultChecked /><span><Check size={12} /></span>账号发出非本人消息</label>
            </fieldset>
            <label className="report-description"><span>简短描述</span><textarea value="我连接了名为 Campus_Free_5G 的开放网络，并按照页面提示安装了网络配置。之后出现未知设备登录和异常消息。" readOnly /></label>
            <div className="measures"><ClipboardList size={15} /><div><strong>已采取措施</strong><p>{[state.sessionsRevoked && "退出会话", state.profileRemoved && "删除配置", state.classmatesWarned && "通知同学"].filter(Boolean).join("、") || "暂未选择"}</p></div></div>
            <PixelButton variant="primary" type="submit">提交工单</PixelButton>
          </form>
        ) : (
          <div className="support-empty"><TicketCheck size={27} /><h3>需要技术支持？</h3><p>选择问题类别后，系统会帮助你整理必要信息。</p><PixelButton disabled>创建报告</PixelButton></div>
        )}
      </div>
    </WindowFrame>
  );
}
