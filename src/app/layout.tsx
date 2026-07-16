import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "一步之差 | One Step Wrong",
  description: "数字判断力互动故事与可验证的 Scenario Studio 安全演练。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
