interface PreviewCard {
  title: string;
  label: string;
  priority: "urgent" | "high" | "medium" | "low";
  initials?: string;
}

interface PreviewColumn {
  name: string;
  cards: PreviewCard[];
}

const priorityEdge: Record<PreviewCard["priority"], string> = {
  urgent: "border-l-destructive",
  high: "border-l-foreground/70",
  medium: "border-l-muted-foreground",
  low: "border-l-border",
};

const columns: PreviewColumn[] = [
  {
    name: "Backlog",
    cards: [
      { title: "Board sharing links expire silently", label: "Bug", priority: "high", initials: "TR" },
      { title: "Export a board to CSV", label: "Idea", priority: "low" },
      { title: "Slow board load past 200 cards", label: "Perf", priority: "medium", initials: "AK" },
    ],
  },
  {
    name: "In progress",
    cards: [
      { title: "Fix drag preview offset in Safari", label: "Bug", priority: "urgent", initials: "DO" },
      { title: "Inline due date on the card face", label: "Feature", priority: "medium", initials: "AK" },
    ],
  },
  {
    name: "In review",
    cards: [
      { title: "Compact card density setting", label: "Feature", priority: "low", initials: "MH" },
      { title: "Live column reorder for all", label: "Feature", priority: "medium", initials: "YT" },
    ],
  },
];

function PreviewMiniCard({ card }: { card: PreviewCard }) {
  return (
    <div className={`border-l-2 bg-card p-3 ${priorityEdge[card.priority]}`}>
      <p className="text-[13px] leading-snug text-card-foreground">
        {card.title}
      </p>
      <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
        <span>{card.label}</span>
        {card.initials ? <span>{card.initials}</span> : null}
      </div>
    </div>
  );
}

export function LandingBoardPreview() {
  const cardCount = columns.reduce((total, c) => total + c.cards.length, 0);
  return (
    <div className="border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <span className="text-sm font-medium text-foreground">
          Launch checklist
        </span>
        <span className="flex items-center gap-4 font-mono text-[11px] text-muted-foreground">
          <span className="hidden sm:inline">MH TR AK DO YT</span>
          <span className="text-primary">{cardCount} cards</span>
        </span>
      </div>
      <div className="grid sm:grid-cols-3 sm:divide-x sm:divide-border">
        {columns.map((column) => (
          <div key={column.name} className="p-5">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {column.name}
              </span>
              <span className="font-mono text-[11px] text-primary">
                {column.cards.length}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              {column.cards.map((card) => (
                <PreviewMiniCard key={card.title} card={card} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
