"use client";

import { Bell, CheckCircle2, Info, ShieldAlert, X } from "lucide-react";
import { useGame } from "@/state/GameContext";
import { IconButton } from "@/components/ui/IconButton";

const icons = {
  info: <Info size={15} />,
  notice: <Bell size={15} />,
  incident: <ShieldAlert size={15} />,
  success: <CheckCircle2 size={15} />,
};

export function NotificationCenter() {
  const { state, dispatch } = useGame();
  return (
    <aside className="notification-center" aria-label="通知中心">
      <header>
        <div><Bell size={17} /><h2>通知中心</h2></div>
        <IconButton label="关闭通知中心" icon={<X size={16} />} onClick={() => dispatch({ type: "TOGGLE_NOTIFICATION_CENTER" })} />
      </header>
      <div className="notification-history">
        {[...state.notifications].reverse().map((notification) => (
          <article key={notification.id} className={`history-item history-item--${notification.tone}`}>
            <span>{icons[notification.tone]}</span>
            <div><strong>{notification.title}</strong><p>{notification.body}</p><small>23:47</small></div>
          </article>
        ))}
      </div>
    </aside>
  );
}
