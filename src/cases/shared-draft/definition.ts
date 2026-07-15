import type { CaseSummary } from "@/cases/types";
import type { DecisionCaseDefinition } from "@/engine/decision/types";

export const sharedDraftSummary = {
  id: "shared-draft",
  number: "02",
  title: "共享范围",
  kicker: "协作与权限",
  summary: "小组成员都在催访问权限。怎样让协作继续，又不把访谈资料交给整条链接？",
  location: "Bobst Library · LL2",
  duration: "8–10 分钟",
  topic: "云端共享",
  app: "NYU Drive",
  tone: "blue",
} satisfies CaseSummary;

export const sharedDraftDefinition = {
  ...sharedDraftSummary,
  intro: {
    time: "20:16",
    title: "共享范围",
    body: "纪录片小组的引文核对今晚截止。三位组员都在等访问权限，资料夹里还放着受访者同意书和未公开的逐字稿。",
    task: "在 20:30 前开放必要的编辑权限，让小组完成核对。",
    startLabel: "打开共享设置",
  },
  decision: {
    eyebrow: "NYU DRIVE · SHARING",
    title: "Interview Research · Week 8",
    body: "Maya 说她的常用地址收不到邀请，并发来了一个 Gmail 地址。其他组员都使用 NYU 邮箱。",
    deadline: "14:00",
    options: [
      { id: "specific-accounts", title: "添加三位 NYU 账号", meta: "仅受邀者 · Editor", description: "逐一添加 mc9812@nyu.edu、lx2048@nyu.edu 和 ar7731@nyu.edu。", route: "verified", event: "向三个指定 NYU 账号授予编辑权限" },
      { id: "nyu-link", title: "NYU 社区持链接可编辑", meta: "New York University · Editor", description: "任何拥有 NYU 账号并拿到链接的人都可以编辑。", route: "caution", event: "将链接范围设为 NYU 社区可编辑" },
      { id: "public-link", title: "任何持链接者可编辑", meta: "Anyone with the link · Editor", description: "不用登录，转发链接即可进入，最快解决当前访问问题。", route: "incident", event: "将资料夹改为任何持链接者可编辑" },
    ],
  },
  incident: {
    delay: "6 分钟后",
    title: "出现不在小组名单里的访问者",
    body: "资料夹链接被再次转发。一位匿名访问者下载了逐字稿，并修改了受访者姓名表。",
    evidence: [
      { label: "访问者", value: "Anonymous User 483 · 外部" },
      { label: "活动", value: "下载 4 个文件 · 编辑 1 个表格" },
      { label: "来源", value: "Anyone with the link" },
    ],
  },
  responseTitle: "收回超出任务的访问范围",
  responseBody: "共享链接只是入口。还需要分别处理权限、内容改动、组员沟通和学校上报。",
  responseSteps: [
    { id: "restrict-link", title: "关闭公开编辑链接", description: "把 General access 改回 Restricted。", event: "关闭任何持链接者的编辑权限", required: true },
    { id: "remove-outsider", title: "移除未知访问者", description: "终止外部会话并撤销仍在生效的访问。", event: "移除未知外部访问者", required: true },
    { id: "restore-version", title: "核对活动并恢复版本", description: "检查下载记录，恢复被修改的姓名表。", event: "检查活动并恢复文件版本", required: true },
    { id: "notify-team", title: "通知小组与受影响成员", description: "说明链接范围、被访问文件和已采取措施。", event: "向小组发送明确的事件说明", required: true },
    { id: "report-it", title: "提交 NYU IT 安全报告", description: "保留活动记录，提交给学校进一步评估。", event: "向 NYU IT 报告共享异常", required: false },
  ],
  endings: {
    verified: { eyebrow: "结局 01", title: "只给需要的人", summary: "协作继续，资料范围没有超出小组。", detail: "你用具体身份代替了可转发的链接，访问边界和任务边界保持一致。" },
    caution: { eyebrow: "结局 02", title: "范围偏宽", summary: "任务完成了，但整所 NYU 都处在潜在共享范围内。", detail: "组织内链接比公开链接收敛，但仍然大于三位组员的实际需要。" },
    contained: { eyebrow: "结局 03", title: "访问已收回", summary: "公开入口、异常访问和文件改动都得到处理。", detail: "资料曾被外部访问，但你完成了权限收回、版本恢复和影响沟通。" },
    expanded: { eyebrow: "结局 04", title: "链接仍在扩散", summary: "部分访问或内容影响仍未处理。", detail: "只完成其中一项操作无法让已转发的链接、活动会话和文件改动同时失效。" },
  },
  clues: [
    "任务只需要三位组员进入，实际授权范围不必覆盖整所学校或互联网。",
    "常用 Gmail 地址与“NYU 登录有问题”不能证明请求者身份。",
    "Editor 权限允许修改内容，影响比只读链接更大。",
  ],
  causeChain: {
    verified: ["明确三位协作者", "逐一核对 NYU 身份", "只授予必要编辑权限", "协作完成且边界清楚"],
    caution: ["为了减少逐个邀请", "使用组织范围链接", "链接可被校内继续转发", "任务完成但范围偏宽"],
    incident: ["截止压力与访问催促", "公开链接并授予编辑权限", "链接被二次转发", "资料下载与内容改动"],
  },
  transferRules: [
    { title: "身份先于地址", body: "通过已知渠道确认请求者，再决定是否添加新邮箱。" },
    { title: "范围贴合任务", body: "三个人需要访问，就优先授权三个人，而不是整组域名。" },
    { title: "权限贴合动作", body: "只需阅读就不要给 Editor；需要上传也不等于能修改全部内容。" },
    { title: "链接不是撤回", body: "发生异常时还要检查活动会话、下载记录和文件版本。" },
  ],
  correctPath: ["确认组员当前使用的 NYU 账号。", "逐一添加实际协作者，并按任务授予 Viewer、Commenter 或 Editor。", "发送前复核 General access 仍为 Restricted。", "定期检查活动与成员列表，任务结束后移除临时权限。"],
} satisfies DecisionCaseDefinition;
