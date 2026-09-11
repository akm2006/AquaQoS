import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DocsProvider } from "./_components/provider";
import "./docs.css";

const sans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: { default: "Docs · AquaQoS", template: "%s · AquaQoS docs" },
  description:
    "How AquaQoS schedules shared 1inch Aqua inventory: the problem, the capacity model, the security boundary and the evidence.",
};

// A separate root layout keeps Tailwind and Fumadocs styles off the product routes.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${sans.variable} ${mono.variable}`}
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <DocsProvider>{children}</DocsProvider>
      </body>
    </html>
  );
}
