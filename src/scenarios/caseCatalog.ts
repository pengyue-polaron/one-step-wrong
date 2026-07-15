export type ProductCaseId = "final-submission" | "shared-draft" | "unexpected-push";
export type DecisionCaseId = Exclude<ProductCaseId, "final-submission">;
export type CaseRoute = "verified" | "caution" | "incident";
export type CaseEnding = "verified" | "caution" | "contained" | "expanded";

export type CatalogCase = {
  id: ProductCaseId;
  number: string;
  title: string;
  kicker: string;
  summary: string;
  location: string;
  duration: string;
  topic: string;
  app: string;
  tone: "violet" | "blue" | "green";
};

export type DecisionOption = {
  id: string;
  title: string;
  meta: string;
  description: string;
  route: CaseRoute;
  event: string;
};

export type ResponseStep = {
  id: string;
  title: string;
  description: string;
  event: string;
  required: boolean;
};

export type TransferRule = {
  title: string;
  body: string;
};

export type DecisionCaseDefinition = CatalogCase & {
  id: DecisionCaseId;
  intro: {
    time: string;
    title: string;
    body: string;
    task: string;
    startLabel: string;
  };
  decision: {
    eyebrow: string;
    title: string;
    body: string;
    deadline: string;
    options: DecisionOption[];
  };
  incident: {
    delay: string;
    title: string;
    body: string;
    evidence: Array<{ label: string; value: string }>;
  };
  responseTitle: string;
  responseBody: string;
  responseSteps: ResponseStep[];
  endings: Record<CaseEnding, { eyebrow: string; title: string; summary: string; detail: string }>;
  clues: string[];
  causeChain: {
    verified: string[];
    caution: string[];
    incident: string[];
  };
  transferRules: TransferRule[];
  correctPath: string[];
};

export const caseCatalog: CatalogCase[] = [
  {
    id: "final-submission",
    number: "01",
    title: "最后一次提交",
    kicker: "连接与身份",
    summary: "截止前恢复网络，把作业交进 Brightspace。便利入口真的来自 NYU 吗？",
    location: "Bobst Library · LL1",
    duration: "10–12 分钟",
    topic: "公共网络",
    app: "NYU Brightspace",
    tone: "violet",
  },
  {
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
  },
  {
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
  },
];

export const decisionCases: Record<DecisionCaseId, DecisionCaseDefinition> = {
  "shared-draft": {
    ...caseCatalog[1],
    id: "shared-draft",
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
        {
          id: "specific-accounts",
          title: "添加三位 NYU 账号",
          meta: "仅受邀者 · Editor",
          description: "逐一添加 mc9812@nyu.edu、lx2048@nyu.edu 和 ar7731@nyu.edu。",
          route: "verified",
          event: "向三个指定 NYU 账号授予编辑权限",
        },
        {
          id: "nyu-link",
          title: "NYU 社区持链接可编辑",
          meta: "New York University · Editor",
          description: "任何拥有 NYU 账号并拿到链接的人都可以编辑。",
          route: "caution",
          event: "将链接范围设为 NYU 社区可编辑",
        },
        {
          id: "public-link",
          title: "任何持链接者可编辑",
          meta: "Anyone with the link · Editor",
          description: "不用登录，转发链接即可进入，最快解决当前访问问题。",
          route: "incident",
          event: "将资料夹改为任何持链接者可编辑",
        },
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
  },
  "unexpected-push": {
    ...caseCatalog[2],
    id: "unexpected-push",
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
  },
};
