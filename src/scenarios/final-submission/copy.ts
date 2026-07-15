export const copy = {
  intro: {
    kicker: "NORTHBRIDGE UNIVERSITY · 23:47",
    title: "最后一次提交",
    body: "文件已经改完了，提交页面却第三次停在上传前。离截止还有十二分钟。",
    prompt: "把 Final_Assignment.pdf 在 23:59 前提交到课程系统。",
  },
  task: {
    submission: "提交最终作业",
    submissionHint: "恢复网络连接，完成文件提交。",
    response: "阻止异常继续扩大",
    responseHint: "检查登录设备、网络配置、已发送消息和 IT 报告。",
  },
  portal: {
    title: "校园高速网络接入",
    body: "检测到新设备。为保证连接稳定，请完成一次网络配置。",
    address: "http://campus-connect.local",
    officialAddress: "https://auth.northbridge.edu",
    guestAddress: "https://guest.northbridge.edu",
  },
  messages: {
    initial: "你交了吗？我刚才也卡了两次。",
    followup: "交上了吗？我准备收电脑了。",
    suspiciousQuestion: "你刚才给我发的是什么链接？",
    suspiciousFollowup: "我点进去也让我装东西，这是什么？",
    forged: "校园高速网络入口，连不上网的话试试这个：\nhttp://campus-access.net",
  },
} as const;
