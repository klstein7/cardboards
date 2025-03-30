export default function BoardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectId: string };
}) {
  return <div className="flex h-full flex-col">{children}</div>;
}
