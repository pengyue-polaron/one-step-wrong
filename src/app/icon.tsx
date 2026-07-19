import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#57068c",
        border: "4px solid #f6f1e7",
        color: "#fffdf8",
        display: "flex",
        fontFamily: "monospace",
        fontSize: 32,
        fontWeight: 700,
        height: "100%",
        justifyContent: "center",
        position: "relative",
        width: "100%",
      }}
    >
      <span style={{ transform: "translateX(-3px)" }}>1</span>
      <span style={{ background: "#f6f1e7", bottom: 14, height: 7, position: "absolute", right: 14, width: 7 }} />
      <span style={{ background: "#ead7aa", bottom: 7, height: 7, position: "absolute", right: 7, width: 7 }} />
    </div>,
    size,
  );
}
