"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";

import { TRPCReactProvider } from "~/trpc/client";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ClerkProvider>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </ClerkProvider>
    </ThemeProvider>
  );
}
