import { cn } from "~/lib/utils";

export type BoardPreviewKind = "panorama" | "runway" | "aperture";

const marks = [4, 3, 0, 2, 3];

export function BoardStudyPreview({
  kind,
  className,
}: {
  kind: BoardPreviewKind;
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
      {kind === "panorama" && <PanoramaPreview />}
      {kind === "runway" && <RunwayPreview />}
      {kind === "aperture" && <AperturePreview />}
    </div>
  );
}

function PreviewHeader() {
  return (
    <div className="flex h-5 items-center border-b border-border px-2">
      <span className="h-1.5 w-1.5 bg-primary" />
      <span className="ml-1.5 h-px w-12 bg-foreground/60" />
      <span className="ml-auto h-px w-5 bg-border" />
      <span className="ml-1 h-px w-5 bg-border" />
    </div>
  );
}

function PanoramaPreview() {
  return (
    <div className="flex h-[calc(100%-1.25rem)] flex-col">
      <div className="flex h-10 items-end border-b border-border px-3 pb-2">
        <span className="h-1 w-20 bg-foreground/75" />
        <span className="ml-auto h-px w-16 bg-primary/70" />
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[1.25fr_1.15fr_.7fr_.9fr_.8fr] divide-x divide-border">
        {marks.map((count, columnIndex) => (
          <div key={columnIndex} className="min-w-0 px-1.5 py-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="h-px w-7 bg-muted-foreground/70" />
              <span className="h-1 w-1 bg-primary/70" />
            </div>
            <div className="space-y-1.5">
              {Array.from({ length: count }).map((_, cardIndex) => (
                <span
                  key={cardIndex}
                  className="block border-t border-border pt-1.5"
                >
                  <span className="flex gap-1">
                    <span className="h-3 w-px bg-primary/70" />
                    <span className="mt-0.5 h-px flex-1 bg-foreground/55" />
                  </span>
                  <span className="mt-1 block h-px w-2/3 bg-muted-foreground/35" />
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RunwayPreview() {
  return (
    <div className="h-[calc(100%-1.25rem)]">
      {[3, 2, 1, 3].map((count, rowIndex) => (
        <div
          key={rowIndex}
          className="flex h-1/4 flex-col border-b border-border last:border-b-0"
        >
          <div className="flex h-3 shrink-0 items-center gap-1.5 border-b border-border px-2">
            <span className="block h-px w-8 bg-muted-foreground/70" />
            <span className="block h-px w-3 bg-primary/70" />
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-3 divide-x divide-border">
            {Array.from({ length: count }).map((_, cardIndex) => (
              <div key={cardIndex} className="p-2">
                <span className="block h-px w-4/5 bg-foreground/60" />
                <span className="mt-2 block h-px w-1/2 bg-muted-foreground/35" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AperturePreview() {
  return (
    <div className="flex h-[calc(100%-1.25rem)] divide-x divide-border">
      <div className="w-[12%] p-2">
        <span className="block h-px w-full bg-muted-foreground/60" />
        <span className="mt-3 block h-5 w-px bg-primary/60" />
        <span className="mt-2 block h-5 w-px bg-primary/40" />
      </div>
      <div className="min-w-0 flex-1 p-3">
        <div className="flex items-end border-b border-border pb-2">
          <span className="h-1 w-16 bg-foreground/70" />
          <span className="ml-auto h-px w-6 bg-primary/70" />
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="border-t border-border pt-2">
              <span className="block h-px w-4/5 bg-foreground/60" />
              <span className="mt-2 block h-px w-1/2 bg-muted-foreground/35" />
            </div>
          ))}
        </div>
      </div>
      {[0, 1, 2].map((index) => (
        <div key={index} className="w-[12%] p-2">
          <span className="block h-px w-full bg-muted-foreground/60" />
          <span className="mt-3 block h-5 w-px bg-primary/40" />
        </div>
      ))}
    </div>
  );
}
