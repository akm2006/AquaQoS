"use client";
import { RootProvider } from "fumadocs-ui/provider/next";
import SearchDialog from "./search";

// Light and dark both ship (D026): the logo master sits on an ink tile on cream, so the
// dark-only constraint of D024 no longer applies. System preference decides on first visit.
export function DocsProvider({ children }: { children: React.ReactNode }) {
  return (
    <RootProvider
      theme={{
        defaultTheme: "system",
        enableSystem: true,
        hotKey: false,
      }}
      search={{ SearchDialog }}
    >
      {children}
    </RootProvider>
  );
}
