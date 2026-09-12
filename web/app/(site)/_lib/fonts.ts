import { Geist_Mono, Geist_Pixel } from "next/font/google";

// Self-hosted by next/font at build time. Geist Mono is the UI face; Geist Pixel is display only.
export const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});
export const pixel = Geist_Pixel({
  subsets: ["latin"],
  variable: "--font-geist-pixel",
  axes: ["ELSH"],
  // next/font has no fallback metrics for this family; display text falls back to mono.
  adjustFontFallback: false,
});

export const fontVariables = `${mono.variable} ${pixel.variable}`;
