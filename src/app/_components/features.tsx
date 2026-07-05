import { FadeIn } from "~/components/animations/fade-in";

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="w-full py-24"
      aria-labelledby="features-heading"
    >
      <FadeIn>
        <h2
          id="features-heading"
          className="text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          Everything it does.
        </h2>

        <div className="mt-8 grid gap-px bg-border md:grid-cols-3">
          <div className="bg-background p-8 md:col-span-2">
            <h3 className="text-xl font-semibold tracking-tight">
              Realtime by default
            </h3>
            <p className="mt-2 max-w-sm leading-relaxed text-muted-foreground">
              Every drag, edit, and comment lands on every screen the moment
              it happens. The board is the standup.
            </p>
            <div className="mt-6 grid max-w-lg gap-2 sm:grid-cols-2">
              <div className="border border-border border-l-2 border-l-destructive p-3">
                <p className="text-[13px] leading-snug text-card-foreground">
                  Fix drag preview offset in Safari
                </p>
                <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                  <span>Bug</span>
                  <span>DO</span>
                </div>
              </div>
              <div className="border border-border border-l-2 border-l-muted-foreground p-3">
                <p className="text-[13px] leading-snug text-card-foreground">
                  Live column reorder for all
                </p>
                <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                  <span>Feature</span>
                  <span>YT</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-background p-8">
            <h3 className="text-xl font-semibold tracking-tight">
              Draft a board with AI
            </h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Describe the work in a sentence and get columns and cards to
              start from.
            </p>
            <p className="mt-6 border border-border px-3 py-2 font-mono text-xs text-muted-foreground">
              &ldquo;Plan a product launch&rdquo;
            </p>
          </div>

          <div className="bg-background p-8">
            <h3 className="text-xl font-semibold tracking-tight">
              Invite with one link
            </h3>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Share a link and the whole team is on the board.
            </p>
            <p className="mt-6 inline-block border border-border px-3 py-2 font-mono text-xs text-muted-foreground">
              cardboards.app/i/new-team
            </p>
          </div>

          <div className="bg-background p-8 md:col-span-2">
            <div className="h-0.5 w-10 bg-primary" />
            <h3 className="mt-5 text-xl font-semibold tracking-tight">
              No setup
            </h3>
            <p className="mt-2 max-w-md leading-relaxed text-muted-foreground">
              Name a few columns and you are running. No workflow builder, no
              onboarding call, no step two.
            </p>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
