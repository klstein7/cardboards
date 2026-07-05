import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Design variants | cardboards",
  description: "Design direction mockups for the cardboards redesign.",
};

export default function DesignVariantsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="h-dvh overflow-y-auto bg-neutral-950">{children}</div>;
}
