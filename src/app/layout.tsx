import "~/styles/globals.css";

import { type Metadata } from "next";
import { Jost } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { Toaster } from "~/components/ui/sonner";

import Providers from "./providers";

const font = Jost({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${font.className} dark`}
      suppressHydrationWarning
    >
      <body className="h-full overflow-hidden">
        <NextTopLoader showSpinner={false} />
        <NuqsAdapter>
          <Providers>{children}</Providers>
        </NuqsAdapter>
        <Toaster />
      </body>
    </html>
  );
}
