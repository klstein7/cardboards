"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";

import { NotificationRealtimeProvider } from "~/app/_components/notification-realtime-provider";
import { TRPCReactProvider } from "~/trpc/client";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ClerkProvider>
        <TRPCReactProvider>
          <NotificationRealtimeProvider>
            {children}
          </NotificationRealtimeProvider>
        </TRPCReactProvider>
      </ClerkProvider>
    </ThemeProvider>
  );
}
