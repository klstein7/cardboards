import { cn } from "~/lib/utils";

export type ProjectPreviewKind =
  | "register"
  | "briefing"
  | "atlas"
  | "pulse"
  | "matrix"
  | "spotlight";

export function ProjectStudyPreview({
  kind,
  className,
}: {
  kind: ProjectPreviewKind;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative aspect-[16/9] overflow-hidden border border-border bg-background",
        className,
      )}
    >
      <PreviewHeader />
      {kind === "register" && <RegisterPreview />}
      {kind === "briefing" && <BriefingPreview />}
      {kind === "atlas" && <AtlasPreview />}
      {kind === "pulse" && <PulsePreview />}
      {kind === "matrix" && <MatrixPreview />}
      {kind === "spotlight" && <SpotlightPreview />}
    </div>
  );
}

function PreviewHeader() {
  return (
    <div className="flex h-5 items-center border-b border-border px-2">
      <span className="h-1.5 w-1.5 bg-primary" />
      <span className="ml-1.5 h-px w-10 bg-foreground/60" />
      <span className="ml-auto h-1 w-8 bg-primary/70" />
    </div>
  );
}

function RegisterPreview() {
  return (
    <div className="h-[calc(100%-1.25rem)] px-3 pt-3">
      <div className="flex items-end justify-between border-b border-border pb-2">
        <span className="h-1.5 w-20 bg-foreground/75" />
        <span className="h-px w-14 bg-primary/70" />
      </div>
      {[0, 1, 2, 3].map((row) => (
        <div
          key={row}
          className="grid h-[22%] grid-cols-[18px_1fr_1.2fr_34px] items-center gap-2 border-b border-border/70"
        >
          <span className="h-px w-3 bg-muted-foreground/40" />
          <span className="h-px w-4/5 bg-foreground/60" />
          <span className="h-px w-full bg-muted-foreground/35" />
          <span className="h-1 w-5 bg-primary/50" />
        </div>
      ))}
    </div>
  );
}

function BriefingPreview() {
  return (
    <div className="grid h-[calc(100%-1.25rem)] grid-cols-[34%_1fr] divide-x divide-border">
      <div className="divide-y divide-border p-2">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="py-2">
            <span className="block h-px w-3/4 bg-foreground/55" />
            <span className="mt-1.5 block h-px w-1/2 bg-muted-foreground/30" />
          </div>
        ))}
      </div>
      <div className="p-3">
        <span className="block h-1.5 w-20 bg-foreground/70" />
        <span className="mt-2 block h-px w-full bg-border" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((item) => (
            <span key={item} className="border-t border-border pt-2">
              <span className="block h-px w-4/5 bg-foreground/55" />
              <span className="mt-2 block h-px w-1/2 bg-muted-foreground/30" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AtlasPreview() {
  return (
    <div className="h-[calc(100%-1.25rem)] px-3 pt-3">
      <div className="mb-3 flex items-end justify-between">
        <span className="h-2 w-24 bg-foreground/70" />
        <span className="h-px w-12 bg-primary/60" />
      </div>
      {[0, 1, 2].map((row) => (
        <div
          key={row}
          className="grid h-[27%] grid-cols-[1fr_1.4fr] gap-4 border-t border-border py-2"
        >
          <span>
            <span className="block h-1 w-3/4 bg-foreground/60" />
            <span className="mt-2 block h-px w-1/2 bg-muted-foreground/30" />
          </span>
          <span className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((board) => (
              <span key={board} className="border-l border-border pl-1.5">
                <span className="block h-px w-full bg-foreground/45" />
                <span className="mt-2 block h-1 w-1 bg-primary/50" />
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

function PulsePreview() {
  return (
    <div className="grid h-[calc(100%-1.25rem)] grid-cols-[28%_1fr] divide-x divide-border">
      <div className="p-2.5">
        <span className="block h-1 w-14 bg-foreground/65" />
        {[0, 1, 2, 3].map((item) => (
          <span key={item} className="mt-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-primary/60" />
            <span className="h-px flex-1 bg-muted-foreground/35" />
          </span>
        ))}
      </div>
      <div className="px-3 pt-2.5">
        <span className="block h-1 w-20 bg-foreground/65" />
        {[0, 1, 2, 3].map((item) => (
          <span
            key={item}
            className="grid grid-cols-[12px_1fr_24px] items-center gap-2 border-b border-border py-2.5"
          >
            <span className="h-2 w-2 rounded-full bg-muted-foreground/45" />
            <span>
              <span className="block h-px w-4/5 bg-foreground/55" />
              <span className="mt-1.5 block h-px w-1/2 bg-muted-foreground/30" />
            </span>
            <span className="h-px bg-primary/50" />
          </span>
        ))}
      </div>
    </div>
  );
}

function MatrixPreview() {
  return (
    <div className="h-[calc(100%-1.25rem)] p-3">
      <div className="grid grid-cols-[1.2fr_.6fr_.55fr_.8fr] gap-2 border-b border-border pb-2">
        {[0, 1, 2, 3].map((item) => (
          <span key={item} className="h-px bg-muted-foreground/40" />
        ))}
      </div>
      {[0, 1, 2, 3, 4].map((row) => (
        <div
          key={row}
          className="grid h-[17%] grid-cols-[1.2fr_.6fr_.55fr_.8fr] items-center gap-2 border-b border-border/70"
        >
          <span className="h-px w-4/5 bg-foreground/60" />
          <span className="h-1 w-1 bg-primary/60" />
          <span className="h-px w-2/3 bg-muted-foreground/35" />
          <span className="flex gap-1">
            {[0, 1, 2].map((item) => (
              <span key={item} className="h-1 flex-1 bg-primary/30" />
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}

function SpotlightPreview() {
  return (
    <div className="h-[calc(100%-1.25rem)] px-5 pt-4">
      <div className="border-b border-foreground/60 pb-2">
        <span className="block h-1.5 w-2/3 bg-foreground/70" />
      </div>
      <div className="mt-4 grid grid-cols-[1fr_42%] divide-x divide-border border-y border-border">
        <div className="divide-y divide-border">
          {[0, 1, 2].map((item) => (
            <span key={item} className="block px-2 py-2.5">
              <span className="block h-px w-3/4 bg-foreground/55" />
              <span className="mt-1.5 block h-px w-1/2 bg-muted-foreground/30" />
            </span>
          ))}
        </div>
        <div className="p-3">
          <span className="block h-1 w-3/4 bg-primary/65" />
          <span className="mt-3 block h-px w-full bg-border" />
          <span className="mt-3 block h-px w-2/3 bg-muted-foreground/35" />
        </div>
      </div>
    </div>
  );
}
