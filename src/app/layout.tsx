import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "One Step Wrong",
    template: "%s | One Step Wrong",
  },
  applicationName: "One Step Wrong",
  description: "Playable digital-safety rehearsals that turn ordinary student decisions into causal debriefs.",
  category: "education",
  keywords: ["digital judgment", "cybersecurity education", "interactive rehearsal", "scenario-based learning"],
  openGraph: {
    type: "website",
    siteName: "One Step Wrong",
    title: "One Step Wrong | Digital judgment rehearsals",
    description: "Practice consequential digital decisions inside believable student tasks, then review what each action changed.",
  },
  twitter: {
    card: "summary_large_image",
    title: "One Step Wrong | Digital judgment rehearsals",
    description: "Practice consequential digital decisions inside believable student tasks, then review what each action changed.",
  },
};

export const viewport: Viewport = {
  themeColor: "#101725",
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
