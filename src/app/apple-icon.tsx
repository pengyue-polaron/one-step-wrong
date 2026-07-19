import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#57068c",
        border: "10px solid #f6f1e7",
        color: "#fffdf8",
        display: "flex",
        fontFamily: "monospace",
        fontSize: 88,
        fontWeight: 700,
        height: "100%",
        justifyContent: "center",
        position: "relative",
        width: "100%",
      }}
    >
      <span style={{ transform: "translateX(-8px)" }}>1</span>
      <span style={{ background: "#f6f1e7", bottom: 38, height: 19, position: "absolute", right: 38, width: 19 }} />
      <span style={{ background: "#ead7aa", bottom: 19, height: 19, position: "absolute", right: 19, width: 19 }} />
    </div>,
    size,
  );
}
