import type { Metadata } from "next";
import { fontVariables } from "../(site)/_lib/fonts";
import { DocsProvider } from "./_components/provider";
import "./docs.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aquaqos.vercel.app"),
  title: { default: "Docs · AquaQoS", template: "%s · AquaQoS docs" },
  description:
    "How AquaQoS schedules shared 1inch Aqua inventory: the problem, the capacity model, the security boundary and the evidence.",
  openGraph: {
    title: "AquaQoS documentation",
    description:
      "Architecture, capacity model, security boundaries and verifiable deployment evidence.",
    url: "/docs/",
    siteName: "AquaQoS",
    type: "website",
    images: [{ url: "/brand/AquaQoS.svg", alt: "AquaQoS" }],
  },
};

// A separate root layout keeps Tailwind and Fumadocs styles off the product routes. Fonts come
// from the product surface's loader so both roots serve the identical Geist Mono/Pixel files.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <DocsProvider>{children}</DocsProvider>
      </body>
    </html>
  );
}
