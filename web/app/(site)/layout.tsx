import type { Metadata, Viewport } from "next";
import { Footer } from "./_components/Footer";
import { Navbar } from "./_components/Navbar";
import { siteDescription } from "./_lib/copy";
import { fontVariables } from "./_lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aquaqos.vercel.app"),
  title: {
    default: "AquaQoS · Shared liquidity, scheduled",
    template: "%s · AquaQoS",
  },
  description: siteDescription,
  openGraph: {
    title: "AquaQoS · Shared liquidity, scheduled",
    description: siteDescription,
    url: "/",
    siteName: "AquaQoS",
    type: "website",
    images: [{ url: "/brand/AquaQoS.svg", alt: "AquaQoS" }],
  },
  twitter: {
    card: "summary",
    title: "AquaQoS · Shared liquidity, scheduled",
    description: siteDescription,
    images: ["/brand/AquaQoS.svg"],
  },
};

// Matches --color-cream in globals.css.
export const viewport: Viewport = { themeColor: "#f1efe9" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <a href="#main" className="skip">
          Skip to content
        </a>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
