"use client";

import { ArrowRight, CheckCircle2, Clock3, DraftingCompass, FolderKey, KeyRound, MapPin, MessageSquareText, ShieldCheck, Wifi } from "lucide-react";
import Link from "next/link";
import { BrandLockup } from "@/components/brand/BrandLockup";
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
        <BrandLockup />
        <div className="library-progress"><span>CASE LIBRARY</span><strong>{reviewedRehearsals.length + caseCatalog.length} rehearsals</strong><Link className="library-studio-link" href="/studio">Scenario Studio <DraftingCompass aria-hidden="true" size={13} /></Link></div>
      </header>

      <div className="library-body">
        <header className="library-heading">
          <div><span>DIGITAL JUDGMENT PRACTICE</span><h1>Choose a rehearsal</h1><p>Every story begins with an ordinary task. The result follows what you actually do, not how many answers you get right.</p></div>
          <ul className="library-stats" aria-label="Library summary"><li><span>Playable cases</span><strong>{caseCatalog.length + reviewedRehearsals.length}</strong></li><li><span>Total time</span><strong>About 45 min</strong></li></ul>
        </header>

        <section className="reviewed-rehearsal-grid" aria-label="Reviewed interactive rehearsals">
          {reviewedRehearsals.map((item, index) => (
            <article className="featured-rehearsal" key={item.id}>
              <div className="featured-rehearsal-mark">
                {item.icon === "message"
                  ? <MessageSquareText size={27} />
                  : item.icon === "folder"
                    ? <FolderKey size={27} />
                    : <KeyRound size={27} />}
              </div>
              <div>
                <span>{String(index + 1).padStart(2, "0")} / {item.kicker}</span>
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

        <header className="archive-section-heading">
          <div><span>ARCHIVE CASES</span><h2 id="archive-cases-heading">Earlier rehearsals</h2></div>
          <strong>{completedCount} / {caseCatalog.length} complete this session</strong>
        </header>

        <section aria-labelledby="archive-cases-heading" className="case-grid">
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
      </div>
    </main>
  );
}
