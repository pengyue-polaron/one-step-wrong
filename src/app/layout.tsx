import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "一步之差 | One Step Wrong",
  description: "一场发生在作业截止前的校园网络安全互动故事。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
