"use client";

import { Bell, CheckCircle2, Info, ShieldAlert, X } from "lucide-react";
import { useGame } from "@/cases/final-submission/state/GameContext";
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
    <aside className="notification-center" aria-label="Notification center">
      <header>
        <div><Bell size={17} /><h2>Notification center</h2></div>
        <IconButton label="Close notification center" icon={<X size={16} />} onClick={() => dispatch({ type: "TOGGLE_NOTIFICATION_CENTER" })} />
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
