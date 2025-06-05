"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <Toaster richColors position="top-right" />
      {children}
    </ThemeProvider>
  );
}