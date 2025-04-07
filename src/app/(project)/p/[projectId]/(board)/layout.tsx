import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Board | cardboards",
  description: "Manage and visualize your tasks with our Kanban board",
};

export default function BoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex h-full flex-col">{children}</div>;
}
