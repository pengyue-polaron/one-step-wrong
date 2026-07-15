"use client";

import { Minus, X } from "lucide-react";
import type { ReactNode } from "react";
import type { WindowId } from "@/scenarios/types";
import { useGame } from "@/state/GameContext";
import { IconButton } from "@/components/ui/IconButton";

type WindowFrameProps = {
  id: WindowId;
  title: string;
  icon: ReactNode;
  address?: string;
  children: ReactNode;
  tone?: "paper" | "system";
};

export function WindowFrame({ id, title, icon, address, children, tone = "paper" }: WindowFrameProps) {
  const { dispatch } = useGame();
  return (
    <section className={`window-frame window-frame--${tone}`} aria-label={title} data-window={id}>
      <header className="window-titlebar">
        <div className="window-title">
          {icon}
          <span>{title}</span>
        </div>
        <div className="window-controls">
          <IconButton label={`最小化${title}`} icon={<Minus size={14} />} onClick={() => dispatch({ type: "CLOSE_WINDOW", window: id })} />
          <IconButton label={`关闭${title}`} icon={<X size={14} />} onClick={() => dispatch({ type: "CLOSE_WINDOW", window: id })} />
        </div>
      </header>
      {address ? (
        <div className="address-bar">
          <span className="address-status" aria-hidden="true" />
          <span>{address}</span>
        </div>
      ) : null}
      <div className="window-content">{children}</div>
    </section>
  );
}
