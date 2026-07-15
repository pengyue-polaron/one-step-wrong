import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "一步之差 | One Step Wrong",
  description: "三个发生在 NYU 的数字安全互动故事：连接、共享与登录确认。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
