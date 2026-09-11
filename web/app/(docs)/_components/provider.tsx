"use client";
import { RootProvider } from "fumadocs-ui/provider/next";
import SearchDialog from "./search";

// Dark only: the logo master needs a dark surface. Search reads the exported static index.
export function DocsProvider({ children }: { children: React.ReactNode }) {
  return (
    <RootProvider
      theme={{
        forcedTheme: "dark",
        defaultTheme: "dark",
        enableSystem: false,
        hotKey: false,
      }}
      search={{ SearchDialog }}
    >
      {children}
    </RootProvider>
  );
}
