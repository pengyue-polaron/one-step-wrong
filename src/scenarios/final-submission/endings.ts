import type { EndingDefinition } from "@/scenarios/types";

export const endingDefinitions: EndingDefinition[] = [
  {
    id: "verified-path",
    eyebrow: "结局 01",
    title: "多确认一步",
    summary: "作业已提交，账号与设备未出现异常。",
    detail: "你承受了一点时间和流量成本，但选择了来源清楚、验证方式可追溯的连接。",
  },
  {
    id: "contained",
    eyebrow: "结局 02",
    title: "及时止损",
    summary: "异常会话已终止，影响范围被控制。",
    detail: "账号曾短暂暴露，但你逐项处理了会话、设备配置、受影响同学和 IT 上报。",
  },
  {
    id: "expanded",
    eyebrow: "结局 03",
    title: "影响扩大",
    summary: "冒名消息继续传播，账号需要进一步重置。",
    detail: "作业确实提交成功了，但未处理的会话和配置让影响延续到了更多同学。",
  },
];
