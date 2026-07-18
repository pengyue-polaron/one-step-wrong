"use client";

import { ChevronDown, ChevronRight, Radio, Smartphone, Wifi, X } from "lucide-react";
import { useState } from "react";
import type { NetworkDefinition } from "@/cases/final-submission/types";
import { useGame } from "@/cases/final-submission/state/GameContext";
import { IconButton } from "@/components/ui/IconButton";

function SignalBars({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span className="signal-bars" aria-label={`Signal ${level === 3 ? "strong" : level === 2 ? "medium" : "weak"}`}>
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
        aria-pressed={active}
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
        Network details
      </button>
      {expanded ? (
        <div className="wifi-details">
          <p>{network.summary}</p>
          <dl>
            <div><dt>Operator</dt><dd>{network.operator ?? "Not provided"}</dd></div>
            <div><dt>Connection</dt><dd>{network.security}</dd></div>
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
    <aside className="network-panel" aria-label="Available networks">
      <header>
        <div>
          <span className="panel-icon"><Radio size={17} /></span>
          <div><h2>Available networks</h2><p>Public study area</p></div>
        </div>
        <IconButton label="Close network list" icon={<X size={16} />} onClick={() => dispatch({ type: "TOGGLE_NETWORK_PANEL" })} />
      </header>
      <div className="network-list">
        {primary.map((network) => <WifiItem key={network.id} network={network} />)}
      </div>
      <div className="other-connection">
        <span>Other connection options</span>
        <WifiItem network={hotspot} />
      </div>
    </aside>
  );
}
