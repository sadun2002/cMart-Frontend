"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useEffect } from "react";

function TauriThemeSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
      import("@tauri-apps/api/window").then(({ getCurrentWindow }) => {
        try {
          getCurrentWindow().setTheme(resolvedTheme === "dark" ? "dark" : "light");
        } catch (e) {
          console.error("Failed to set Tauri window theme", e);
        }
      });
    }
  }, [resolvedTheme]);

  return null;
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <TauriThemeSync />
      {children}
    </NextThemesProvider>
  );
}
