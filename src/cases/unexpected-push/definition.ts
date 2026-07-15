import type { CaseSummary } from "@/cases/types";
import type { DecisionCaseDefinition } from "@/engine/decision/types";

export const unexpectedPushSummary = {
  id: "unexpected-push",
  number: "03",
  title: "这次是你吗",
  kicker: "登录与确认",
  summary: "会议还有两分钟开始，手机连续弹出 Duo 请求。哪一次登录才真正属于你？",
  location: "Kimmel Center · 7F",
  duration: "7–9 分钟",
  topic: "多重验证",
  app: "NYU Duo",
  tone: "green",
} satisfies CaseSummary;

export const unexpectedPushDefinition = {
  ...unexpectedPushSummary,
  intro: {
    time: "17:58",
    title: "这次是你吗",
    body: "线上导师会议两分钟后开始。Zoom 还停在登录页，手机却已经连续收到三次 Duo 登录请求。课程群里有人说 NYU 正在迁移账号。",
    task: "确认属于自己的登录，准时进入导师会议。",
    startLabel: "查看登录请求",
  },
  decision: {
    eyebrow: "DUO MOBILE · LOGIN REQUEST",
    title: "NYU Login",
    body: "请求来自 Chrome，位置显示 Jersey City。你还没有在当前 Zoom 页面输入 NetID。",
    deadline: "01:42",
    options: [
      { id: "verify-browser", title: "返回浏览器核对登录", meta: "暂不处理手机请求", description: "先确认自己是否发起过登录，再从当前页面重新开始。", route: "verified", event: "暂停 Duo 请求并核对当前浏览器登录" },
      { id: "deny-request", title: "拒绝这次请求", meta: "Deny · I didn't request this", description: "标记这不是本人发起，再从自己的 Zoom 页面重新登录。", route: "caution", event: "拒绝未发起的 Duo 登录请求" },
      { id: "approve-request", title: "批准登录", meta: "Approve", description: "先让提示消失，再回到 Zoom 检查是否已经进入会议。", route: "incident", event: "批准未发起的 Duo 登录请求" },
    ],
  },
  incident: {
    delay: "90 秒后",
    title: "批准的登录没有进入你的 Zoom",
    body: "NYU 账号出现一台新的 Chrome 会话，恢复电话号码也收到变更请求。刚才的 Duo 请求属于另一台设备。",
    evidence: [
      { label: "新会话", value: "Chrome · Jersey City, NJ" },
      { label: "账号活动", value: "查看 NYU Email · 请求更改恢复方式" },
      { label: "验证方式", value: "Duo Push · 已批准" },
    ],
  },
  responseTitle: "把批准过的访问逐层收回",
  responseBody: "拒绝后续推送并不能退出已经批准的会话。账号、密码、恢复方式和学校记录需要分别处理。",
  responseSteps: [
    { id: "revoke-session", title: "退出未知浏览器会话", description: "从 NYU 账号活动中终止 Jersey City 会话。", event: "退出未知 Chrome 会话", required: true },
    { id: "change-password", title: "更改 NYU NetID 密码", description: "从 start.nyu.edu 使用新的唯一密码。", event: "更改 NYU NetID 密码", required: true },
    { id: "review-recovery", title: "检查恢复方式和转发规则", description: "撤销未知电话号码，并检查邮箱转发。", event: "核对账号恢复方式与邮箱规则", required: true },
    { id: "report-security", title: "联系 NYU IT Security", description: "说明意外 Duo 批准、时间、设备和已采取措施。", event: "向 NYU IT Security 报告事件", required: true },
    { id: "warn-class", title: "提醒课程群忽略迁移消息", description: "避免其他同学因同一说法批准请求。", event: "提醒课程群核对意外 Duo 请求", required: false },
  ],
  endings: {
    verified: { eyebrow: "结局 01", title: "先绑定自己的动作", summary: "你只批准了自己刚刚发起的登录。", detail: "MFA 不是让提示消失，而是确认“这次登录确实由我开始”。" },
    caution: { eyebrow: "结局 02", title: "请求已拒绝", summary: "未发起的登录没有获得第二重验证。", detail: "你阻止了这次访问；进一步联系 IT 能帮助判断是否已有密码暴露。" },
    contained: { eyebrow: "结局 03", title: "会话已终止", summary: "未知登录和恢复方式变更都得到控制。", detail: "批准曾让另一台设备进入账号，但你完成了会话、密码、恢复方式和上报处理。" },
    expanded: { eyebrow: "结局 04", title: "账号仍有入口", summary: "部分访问路径或恢复方式仍未清理。", detail: "改密码、拒绝新推送和退出旧会话解决的是不同层次，缺一项都可能留下入口。" },
  },
  clues: [
    "手机请求出现时，你尚未在当前 Zoom 页面输入 NetID。",
    "设备与位置描述和你正在使用的浏览器不一致。",
    "课程群里的“账号迁移”说法没有来自 NYU IT 的可核对通知。",
  ],
  causeChain: {
    verified: ["会议时间压力", "先核对自己的登录动作", "重新发起并匹配设备", "只批准属于自己的请求"],
    caution: ["收到意外 Duo 请求", "明确选择拒绝", "从自己的页面重新登录", "未授权会话被阻止"],
    incident: ["连续推送与迁移说法", "为了消除提示而批准", "另一台设备完成登录", "账号与恢复方式暴露"],
  },
  transferRules: [
    { title: "先问是否由我发起", body: "MFA 请求必须对应你刚刚执行的登录，而不是只看品牌和账号。" },
    { title: "匹配设备与位置", body: "浏览器、地点、时间不一致时，先拒绝再核对。" },
    { title: "连续推送不是催促", body: "重复请求可能是在消耗判断耐心，不是系统要求尽快批准。" },
    { title: "批准后要清会话", body: "误批后需处理现有会话、密码、恢复方式并联系 IT。" },
  ],
  correctPath: ["只有在自己刚发起登录后才查看 Duo。", "核对服务、设备、位置和请求时间。", "不匹配时选择 Deny，并标记不是本人发起。", "若曾误批，立即退出未知会话、更改密码、检查恢复方式并联系 NYU IT。"],
} satisfies DecisionCaseDefinition;
