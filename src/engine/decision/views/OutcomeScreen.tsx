import { AlertTriangle, ArrowRight, CheckCircle2, History, ShieldAlert } from "lucide-react";
import { PixelButton } from "@/components/ui/PixelButton";
import { ChapterTopbar } from "@/engine/decision/components/ChapterChrome";
import type { DecisionCaseDefinition, DecisionOption } from "@/engine/decision/types";

export function OutcomeScreen({
  definition,
  choice,
  onContinue,
  onExit,
}: {
  definition: DecisionCaseDefinition;
  choice: DecisionOption;
  onContinue: () => void;
  onExit: () => void;
}) {
  const incident = choice.route === "incident";
  const caution = choice.route === "caution";
  const drive = definition.id === "shared-draft";
  const title = incident ? definition.incident.title : drive ? "共享设置已更新" : caution ? "请求已拒绝" : "登录来源已核对";
  const body = incident
    ? definition.incident.body
    : drive
      ? choice.route === "verified" ? "三位组员已收到邀请，资料夹仍保持 Restricted。" : "NYU 社区链接已经生效，组员可以继续编辑。"
      : choice.route === "verified" ? "当前手机请求与你的浏览器动作不匹配。你重新从 Zoom 发起了登录。" : "Duo 已记录这不是你发起的登录，当前请求未被批准。";
  return (
    <main className={`chapter-shell chapter-shell--${definition.tone}`}>
      <ChapterTopbar definition={definition} onExit={onExit} />
      <section className={`chapter-outcome ${incident ? "chapter-outcome--incident" : caution ? "chapter-outcome--caution" : ""}`}>
        <div className="outcome-status"><span>{incident ? <AlertTriangle size={30} /> : <CheckCircle2 size={30} />}</span><div><small>{incident ? definition.incident.delay : "任务状态"}</small><h1>{title}</h1><p>{body}</p></div></div>
        <div className="outcome-evidence">
          <header><History size={16} /><strong>{incident ? "活动记录" : "本次操作"}</strong></header>
          {incident ? (
            <dl>{definition.incident.evidence.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl>
          ) : (
            <dl><div><dt>选择</dt><dd>{choice.title}</dd></div><div><dt>范围</dt><dd>{choice.meta}</dd></div><div><dt>结果</dt><dd>{drive ? "协作可以继续" : "未授权登录未完成"}</dd></div></dl>
          )}
        </div>
        <PixelButton variant="primary" icon={incident ? <ShieldAlert size={16} /> : <ArrowRight size={16} />} onClick={onContinue}>
          {incident ? (drive ? "处理共享异常" : "处理账号异常") : "查看本次复盘"}
        </PixelButton>
      </section>
    </main>
  );
}
