"use client";

import { ArrowRight, CheckCircle2, Clock3, FolderKey, MapPin, ShieldCheck, Wifi } from "lucide-react";
import { caseCatalog, type CaseEnding, type ProductCaseId } from "@/scenarios/caseCatalog";

const caseIcons = {
  "final-submission": <Wifi size={28} />,
  "shared-draft": <FolderKey size={28} />,
  "unexpected-push": <ShieldCheck size={28} />,
};

export function CaseLibrary({
  completed,
  onStart,
}: {
  completed: Partial<Record<ProductCaseId, CaseEnding | string>>;
  onStart: (id: ProductCaseId) => void;
}) {
  const completedCount = Object.keys(completed).length;
  return (
    <main className="case-library">
      <header className="library-topbar">
        <div className="system-brand"><span className="brand-mark">N</span><span>一步之差</span></div>
        <div className="library-progress"><span>NYU DIGITAL SAFETY FILES</span><strong>{completedCount} / {caseCatalog.length} 已完成</strong></div>
      </header>

      <div className="library-body">
        <header className="library-heading">
          <div><span>CASE ARCHIVE · FALL 2026</span><h1>选择一个案例</h1><p>每个故事都从一件普通任务开始。结果取决于你实际做了什么，而不是答对了几道题。</p></div>
          <dl><div><dt>可玩章节</dt><dd>{caseCatalog.length}</dd></div><div><dt>预计总时长</dt><dd>约 28 分钟</dd></div></dl>
        </header>

        <section className="case-grid" aria-label="案例列表">
          {caseCatalog.map((item) => {
            const isCompleted = Boolean(completed[item.id]);
            return (
              <article className={`case-file case-file--${item.tone}`} key={item.id}>
                <div className="case-thumbnail" aria-hidden="true">
                  <span className="case-number">{item.number}</span>
                  <div className="case-thumbnail-icon">{caseIcons[item.id]}</div>
                  <div className="case-thumbnail-lines"><i /><i /><i /></div>
                  <small>{item.app}</small>
                </div>
                <div className="case-file-copy">
                  <header><span>{item.kicker}</span>{isCompleted ? <small><CheckCircle2 size={13} /> 已完成</small> : <small>未开始</small>}</header>
                  <h2>{item.title}</h2>
                  <p>{item.summary}</p>
                  <dl>
                    <div><MapPin size={13} /><span>{item.location}</span></div>
                    <div><Clock3 size={13} /><span>{item.duration}</span></div>
                  </dl>
                </div>
                <button data-testid={`case-${item.id}`} onClick={() => onStart(item.id)}>
                  <span>{isCompleted ? "再次体验" : "开始案例"}</span><ArrowRight size={16} />
                </button>
              </article>
            );
          })}
        </section>

        <footer className="library-footnote">
          <span>三个案例 · 三种数字边界</span>
          <p>连接来源、共享范围、登录确认。每章都可以独立重玩。</p>
        </footer>
      </div>
    </main>
  );
}
