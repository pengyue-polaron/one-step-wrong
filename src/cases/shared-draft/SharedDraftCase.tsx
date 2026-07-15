"use client";

import { FileText, FolderKey, LockKeyhole, UserRound, Users, X } from "lucide-react";
import type { CaseRunnerProps } from "@/cases/types";
import { sharedDraftDefinition } from "@/cases/shared-draft/definition";
import { DecisionCaseRunner } from "@/engine/decision/DecisionCaseRunner";
import { OptionButton } from "@/engine/decision/components/ChapterChrome";
import type { DecisionSceneProps } from "@/engine/decision/types";

function SharedDraftIntroScene() {
  return (
    <>
      <span className="scene-folder"><FolderKey size={46} /></span>
      <span className="scene-document scene-document--one" />
      <span className="scene-document scene-document--two" />
      <span className="scene-cursor"><UserRound size={20} /></span>
    </>
  );
}

function SharedDraftScene({ definition, onSelect }: DecisionSceneProps) {
  return (
    <section className="tool-window drive-window" aria-label="NYU Drive 共享设置">
      <header className="tool-titlebar"><div><span className="drive-mark"><FolderKey size={17} /></span><strong>NYU Drive</strong></div><span>drive.google.com · NYU Workspace</span></header>
      <div className="drive-toolbar"><FileText size={16} /><div><strong>Interview Research · Week 8</strong><small>Shared folder · Last edited 2 min ago</small></div><span><Users size={14} /> 3 people</span></div>
      <div className="drive-layout">
        <main className="document-preview">
          <span>MEDIA, CULTURE, AND SOCIETY</span>
          <h2>Interview Research</h2>
          <p>Participant consent forms, interview transcripts, selected quotations, and edit notes.</p>
          <div className="document-lines"><i /><i /><i /><i /><i /></div>
          <footer><LockKeyhole size={13} /> Contains participant contact details</footer>
        </main>
        <aside className="share-dialog">
          <header><div><h2>Share “Interview Research”</h2><p>Choose who can open and edit this folder.</p></div><X aria-hidden="true" size={16} /></header>
          <div className="share-request"><span className="avatar">M</span><div><strong>Maya Chen</strong><p>“NYU 登录有问题，先发到 maya.chen.nyu@gmail.com”</p></div></div>
          <div className="option-list">{definition.decision.options.map((option) => <OptionButton key={option.id} option={option} onSelect={onSelect} />)}</div>
        </aside>
      </div>
    </section>
  );
}

export function SharedDraftCase(props: CaseRunnerProps) {
  return <DecisionCaseRunner definition={sharedDraftDefinition} IntroScene={SharedDraftIntroScene} DecisionScene={SharedDraftScene} {...props} />;
}
