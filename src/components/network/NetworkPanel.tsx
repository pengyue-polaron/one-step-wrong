"use client";

import { ChevronDown, ChevronRight, Radio, Smartphone, Wifi, X } from "lucide-react";
import { useState } from "react";
import type { NetworkDefinition } from "@/scenarios/types";
import { useGame } from "@/state/GameContext";
import { IconButton } from "@/components/ui/IconButton";

function SignalBars({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span className="signal-bars" aria-label={`信号 ${level === 3 ? "满格" : level === 2 ? "中等" : "弱"}`}>
      {[1, 2, 3].map((bar) => <i key={bar} className={bar <= level ? "is-on" : ""} />)}
    </span>
  );
}

function WifiItem({ network }: { network: NetworkDefinition }) {
  const { state, dispatch } = useGame();
  const [expanded, setExpanded] = useState(false);
  const active = state.selectedNetwork === network.id;
  return (
    <article className={`wifi-item ${active ? "is-active" : ""}`}>
      <button
        className="wifi-main"
        onClick={() => dispatch({ type: "SELECT_NETWORK", network: network.id })}
        data-testid={`network-${network.id}`}
      >
        <span className="wifi-icon">{network.id === "mobile-hotspot" ? <Smartphone size={18} /> : <Wifi size={18} />}</span>
        <span className="wifi-copy">
          <strong>{network.name}</strong>
          <small>{network.security} · {network.connectionTime}</small>
        </span>
        <SignalBars level={network.signal} />
      </button>
      <button
        className="wifi-details-trigger"
        aria-expanded={expanded}
        onClick={() => {
          setExpanded((value) => !value);
          dispatch({ type: "VIEW_NETWORK_DETAILS" });
        }}
      >
        {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        网络详情
      </button>
      {expanded ? (
        <div className="wifi-details">
          <p>{network.summary}</p>
          <dl>
            <div><dt>运营方</dt><dd>{network.operator ?? "未提供"}</dd></div>
            <div><dt>连接方式</dt><dd>{network.security}</dd></div>
          </dl>
        </div>
      ) : null}
    </article>
  );
}

export function NetworkPanel() {
  const { scenario, dispatch } = useGame();
  const primary = scenario.networks.slice(0, 3);
  const hotspot = scenario.networks[3];
  return (
    <aside className="network-panel" aria-label="可用网络">
      <header>
        <div>
          <span className="panel-icon"><Radio size={17} /></span>
          <div><h2>可用网络</h2><p>公共学习区</p></div>
        </div>
        <IconButton label="关闭网络列表" icon={<X size={16} />} onClick={() => dispatch({ type: "TOGGLE_NETWORK_PANEL" })} />
      </header>
      <div className="network-list">
        {primary.map((network) => <WifiItem key={network.id} network={network} />)}
      </div>
      <div className="other-connection">
        <span>其他连接方式</span>
        <WifiItem network={hotspot} />
      </div>
    </aside>
  );
}
