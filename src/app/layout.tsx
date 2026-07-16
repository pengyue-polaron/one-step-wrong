import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "One Step Wrong",
  description: "Interactive digital-judgment stories and source-grounded security rehearsals.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <div id="main-content" tabIndex={-1}>{children}</div>
      </body>
    </html>
  );
}
