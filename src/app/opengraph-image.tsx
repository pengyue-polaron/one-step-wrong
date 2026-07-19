import { ImageResponse } from "next/og";

export const alt = "One Step Wrong digital judgment rehearsal case library";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const steps = [
  ["01", "PRACTICE", "Make the decision inside the task"],
  ["02", "REVIEW", "Trace what each action changed"],
  ["03", "APPLY", "Use the same rule in a new situation"],
];

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#101725",
        color: "#f6f1e7",
        display: "flex",
        flexDirection: "column",
        fontFamily: "monospace",
        height: "100%",
        padding: "48px 54px",
        width: "100%",
      }}
    >
      <div style={{ alignItems: "center", borderBottom: "2px solid #435267", display: "flex", justifyContent: "space-between", paddingBottom: 28 }}>
        <div style={{ alignItems: "center", display: "flex", fontSize: 22, fontWeight: 700, gap: 14 }}>
          <div style={{ alignItems: "center", background: "#57068c", border: "3px solid #f6f1e7", display: "flex", height: 42, justifyContent: "center", position: "relative", width: 42 }}>
            <span style={{ transform: "translateX(-2px)" }}>1</span>
            <span style={{ background: "#f6f1e7", bottom: 8, height: 5, position: "absolute", right: 8, width: 5 }} />
            <span style={{ background: "#ead7aa", bottom: 3, height: 5, position: "absolute", right: 3, width: 5 }} />
          </div>
          <span>One Step Wrong</span>
        </div>
        <span style={{ color: "#ead7aa", fontSize: 15, fontWeight: 700 }}>DIGITAL JUDGMENT REHEARSALS</span>
      </div>

      <div style={{ display: "flex", flex: 1, gap: 58, paddingTop: 48 }}>
        <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center" }}>
          <span style={{ color: "#d7b9e8", fontSize: 17, fontWeight: 700, marginBottom: 20 }}>PLAYABLE PRACTICE FOR ORDINARY DIGITAL DECISIONS</span>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 54, fontWeight: 700, letterSpacing: 0, lineHeight: 1.08 }}>
            <span>Practice the judgment,</span>
            <span>not the answer.</span>
          </div>
          <p style={{ color: "#aeb8c4", fontFamily: "sans-serif", fontSize: 22, lineHeight: 1.5, margin: "24px 0 0", maxWidth: 620 }}>
            Enter a believable student task, make an unmarked choice, and review how the result followed what you actually did.
          </p>
        </div>

        <div style={{ alignSelf: "center", border: "1px solid #68808c", display: "flex", flexDirection: "column", width: 390 }}>
          {steps.map(([number, label, detail], index) => (
            <div
              key={number}
              style={{
                alignItems: "center",
                background: index === 1 ? "#203344" : "#172536",
                borderBottom: index < steps.length - 1 ? "1px solid #526677" : "none",
                display: "flex",
                gap: 20,
                minHeight: 116,
                padding: "20px 22px",
              }}
            >
              <span style={{ alignItems: "center", border: "1px solid #d6bd83", color: "#ead7aa", display: "flex", flexShrink: 0, fontSize: 17, fontWeight: 700, height: 52, justifyContent: "center", width: 52 }}>{number}</span>
              <span style={{ display: "flex", flex: 1, flexDirection: "column", gap: 9 }}>
                <strong style={{ color: "#ead7aa", fontSize: 14 }}>{label}</strong>
                <span style={{ color: "#dce2e6", fontFamily: "sans-serif", fontSize: 18, lineHeight: 1.3 }}>{detail}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>,
    size,
  );
}
