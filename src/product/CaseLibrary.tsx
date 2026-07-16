"use client";

import { ArrowRight, CheckCircle2, Clock3, FolderKey, MapPin, MessageSquareText, ShieldCheck, Sparkles, Wifi } from "lucide-react";
import Link from "next/link";
import { caseCatalog } from "@/product/caseRegistry";
import { reviewedRehearsals } from "@/product/reviewedRehearsals";
import type { CaseEnding, ProductCaseId } from "@/cases/types";

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
  const completedCount = caseCatalog.filter((item) => completed[item.id]).length;
  return (
    <main className="case-library">
      <header className="library-topbar">
        <div className="system-brand"><span className="brand-mark">1</span><span>One Step Wrong</span></div>
        <div className="library-progress"><span>DIGITAL JUDGMENT REHEARSALS</span><strong>Archive {completedCount} / {caseCatalog.length} complete</strong><Link className="library-studio-link" href="/studio">Scenario Studio <Sparkles size={13} /></Link></div>
      </header>

      <div className="library-body">
        <header className="library-heading">
          <div><span>CASE ARCHIVE · FALL 2026</span><h1>Choose a rehearsal</h1><p>Every story begins with an ordinary task. The result follows what you actually do, not how many answers you get right.</p></div>
          <ul className="library-stats" aria-label="Library summary"><li><span>Playable cases</span><strong>{caseCatalog.length + reviewedRehearsals.length}</strong></li><li><span>Total time</span><strong>About 36 min</strong></li></ul>
        </header>

        <section className="reviewed-rehearsal-grid" aria-label="Reviewed interactive rehearsals">
          {reviewedRehearsals.map((item) => (
            <article className="featured-rehearsal" key={item.id}>
              <div className="featured-rehearsal-mark">
                {item.icon === "message" ? <MessageSquareText size={27} /> : <FolderKey size={27} />}
              </div>
              <div>
                <span>{item.kicker}</span>
                <h2>{item.title}</h2>
                <p>{item.summary}</p>
                <ul className="rehearsal-meta" aria-label={`${item.title} details`}>
                  <li><MapPin size={13} /><span>{item.location}</span></li>
                  <li><Clock3 size={13} /><span>{item.duration}</span></li>
                </ul>
              </div>
              <div className="featured-rehearsal-flow"><span>Practice</span><i /><span>Review</span><i /><span>Apply</span></div>
              <Link
                data-testid={item.testId}
                href={item.href}
              >
                Start rehearsal <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </section>

        <section className="case-grid" aria-label="Case list">
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
                  <header><span>{item.kicker}</span>{isCompleted ? <small><CheckCircle2 size={13} /> Complete</small> : <small>Not started</small>}</header>
                  <h2>{item.title}</h2>
                  <p>{item.summary}</p>
                  <ul className="case-meta" aria-label={`${item.title} details`}>
                    <li><MapPin size={13} /><span>{item.location}</span></li>
                    <li><Clock3 size={13} /><span>{item.duration}</span></li>
                  </ul>
                </div>
                <button data-testid={`case-${item.id}`} onClick={() => onStart(item.id)}>
                  <span>{isCompleted ? "Replay case" : "Start case"}</span><ArrowRight size={16} />
                </button>
              </article>
            );
          })}
        </section>

        <footer className="library-footnote">
          <span>Four rehearsals · Four judgment patterns</span>
          <p>Verify sources, scope sharing, bind authentication to your own action, and challenge familiar requests.</p>
        </footer>
      </div>
    </main>
  );
}
