import type { NetworkId } from "@/scenarios/types";

export const networkLabels: Record<NetworkId, string> = {
  "campus-secure": "Campus-Secure",
  "campus-guest": "Campus-Guest",
  "campus-free-5g": "Campus_Free_5G",
  "mobile-hotspot": "Penny 的手机热点",
};

export const responseActionLabels = {
  "revoke-session": "退出未知设备会话",
  "change-password": "修改校园账号密码",
  "enable-mfa": "开启二次验证",
  "disconnect-network": "断开 Campus_Free_5G",
  "forget-network": "忘记 Campus_Free_5G",
  "remove-profile": "删除 Campus Network Access 配置",
  "delete-message": "删除冒名发送的消息",
  "warn-brief": "向同学发送简短提醒",
  "warn-clear": "向同学发送明确提醒",
  "warn-none": "暂未向同学说明情况",
  "report-it": "向学校 IT 提交事件报告",
} as const;
